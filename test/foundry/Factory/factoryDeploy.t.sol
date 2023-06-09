// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "forge-std/src/Test.sol";
import {
    DeployFactoryBase,
    IFactory
} from "test/foundry/Base/Factory/deployFactoryBase.sol";

contract DeployFactory is Test, DeployFactoryBase {
    function setUp() public {
        // vm.startPrank(factoryOwner);
        vm.deal(factoryOwner, 1000 ether);
    }

    function testERC721DeployFactoryDefault() public {
        deployDefault(ercTypes.ERC721);
    }

    function testERC1155DeployFactoryDefault() public {
        deployDefault(ercTypes.ERC1155);
    }

    function testERC721DeployFactoryZeroAddresses() public {
        deployZeroAddresses(ercTypes.ERC721);
    }

    function testERC1155DeployFactoryZeroAddresses() public {
        deployZeroAddresses(ercTypes.ERC1155);
    }

    function deployDefault(ercTypes ercType) public {
        IFactory factory = deployFactoryDefault(ercType);
        setRouter(factory, factoryRouterAddress, factoryOwner);
    }

    function deployZeroAddresses(ercTypes ercType) public {
        address temp;
        uint256 len = factoryDefaultAddresses.length;
        address[] memory _addresses = factoryDefaultAddresses;
        // iterate over the factoryDefaultAddresses array, each time setting one
        // to address(0)
        for (uint256 i = 0; i < len; i++) {
            temp = _addresses[i];
            _addresses[i] = address(0);

            vm.expectRevert();

            deployFactoryCustom(
                ercType,
                factoryOwner,
                _addresses[0],
                _addresses[1],
                _addresses[2]
            );
            // reset the address back to original for next loop
            _addresses[i] = temp;
        }
    }
}
