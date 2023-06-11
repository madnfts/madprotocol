pragma solidity 0.8.19;

import "forge-std/src/Test.sol";
import {
    ISplitter,
    Deployer,
    IDeployer
} from "test/foundry/Base/Splitter/deploySplitterBase.sol";

import { Enums } from "test/foundry/utils/enums.sol";

import {
    CreateCollectionHelpers,
    DeploySplitterBase,
    IFactory,
    SplitterHelpers
} from "test/foundry/CreateCollection/createCollectionHelpers.sol";

import { IERC721Basic } from "test/foundry/Base/Tokens/ERC721/IERC721Basic.sol";

contract testMintBurnAndTransferERC721 is CreateCollectionHelpers, Enums {
    IDeployer.DeployedContracts deployedContracts;
    Deployer deployer;
    DeploySplitterBase splitterDeployer;

    uint256 nftMintFee = 0.25 ether; // default contract
    uint256 nftBurnFee; // default contract

    // Create default addresses
    address nftReceiver = makeAddr("nftReceiverDefault");
    address nftMinter = makeAddr("nftMinterDefault");

    function setUp() public {
        // Instantiate deployer contracts
        deployer = new Deployer();

        // Instantiate splitter deployer contract
        splitterDeployer = new DeploySplitterBase();

        // Create array of deployed contracts instances for ERC721
        deployedContracts = deployer.deployAll(ercTypes.ERC721);
    }

    function testMintToDefaultSingle() public {
        _mintToSingle(nftMinter, nftReceiver, nftMintFee);
    }

    function testFailMintToIncorrectFeeSingleFuzzy(uint256 _nftMintFee)
        public
    {
        vm.assume(_nftMintFee != nftMintFee);
        _mintToSingle(nftMinter, nftReceiver, _nftMintFee);
    }

    function testFailMintToUnAuthorised() public {
        (address _collectionAddress, address _splitterAddress) =
            _mintToSingle(nftMinter, nftReceiver, nftMintFee);
        // Mint to nftReceiver
        address prankster = makeAddr("prankster");
        vm.prank(prankster);
        IERC721Basic collection = IERC721Basic(_collectionAddress);
        collection.mintTo{value: nftMintFee}(nftReceiver, 1, nftReceiver);
    }

    function _mintToSingle(
        address _nftMinter,
        address _nftReceiver,
        uint256 _nftMintFee
    ) internal returns (address _collectionAddress, address _splitterAddress) {
        // Add Ether to Accounts
        vm.deal(_nftMinter, 1000 ether);
        vm.deal(_nftReceiver, 1000 ether);

        // Create Collection & Splitter
        (_collectionAddress, _splitterAddress) = _createCollectionDefault(
            deployedContracts.factory, splitterDeployer, _nftMinter
        );

        IERC721Basic collection = IERC721Basic(_collectionAddress);
        // ISplitter splitter = ISplitter(_splitterAddress);

        // Mint to nftReceiver
        vm.prank(_nftMinter);
        collection.mintTo{value: _nftMintFee}(_nftReceiver, 1, _nftReceiver);

        // Check that nftReceiver has the token
        assertTrue(collection.balanceOf(_nftReceiver) == 1);

        // Check the totalSupply of the collection has increased
        assertTrue(collection.totalSupply() == 1);

        //send to friend and have it sent back using transferFrom.
        address friend = makeAddr("friend");
        vm.prank(_nftReceiver);
        collection.transferFrom(_nftReceiver, friend, 1);

        // Check that nftReceiver no longer has the token
        assertTrue(collection.balanceOf(_nftReceiver) == 0);

        // Check that friend  now has the token
        assertTrue(collection.balanceOf(friend) == 1);

        // Check the totalSupply of the collection has NOT increased
        assertTrue(collection.totalSupply() == 1);

        // Send token back to nftReceiver
        vm.prank(friend);
        collection.transferFrom(friend, nftReceiver, 1);

        // Check that nftReceiver has the token
        assertTrue(collection.balanceOf(_nftReceiver) == 1);

        // Check that friend  Does NOT have the token
        assertTrue(collection.balanceOf(friend) == 0);

        // Check the totalSupply of the collection has NOT increased
        assertTrue(collection.totalSupply() == 1);

        //------------------------------------------------------------
        //send to friend and have it sent back using safeTransferFrom.
        vm.prank(_nftReceiver);
        collection.safeTransferFrom(_nftReceiver, friend, 1);

        // Check that nftReceiver no longer has the token
        assertTrue(collection.balanceOf(_nftReceiver) == 0);

        // Check that friend  now has the token
        assertTrue(collection.balanceOf(friend) == 1);

        // Check the totalSupply of the collection has NOT increased
        assertTrue(collection.totalSupply() == 1);

        // Send token back to nftReceiver
        vm.prank(friend);
        collection.safeTransferFrom(friend, nftReceiver, 1);

        // Check that nftReceiver has the token
        assertTrue(collection.balanceOf(_nftReceiver) == 1);

        // Check that friend  Does NOT have the token
        assertTrue(collection.balanceOf(friend) == 0);

        // Check the totalSupply of the collection has NOT increased
        assertTrue(collection.totalSupply() == 1);

        //------------------------------------------------------------
        //send to friend and have it sent back using safeTransferFrom with  data.

        bytes memory data = "SomeDataToSend";

        vm.prank(_nftReceiver);
        collection.safeTransferFrom(_nftReceiver, friend, 1, data);

        // Check that nftReceiver no longer has the token
        assertTrue(collection.balanceOf(_nftReceiver) == 0);

        // Check that friend  now has the token
        assertTrue(collection.balanceOf(friend) == 1);

        // Check the totalSupply of the collection has NOT increased
        assertTrue(collection.totalSupply() == 1);

        // Send token back to nftReceiver
        vm.prank(friend);
        collection.safeTransferFrom(friend, nftReceiver, 1, data);

        // Check that nftReceiver has the token
        assertTrue(collection.balanceOf(_nftReceiver) == 1);

        // Check that friend  Does NOT have the token
        assertTrue(collection.balanceOf(friend) == 0);

        // Check the totalSupply of the collection has NOT increased
        assertTrue(collection.totalSupply() == 1);
    }

    // function _mintToSingle(
    //     address _nftMinter,
    //     address _nftReceiver,
    //     uint256 _nftMintFee
    // ) internal returns (address _collectionAddress, address _splitterAddress)
    // {
    //     // Create necessary addresses
    //     address friend = makeAddr("friend");

    //     // Add Ether to Accounts
    //     vm.deal(nftReceiver, 1000 ether);
    //     vm.deal(friend, 1000 ether);

    //     // Create Collection & Splitter
    //     (
    //         address _collectionAddress,
    //         // address _splitterAddress
    //     ) = _createCollectionDefault(
    //         deployedContracts.factory, splitterDeployer, nftReceiver
    //     );

    //     IERC721Basic collection = IERC721Basic(_collectionAddress);
    //     // ISplitter splitter = ISplitter(_splitterAddress);

    //     // Test transfer scenario 1: nftReceiver to friend
    //     _mintAndCheck(collection, nftReceiver, friend, "SomeDataToSend");

    //     // Test transfer scenario 2: friend to nftReceiver
    //     _mintAndCheck(collection, friend, nftReceiver, "SomeDataToSend");
    // }

    // function _mintAndCheck(
    //     IERC721Basic collection,
    //     address from,
    //     address recipient,
    //     bytes memory data
    // ) internal {
    //     uint128 mintAmount = 1;
    //     uint256 balanceFrom = collection.balanceOf(from);
    //     uint256 balanceRecipient = collection.balanceOf(recipient);
    //     uint256 totalSupply = collection.totalSupply();

    //     // Mint to 'from' address
    //     vm.prank(from);
    //     collection.mintTo{value: nftMintFee}(from, mintAmount, from);

    //     // Check that 'from' has the token
    //     assertTrue(collection.balanceOf(from) == balanceFrom + mintAmount);

    //     // Check the totalSupply of the collection has increased
    //     assertTrue(collection.totalSupply() == totalSupply + mintAmount);

    //     // Transfer token from 'from' to 'recipient' using safeTransferFrom
    //     // without data
    //     vm.prank(from);
    //     collection.safeTransferFrom(from, recipient, mintAmount);

    //     // Check that 'from' no longer has the token
    //     assertTrue(collection.balanceOf(from) == balanceFrom - mintAmount);

    //     // Check that 'recipient' now has the token
    //     assertTrue(
    //         collection.balanceOf(recipient) == balanceRecipient + mintAmount
    //     );

    //     // Check the totalSupply of the collection has not increased
    //     assertTrue(collection.totalSupply() == totalSupply);

    //     // Send token back from 'recipient' to 'from' using safeTransferFrom
    //     // with data
    //     vm.prank(recipient);
    //     collection.safeTransferFrom(recipient, from, mintAmount, data);

    //     // Check that 'from' has the token again
    //     assertTrue(collection.balanceOf(from) == balanceFrom + mintAmount);

    //     // Check that 'recipient' does not have the token
    //     assertTrue(
    //         collection.balanceOf(recipient) == balanceRecipient - mintAmount
    //     );

    //     // Check the totalSupply of the collection has not increased
    //     assertTrue(collection.totalSupply() == totalSupply);

    //     // Transfer token from 'from' to 'recipient' using transferFrom
    //     collection.transferFrom(from, recipient, mintAmount);

    //     // Check that 'from' no longer has the token
    //     assertTrue(collection.balanceOf(from) == balanceFrom - mintAmount);

    //     // Check that 'recipient' now has the token
    //     assertTrue(
    //         collection.balanceOf(recipient) == balanceRecipient + mintAmount
    //     );

    //     // Check the totalSupply of the collection has not increased
    //     assertTrue(collection.totalSupply() == totalSupply);

    //     // Transfer token back from 'recipient' to 'from' using transferFrom
    //     collection.transferFrom(recipient, from, mintAmount);

    //     // Check that 'from' has the token again
    //     assertTrue(collection.balanceOf(from) == balanceFrom + mintAmount);

    //     // Check that 'recipient' no longer has the token
    //     assertTrue(
    //         collection.balanceOf(recipient) == balanceRecipient - mintAmount
    //     );

    //     // Check the totalSupply of the collection has not increased
    //     assertTrue(collection.totalSupply() == totalSupply);
    // }
}
