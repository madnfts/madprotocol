// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { FactoryVerifier } from "contracts/Shared/EventsAndErrors.sol";

interface IMarketplace {
    // Getters
    function owner() external view returns (address);
    function swapRouter() external view returns (address);
    function recipient() external view returns (address);
    function erc20() external view returns (address);
    function MADFactory() external view returns (FactoryVerifier);

    function MAX_FEES() external view returns (uint256);
    function MAX_ROYALTY_FEE() external view returns (uint256);
    function basisPoints() external view returns (uint16);
    function feeTier() external view returns (uint24);

    function maxFee() external view returns (uint256);
    function maxOrderDuration() external view returns (uint256);

    function minAuctionIncrement() external view returns (uint256);
    function minAuctionIncrementMAX() external view returns (uint256);
    function minBidValue() external view returns (uint256);
    function minOrderDuration() external view returns (uint256);
    function minOrderDurationtMAX() external view returns (uint256);

    function royaltyFee() external view returns (uint256);
    function totalOutbid() external view returns (uint256);

    // Order Getters
    function orderIdBySeller(address, uint256)
        external
        view
        returns (bytes32);

    function sellerOrderLength(address _seller)
        external
        view
        returns (uint256);

    function getCurrentPrice(bytes32 _order)
        external
        view
        returns (uint256 price);

    function userOutbid(address) external view returns (uint256);

    // Setters
    function setFactory(FactoryVerifier factory) external;
    function setOwner(address newOwner) external;
    function setRecipient(address _recipient) external;

    function setFees(uint256 _royaltyFee, uint256 _maxFee) external;
    function setMinAuctionIncrementMAX(uint256 _minAuctionIncrementMAX)
        external;
    function setMinOrderDurationtMAX(uint256 _minOrderDurationtMAX) external;

    function updateSettings(
        uint256 _minAuctionIncrement,
        uint256 _minOrderDuration,
        uint256 _minBidValue,
        uint256 _maxOrderDuration
    ) external;

    // Order Setters
    function bid(bytes32 _order) external;
    function buy(bytes32 _order) external;
    function cancelOrder(bytes32 _order) external;
    function claim(bytes32 _order) external;

    // Withdaw Functions
    function withdraw() external;
    function withdrawERC20() external;
    function withdrawOutbid(address _token, uint256 minOut, uint160 priceLimit)
        external;
    function withdrawOutbidEth() external;
}
