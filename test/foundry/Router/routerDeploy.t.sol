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
        deployRouterDefault(2);
    }

    function testDeployDefaultERC721Router() public {
        deployRouterDefault(1);
    }

    function testDeployZeroAddressesERC1155Router() public {
        deployZeroAddresses(2);
    }

    function testDeployZeroAddressesERC721Router() public {
        deployZeroAddresses(1);
    }

    function deployDefault(uint8 _type) public {
        deployRouterDefault(_type);
    }

    function deployZeroAddresses(uint8 _type) public {
        address temp;
        uint256 len = routerDefaultAddresses.length;
        address[] memory _addresses = routerDefaultAddresses;
        // iterate over the RouterDefaultAddresses array, each time setting one
        // to address(0)
        for (uint256 i = 0; i < len; i++) {
            temp = _addresses[i];
            _addresses[i] = address(0);

            vm.expectRevert();

            deployRouterCustom(
                _type, routerOwner, _addresses[0], _addresses[1], _addresses[2]
            );
            // reset the address back to original for next loop
            _addresses[i] = temp;
        }
    }
}
