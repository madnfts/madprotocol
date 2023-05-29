// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import { MADFactory721 } from "contracts/Factory/MADFactory721.sol";
import { MADFactory1155 } from "contracts/Factory/MADFactory1155.sol";

contract FactoryFactory {
    function createFactory(
        uint8 factoryType,
        address _marketplaceAddressFactory,
        address _factorySignerAddress,
        address _paymentTokenAddressFactory
    ) public returns (address newFactory) {
        if (factoryType == 1) {
            return address(
                new MADFactory721(
                _marketplaceAddressFactory,
                _factorySignerAddress,
                _paymentTokenAddressFactory
                )
            );
        } else if (factoryType == 2) {
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
