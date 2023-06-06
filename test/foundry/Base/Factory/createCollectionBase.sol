// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "forge-std/src/Test.sol";

import {
    IFactory,
    CreateCollectionParams
} from "test/foundry/Base/Factory/createCollectionParams.sol";

import { SettersToggle } from "test/foundry/utils/setterToggle.sol";

contract CreateCollectionBase is SettersToggle("defaultCollectionOwner") {
    function createCollectionDefault(IFactory factory, address _splitter)
        public
    {
        createCollectionCustom(
            factory,
            _splitter,
            CreateCollectionParams.defaultCollectionParams(_splitter),
            currentSigner
        );
    }

    function createCollectionCustom(
        IFactory factory,
        address _splitter,
        IFactory.CollectionParams memory params,
        address collectionOwner
    ) public {
        vm.prank(collectionOwner, collectionOwner);
        factory.createCollection(
            params.tokenType,
            params.tokenSalt,
            params.name,
            params.symbol,
            params.price,
            params.maxSupply,
            params.uri,
            _splitter,
            params.royalty,
            params.extra
        );
    }
}
