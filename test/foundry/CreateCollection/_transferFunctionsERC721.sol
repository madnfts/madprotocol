pragma solidity 0.8.19;

import "forge-std/src/Test.sol";
import { IERC721Basic } from "test/foundry/Base/Tokens/ERC721/IERC721Basic.sol";

import { ICollection } from "test/foundry/CreateCollection/ICollection.sol";

abstract contract ERC721TransferFunctions is Test {
    function _checkOwnerOf(address _owner, ICollection.MintData memory mintData)
        internal
        returns (bool ownsAll)
    {
        ownsAll = true;
        IERC721Basic collection = IERC721Basic(mintData.collectionAddress);
        for (
            uint256 i = mintData.newTotalSupply;
            i > mintData.totalSupplyBefore;
            --i
        ) {
            // Check that the nftReceiver is the Owner
            if (collection.ownerOf(i) != _owner) {
                ownsAll = false;
            }
        }
    }

    function _checkTransferFrom(ICollection.MintData memory mintData)
        internal
    {
        IERC721Basic collection = IERC721Basic(mintData.collectionAddress);
        //send to friend and have it sent back using transferFrom.
        address friend = makeAddr("friend");
        vm.deal(friend, 1000 ether);

        vm.prank(mintData.nftReceiver);
        collection.transferFrom(
            mintData.nftReceiver, friend, mintData.amountToMint
        );

        // Check that nftReceiver no longer has the token
        assertTrue(
            collection.balanceOf(mintData.nftReceiver)
                == mintData.balanceNftReceiverBefore
        );
        assertTrue(!_checkOwnerOf(mintData.nftReceiver, mintData));

        // Check that friend  now has the token
        assertTrue(collection.balanceOf(friend) == mintData.amountToMint);
        assertTrue(_checkOwnerOf(friend, mintData));

        // Check the totalSupply of the collection has NOT increased
        assertTrue(collection.totalSupply() == mintData.newTotalSupply);

        // Send token back to nftReceiver
        vm.prank(friend);
        collection.transferFrom(
            friend, mintData.nftReceiver, mintData.amountToMint
        );

        // Check that nftReceiver has the token
        assertTrue(
            collection.balanceOf(mintData.nftReceiver)
                == mintData.balanceNftReceiverBefore
        );
        assertTrue(_checkOwnerOf(mintData.nftReceiver, mintData));

        // Check that friend  Does NOT have the token
        assertTrue(collection.balanceOf(friend) == 0);
        assertTrue(!_checkOwnerOf(friend, mintData));

        // Check the totalSupply of the collection has NOT increased
        assertTrue(collection.totalSupply() == mintData.newTotalSupply);
    }

    function _checkSafeTransferFrom(ICollection.MintData memory mintData)
        internal
    {
        IERC721Basic collection = IERC721Basic(mintData.collectionAddress);
        address friend = makeAddr("friend");
        vm.deal(friend, 1000 ether);

        //------------------------------------------------------------
        //send to friend and have it sent back using safeTransferFrom.
        vm.prank(mintData.nftReceiver);
        collection.safeTransferFrom(
            mintData.nftReceiver, friend, mintData.amountToMint
        );

        // Check that nftReceiver no longer has the token
        assertTrue(
            collection.balanceOf(mintData.nftReceiver)
                == mintData.balanceNftReceiverBefore
        );
        assertTrue(!_checkOwnerOf(mintData.nftReceiver, mintData));

        // Check that friend  now has the token
        assertTrue(collection.balanceOf(friend) == mintData.amountToMint);
        assertTrue(_checkOwnerOf(friend, mintData));

        // Check the totalSupply of the collection has NOT increased
        assertTrue(collection.totalSupply() == mintData.newTotalSupply);

        // Send token back to nftReceiver
        vm.prank(friend);
        collection.safeTransferFrom(
            friend, mintData.nftReceiver, mintData.amountToMint
        );

        // Check that nftReceiver has the token
        assertTrue(
            collection.balanceOf(mintData.nftReceiver)
                == mintData.balanceNftReceiverBefore + mintData.amountToMint
        );
        assertTrue(_checkOwnerOf(mintData.nftReceiver, mintData));

        // Check that friend  Does NOT have the token
        assertTrue(collection.balanceOf(friend) == 0);
        assertTrue(!_checkOwnerOf(friend, mintData));

        // Check the totalSupply of the collection has NOT increased
        assertTrue(collection.totalSupply() == mintData.newTotalSupply);
    }

    function _checkSafeTransferFromWithData(
        ICollection.MintData memory mintData
    ) internal {
        IERC721Basic collection = IERC721Basic(mintData.collectionAddress);
        address friend = makeAddr("friend");
        vm.deal(friend, 1000 ether);
        //------------------------------------------------------------
        //send to friend and have it sent back using safeTransferFrom with  data.

        bytes memory data = "SomeDataToSend";

        vm.prank(mintData.nftReceiver);
        collection.safeTransferFrom(mintData.nftReceiver, friend, 1, data);

        // Check that nftReceiver no longer has the token
        assertTrue(
            collection.balanceOf(mintData.nftReceiver)
                == mintData.balanceNftReceiverBefore
        );
        assertTrue(!_checkOwnerOf(mintData.nftReceiver, mintData));

        // Check that friend  now has the token
        assertTrue(collection.balanceOf(friend) == mintData.amountToMint);
        assertTrue(_checkOwnerOf(friend, mintData));

        // Check the totalSupply of the collection has NOT increased
        assertTrue(collection.totalSupply() == mintData.newTotalSupply);

        // Send token back to nftReceiver
        vm.prank(friend);
        collection.safeTransferFrom(friend, mintData.nftReceiver, 1, data);

        // Check that nftReceiver has the token
        assertTrue(
            collection.balanceOf(mintData.nftReceiver)
                == mintData.balanceNftReceiverBefore + mintData.amountToMint
        );
        assertTrue(_checkOwnerOf(mintData.nftReceiver, mintData));

        // Check that friend  Does NOT have the token
        assertTrue(collection.balanceOf(friend) == 0);
        assertTrue(!_checkOwnerOf(friend, mintData));

        // Check the totalSupply of the collection has NOT increased
        assertTrue(collection.totalSupply() == mintData.newTotalSupply);
    }
}
