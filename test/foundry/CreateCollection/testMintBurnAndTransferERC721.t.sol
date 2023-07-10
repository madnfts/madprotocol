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

    uint256 nftPublicMintPrice = 1 ether;

    // Create default addresses
    address nftReceiver = makeAddr("nftReceiverDefault");
    address nftMinter = makeAddr("nftMinterDefault");
    address prankster = makeAddr("prankster");

    function setUp() public {
        vm.deal(prankster, 20_000 ether);
        // Instantiate deployer contracts
        deployer = new Deployer();

        // Instantiate splitter deployer contract
        splitterDeployer = new DeploySplitterBase();

        // Create array of deployed contracts instances for ERC721
        deployedContracts = deployer.deployAll(ercTypes.ERC721);
    }

    function testMintTo_DefaultSingle() public {
        uint128 _amountToMint = 1;
        MintData memory mintData =
            _setupMint(nftMinter, nftReceiver, 0, _amountToMint);
        _doMintTo(mintData, 0);

        _checkMint(mintData);
    }

    function TestPublicMint_DefaultSingle() public {
        uint128 _amountToMint = 1;
        MintData memory mintData = _setupMint(
            nftMinter, nftReceiver, nftPublicMintPrice, _amountToMint
        );

        _doPublicMint(mintData, true, 0);

        _checkMint(mintData);
    }

    function testMintTo_DefaultMultiple() public {
        for (uint256 i = 0; i < 10; i++) {
            uint128 _amountToMint = 10;
            MintData memory mintData =
                _setupMint(nftMinter, nftReceiver, 0, _amountToMint);
            _doMintTo(mintData, 0);

            _checkMint(mintData);
        }
    }

    function TestPublicMint_DefaultMultiple() public {
        for (uint256 i = 0; i < 10; i++) {
            uint128 _amountToMint = 10;
            MintData memory mintData = _setupMint(
                nftMinter, nftReceiver, nftPublicMintPrice, _amountToMint
            );

            _doPublicMint(mintData, true, 0);

            _checkMint(mintData);
        }
    }

    function testMintTo_DefaultFuzzy(uint256 x) public {
        uint128 _amountToMint = 10;
        MintData memory mintData =
            _setupMint(nftMinter, nftReceiver, 0, _amountToMint);
        _doMintTo(mintData, 0);

        _checkMint(mintData);
    }

    function TestPublicMint_DefaultFuzzy(uint256 x) public {
        uint128 _amountToMint = 10;
        MintData memory mintData = _setupMint(
            nftMinter, nftReceiver, nftPublicMintPrice, _amountToMint
        );

        _doPublicMint(mintData, true, 0);

        _checkMint(mintData);
    }

    function test_SetPublicMint_Unauthorised() public {
        uint128 _amountToMint = 1;
        MintData memory mintData = _setupMint(
            nftMinter, nftReceiver, nftPublicMintPrice, _amountToMint
        );
        IERC721Basic collection = IERC721Basic(mintData.collectionAddress);

        vm.startPrank(prankster);
        vm.deal(prankster, 20_000 ether);
        vm.expectRevert(0x1648fd01); // error NotAuthorised();
        collection.setPublicMintState(true);
        vm.stopPrank();
    }

    function testPublicMint_PublicMintClosed() public {
        uint128 _amountToMint = 1;
        MintData memory mintData = _setupMint(
            nftMinter, nftReceiver, nftPublicMintPrice, _amountToMint
        );

        _doPublicMint(
            mintData,
            false,
            0x2d0a3f8e // error PublicMintClosed();
        );
    }

    function testPublicMint_IncorrectFeeSingleFuzzy(uint256 _nftPublicMintPrice)
        public
    {
        vm.assume(
            _nftPublicMintPrice != nftPublicMintPrice
                && _nftPublicMintPrice <= 1 ether
        );
        uint128 _amountToMint = 1;
        MintData memory mintData = _setupMint(
            nftMinter, nftReceiver, nftPublicMintPrice, _amountToMint
        );

        mintData.nftPublicMintPrice = _nftPublicMintPrice; // change mint fee

        _doPublicMint(
            mintData,
            true,
            0xf7760f25 // error WrongPrice();
        );
    }

    function testMintTo_UnAuthorised() public {
        uint128 _amountToMint = 1;
        MintData memory mintData = _setupMint(
            nftMinter, nftReceiver, nftPublicMintPrice, _amountToMint
        );

        // Attempt to Mint to nftReceiver

        vm.prank(prankster);

        vm.expectRevert(0x1648fd01); // error NotAuthorised();
        IERC721Basic(mintData.collectionAddress).mintTo(prankster, 1);
    }

    function testMintTo_MaxSupply() public {
        // Mint Max Supply
        uint128 _amountToMint = 10_000;
        MintData memory mintData =
            _setupMint(nftMinter, nftReceiver, 0, _amountToMint);
        _doMintTo(mintData, 0);

        // Try and mint more..
        vm.deal(nftMinter, 20_000 ether);

        _doMintTo(mintData, 0xd05cb609); // error MaxSupplyReached();
    }

    function testMint_MaxSupply() public {
        // Mint Max Supply
        uint128 _amountToMint = 10_000;
        MintData memory mintData = _setupMint(
            nftMinter, nftReceiver, nftPublicMintPrice, _amountToMint
        );
        _doPublicMint(mintData, true, 0);

        // Try and mint more..
        vm.deal(nftMinter, 20_000 ether);
        _doPublicMint(mintData, true, 0xd05cb609); // error MaxSupplyReached();
    }

    function _setupMint(
        address _nftMinter,
        address _nftReceiver,
        uint256 _nftPublicMintPrice,
        uint128 _amountToMint
    ) internal returns (MintData memory mintData) {
        // Create Collection & Splitter
        vm.prank(_nftMinter);
        (address _collectionAddress, address _splitterAddress) =
        _createCollectionDefault(
            deployedContracts.factory, splitterDeployer, _nftMinter
        );

        IERC721Basic collection = IERC721Basic(_collectionAddress);
        // ISplitter splitter = ISplitter(_splitterAddress);

        // Add Ether to Accounts
        vm.deal(_nftMinter, 20_000 ether);
        vm.deal(_nftReceiver, 20_000 ether);

        uint256 _totalSupplyBefore = collection.totalSupply();

        mintData = MintData({
            nftMinter: _nftMinter,
            nftReceiver: _nftReceiver,
            nftPublicMintPrice: _nftPublicMintPrice,
            amountToMint: _amountToMint,
            collectionAddress: _collectionAddress,
            splitterAddress: _splitterAddress,
            totalSupplyBefore: _totalSupplyBefore,
            newTotalSupply: _totalSupplyBefore + _amountToMint,
            balanceNftReceiverBefore: collection.balanceOf(_nftReceiver),
            balanceNftMinterBefore: collection.balanceOf(_nftMinter)
        });
        return mintData;
    }

    function _doMintTo(MintData memory mintData, bytes4 _errorSelector)
        internal
    {
        vm.startPrank(mintData.nftMinter, mintData.nftMinter);
        IERC721Basic collection = IERC721Basic(mintData.collectionAddress);

        if (_errorSelector != 0x00000000) {
            vm.expectRevert(_errorSelector);
        }
        collection.mintTo(mintData.nftReceiver, mintData.amountToMint);
        vm.stopPrank();
    }

    function _doPublicMint(
        MintData memory mintData,
        bool _mintState,
        bytes4 _errorSelector
    ) internal {
        IERC721Basic collection = IERC721Basic(mintData.collectionAddress);

        vm.prank(mintData.nftMinter, mintData.nftMinter);
        collection.setPublicMintState(_mintState);

        if (_errorSelector != 0x00000000) {
            vm.expectRevert(_errorSelector);
        }

        uint256 _nftPublicMintPrice =
            mintData.nftPublicMintPrice * mintData.amountToMint;

        vm.prank(mintData.nftReceiver);
        collection.mint{value: _nftPublicMintPrice}(mintData.amountToMint);
    }

    function _checkMint(MintData memory mintData) internal {
        IERC721Basic collection = IERC721Basic(mintData.collectionAddress);

        // Check that nftReceiver has the token(s)
        assertTrue(
            collection.balanceOf(mintData.nftReceiver)
                == mintData.balanceNftReceiverBefore + mintData.amountToMint
        );

        // Check the totalSupply of the collection has increased
        assertTrue(collection.totalSupply() == mintData.newTotalSupply);

        assertTrue(_checkOwnerOf(mintData.nftReceiver, mintData));

        _checkTransferFrom(mintData);
        _checkSafeTransferFrom(mintData);
        _checkSafeTransferFromWithData(mintData);
    }
}
