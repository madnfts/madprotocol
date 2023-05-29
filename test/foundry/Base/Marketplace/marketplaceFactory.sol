// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import { MADMarketplace721 } from "contracts/Marketplace/MADMarketplace721.sol";
import { MADMarketplace1155 } from
    "contracts/Marketplace/MADMarketplace1155.sol";

contract MarketplaceFactory {
    function createMarketplace(
        uint8 marketplaceType,
        address _recipientMarketplace,
        address _paymentTokenAddressMarket,
        address _swapRouter
    ) public returns (address newMarketplace) {
        if (marketplaceType == 1) {
            return address(
                new MADMarketplace721(
                    _recipientMarketplace,
                    _paymentTokenAddressMarket,
                    _swapRouter
                )
            );
        } else if (marketplaceType == 2) {
            return address(
                new MADMarketplace1155(
                    _recipientMarketplace,
                    _paymentTokenAddressMarket,
                    _swapRouter
                )
            );
        } else {
            revert("Invalid marketplace type");
        }
    }
}
