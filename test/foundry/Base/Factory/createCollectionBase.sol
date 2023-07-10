// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "forge-std/src/Test.sol";
import {
    IFactory,
    CreateCollectionParams,
    Strings
} from "test/foundry/Base/Factory/createCollectionParams.sol";

import { IERC1155Basic } from
    "test/foundry/Base/Tokens/ERC1155/IERC1155Basic.sol";
import { IERC721Basic } from "test/foundry/Base/Tokens/ERC721/IERC721Basic.sol";

import { IImplBase } from "test/foundry/Base/Tokens/common/IImplBase.sol";

import { SettersToggle } from "test/foundry/utils/setterToggle.sol";

abstract contract CreateCollectionBase is
    SettersToggle("defaultCollectionOwner"),
    CreateCollectionParams
{
    function createCollectionDefault(IFactory factory, address _splitter)
        public
        returns (address collectionAddress)
    {
        collectionAddress = createCollectionCustom(
            factory,
            _splitter,
            CreateCollectionParams.defaultCollectionParams(_splitter),
            currentSigner
        );
    }

    function createCollectionCustom(
        IFactory factory,
        address _splitter,
        IFactory.CreateCollectionParams memory params,
        address collectionOwner
    ) public returns (address collectionAddress) {
        vm.prank(collectionOwner, collectionOwner);

        params.splitter = _splitter;
        factory.createCollection(params);

        collectionAddress =
            factory.getDeployedAddress(params.tokenSalt, collectionOwner);

        _verifyCollectionFactory(
            factory, params, collectionOwner, collectionAddress
        );

        // Shared assertions
        _verifyCollectionTokensShared(
            IImplBase(collectionAddress), params, factory, collectionOwner
        );

        // Find Collection Type and verify..
        if (IERC721Basic(collectionAddress).supportsInterface(0x80ac58cd)) {
            _verifyCollectionERC721(collectionAddress, params, collectionOwner);
        }
        if (IERC1155Basic(collectionAddress).supportsInterface(0xd9b67a26)) {
            _verifyCollectionERC1155(collectionAddress, params, collectionOwner);
        }
    }

    function _verifyCollectionFactory(
        IFactory factory,
        IFactory.CreateCollectionParams memory params,
        address collectionOwner,
        address collectionId
    ) private {
        // Perform verification checks
        uint256 expectedBlockNumber = block.number; // Get current block number

        (
            address creator,
            uint8 collectionType,
            bytes32 collectionSalt,
            uint256 blocknumber,
            address splitter
        ) = factory.collectionInfo(collectionId);

        vm.prank(collectionOwner, collectionOwner);
        assertTrue(
            factory.creatorAuth(collectionId, collectionOwner),
            "Invalid creator auth"
        );

        vm.prank(factory.router(), collectionOwner);
        (address _creator, bool _check) = factory.creatorCheck(collectionId);

        assertTrue(_creator == collectionOwner, "Invalid creator");
        assertTrue(_check, "Invalid creator check");

        vm.prank(factory.router(), collectionOwner);
        assertTrue(
            factory.collectionTypeChecker(collectionId) == params.tokenType,
            "Invalid type checker"
        );

        assertTrue(collectionType == params.tokenType, "Invalid token type");
        assertTrue(creator == collectionOwner, "Invalid collection owner");
        assertTrue(splitter == params.splitter, "Invalid splitter address");

        assertTrue(
            collectionSalt
                == keccak256(abi.encode(collectionOwner, params.tokenSalt)),
            "Invalid collection salt"
        );

        assertTrue(blocknumber == expectedBlockNumber, "Invalid block number");
    }

    function _verifyCollectionERC1155(
        address collectionAddress,
        IFactory.CreateCollectionParams memory params,
        address collectionOwner
    ) internal {
        IERC1155Basic collection = IERC1155Basic(collectionAddress);

        // Test balanceCount function
        uint256 balanceCount = collection.balanceCount(1);
        assertTrue(balanceCount == 0, "Incorrect balanceCount value");

        // Test balanceOf function
        uint256 balance = collection.balanceOf(collectionOwner, 1);
        assertTrue(balance == 0, "Incorrect balanceOf value");

        // Test liveBalance function
        uint256 liveBalance = collection.liveBalance(1);
        assertTrue(liveBalance == 0, "Incorrect liveBalance value");

        // Test maxIdBalance function
        uint128 maxIdBalance = collection.maxIdBalance();
        assertTrue(
            maxIdBalance == params.maxSupply, "Incorrect maxIdBalance value"
        );
    }

    function _verifyCollectionERC721(
        address collectionAddress,
        IFactory.CreateCollectionParams memory params,
        address collectionOwner
    ) internal {
        // Additional assertions specific to IERC721Basic interface
        IERC721Basic collection = IERC721Basic(collectionAddress);

        // Test balanceOf function
        uint256 balance = collection.balanceOf(collectionAddress);
        assertTrue(balance == 0, "Incorrect balanceOf value");

        // Test getApproved function
        vm.expectRevert(0xceea21b6); // `TokenDoesNotExist()`.
        collection.getApproved(1);

        // Test ownerOf function fails
        vm.expectRevert(0xceea21b6); // `TokenDoesNotExist()`.
        collection.ownerOf(1);

        // Test tokenURI function
        vm.expectRevert(0xbad086ea); // NotMintedYet()
        collection.tokenURI(1);

        // Test name function
        string memory name = collection.name();
        assertEq(name, params.name, "Incorrect name value");

        // Test symbol function
        string memory symbol = collection.symbol();
        assertEq(symbol, params.symbol, "Incorrect symbol value");
    }

    function _verifyCollectionTokensShared(
        IImplBase collection,
        IFactory.CreateCollectionParams memory params,
        IFactory factory,
        address collectionOwner
    ) internal {
        // baseURI()
        assertEq(collection.baseURI(), params.uri);

        // isApprovedForAll(address, address)
        assertFalse(
            collection.isApprovedForAll(
                makeAddr("WorldAddress"), makeAddr("HelloAddress")
            )
        );

        // totalSupply()
        assertTrue(collection.totalSupply() == 0);

        // _royaltyFee()
        assertTrue(collection._royaltyFee() == params.royalty);

        // erc20()
        assertTrue(collection.erc20() != address(0));
        assertTrue(collection.erc20() == factory.erc20());

        // getOwner()
        assertTrue(collection.getOwner() != address(0));
        assertTrue(collection.getOwner() == collectionOwner);

        // getRouter()
        assertTrue(collection.getRouter() != address(0));
        assertTrue(collection.getRouter() == factory.router());

        // splitter()
        assertTrue(collection.splitter() != address(0));
        assertTrue(collection.splitter() == params.splitter);

        // feeCount()
        assertTrue(collection.feeCount() == 0);

        // feeCountERC20()
        assertTrue(collection.feeCountERC20() == 0);

        // liveSupply()
        assertTrue(collection.liveSupply() == 0);

        // maxSupply()
        assertTrue(collection.maxSupply() == params.maxSupply);

        // mintCount()
        assertTrue(collection.mintCount() == 0);

        // price()
        assertTrue(collection.price() == params.price);

        // publicMintState()
        assertTrue(collection.publicMintState() == false);

        // royaltyInfo(uint256, uint256)
        (address receiver, uint256 royaltyAmount) =
            collection.royaltyInfo(0, 1 ether);
        uint256 _royaltyAmount = (1 ether * params.royalty) / 10_000;

        assertTrue(
            receiver == params.splitter && royaltyAmount == _royaltyAmount
        );

        // uriLock()
        assertTrue(collection.uriLock() == false);
    }
}
