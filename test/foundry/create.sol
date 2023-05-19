
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "forge-std/Test.sol";
import {TwoFactorNFT, MADRouter721} from "./mocks/twoFactorNFT.sol";

contract TwoFactorNFTTest is Test {
    TwoFactorNFT public twoFactorNFT;
    MADRouter721 public madRouter721;

    address nftOwner = makeAddr("NFTOwner");
    address routerOwner = makeAddr("RouterOwner");

    function setUp() public {
        vm.prank(routerOwner);
        madRouter721 = new MADRouter721();
    }

    function testTwoFactorNFT() public {
        // Create a new NFT
        vm.prank(nftOwner);
        TwoFactorNFT nft = TwoFactorNFT(madRouter721.createNft());

        // Check ownership
        emit log_named_address("Owner of NFT:  ", nft.owner());
        emit log_named_address("Router of NFT: ", nft.router());

        assertEq(nft.owner(), nftOwner);
        assertEq(nft.router(), address(madRouter721));

        // try to withdraw direct from the contract as the owner.
        nft.withdraw();

        // try to withdraw via the router
        madRouter721.withdraw();

    }

}

// Logs:
//   Owner of NFT:  : 0x27b690b81834cc0c2dcdf46708ec983f681db3ec
//   Router of NFT: : 0x879eaeaaee45587875de83c85860ddce9c0e9dea