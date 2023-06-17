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

contract TestMintBurnAndTransferERC721 is CreateCollectionHelpers, Enums {
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
        MintData memory mintData =
            _mintToERC721(nftMinter, nftReceiver, nftMintFee, 1);
        _checkTransferFrom(mintData);
        _checkSafeTransferFrom(mintData);
        _checkSafeTransferFromWithData(mintData);
    }

    function testMintToDefaultMultiple() public {
        for (uint256 i = 0; i < 10; i++) {
            MintData memory mintData =
                _mintToERC721(nftMinter, nftReceiver, nftMintFee, 10);
            _checkTransferFrom(mintData);
            _checkSafeTransferFrom(mintData);
            _checkSafeTransferFromWithData(mintData);
        }
    }

    function testMintToDefaultFuzzy(uint256 x) public {
        vm.assume(x < 10);
        MintData memory mintData =
            _mintToERC721(nftMinter, nftReceiver, nftMintFee, 1);
        _checkTransferFrom(mintData);
        _checkSafeTransferFrom(mintData);
        _checkSafeTransferFromWithData(mintData);
    }

    function testFailMintToIncorrectFeeSingle(uint256 _mintFee) public {
        vm.assume(_mintFee != nftMintFee);
        _mintToERC721(nftMinter, nftReceiver, _mintFee, 1);
    }

    function testFailMintToUnAuthorised() public {
        MintData memory mintData =
            _mintToERC721(nftMinter, nftReceiver, nftMintFee, 1);
        // Mint to nftReceiver
        address prankster = makeAddr("prankster");
        vm.prank(prankster);
        IERC721Basic(mintData.collectionAddress).mintTo{value: nftMintFee}(
            nftReceiver, 1, nftReceiver
        );
    }

    function testFailMintToMaxSupply() public {
        // Mint Max Supply
        _mintToERC721(nftMinter, nftReceiver, nftMintFee, 10_000);

        // Try and mint more..
        _mintToERC721(nftMinter, nftReceiver, nftMintFee, 10_000);
    }

    function TestPublicMintDefault() public {
        // Create Collection & Splitter
        (address _collectionAddress, address _splitterAddress) =
        _createCollectionDefault(
            deployedContracts.factory, splitterDeployer, nftMinter
        );

        IERC721Basic collection = IERC721Basic(_collectionAddress);
        // ISplitter splitter = ISplitter(_splitterAddress);

        // Add Ether to Accounts
        vm.deal(nftMinter, 1000 ether);

        collection.setPublicMintState(true);

        uint256 _totalSupplyBefore = collection.totalSupply();

        // Mint to nftReceiver
        vm.prank(nftMinter);
        collection.mint{value: nftMintFee}(1);

        // Check that nftReceiver has the token(s)
        assertTrue(collection.balanceOf(nftMinter) == 1);

        // Check the totalSupply of the collection has increased
        assertTrue(collection.totalSupply() == _totalSupplyBefore + 1);

        // Check that nftReceiver is the Owner
        assertTrue(collection.ownerOf(1) == nftMinter);
    }

      function TestFailPublicMintDefault() public {
        // Create Collection & Splitter
        (address _collectionAddress, address _splitterAddress) =
        _createCollectionDefault(
            deployedContracts.factory, splitterDeployer, nftMinter
        );

        IERC721Basic collection = IERC721Basic(_collectionAddress);
        // ISplitter splitter = ISplitter(_splitterAddress);

        // Add Ether to Accounts
        vm.deal(nftMinter, 1000 ether);

        collection.setPublicMintState(false);

        uint256 _totalSupplyBefore = collection.totalSupply();

        // Mint to nftReceiver
        vm.prank(nftMinter);
        collection.mint{value: nftMintFee}(1);
    }

    function _mintToERC721(
        address _nftMinter,
        address _nftReceiver,
        uint256 _nftMintFee,
        uint128 _amountToMint
    ) internal returns (MintData memory mintData) {
        // Create Collection & Splitter
        (address _collectionAddress, address _splitterAddress) =
        _createCollectionDefault(
            deployedContracts.factory, splitterDeployer, _nftMinter
        );

        IERC721Basic collection = IERC721Basic(_collectionAddress);
        // ISplitter splitter = ISplitter(_splitterAddress);

        // Add Ether to Accounts
        vm.deal(_nftMinter, 1000 ether);
        vm.deal(_nftReceiver, 1000 ether);

        uint256 _totalSupplyBefore = collection.totalSupply();

        mintData = MintData({
            nftMinter: _nftMinter,
            nftReceiver: _nftReceiver,
            nftMintFee: _nftMintFee,
            amountToMint: _amountToMint,
            collectionAddress: _collectionAddress,
            splitterAddress: _splitterAddress,
            totalSupplyBefore: _totalSupplyBefore,
            newTotalSupply: _totalSupplyBefore + _amountToMint,
            balanceNftReceiverBefore: collection.balanceOf(_nftReceiver),
            balanceNftMinterBefore: collection.balanceOf(_nftMinter)
        });

        // Mint to nftReceiver
        vm.prank(_nftMinter);

        collection.mintTo{value: _nftMintFee}(
            _nftReceiver, _amountToMint, _nftReceiver
        );

        // Check that nftReceiver has the token(s)
        assertTrue(
            collection.balanceOf(_nftReceiver)
                == mintData.balanceNftReceiverBefore + _amountToMint
        );

        // Check the totalSupply of the collection has increased
        assertTrue(collection.totalSupply() == mintData.newTotalSupply);

        assertTrue(_checkOwnerOf(_nftReceiver, mintData));
    }
}
