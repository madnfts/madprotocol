// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import {
    DeployRouterBase,
    IRouter
} from "test/foundry/Base/Router/deployRouterBase.sol";

import { RouterBaseFunctions } from
    "test/foundry/Base/Router/routerBaseFunctions.sol";

contract DeployERC1155Router is DeployRouterBase, RouterBaseFunctions {
    function setUp() public {
        // vm.startPrank(routerOwner);
        vm.deal(routerOwner, 1000 ether);
    }

    function testDeployDefaultERC1155Router() public {
        address router = deployRouterDefault(ercTypes.ERC1155);
        _setRouterFees(routerOwner, IRouter(router), 1.0 ether, 0.25 ether);
    }

    function testDeployDefaultERC721Router() public {
        address router = deployRouterDefault(ercTypes.ERC721);
        _setRouterFees(routerOwner, IRouter(router), 1.0 ether, 0.25 ether);
    }

    function testDeployZeroAddressesERC1155Router() public {
        deployZeroAddresses(
            ercTypes.ERC1155,
            routerDefaultAddresses,
            routerOwner,
            _deployRouterCustomInternal
        );
    }

    function testDeployZeroAddressesERC721Router() public {
        deployZeroAddresses(
            ercTypes.ERC721,
            routerDefaultAddresses,
            routerOwner,
            _deployRouterCustomInternal
        );
    }

    function deployDefault(ercTypes ercType) public {
        IRouter router = IRouter(deployRouterDefault(ercType));
        _setRouterFees(routerOwner, router, 1.0 ether, 0.25 ether);
    }
}
