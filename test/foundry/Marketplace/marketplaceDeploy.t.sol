// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "forge-std/src/Test.sol";
import {
    DeployMarketplaceBase,
    IMarketplace
} from "test/foundry/Base/Marketplace/deployMarketplaceBase.sol";

import { Enums } from "test/foundry/utils/enums.sol";

contract DeployERC721Marketplace is Test, DeployMarketplaceBase {
    function setUp() public {
        // vm.startPrank(marketplaceOwner);
        vm.deal(marketplaceOwner, 1000 ether);
    }

    function testDeployDefaultERC721Marketplace() public {
        deployDefault(ercTypes.ERC721);
    }

    function testDeployZeroAddressesERC721Marketplace() public {
        deployZeroAddresses(ercTypes.ERC721);
    }

    function testDeployDefaultERC1155Marketplace() public {
        deployDefault(ercTypes.ERC1155);
    }

    function testDeployZeroAddressesERC1155Marketplace() public {
        deployZeroAddresses(ercTypes.ERC1155);
    }

    function deployDefault(ercTypes ercType) public {
        IMarketplace mp = deployMarketplaceDefault(ercType);
        setFactory(mp, factoryVerifierMarketplace, marketplaceOwner);
    }

    function deployZeroAddresses(ercTypes ercType) public {
        address temp;
        uint256 len = marketplaceDefaultAddresses.length;
        address[] memory _addresses = marketplaceDefaultAddresses;
        // iterate over the marketplaceDefaultAddresses array, each time setting
        // one
        // to address(0)
        for (uint256 i = 0; i < len; i++) {
            temp = _addresses[i];
            _addresses[i] = address(0);

            vm.expectRevert();

            deployMarketplaceCustom(
                ercType,
                marketplaceOwner,
                _addresses[0],
                _addresses[1],
                _addresses[2]
            );
            // reset the address back to original for next loop
            _addresses[i] = temp;
        }
    }
}
