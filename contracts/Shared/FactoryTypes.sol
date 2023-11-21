// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.22;

// prettier-ignore
library FactoryTypes {
    struct CreateCollectionParams {
        address madFeeTokenAddress;
        uint8 tokenType;
        bytes32 tokenSalt;
        string collectionName;
        string collectionSymbol;
        uint256 price;
        uint256 maxSupply;
        string uri;
        address splitter;
        uint96 royalty;
    }

    // [1,
    // 0x000000000000000000000000000000000000000000000000002bdc545e14da04,"createCollection_8","CC8",100,97,"https://example.com",0xFc1Ff53Aa986d215e157efF5786e1B3bBB126446,0]

    struct CreateSplitterParams {
        bytes32 splitterSalt;
        address ambassador;
        address project;
        uint256 ambassadorShare;
        uint256 projectShare;
        address madFeeTokenAddress;
    }

    // MAD TEST SKALE
    // [0x666f6f0000000000000000000000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000,0x0,0x0]
    struct CollectionArgs {
        string _name;
        string _symbol;
        string _baseURI;
        uint256 _price;
        uint256 _maxSupply;
        address _splitter;
        uint96 _royaltyPercentage;
        address _router;
        address _erc20;
        address _owner;
    }

    struct Collection {
        address creator;
        uint8 collectionType;
        bytes32 collectionSalt;
        uint256 blocknumber;
        address splitter;
        bool isValid;
    }

    struct SplitterConfig {
        address splitter;
        bytes32 splitterSalt;
        address ambassador;
        address project;
        uint256 ambassadorShare;
        uint256 projectShare;
        bool valid;
    }
}
