// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "forge-std/src/Test.sol";
import {
    DeployFactoryBase,
    IFactory
} from "test/foundry/Base/Factory/deployFactoryBase.sol";

import { AddressesHelp } from "test/foundry/utils/addressesHelp.sol";

contract DeployFactory is AddressesHelp, DeployFactoryBase {
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

    function deployDefault(ercTypes ercType) public {
        address factory = deployFactoryDefault(ercType);
        setRouter(IFactory(factory), factoryRouterAddress, factoryOwner);
    }
}
