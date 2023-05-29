// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import { MADRouter721 } from "contracts/Router/MADRouter721.sol";
import { MADRouter1155 } from "contracts/Router/MADRouter1155.sol";
import { FactoryVerifier } from "contracts/Shared/EventsAndErrors.sol";

contract RouterFactory {
    function createRouter(
        uint8 routerType,
        FactoryVerifier _factoryVerifier,
        address _paymentTokenAddressRouter,
        address _recipientRouter
    ) public returns (address newRouter) {
        if (routerType == 1) {
            return address(
                new MADRouter721(
                    _factoryVerifier,
                    _paymentTokenAddressRouter,
                    _recipientRouter
                )
            );
        } else if (routerType == 2) {
            return address(
                new MADRouter1155(
                    _factoryVerifier,
                    _paymentTokenAddressRouter,
                    _recipientRouter
                )
            );
        } else {
            revert("Invalid router type");
        }
    }
}
