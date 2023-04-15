// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.16;

import { MAD } from "./MAD.sol";
import { FactoryVerifier, MarketplaceEventsAndErrorsBase } from "./EventsAndErrors.sol";
// import { Types } from "./Types.sol";
import { Pausable } from "./lib/security/Pausable.sol";
import { Owned } from "./lib/auth/Owned.sol";
import { SafeTransferLib } from "./lib/utils/SafeTransferLib.sol";
import { ERC20 } from "./lib/tokens/ERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

abstract contract MADMarketplaceBase is
    MAD,
    Owned(msg.sender),
    Pausable,
    MarketplaceEventsAndErrorsBase
{
    /// @dev Function Signature := 0x06fdde03
    function name()
        external
        pure
        override(MAD)
        returns (string memory)
    {
        assembly {
            mstore(0x20, 0x20)
            mstore(0x46, 0x066D61726B6574)
            return(0x20, 0x60)
        }
    }

    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////
    ISwapRouter public immutable swapRouter;
    uint24 public constant feeTier = 3000;

    // 0x8b30951df380b6b10da747e1167dd8e40bf8604c88c75b245dc172767f3b7320;
    uint256 public feeVal2 = 1.0e3;
    uint256 public feeVal3 = 2.5e2;

    // uint16 public constant feePercent1 = 2.5e2;
    // uint16 public constant feePercent0 = 1.0e3;
    uint16 public constant basisPoints = 1.0e4;

    /// @dev when user is outbid on an erc20, deposit here and let the user withdraw it
    mapping(address => uint256) public userOutbid;

    /// @dev seller => orderID
    mapping(address => bytes32[]) public orderIdBySeller;

    // /// @dev token => tokenId => amount => case0(feePercent0)/case1(feePercent1)
    // mapping(uint256 => mapping(uint256 => mapping(uint256 => bool)))
    //     public feeSelector;

    uint256 public minOrderDuration;
    uint256 public minAuctionIncrement;
    uint256 public minBidValue;
    uint256 public maxOrderDuration;

    address public recipient;

    ERC20 public erc20;
    uint256 public totalOutbid;

    FactoryVerifier public MADFactory;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(
        address _recipient,
        uint256 _minOrderDuration,
        FactoryVerifier _factory,
        address _paymentTokenAddress,
        address _swapRouter
    ) {
        setFactory(_factory);
        setRecipient(_recipient);
        swapRouter = ISwapRouter(_swapRouter);

        if (_paymentTokenAddress != address(0)) {
            require(
                address(swapRouter) != address(0),
                "invalid swap router configuration"
            );
            _setPaymentToken(_paymentTokenAddress);

            // Approve the router to spend the ERC20 payment token.
            SafeTransferLib.safeApprove(
                ERC20(_paymentTokenAddress),
                address(_swapRouter),
                2 ** 256 - 1
            );
        }
        updateSettings(
            300, // 5 min
            _minOrderDuration,
            20, // 5% (1/20th)
            31536000 // 24 months
        );
    }

    receive() external payable {}

    ////////////////////////////////////////////////////////////////
    //                         OWNER FX                           //
    ////////////////////////////////////////////////////////////////

    /// @dev `MADFactory` instance setter.
    /// @dev Function Signature := 0x612990fe
    function setFactory(
        FactoryVerifier _factory
    ) public onlyOwner {
        assembly {
            // MADFactory = _factory;
            sstore(MADFactory.slot, _factory)
        }
        emit FactoryUpdated(_factory);
    }

    function setFees(
        uint256 _feeVal2,
        uint256 _feeVal3
    ) external onlyOwner {
        // max fees, 15% for royalties, 5% for fees
        require(
            _feeVal2 <= 1.5e3 && _feeVal3 <= 5.0e2,
            "Invalid Fees"
        );

        assembly {
            sstore(feeVal2.slot, _feeVal2)
            sstore(feeVal3.slot, _feeVal3)
        }

        emit FeesUpdated(_feeVal2, _feeVal3);
    }

    /// @notice Marketplace config setter.
    /// @dev Function Signature := 0x0465c563
    /// @dev Time tracking criteria based on `blocktimestamp`.
    /// @param _minAuctionIncrement Min. time threshold for Auction extension.
    /// @param _minOrderDuration Min. order listing duration
    /// @param _minBidValue Min. value for a bid to be considered.
    /// @param _maxOrderDuration Max. order listing duration.
    function updateSettings(
        uint256 _minAuctionIncrement,
        uint256 _minOrderDuration,
        uint256 _minBidValue,
        uint256 _maxOrderDuration
    ) public onlyOwner {
        // minOrderDuration = _minOrderDuration;
        // minAuctionIncrement = _minAuctionIncrement;
        // minBidValue = _minBidValue;
        // maxOrderDuration = _maxOrderDuration;
        require(
            (_minAuctionIncrement <= 1200 &&
                _minOrderDuration <= 600 &&
                _minBidValue > 0) ||
                _maxOrderDuration >= _minOrderDuration,
            "Invalid Settings"
        );

        assembly {
            sstore(minOrderDuration.slot, _minOrderDuration)
            sstore(
                minAuctionIncrement.slot,
                _minAuctionIncrement
            )
            sstore(minBidValue.slot, _minBidValue)
            sstore(maxOrderDuration.slot, _maxOrderDuration)
        }

        emit AuctionSettingsUpdated(
            _minOrderDuration,
            _minAuctionIncrement,
            _minBidValue,
            _maxOrderDuration
        );
    }

    /// @notice Paused state initializer for security risk mitigation pratice.
    /// @dev Function Signature := 0x8456cb59
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpaused state initializer for security risk mitigation pratice.
    /// @dev Function Signature := 0x3f4ba83a
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Enables the contract's owner to change payment token address.
    /// @dev Function Signature := ?
    function _setPaymentToken(
        address _paymentTokenAddress
    ) private {
        require(
            _paymentTokenAddress != address(0),
            "Invalid token address"
        );
        erc20 = ERC20(_paymentTokenAddress);

        emit PaymentTokenUpdated(_paymentTokenAddress);
    }

    /// @notice Enables the contract's owner to change recipient address.
    /// @dev Function Signature := 0x3bbed4a0
    function setRecipient(
        address _recipient
    ) public onlyOwner {
        require(
            _recipient != address(0),
            "Invalid recipient"
        );

        // recipient = _recipient;
        assembly {
            sstore(recipient.slot, _recipient)
        }

        emit RecipientUpdated(_recipient);
    }

    /// @dev Function Signature := 0x13af4035
    function setOwner(
        address newOwner
    ) public override onlyOwner {
        require(newOwner != address(0), "Invalid owner");

        // owner = newOwner;
        assembly {
            sstore(owner.slot, newOwner)
        }

        emit OwnerUpdated(msg.sender, newOwner);
    }

    /// @dev Function Signature := 0x3ccfd60b
    function withdraw() external onlyOwner whenPaused {
        require(
            address(this).balance - totalOutbid > 0,
            "No balance to withdraw"
        );
        SafeTransferLib.safeTransferETH(
            msg.sender,
            address(this).balance - totalOutbid
        );
    }

    function withdrawERC20(
        ERC20 _token
    ) external onlyOwner whenPaused {
        require(
            _token.balanceOf(address(this)) - totalOutbid > 0,
            "No balance to withdraw"
        );
        SafeTransferLib.safeTransfer(
            _token,
            msg.sender,
            _token.balanceOf(address(this)) - totalOutbid
        );
    }

    /// @dev when outbid (eth) the user must withdraw manually.
    function withdrawOutbidEth() external {
        require(
            userOutbid[msg.sender] > 0,
            "nothing to withdraw"
        );
        require(
            address(erc20) == address(0),
            "cannot withdraw eth"
        );

        uint256 amountOut = userOutbid[msg.sender];
        userOutbid[msg.sender] = 0;
        totalOutbid -= amountOut;

        SafeTransferLib.safeTransferETH(
            msg.sender,
            amountOut
        );
        emit WithdrawOutbid(
            msg.sender,
            address(0),
            amountOut
        ); // amount withdrawn
    }

    function withdrawOutbid(
        ERC20 _token,
        uint256 minOut,
        uint160 priceLimit
    ) external {
        _withdrawOutbid(
            msg.sender,
            _token,
            minOut,
            priceLimit
        );
    }

    function _withdrawOutbid(
        address _sender,
        ERC20 _token,
        uint256 minOut,
        uint160 priceLimit
    ) private {
        require(
            address(erc20) != address(0) &&
                address(_token) != address(0),
            "not erc20"
        );
        require(
            userOutbid[_sender] > 0,
            "nothing to withdraw"
        );

        uint256 amountIn = userOutbid[_sender];
        userOutbid[_sender] = 0;
        totalOutbid -= amountIn;

        if (_token == erc20) {
            SafeTransferLib.safeTransfer(
                _token,
                _sender,
                amountIn
            );
            emit WithdrawOutbid(
                _sender,
                address(_token),
                amountIn
            ); // amount withdrawn
            return;
        }

        // Note: To use this example, you should explicitly set slippage limits, omitting for simplicity
        // uint256 minOut = /* Calculate min output */ 0;
        // uint160 priceLimit = /* Calculate price limit */ 0;
        // Create the params that will be used to execute the swap

        ISwapRouter.ExactInputSingleParams
            memory params = ISwapRouter
                .ExactInputSingleParams({
                    tokenIn: address(erc20),
                    tokenOut: address(_token),
                    fee: feeTier,
                    recipient: _sender,
                    deadline: block.timestamp,
                    amountIn: amountIn,
                    amountOutMinimum: minOut,
                    sqrtPriceLimitX96: priceLimit
                });
        // The call to `exactInputSingle` executes the swap.
        uint256 amountOut = swapRouter.exactInputSingle(
            params
        );
        emit WithdrawOutbid(
            _sender,
            address(_token),
            amountOut
        ); // amount withdrawn
    }

    /// @dev retrieve how much balance
    function getOutbidBalance()
        external
        view
        returns (uint256 balance)
    {
        balance = userOutbid[msg.sender];
    }

    ////////////////////////////////////////////////////////////////
    //                        INTERNAL FX                          //
    ////////////////////////////////////////////////////////////////

    function _exceedsMaxEP(
        uint256 _startPrice,
        uint256 _endPrice
    ) internal pure {
        assembly {
            // ExceedsMaxEP()
            if iszero(
                iszero(
                    or(
                        eq(_startPrice, _endPrice),
                        lt(_startPrice, _endPrice)
                    )
                )
            ) {
                mstore(0x00, 0x70f8f33a)
                revert(0x1c, 0x04)
            }
        }
    }

    function _isBidderOrSeller(
        address _bidder,
        address _seller
    ) internal view {
        assembly {
            // AccessDenied()
            if iszero(
                or(
                    eq(caller(), _seller),
                    eq(caller(), _bidder)
                )
            ) {
                mstore(0x00, 0x4ca88867)
                revert(0x1c, 0x04)
            }
        }
    }

    function _makeOrderChecks(
        uint256 _endTime,
        uint256 _startPrice
    ) internal view {
        assembly {
            // NeedMoreTime()
            if iszero(
                iszero(
                    or(
                        or(
                            eq(timestamp(), _endTime),
                            lt(_endTime, timestamp())
                        ),
                        lt(
                            sub(_endTime, timestamp()),
                            sload(minOrderDuration.slot)
                        )
                    )
                )
            ) {
                mstore(0x00, 0x921dbfec)
                revert(0x1c, 0x04)
            }
            // Exceeds max time - NeedMoreTime()
            if iszero(
                lt(
                    sub(_endTime, timestamp()),
                    sload(maxOrderDuration.slot)
                )
            ) {
                mstore(0x00, 0x921dbfec)
                revert(0x1c, 0x04)
            }
            // WrongPrice()
            if iszero(_startPrice) {
                mstore(0x00, 0xf7760f25)
                revert(0x1c, 0x04)
            }
        }
    }

    function _cancelOrderChecks(
        address _seller,
        bool _isSold,
        uint256 _lastBidPrice
    ) internal view {
        assembly {
            // AccessDenied()
            if iszero(eq(_seller, caller())) {
                mstore(0x00, 0x4ca88867)
                revert(0x1c, 0x04)
            }
            // SoldToken()
            if iszero(iszero(_isSold)) {
                mstore(0x00, 0xf88b07a3)
                revert(0x1c, 0x04)
            }
            // BidExists()
            if iszero(iszero(_lastBidPrice)) {
                mstore(0x00, 0x3e0827ab)
                revert(0x1c, 0x04)
            }
        }
    }

    function _bidChecks(
        uint8 _orderType,
        uint256 _endTime,
        address _seller,
        uint256 _lastBidPrice,
        uint256 _startPrice,
        uint256 _bidValue
    ) internal view {
        assembly {
            // EAOnly()
            if iszero(eq(_orderType, 2)) {
                mstore(0x00, 0xffc96cb0)
                revert(0x1c, 0x04)
            }
            // CanceledOrder()
            if iszero(_endTime) {
                mstore(0x00, 0xdf9428da)
                revert(0x1c, 0x04)
            }
            // Timeout()
            if gt(timestamp(), _endTime) {
                mstore(0x00, 0x2af0c7f8)
                revert(0x1c, 0x04)
            }
            // InvalidBidder()
            if eq(caller(), _seller) {
                mstore(0x00, 0x0863b103)
                revert(0x1c, 0x04)
            }
            // WrongPrice()
            switch iszero(_lastBidPrice)
            case 0 {
                if lt(
                    _bidValue,
                    add(
                        _lastBidPrice,
                        div(
                            _lastBidPrice,
                            sload(minBidValue.slot)
                        )
                    )
                ) {
                    mstore(0x00, 0xf7760f25)
                    revert(0x1c, 0x04)
                }
            }
            case 1 {
                if or(
                    iszero(_bidValue),
                    lt(_bidValue, _startPrice)
                ) {
                    mstore(0x00, 0xf7760f25)
                    revert(0x1c, 0x04)
                }
            }
        }
    }

    function _buyChecks(
        uint256 _endTime,
        uint8 _orderType,
        bool _isSold
    ) internal view {
        assembly {
            // CanceledOrder()
            if iszero(_endTime) {
                mstore(0x00, 0xdf9428da)
                revert(0x1c, 0x04)
            }
            // Timeout()
            if or(
                eq(timestamp(), _endTime),
                lt(_endTime, timestamp())
            ) {
                mstore(0x00, 0x2af0c7f8)
                revert(0x1c, 0x04)
            }
            // NotBuyable()
            if eq(_orderType, 0x02) {
                mstore(0x00, 0x07ae5744)
                revert(0x1c, 0x04)
            }
            // SoldToken()
            if iszero(iszero(_isSold)) {
                mstore(0x00, 0xf88b07a3)
                revert(0x1c, 0x04)
            }
        }
    }

    function _claimChecks(
        bool _isSold,
        uint8 _orderType,
        uint256 _endTime
    ) internal view {
        assembly {
            // SoldToken()
            if iszero(iszero(_isSold)) {
                mstore(0x00, 0xf88b07a3)
                revert(0x1c, 0x04)
            }
            // EAOnly()
            if iszero(eq(_orderType, 0x02)) {
                mstore(0x00, 0xffc96cb0)
                revert(0x1c, 0x04)
            }
            // NeedMoreTime()
            if or(
                eq(timestamp(), _endTime),
                lt(timestamp(), _endTime)
            ) {
                mstore(0x00, 0x921dbfec)
                revert(0x1c, 0x04)
            }
        }
    }

    ////////////////////////////////////////////////////////////////
    //                   PUBLIC/EXTERNAL GETTERS                  //
    ////////////////////////////////////////////////////////////////

    /// @notice Everything in storage can be fetch through the
    /// getters natively provided by all public mappings.
    /// @dev This public getter serve as a hook to ease frontend
    /// fetching whilst estimating `orderIdBySeller` indexes by length.
    /// @dev Function Signature := 0x8aae982a
    function sellerOrderLength(
        address _seller
    ) external view returns (uint256) {
        return orderIdBySeller[_seller].length;
    }
}
