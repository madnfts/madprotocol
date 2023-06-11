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

contract testMintBurnAndTradeERC721 is CreateCollectionHelpers, Enums {
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
        (address _collectionAddress, address _splitterAddress) =
        _createCollectionDefault(
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
    }
}
