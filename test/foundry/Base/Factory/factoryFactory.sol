// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { MADFactory721 } from "contracts/Factory/MADFactory721.sol";
import { MADFactory1155 } from "contracts/Factory/MADFactory1155.sol";

import { Enums } from "test/foundry/utils/enums.sol";

contract FactoryFactory is Enums {
    function createFactory(
        ercTypes ercType,
        address _marketplaceAddressFactory,
        address _factorySignerAddress,
        address _paymentTokenAddressFactory
    ) public returns (address newFactory) {
        if (ercType == ercTypes.ERC721) {
            return address(
                new MADFactory721(
                _marketplaceAddressFactory,
                _factorySignerAddress,
                _paymentTokenAddressFactory
                )
            );
        } else if (ercType == ercTypes.ERC1155) {
            return address(
                new MADFactory1155(
                _marketplaceAddressFactory,
                _factorySignerAddress,
                _paymentTokenAddressFactory
                )
            );
        } else {
            revert("Invalid factory type");
        }
    }
}
