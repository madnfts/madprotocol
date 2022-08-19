// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.4;

/* 
DISCLAIMER: 
This contract hasn't been audited yet. Most likely contains unexpected bugs. 
Don't trust your funds to be held by this code before the final thoroughly tested and audited version release.
*/

/// @author Modified from NFTEX
/// (https://github.com/TheGreatHB/NFTEX/blob/main/contracts/NFTEX.sol)

import { MAD } from "./MAD.sol";
import { MarketplaceEventsAndErrors1155, FactoryVerifier, IERC1155 } from "./EventsAndErrors.sol";
import { Types } from "./Types.sol";
import { Pausable } from "./lib/security/Pausable.sol";
import { Owned } from "./lib/auth/Owned.sol";
import { ERC1155Holder } from "./lib/tokens/ERC1155/Base/utils/ERC1155Holder.sol";
import { SafeTransferLib } from "./lib/utils/SafeTransferLib.sol";

contract MADMarketplace1155 is
    MAD,
    MarketplaceEventsAndErrors1155,
    ERC1155Holder,
    Owned(msg.sender),
    Pausable
{
    using Types for Types.Order1155;

    /// @dev Function Signature := 0x06fdde03
    function name()
        public
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

    // uint256 constant NAME_SLOT =
    // 0x8b30951df380b6b10da747e1167dd8e40bf8604c88c75b245dc172767f3b7320;

    /// @dev token => id => amount => orderID[]
    mapping(IERC1155 => mapping(uint256 => mapping(uint256 => bytes32[])))
        public orderIdByToken;
    /// @dev seller => orderID
    mapping(address => bytes32[]) public orderIdBySeller;
    /// @dev orderID => order details
    mapping(bytes32 => Types.Order1155) public orderInfo;

    uint16 public constant feePercent = 20000;
    uint256 public minOrderDuration;
    uint256 public minAuctionIncrement;
    uint256 public minBidValue;

    address public recipient;
    FactoryVerifier public MADFactory1155;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(
        address _recipient,
        uint256 _minOrderDuration,
        FactoryVerifier _factory
    ) {
        recipient = _recipient;
        minOrderDuration = _minOrderDuration;
        minAuctionIncrement = 300; // 5min
        minBidValue = 20; // 5% (1/20th)

        MADFactory1155 = _factory;
    }

    ////////////////////////////////////////////////////////////////
    //                           USER FX                          //
    ////////////////////////////////////////////////////////////////

    /// @notice Fixed Price listing order public pusher.
    /// @dev Function Signature := 0x40b78b0f
    function fixedPrice(
        IERC1155 _token,
        uint256 _id,
        uint256 _amount,
        uint256 _price,
        uint256 _endBlock
    ) public whenNotPaused {
        _makeOrder(
            0,
            _token,
            _id,
            _amount,
            _price,
            0,
            _endBlock
        );
    }

    /// @notice Dutch Auction listing order public pusher.
    /// @dev Function Signature := 0x205e409c
    function dutchAuction(
        IERC1155 _token,
        uint256 _id,
        uint256 _amount,
        uint256 _startPrice,
        uint256 _endPrice,
        uint256 _endBlock
    ) public whenNotPaused {
        if (_startPrice <= _endPrice) revert ExceedsMaxEP();
        _makeOrder(
            1,
            _token,
            _id,
            _amount,
            _startPrice,
            _endPrice,
            _endBlock
        );
    }

    /// @notice English Auction listing order public pusher.
    /// @dev Function Signature := 0x47c4be17
    function englishAuction(
        IERC1155 _token,
        uint256 _id,
        uint256 _amount,
        uint256 _startPrice,
        uint256 _endBlock
    ) public whenNotPaused {
        _makeOrder(
            2,
            _token,
            _id,
            _amount,
            _startPrice,
            0,
            _endBlock
        );
    }

    /// @notice Bidding function available for English Auction only.
    /// @dev Function Signature := 0x957bb1e0
    /// @dev By default, bids must be at least 5% higher than the previous one.
    /// @dev By default, auction will be extended in 5 minutes if last bid is placed 5 minutes prior to auction's end.
    /// @dev 5 minutes eq to 300 mined blocks since block mining time is expected to take 1s in the harmony blockchain.
    function bid(bytes32 _order)
        external
        payable
        whenNotPaused
    {
        if (msg.value == 0) revert WrongPrice();

        Types.Order1155 storage order = orderInfo[_order];
        uint256 endBlock = order.endBlock;
        uint256 lastBidPrice = order.lastBidPrice;
        address lastBidder = order.lastBidder;

        if (order.orderType != 2) revert EAOnly();
        if (endBlock == 0) revert CanceledOrder();
        if (block.number > endBlock) revert Timeout();
        if (order.seller == msg.sender)
            revert InvalidBidder();

        if (
            msg.value <
            lastBidPrice + (lastBidPrice / minBidValue)
        ) revert WrongPrice();

        // 1s blocktime
        if (block.number > endBlock - minAuctionIncrement) {
            order.endBlock = endBlock + minAuctionIncrement;
        }

        order.lastBidder = msg.sender;
        order.lastBidPrice = msg.value;

        SafeTransferLib.safeTransferETH(
            lastBidder,
            lastBidPrice
        );

        emit Bid(
            order.token,
            order.tokenId,
            order.amount,
            _order,
            msg.sender,
            msg.value
        );
    }

    /// @notice Enables user to buy an nft for both Fixed Price and Dutch Auction listings
    /// @dev Function Signature := 0x9c9a1061
    function buy(bytes32 _order)
        external
        payable
        whenNotPaused
    {
        Types.Order1155 storage order = orderInfo[_order];
        uint256 endBlock = order.endBlock;
        if (endBlock == 0) revert CanceledOrder();
        if (endBlock <= block.number) revert Timeout();
        if (order.orderType == 2) revert NotBuyable();
        if (order.isSold == true) revert SoldToken();

        uint256 currentPrice = getCurrentPrice(_order);
        // price overrunning not accepted in fixed price and dutch auction
        if (msg.value != currentPrice) revert WrongPrice();

        order.isSold = true;

        // address _seller = order.seller;
        IERC1155 _token = order.token;

        // path for inhouse minted tokens
        if (
            MADFactory1155.creatorAuth(
                address(_token),
                order.seller
            ) == true
        ) {
            // load royalty info query to mem
            address _receiver;
            uint256 _amount;
            (_receiver, _amount) = _token.royaltyInfo(
                order.tokenId,
                currentPrice
            );

            // transfer royalties
            SafeTransferLib.safeTransferETH(
                _receiver,
                _amount
            );

            // transfer remaining value to seller
            SafeTransferLib.safeTransferETH(
                payable(order.seller),
                currentPrice - _amount
            );

            // path for external tokens
        } else {
            // case for external tokens with ERC2981 support
            if (
                _token.supportsInterface(0x2a55205a) == true
            ) {
                // load royalty info query to mem
                address _receiver;
                uint256 _amount;
                (_receiver, _amount) = _token.royaltyInfo(
                    order.tokenId,
                    currentPrice
                );

                // transfer royalties
                SafeTransferLib.safeTransferETH(
                    payable(_receiver),
                    _amount
                );

                // update price and transfer fee to recipient
                currentPrice = currentPrice - _amount;
                uint256 fee = (currentPrice * feePercent) /
                    10000;
                SafeTransferLib.safeTransferETH(
                    payable(recipient),
                    fee
                );

                // transfer remaining value to seller
                SafeTransferLib.safeTransferETH(
                    payable(order.seller),
                    currentPrice - fee
                );

                // case for external tokens without ERC2981 support
            } else {
                uint256 fee = (currentPrice * feePercent) /
                    10000;
                SafeTransferLib.safeTransferETH(
                    payable(recipient),
                    fee
                );
                SafeTransferLib.safeTransferETH(
                    payable(order.seller),
                    currentPrice - fee
                );
            }
        }

        // transfer token and emit event
        order.token.safeTransferFrom(
            address(this),
            msg.sender,
            order.tokenId,
            order.amount,
            ""
        );

        emit Claim(
            order.token,
            order.tokenId,
            order.amount,
            _order,
            order.seller,
            msg.sender,
            currentPrice
        );
    }

    /// @notice Pull method for NFT withdrawing in English Auction.
    /// @dev Function Signature := 0xbd66528a
    /// @dev Callable by both the seller and the auction winner.
    function claim(bytes32 _order) external whenNotPaused {
        Types.Order1155 storage order = orderInfo[_order];

        address seller = order.seller;
        address lastBidder = order.lastBidder;

        if (order.isSold == true) revert SoldToken();
        if (seller != msg.sender || lastBidder != msg.sender)
            revert AccessDenied();
        if (order.orderType != 2) revert EAOnly();
        if (block.number <= order.endBlock)
            revert NeedMoreTime();

        IERC1155 token = order.token;
        uint256 tokenId = order.tokenId;
        uint256 amount = order.amount;
        uint256 lastBidPrice = order.lastBidPrice;

        order.isSold = true;

        // address _seller = order.seller;
        IERC1155 _token = order.token;

        // path for inhouse minted tokens
        if (
            MADFactory1155.creatorAuth(
                address(_token),
                order.seller
            ) == true
        ) {
            // load royalty info query to mem
            address _receiver;
            uint256 _amount;
            (_receiver, _amount) = _token.royaltyInfo(
                order.tokenId,
                lastBidPrice
            );

            // transfer royalties
            SafeTransferLib.safeTransferETH(
                _receiver,
                _amount
            );

            // transfer remaining value to seller
            SafeTransferLib.safeTransferETH(
                payable(order.seller),
                lastBidPrice - _amount
            );

            // path for external tokens
        } else {
            // case for external tokens with ERC2981 support
            if (
                _token.supportsInterface(0x2a55205a) == true
            ) {
                // load royalty info query to mem
                address _receiver;
                uint256 _amount;
                (_receiver, _amount) = _token.royaltyInfo(
                    order.tokenId,
                    lastBidPrice
                );

                // transfer royalties
                SafeTransferLib.safeTransferETH(
                    payable(_receiver),
                    _amount
                );

                // update price and transfer fee to recipient
                uint256 newPrice = lastBidPrice - _amount;
                uint256 fee = (newPrice * feePercent) / 10000;
                SafeTransferLib.safeTransferETH(
                    payable(recipient),
                    fee
                );

                // transfer remaining value to seller
                SafeTransferLib.safeTransferETH(
                    payable(order.seller),
                    newPrice - fee
                );

                // case for external tokens without ERC2981 support
            } else {
                uint256 fee = (lastBidPrice * feePercent) /
                    10000;
                SafeTransferLib.safeTransferETH(
                    payable(recipient),
                    fee
                );
                SafeTransferLib.safeTransferETH(
                    payable(order.seller),
                    lastBidPrice - fee
                );
            }
        }

        token.safeTransferFrom(
            address(this),
            lastBidder,
            tokenId,
            amount,
            ""
        );

        emit Claim(
            token,
            tokenId,
            amount,
            _order,
            seller,
            lastBidder,
            lastBidPrice
        );
    }

    /// @notice Enables sellers to withdraw their tokens.
    /// @dev Function Signature := 0x7489ec23
    /// @dev Cancels order setting endBlock value to 0.
    function cancelOrder(bytes32 _order) external {
        Types.Order1155 storage order = orderInfo[_order];
        if (order.seller != msg.sender) revert AccessDenied();
        if (order.lastBidPrice != 0) revert BidExists();
        if (order.isSold == true) revert SoldToken();

        IERC1155 token = order.token;
        uint256 tokenId = order.tokenId;
        uint256 amount = order.amount;

        order.endBlock = 0;

        token.safeTransferFrom(
            address(this),
            msg.sender,
            tokenId,
            amount,
            ""
        );

        emit CancelOrder(
            token,
            tokenId,
            amount,
            _order,
            msg.sender
        );
    }

    receive() external payable {}

    ////////////////////////////////////////////////////////////////
    //                         OWNER FX                           //
    ////////////////////////////////////////////////////////////////

    /// @dev `MADFactory` instance setter.
    /// @dev Function Signature := 0x612990fe
    function setFactory(FactoryVerifier _factory)
        public
        onlyOwner
    {
        MADFactory1155 = _factory;

        emit FactoryUpdated(_factory);
    }

    /// @notice Marketplace config setter.
    /// @dev Function Signature := 0x0465c563
    /// @dev Time tracking criteria based on `blocknumber`.
    /// @param _minAuctionIncrement Min. time threshold for Auction extension.
    /// @param _minOrderDuration Min. order listing duration
    /// @param _minBidValue Min. value for a bid to be considered.
    function updateSettings(
        uint256 _minAuctionIncrement,
        uint256 _minOrderDuration,
        uint256 _minBidValue
    ) public onlyOwner {
        minOrderDuration = _minOrderDuration;
        minAuctionIncrement = _minAuctionIncrement;
        minBidValue = _minBidValue;
        emit AuctionSettingsUpdated(
            minOrderDuration,
            minAuctionIncrement,
            minBidValue
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

    /// @notice Enables the contract's owner to change recipient address.
    /// @dev Function Signature := 0x3bbed4a0
    function setRecipient(address _recipient)
        external
        onlyOwner
    {
        recipient = _recipient;
    }

    /// @dev Function Signature := 0x13af4035
    function setOwner(address newOwner)
        public
        override
        onlyOwner
    {
        owner = newOwner;

        emit OwnerUpdated(msg.sender, newOwner);
    }

    /// @dev Function Signature := 0x3ccfd60b
    function withdraw() external onlyOwner whenPaused {
        SafeTransferLib.safeTransferETH(
            msg.sender,
            address(this).balance
        );
    }

    /// @notice Delete order function only callabe by contract's owner, when contract is paused, as security measure.
    /// @dev Function Signature := 0x0c026db9
    function delOrder(
        bytes32 hash,
        IERC1155 _token,
        uint256 _id,
        uint256 _amount,
        address _seller
    ) external onlyOwner whenPaused {
        delete orderInfo[hash];
        delete orderIdByToken[_token][_id][_amount];
        delete orderIdBySeller[_seller];

        // test if token is properly transfered back to it's owner
        _token.safeTransferFrom(
            address(this),
            _seller,
            _id,
            _amount,
            ""
        );
    }

    ////////////////////////////////////////////////////////////////
    //                        INTERNAL FX                         //
    ////////////////////////////////////////////////////////////////

    /// @notice Internal order path resolver.
    /// @dev Function Signature := 0x4ac079a6
    /// @param _orderType Values legend:
    /// 0=Fixed Price; 1=Dutch Auction; 2=English Auction.
    /// @param _endBlock Equals to canceled order when value is set to 0.
    function _makeOrder(
        uint8 _orderType,
        IERC1155 _token,
        uint256 _id,
        uint256 _amount,
        uint256 _startPrice,
        uint256 _endPrice,
        uint256 _endBlock
    ) internal {
        if (
            _endBlock <= block.number &&
            _endBlock - block.number < minOrderDuration
        ) revert NeedMoreTime();
        if (_startPrice == 0) revert WrongPrice();

        bytes32 hash = _hash(
            _token,
            _id,
            _amount,
            msg.sender
        );
        orderInfo[hash] = Types.Order1155(
            _orderType,
            msg.sender,
            _token,
            _id,
            _amount,
            _startPrice,
            _endPrice,
            block.number,
            _endBlock,
            0,
            address(0),
            false
        );
        orderIdByToken[_token][_id][_amount].push(hash);
        orderIdBySeller[msg.sender].push(hash);

        _token.safeTransferFrom(
            msg.sender,
            address(this),
            _id,
            _amount,
            ""
        );

        emit MakeOrder(
            _token,
            _id,
            _amount,
            hash,
            msg.sender
        );
    }

    /// @notice Provides hash of an order used as an order info pointer
    /// @dev Function Signature := 0x3b1ce0d2
    function _hash(
        IERC1155 _token,
        uint256 _id,
        uint256 _amount,
        address _seller
    ) internal view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    block.number,
                    _token,
                    _id,
                    _amount,
                    _seller
                )
            );
    }

    ////////////////////////////////////////////////////////////////
    //                           VIEW FX                          //
    ////////////////////////////////////////////////////////////////

    /// @notice Works as price fetcher of listed tokens
    /// @dev Function Signature := 0x161e444e
    /// @dev Used for price fetching in buy function.
    function getCurrentPrice(bytes32 _order)
        public
        view
        returns (uint256)
    {
        Types.Order1155 storage order = orderInfo[_order];
        uint8 orderType = order.orderType;
        // Fixed Price
        if (orderType == 0) {
            return order.startPrice;
            // English Auction
        } else if (orderType == 2) {
            uint256 lastBidPrice = order.lastBidPrice;
            return
                lastBidPrice == 0
                    ? order.startPrice
                    : lastBidPrice;
        } else {
            // Ductch Auction
            uint256 _startPrice = order.startPrice;
            uint256 _startBlock = order.startBlock;
            uint256 tickPerBlock = (_startPrice -
                order.endPrice) /
                (order.endBlock - _startBlock);
            return
                _startPrice -
                ((block.number - _startBlock) * tickPerBlock);
        }
    }

    /// @notice Everything in storage can be fetch through the
    /// getters natively provided by all public mappings.
    /// @dev This public getter serve as a hook to ease frontend
    /// fetching whilst estimating `orderIdByToken` indexes by length.
    /// @dev Function Signature := 0x8c5ac795
    function tokenOrderLength(
        IERC1155 _token,
        uint256 _id,
        uint256 _amount
    ) external view returns (uint256) {
        return orderIdByToken[_token][_id][_amount].length;
    }

    /// @notice Everything in storage can be fetch through the
    /// getters natively provided by all public mappings.
    /// @dev This public getter serve as a hook to ease frontend
    /// fetching whilst estimating `orderIdBySeller` indexes by length.
    /// @dev Function Signature := 0x8aae982a
    function sellerOrderLength(address _seller)
        external
        view
        returns (uint256)
    {
        return orderIdBySeller[_seller].length;
    }
}
