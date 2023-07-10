// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { IFactory } from "test/foundry/Base/Factory/IFactory.sol";

import { Strings } from "contracts/MADTokens/common/ImplBase.sol";

abstract contract CreateCollectionParams {
    uint256 public defaultPrice = 1 ether;
    uint256 public defaultMaxSupply = 10_000;
    uint8 public defaultTokenType = 1; // ERC721Basic
    uint96 public defaultRoyalty = 1000; // 10% (max)
    string public defaultUri = "https://mad.network";
    bytes32[] public defaultExtra;

    // string private nextSalt;
    string private constant BASE_NAME = "createCollection";
    string private constant BASE_SYMBOL = "CC";

    uint256 public CreateCollectionSaltNonce = 12_345_678_912_346_589;

    function updateCreateCollectionSalt() public returns (bytes32) {
        CreateCollectionSaltNonce++;
        return bytes32(abi.encodePacked(CreateCollectionSaltNonce));
    }

    function generateCollectionParams(
        uint8 _tokenType,
        uint256 _price,
        uint256 _maxSupply,
        string memory _uri,
        address _splitter,
        uint96 _royalty,
        bytes32[] memory _extra
    ) public returns (IFactory.CreateCollectionParams memory) {
        string memory name = BASE_NAME;
        string memory symbol = BASE_SYMBOL;

        return IFactory.CreateCollectionParams({
            tokenType: uint8(_tokenType),
            tokenSalt: updateCreateCollectionSalt(),
            name: name,
            symbol: symbol,
            price: _price,
            maxSupply: _maxSupply,
            uri: _uri,
            splitter: _splitter,
            royalty: _royalty,
            extra: _extra
        });
    }

    function defaultCollectionParams(address defaultSplitterAddress)
        public
        returns (IFactory.CreateCollectionParams memory)
    {
        return generateCollectionParams(
            defaultTokenType,
            defaultPrice,
            defaultMaxSupply,
            defaultUri,
            defaultSplitterAddress,
            defaultRoyalty,
            defaultExtra
        );
    }
}
