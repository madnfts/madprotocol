// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { MADMarketplace721 } from "contracts/Marketplace/MADMarketplace721.sol";
import { MADMarketplace1155 } from
    "contracts/Marketplace/MADMarketplace1155.sol";
import { Enums } from "test/foundry/utils/enums.sol";

contract MarketplaceFactory is Enums {
    function createMarketplace(
        ercTypes ercType,
        address _recipientMarketplace,
        address _paymentTokenAddressMarket,
        address _swapRouter
    ) public returns (address newMarketplace) {
        if (ercType == ercTypes.ERC721) {
            return address(
                new MADMarketplace721(
                    _recipientMarketplace,
                    _paymentTokenAddressMarket,
                    _swapRouter
                )
            );
        } else if (ercType == ercTypes.ERC1155) {
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
