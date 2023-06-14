// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { IFactory } from "test/foundry/Base/Factory/IFactory.sol";

import { Strings } from "contracts/MADTokens/common/ImplBase.sol";

abstract contract CreateCollectionParams {
    // string private nextSalt;
    string private constant BASE_NAME = "createCollection";
    string private constant BASE_SYMBOL = "CC";

    string createCollectionSalt = "createCollectionSalt";
    uint256 CreateCollectionSaltNonce;

    function updateCreateCollectionSalt() public returns (string memory) {
        return string(
            abi.encodePacked(
                createCollectionSalt,
                Strings.toString(CreateCollectionSaltNonce++)
            )
        );
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
            1, //  tokenType
            1 ether, // price,
            1000, //  maxSupply
            "https://example.com", //  URI
            defaultSplitterAddress,
            0, // royalty
            new bytes32[](0) //  extra
        );
    }
}
