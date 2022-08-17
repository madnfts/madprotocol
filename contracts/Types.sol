// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.4;

import { SplitterImpl } from "./lib/splitter/SplitterImpl.sol";
import { IERC721 } from "./lib/tokens/ERC721/Base/interfaces/IERC721.sol";

// prettier-ignore
library Types {
    enum ERC721Type {
        ERC721Minimal,    // := 0
        ERC721Basic,      // := 1
        ERC721Whitelist,  // := 2
        ERC721Lazy        // := 3
    }

    struct Collection {
        address creator;
        Types.ERC721Type colType;
        bytes32 colSalt;
        uint256 blocknumber;
        address splitter;
    }

    struct SplitterConfig {
        address splitter;
        bytes32 splitterSalt;
        address ambassador;
        uint256 ambShare;
        bool valid;
    }

    struct Voucher {
        bytes32 voucherId;
        address[] users;
        uint256 amount;
        uint256 price;
    }

    struct UserBatch {
        bytes32 voucherId;
        uint256[] ids;
        uint256 price;
        address user;
    }

    /// @param orderType Values legend:
    /// 0=Fixed Price; 1=Dutch Auction; 2=English Auction.
    /// @param endBlock Equals to canceled order when value is set to 0.
    struct Order {
        uint8 orderType;
        address seller;
        IERC721 token;
        uint256 tokenId;
        uint256 startPrice;
        uint256 endPrice;
        uint256 startBlock;
        uint256 endBlock;
        uint256 lastBidPrice;
        address lastBidder;
        bool isSold;
    }
}

/* 
    ├─ type: ContractDefinition
    ├─ name: Types
    ├─ baseContracts
    ├─ subNodes
    │  ├─ 0
    │  │  ├─ type: EnumDefinition
    │  │  ├─ name: ERC721Type
    │  │  └─ members
    │  │     ├─ 0
    │  │     │  ├─ type: EnumValue
    │  │     │  └─ name: ERC721Minimal
    │  │     ├─ 1
    │  │     │  ├─ type: EnumValue
    │  │     │  └─ name: ERC721Basic
    │  │     ├─ 2
    │  │     │  ├─ type: EnumValue
    │  │     │  └─ name: ERC721Whitelist
    │  │     └─ 3
    │  │        ├─ type: EnumValue
    │  │        └─ name: ERC721Lazy
    │  ├─ 1
    │  │  ├─ type: StructDefinition
    │  │  ├─ name: Collection
    │  │  └─ members
    │  │     ├─ 0
    │  │     │  ├─ type: VariableDeclaration
    │  │     │  ├─ typeName
    │  │     │  │  ├─ type: ElementaryTypeName
    │  │     │  │  ├─ name: address
    │  │     │  │  └─ stateMutability
    │  │     │  ├─ name: creator
    │  │     │  ├─ identifier
    │  │     │  │  ├─ type: Identifier
    │  │     │  │  └─ name: creator
    │  │     │  ├─ storageLocation
    │  │     │  ├─ isStateVar: false
    │  │     │  ├─ isIndexed: false
    │  │     │  └─ expression
    │  │     ├─ 1
    │  │     │  ├─ type: VariableDeclaration
    │  │     │  ├─ typeName
    │  │     │  │  ├─ type: UserDefinedTypeName
    │  │     │  │  └─ namePath: Types.ERC721Type
    │  │     │  ├─ name: colType
    │  │     │  ├─ identifier
    │  │     │  │  ├─ type: Identifier
    │  │     │  │  └─ name: colType
    │  │     │  ├─ storageLocation
    │  │     │  ├─ isStateVar: false
    │  │     │  ├─ isIndexed: false
    │  │     │  └─ expression
    │  │     ├─ 2
    │  │     │  ├─ type: VariableDeclaration
    │  │     │  ├─ typeName
    │  │     │  │  ├─ type: ElementaryTypeName
    │  │     │  │  ├─ name: bytes32
    │  │     │  │  └─ stateMutability
    │  │     │  ├─ name: colSalt
    │  │     │  ├─ identifier
    │  │     │  │  ├─ type: Identifier
    │  │     │  │  └─ name: colSalt
    │  │     │  ├─ storageLocation
    │  │     │  ├─ isStateVar: false
    │  │     │  ├─ isIndexed: false
    │  │     │  └─ expression
    │  │     ├─ 3
    │  │     │  ├─ type: VariableDeclaration
    │  │     │  ├─ typeName
    │  │     │  │  ├─ type: ElementaryTypeName
    │  │     │  │  ├─ name: uint256
    │  │     │  │  └─ stateMutability
    │  │     │  ├─ name: blocknumber
    │  │     │  ├─ identifier
    │  │     │  │  ├─ type: Identifier
    │  │     │  │  └─ name: blocknumber
    │  │     │  ├─ storageLocation
    │  │     │  ├─ isStateVar: false
    │  │     │  ├─ isIndexed: false
    │  │     │  └─ expression
    │  │     └─ 4
    │  │        ├─ type: VariableDeclaration
    │  │        ├─ typeName
    │  │        │  ├─ type: UserDefinedTypeName
    │  │        │  └─ namePath: SplitterImpl
    │  │        ├─ name: splitter
    │  │        ├─ identifier
    │  │        │  ├─ type: Identifier
    │  │        │  └─ name: splitter
    │  │        ├─ storageLocation
    │  │        ├─ isStateVar: false
    │  │        ├─ isIndexed: false
    │  │        └─ expression
    │  ├─ 2
    │  │  ├─ type: StructDefinition
    │  │  ├─ name: SplitterConfig
    │  │  └─ members
    │  │     ├─ 0
    │  │     │  ├─ type: VariableDeclaration
    │  │     │  ├─ typeName
    │  │     │  │  ├─ type: UserDefinedTypeName
    │  │     │  │  └─ namePath: SplitterImpl
    │  │     │  ├─ name: splitter
    │  │     │  ├─ identifier
    │  │     │  │  ├─ type: Identifier
    │  │     │  │  └─ name: splitter
    │  │     │  ├─ storageLocation
    │  │     │  ├─ isStateVar: false
    │  │     │  ├─ isIndexed: false
    │  │     │  └─ expression
    │  │     ├─ 1
    │  │     │  ├─ type: VariableDeclaration
    │  │     │  ├─ typeName
    │  │     │  │  ├─ type: ElementaryTypeName
    │  │     │  │  ├─ name: bytes32
    │  │     │  │  └─ stateMutability
    │  │     │  ├─ name: splitterSalt
    │  │     │  ├─ identifier
    │  │     │  │  ├─ type: Identifier
    │  │     │  │  └─ name: splitterSalt
    │  │     │  ├─ storageLocation
    │  │     │  ├─ isStateVar: false
    │  │     │  ├─ isIndexed: false
    │  │     │  └─ expression
    │  │     ├─ 2
    │  │     │  ├─ type: VariableDeclaration
    │  │     │  ├─ typeName
    │  │     │  │  ├─ type: ElementaryTypeName
    │  │     │  │  ├─ name: address
    │  │     │  │  └─ stateMutability
    │  │     │  ├─ name: ambassador
    │  │     │  ├─ identifier
    │  │     │  │  ├─ type: Identifier
    │  │     │  │  └─ name: ambassador
    │  │     │  ├─ storageLocation
    │  │     │  ├─ isStateVar: false
    │  │     │  ├─ isIndexed: false
    │  │     │  └─ expression
    │  │     ├─ 3
    │  │     │  ├─ type: VariableDeclaration
    │  │     │  ├─ typeName
    │  │     │  │  ├─ type: ElementaryTypeName
    │  │     │  │  ├─ name: uint256
    │  │     │  │  └─ stateMutability
    │  │     │  ├─ name: ambShare
    │  │     │  ├─ identifier
    │  │     │  │  ├─ type: Identifier
    │  │     │  │  └─ name: ambShare
    │  │     │  ├─ storageLocation
    │  │     │  ├─ isStateVar: false
    │  │     │  ├─ isIndexed: false
    │  │     │  └─ expression
    │  │     └─ 4
    │  │        ├─ type: VariableDeclaration
    │  │        ├─ typeName
    │  │        │  ├─ type: ElementaryTypeName
    │  │        │  ├─ name: bool
    │  │        │  └─ stateMutability
    │  │        ├─ name: valid
    │  │        ├─ identifier
    │  │        │  ├─ type: Identifier
    │  │        │  └─ name: valid
    │  │        ├─ storageLocation
    │  │        ├─ isStateVar: false
    │  │        ├─ isIndexed: false
    │  │        └─ expression
    │  ├─ 3
    │  │  ├─ type: StructDefinition
    │  │  ├─ name: Voucher
    │  │  └─ members
    │  │     ├─ 0
    │  │     │  ├─ type: VariableDeclaration
    │  │     │  ├─ typeName
    │  │     │  │  ├─ type: ElementaryTypeName
    │  │     │  │  ├─ name: bytes32
    │  │     │  │  └─ stateMutability
    │  │     │  ├─ name: voucherId
    │  │     │  ├─ identifier
    │  │     │  │  ├─ type: Identifier
    │  │     │  │  └─ name: voucherId
    │  │     │  ├─ storageLocation
    │  │     │  ├─ isStateVar: false
    │  │     │  ├─ isIndexed: false
    │  │     │  └─ expression
    │  │     ├─ 1
    │  │     │  ├─ type: VariableDeclaration
    │  │     │  ├─ typeName
    │  │     │  │  ├─ type: ArrayTypeName
    │  │     │  │  ├─ baseTypeName
    │  │     │  │  │  ├─ type: ElementaryTypeName
    │  │     │  │  │  ├─ name: address
    │  │     │  │  │  └─ stateMutability
    │  │     │  │  └─ length
    │  │     │  ├─ name: users
    │  │     │  ├─ identifier
    │  │     │  │  ├─ type: Identifier
    │  │     │  │  └─ name: users
    │  │     │  ├─ storageLocation
    │  │     │  ├─ isStateVar: false
    │  │     │  ├─ isIndexed: false
    │  │     │  └─ expression
    │  │     ├─ 2
    │  │     │  ├─ type: VariableDeclaration
    │  │     │  ├─ typeName
    │  │     │  │  ├─ type: ElementaryTypeName
    │  │     │  │  ├─ name: uint256
    │  │     │  │  └─ stateMutability
    │  │     │  ├─ name: amount
    │  │     │  ├─ identifier
    │  │     │  │  ├─ type: Identifier
    │  │     │  │  └─ name: amount
    │  │     │  ├─ storageLocation
    │  │     │  ├─ isStateVar: false
    │  │     │  ├─ isIndexed: false
    │  │     │  └─ expression
    │  │     └─ 3
    │  │        ├─ type: VariableDeclaration
    │  │        ├─ typeName
    │  │        │  ├─ type: ElementaryTypeName
    │  │        │  ├─ name: uint256
    │  │        │  └─ stateMutability
    │  │        ├─ name: price
    │  │        ├─ identifier
    │  │        │  ├─ type: Identifier
    │  │        │  └─ name: price
    │  │        ├─ storageLocation
    │  │        ├─ isStateVar: false
    │  │        ├─ isIndexed: false
    │  │        └─ expression
    │  └─ 4
    │     ├─ type: StructDefinition
    │     ├─ name: Order
    │     └─ members
    │        ├─ 0
    │        │  ├─ type: VariableDeclaration
    │        │  ├─ typeName
    │        │  │  ├─ type: ElementaryTypeName
    │        │  │  ├─ name: uint8
    │        │  │  └─ stateMutability
    │        │  ├─ name: orderType
    │        │  ├─ identifier
    │        │  │  ├─ type: Identifier
    │        │  │  └─ name: orderType
    │        │  ├─ storageLocation
    │        │  ├─ isStateVar: false
    │        │  ├─ isIndexed: false
    │        │  └─ expression
    │        ├─ 1
    │        │  ├─ type: VariableDeclaration
    │        │  ├─ typeName
    │        │  │  ├─ type: ElementaryTypeName
    │        │  │  ├─ name: address
    │        │  │  └─ stateMutability
    │        │  ├─ name: seller
    │        │  ├─ identifier
    │        │  │  ├─ type: Identifier
    │        │  │  └─ name: seller
    │        │  ├─ storageLocation
    │        │  ├─ isStateVar: false
    │        │  ├─ isIndexed: false
    │        │  └─ expression
    │        ├─ 2
    │        │  ├─ type: VariableDeclaration
    │        │  ├─ typeName
    │        │  │  ├─ type: UserDefinedTypeName
    │        │  │  └─ namePath: IERC721
    │        │  ├─ name: token
    │        │  ├─ identifier
    │        │  │  ├─ type: Identifier
    │        │  │  └─ name: token
    │        │  ├─ storageLocation
    │        │  ├─ isStateVar: false
    │        │  ├─ isIndexed: false
    │        │  └─ expression
    │        ├─ 3
    │        │  ├─ type: VariableDeclaration
    │        │  ├─ typeName
    │        │  │  ├─ type: ElementaryTypeName
    │        │  │  ├─ name: uint256
    │        │  │  └─ stateMutability
    │        │  ├─ name: tokenId
    │        │  ├─ identifier
    │        │  │  ├─ type: Identifier
    │        │  │  └─ name: tokenId
    │        │  ├─ storageLocation
    │        │  ├─ isStateVar: false
    │        │  ├─ isIndexed: false
    │        │  └─ expression
    │        ├─ 4
    │        │  ├─ type: VariableDeclaration
    │        │  ├─ typeName
    │        │  │  ├─ type: ElementaryTypeName
    │        │  │  ├─ name: uint256
    │        │  │  └─ stateMutability
    │        │  ├─ name: startPrice
    │        │  ├─ identifier
    │        │  │  ├─ type: Identifier
    │        │  │  └─ name: startPrice
    │        │  ├─ storageLocation
    │        │  ├─ isStateVar: false
    │        │  ├─ isIndexed: false
    │        │  └─ expression
    │        ├─ 5
    │        │  ├─ type: VariableDeclaration
    │        │  ├─ typeName
    │        │  │  ├─ type: ElementaryTypeName
    │        │  │  ├─ name: uint256
    │        │  │  └─ stateMutability
    │        │  ├─ name: endPrice
    │        │  ├─ identifier
    │        │  │  ├─ type: Identifier
    │        │  │  └─ name: endPrice
    │        │  ├─ storageLocation
    │        │  ├─ isStateVar: false
    │        │  ├─ isIndexed: false
    │        │  └─ expression
    │        ├─ 6
    │        │  ├─ type: VariableDeclaration
    │        │  ├─ typeName
    │        │  │  ├─ type: ElementaryTypeName
    │        │  │  ├─ name: uint256
    │        │  │  └─ stateMutability
    │        │  ├─ name: startBlock
    │        │  ├─ identifier
    │        │  │  ├─ type: Identifier
    │        │  │  └─ name: startBlock
    │        │  ├─ storageLocation
    │        │  ├─ isStateVar: false
    │        │  ├─ isIndexed: false
    │        │  └─ expression
    │        ├─ 7
    │        │  ├─ type: VariableDeclaration
    │        │  ├─ typeName
    │        │  │  ├─ type: ElementaryTypeName
    │        │  │  ├─ name: uint256
    │        │  │  └─ stateMutability
    │        │  ├─ name: endBlock
    │        │  ├─ identifier
    │        │  │  ├─ type: Identifier
    │        │  │  └─ name: endBlock
    │        │  ├─ storageLocation
    │        │  ├─ isStateVar: false
    │        │  ├─ isIndexed: false
    │        │  └─ expression
    │        ├─ 8
    │        │  ├─ type: VariableDeclaration
    │        │  ├─ typeName
    │        │  │  ├─ type: ElementaryTypeName
    │        │  │  ├─ name: uint256
    │        │  │  └─ stateMutability
    │        │  ├─ name: lastBidPrice
    │        │  ├─ identifier
    │        │  │  ├─ type: Identifier
    │        │  │  └─ name: lastBidPrice
    │        │  ├─ storageLocation
    │        │  ├─ isStateVar: false
    │        │  ├─ isIndexed: false
    │        │  └─ expression
    │        ├─ 9
    │        │  ├─ type: VariableDeclaration
    │        │  ├─ typeName
    │        │  │  ├─ type: ElementaryTypeName
    │        │  │  ├─ name: address
    │        │  │  └─ stateMutability
    │        │  ├─ name: lastBidder
    │        │  ├─ identifier
    │        │  │  ├─ type: Identifier
    │        │  │  └─ name: lastBidder
    │        │  ├─ storageLocation
    │        │  ├─ isStateVar: false
    │        │  ├─ isIndexed: false
    │        │  └─ expression
    │        └─ 10
    │           ├─ type: VariableDeclaration
    │           ├─ typeName
    │           │  ├─ type: ElementaryTypeName
    │           │  ├─ name: bool
    │           │  └─ stateMutability
    │           ├─ name: isSold
    │           ├─ identifier
    │           │  ├─ type: Identifier
    │           │  └─ name: isSold
    │           ├─ storageLocation
    │           ├─ isStateVar: false
    │           ├─ isIndexed: false
    │           └─ expression
    └─ kind: library
 */
