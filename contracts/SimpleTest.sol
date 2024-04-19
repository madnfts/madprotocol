// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.22;

import { FactoryTypes } from "contracts/Shared/FactoryTypes.sol";

contract SimpleTest {
    // struct CollectionArgs {
    //     string _name;
    //     string _symbol;
    //     string _baseURI;
    //     uint256 _price;
    //     uint256 _maxSupply;
    //     address _splitter;
    //     uint96 _royaltyPercentage;
    //     address _router;
    //     address _erc20;
    //     address _owner;
    // }

    FactoryTypes.CollectionArgs public params;

    constructor(FactoryTypes.CollectionArgs memory args) { }

    function name() external pure returns (string memory) {
        return "SimpleTestContract";
    }
}
