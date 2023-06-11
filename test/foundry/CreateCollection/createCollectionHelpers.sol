pragma solidity 0.8.19;

import "forge-std/src/Test.sol";
import {
    DeploySplitterBase,
    IFactory,
    SplitterHelpers
} from "test/foundry/Base/Splitter/deploySplitterBase.sol";

import { CreateCollectionBase } from
    "test/foundry/Base/Factory/createCollectionBase.sol";

import { Strings } from "contracts/MADTokens/common/ImplBase.sol";

contract CreateCollectionHelpers is CreateCollectionBase {
    function _createCollectionDefault(
        IFactory _factory,
        DeploySplitterBase splitterDeployer,
        address _currentSigner
    ) internal returns (address _collectionAddress, address _splitter) {
        splitterDeployer.setCurrentSigner(_currentSigner);

        _splitter = splitterDeployer._runSplitterDeploy_creatorOnly(_factory);

        setCurrentSigner(_currentSigner);
        emit log_named_address("currentSigner", currentSigner);

        _collectionAddress = createCollectionDefault(_factory, _splitter);

        assertTrue(_collectionAddress != address(0));
        assertTrue(_splitter != address(0));
    }

    function _createCollectionsWithAllSplitterCombosCustom(
        address _currentSigner,
        DeploySplitterBase _splitterDeployer,
        uint256 _price,
        uint128 _maxSupply,
        uint96 _royalty,
        uint256 _amountToMint,
        address factory,
        uint256 _ambassadorShare,
        uint256 _projectShare,
        string memory _baseURI
    ) internal {
        // Define arrays for function signatures and arguments
        (bytes4[4] memory functionSignatures, bytes[4] memory functionArgs) =
        SplitterHelpers.allSplitterCombinations(
            address(factory), _ambassadorShare, _projectShare
        );

        _splitterDeployer.setCurrentSigner(_currentSigner);

        // Iterate over the function signatures and arguments
        uint256 funcSignaturesLength = 4;
        for (uint256 j = 0; j < funcSignaturesLength; j++) {
            string memory splitterSalt =
                string(abi.encodePacked("SplitterSalt", Strings.toString(j)));

            _splitterDeployer.updateSplitterSalt(splitterSalt);

            address splitter = SplitterHelpers.callFunctionAndGetSplitter(
                address(_splitterDeployer),
                functionSignatures[j],
                functionArgs[j]
            );

            for (uint256 i = 0; i < _amountToMint; i++) {
                emit log_named_uint("Block Number", block.number);
                string memory salt = string(
                    abi.encodePacked(
                        "createCollectionSalt_",
                        splitterSalt,
                        Strings.toString(i)
                    )
                );

                string memory BASE_NAME = string(
                    abi.encodePacked("createCollection_", Strings.toString(i))
                );

                string memory BASE_SYMBOL =
                    string(abi.encodePacked("CC", Strings.toString(i)));

                address collectionAddress = createCollectionCustom(
                    IFactory(factory),
                    splitter,
                    IFactory.CreateCollectionParams(
                        1,
                        salt,
                        BASE_NAME,
                        BASE_SYMBOL,
                        _price,
                        _maxSupply,
                        _baseURI,
                        splitter,
                        _royalty,
                        new bytes32[](0)
                    ),
                    _currentSigner
                );

                assertTrue(collectionAddress != address(0));
            }
        }
    }

    function createCollectionAssumptions(
        uint8 x,
        uint256 _price,
        uint128 _maxSupply,
        uint96 _royalty
    ) internal {
        vm.assume(x < 2);
        vm.assume(_price < type(uint256).max);
        vm.assume(_maxSupply > 0 && _maxSupply < type(uint128).max);
        vm.assume(_royalty < 1001 && _royalty % 25 == 0);
    }
}
