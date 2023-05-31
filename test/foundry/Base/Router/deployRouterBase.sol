// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/src/Test.sol";
import { IRouter } from "test/foundry/Base/Router/IRouter.sol";
import {
    RouterFactory,
    FactoryVerifier
} from "test/foundry/Base/Router/routerFactory.sol";

contract DeployRouterBase is Test, RouterFactory {
    address routerOwner = makeAddr("RouterOwner");
    address paymentTokenAddressRouter = makeAddr("paymentTokenAddressRouter");
    address recipientRouter = makeAddr("RecipientRouter");
    address factoryVerifierRouter = makeAddr("RouterFactory");

    address[] routerDefaultAddresses =
        [recipientRouter, paymentTokenAddressRouter, factoryVerifierRouter];

    function deployRouterDefault(ercTypes _ercType)
        public
        returns (IRouter madRouter)
    {
        madRouter = deployRouterCustom(
            _ercType,
            routerOwner,
            recipientRouter,
            paymentTokenAddressRouter,
            factoryVerifierRouter
        );
    }

    function deployRouterCustom(
        ercTypes _ercType,
        address _owner,
        address _recipientRouter,
        address _paymentTokenAddressRouter,
        address factory
    ) public returns (IRouter madRouter) {
        FactoryVerifier _factoryVerifier = FactoryVerifier(factory);

        vm.prank(_owner);

        address routerAddress = createRouter(
            _ercType,
            _factoryVerifier,
            _paymentTokenAddressRouter,
            _recipientRouter
        );

        madRouter = IRouter(routerAddress);

        if (routerAddress != address(1)) {
            assert(madRouter.owner() == _owner);
            assert(madRouter.madFactory() == _factoryVerifier);
            assert(madRouter.recipient() == _recipientRouter);
            assert(address(madRouter.erc20()) == _paymentTokenAddressRouter);
        }
    }
}
