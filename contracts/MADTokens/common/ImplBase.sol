// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

import { ImplBaseEventsAndErrors } from "contracts/MADTokens/common/interfaces/ImplBaseEventsAndErrors.sol";
import { ERC2981 } from "contracts/lib/tokens/common/ERC2981.sol";
import { ERC20 } from "contracts/lib/tokens/ERC20.sol";
import { TwoFactor } from "contracts/lib/auth/TwoFactor.sol";
import { ReentrancyGuard } from "contracts/lib/security/ReentrancyGuard.sol";
import { SplitterImpl } from "contracts/lib/splitter/SplitterImpl.sol";
import { Counters } from "contracts/lib/utils/Counters.sol";
import { Strings } from "contracts/lib/utils/Strings.sol";
import { SafeTransferLib } from "contracts/lib/utils/SafeTransferLib.sol";
import { FeeOracle } from "contracts/lib/tokens/common/FeeOracle.sol";

abstract contract ImplBase is ERC2981, ImplBaseEventsAndErrors, TwoFactor, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;

    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    /// @notice Splitter address relationship.
    SplitterImpl public splitter;

    /// @notice ERC20 payment token address.
    ERC20 public erc20;

    /// @notice Live supply counter, excludes burned tokens.
    Counters.Counter public liveSupply;

    /// @notice Mint counter, includes burnt count.
    uint256 public mintCount;

    /// @notice Fee counter.
    uint256 public feeCount;

    /// @notice Token base URI string.
    string public baseURI;

    /// @notice Lock the URI default := false.
    bool public uriLock;

    /// @notice Public mint price.
    uint256 public price;

    /// @notice Capped max supply.
    uint256 public maxSupply;

    /// @notice Public mint state default := false.
    bool public publicMintState;

    ////////////////////////////////////////////////////////////////
    //                          MODIFIERS                         //
    ////////////////////////////////////////////////////////////////

    modifier publicMintAccess() {
        if (!publicMintState) revert PublicMintClosed();
        _;
    }

    modifier publicMintPriceCheck(uint256 _price, uint256 _amount) {
        uint256 _fee = _getFeeValue(0x40d097c3);
        feeCount = feeCount + _fee;
        uint256 value = _getPriceValue(msg.sender);
        if ((_price * _amount) + _fee != value) revert WrongPrice();
        _;
    }

    modifier hasReachedMax(uint256 amount) {
        if (mintCount + amount > maxSupply) revert MaxSupplyReached();
        _;
    }

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(
        string memory _baseURI,
        uint256 _price,
        uint256 _maxSupply,
        SplitterImpl _splitter,
        uint96 _fraction,
        address _router
    )
        /*  */
        TwoFactor(_router, tx.origin)
    {
        baseURI = _baseURI;
        price = _price;
        maxSupply = _maxSupply;
        splitter = _splitter;
        _royaltyFee = _fraction;
        _royaltyRecipient = payable(splitter);

        emit RoyaltyFeeSet(_royaltyFee);
        emit RoyaltyRecipientSet(_royaltyRecipient);
    }

    ////////////////////////////////////////////////////////////////
    //                         OWNER FX                           //
    ////////////////////////////////////////////////////////////////

    function setBaseURI(string memory _baseURI) public authorised {
        if (uriLock == true) revert URILocked();
        baseURI = _baseURI;
        emit BaseURISet(_baseURI);
    }

    function setBaseURILock() public authorised {
        uriLock = true;
        emit BaseURILocked(baseURI);
    }

    function setPublicMintState(bool _publicMintState) public authorised {
        publicMintState = _publicMintState;

        emit PublicMintStateSet(_publicMintState);
    }

    ////////////////////////////////////////////////////////////////
    //                       OWNER WITHDRAW                        //
    ////////////////////////////////////////////////////////////////

    function withdraw(address recipient) public authorised {
        uint256 len = splitter.payeesLength();
        address[] memory addrs = new address[](len);
        uint256[] memory values = new uint256[](len);
        uint256 _val;
        if (feeCount > 0 && recipient != address(0)) {
            _val = address(this).balance - feeCount;
            SafeTransferLib.safeTransferETH(payable(recipient), feeCount);
            feeCount = 0;
        } else {
            _val = address(this).balance;
        }
        uint256 i;
        for (i; i < len; ) {
            address addr = splitter._payees(i);
            uint256 share = splitter._shares(addr);
            addrs[i] = addr;
            values[i] = ((_val * (share * 1e2)) / 10_000);
            unchecked {
                ++i;
            }
        }
        uint256 j;
        while (j < len) {
            SafeTransferLib.safeTransferETH(addrs[j], values[j]);
            unchecked {
                ++j;
            }
        }
    }

    function withdrawERC20(ERC20 _token, address recipient) public authorised {
        uint256 len = splitter.payeesLength();
        address[] memory addrs = new address[](len);
        uint256[] memory values = new uint256[](len);
        // Transfer mint fees
        uint256 _val;
        if (feeCount > 0 && recipient != address(0)) {
            _val = _token.balanceOf(address(this)) - feeCount;
            SafeTransferLib.safeTransfer(_token, recipient, feeCount);
            feeCount = 0;
        } else {
            _val = _token.balanceOf(address(this));
        }
        // Transfer splitter funds to shareholders
        uint256 i;
        for (i; i < len; ) {
            address addr = splitter._payees(i);
            uint256 share = splitter._shares(addr);
            addrs[i] = addr;
            values[i] = ((_val * (share * 1e2)) / 10_000);
            unchecked {
                ++i;
            }
        }
        uint256 j;
        while (j < len) {
            SafeTransferLib.safeTransfer(_token, addrs[j], values[j]);
            unchecked {
                ++j;
            }
        }
    }

    ////////////////////////////////////////////////////////////////
    //                          HELPER FX                         //
    ////////////////////////////////////////////////////////////////

    function _incrementCounter() internal returns (uint256) {
        liveSupply.increment();
        mintCount = mintCount + 1;
        return mintCount;
    }

    function _incrementCounter(uint256 amount) internal returns (uint256) {
        liveSupply.increment(amount);
        mintCount = mintCount + amount;
        return mintCount;
    }

    ////////////////////////////////////////////////////////////////
    //                           VIEW FX                          //
    ////////////////////////////////////////////////////////////////

    function totalSupply() public view returns (uint256) {
        return liveSupply.current();
    }

    ////////////////////////////////////////////////////////////////
    //                     INTERNAL FUNCTIONS                     //
    ////////////////////////////////////////////////////////////////

    /// @dev Checks if mint / burn fees are paid
    /// @dev If not router deployed we check msg.value if !erc20 OR checks erc20 approval and transfers
    /// @dev If router deployed we check msg.value if !erc20 BUT checks erc20 approval and transfers are via the router
    /// @param _erc20Owner Non router deploy =msg.sender; Router deploy =payer.address (msg.sender = router.address)
    /// @param _type Passed to _feeCheck to determin the fee 0=mint; 1=burn; ELSE _feeCheck is ignored
    function _paymentCheck(address _erc20Owner, uint8 _type) internal {
        uint256 value = _getPriceValue(_erc20Owner);

        // Check fees are paid
        // ERC20 fees for router calls are checked and transfered via in the router
        if (address(msg.sender) == address(_erc20Owner) || (address(erc20) == address(0))) {
            if (_type == 0) {
                _feeCheck(0x40d097c3, value);
            } else if (_type == 1) {
                _feeCheck(0x44df8e70, value);
            }
            if (address(erc20) != address(0)) {
                SafeTransferLib.safeTransferFrom(erc20, _erc20Owner, address(this), value);
            }
        }
    }

    function _feeCheck(bytes4 _method, uint256 _value) internal view {
        uint256 _fee = _getFeeValue(_method);
        assembly {
            if iszero(eq(_value, _fee)) {
                mstore(0x00, 0xf7760f25)
                revert(0x1c, 0x04)
            }
        }
    }

    function _loopOverflow(uint256 _index, uint256 _end) internal pure {
        assembly {
            if lt(_index, _end) {
                // LoopOverflow()
                mstore(0x00, 0xdfb035c9)
                revert(0x1c, 0x04)
            }
        }
    }

    function _getPriceValue(address _erc20Owner) internal view returns (uint256 value) {
        value = (address(erc20) != address(0)) ? erc20.allowance(_erc20Owner, address(this)) : msg.value;
    }

    //prettier-ignore
    function _getFeeValue(bytes4 _method) internal view returns (uint256 value) {
        // value = _size == 0 ? 0 : FeeOracle(_router).feeLookup(_method);
        bytes memory encoded = 
            abi.encodeWithSelector(0xedc9e7a4, _method);

        assembly {
            let _router := shr(12, sload(router.slot)) 
            let _size := extcodesize( _router)
            switch iszero(_size)
            case 1 { value := 0x00 }
            case 0 {
                pop(
                    staticcall(
                        gas(),
                        _router,
                        add(encoded, 0x20), 
                        mload(encoded),
                        0x00, 
                        0x20
                    )
                )
                value := mload(0x00)
            }
        }

// gas: amount of gas to send to the sub context to execute. The gas that is not used by the sub context is returned to this one.
// address: the account which context to execute.
// argsOffset: byte offset in the memory in bytes, the calldata of the sub context.
// argsSize: byte size to copy (size of the calldata).
// retOffset: byte offset in the memory in bytes, where to store the return data of the sub context.
// retSize: byte size to copy (size of the return data).
    }

    function _extraArgsCheck(bytes32[] memory _extra) internal pure virtual {
        if (_extra.length != 0) revert WrongArgsLength();
    }
}
