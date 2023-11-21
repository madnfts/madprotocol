// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "test/lib/forge-std/src/Test.sol";
import {
    DeployMarketplaceBase,
    IMarketplace
} from "test/foundry/Base/Marketplace/deployMarketplaceBase.sol";

import { Enums } from "test/foundry/utils/enums.sol";
import { AddressesHelp } from "test/foundry/utils/addressesHelp.sol";

contract DeployERC721Marketplace is AddressesHelp, DeployMarketplaceBase {
    function setUp() public {
        // vm.startPrank(marketplaceOwner);
        vm.deal(marketplaceOwner, 1000 ether);
    }

    function testDeployDefaultERC721Marketplace() public {
        deployDefault(ercTypes.ERC721);
    }

    function testDeployZeroAddressesERC721Marketplace() public {
        deployZeroAddresses(
            ercTypes.ERC721,
            marketplaceDefaultAddresses,
            marketplaceOwner,
            _deployMarketplaceCustomInternal
        );
    }

    function testDeployDefaultERC1155Marketplace() public {
        deployDefault(ercTypes.ERC1155);
    }

    function testDeployZeroAddressesERC1155Marketplace() public {
        deployZeroAddresses(
            ercTypes.ERC1155,
            marketplaceDefaultAddresses,
            marketplaceOwner,
            _deployMarketplaceCustomInternal
        );
    }

    function deployDefault(ercTypes ercType) public {
        address mp = deployMarketplaceDefault(ercType);
        setFactory(
            IMarketplace(mp), factoryVerifierMarketplace, marketplaceOwner
        );
    }
}
