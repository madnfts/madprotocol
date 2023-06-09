// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "forge-std/src/Test.sol";
import { DeployRouterBase } from "test/foundry/Base/Router/deployRouterBase.sol";

contract DeployERC1155Router is Test, DeployRouterBase {
    function setUp() public {
        // vm.startPrank(routerOwner);
        vm.deal(routerOwner, 1000 ether);
    }

    function testDeployDefaultERC1155Router() public {
        deployRouterDefault(ercTypes.ERC1155);
    }

    function testDeployDefaultERC721Router() public {
        deployRouterDefault(ercTypes.ERC721);
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
        deployRouterDefault(ercType);
    }
}
