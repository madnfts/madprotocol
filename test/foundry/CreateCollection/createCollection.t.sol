pragma solidity 0.8.19;

import "forge-std/src/Test.sol";
import {
    DeploySplitterBase,
    ISplitter,
    IFactory,
    Deployer
} from "test/foundry/Base/Splitter/deploySplitterBase.sol";

import {
    CreateCollectionBase,
    CreateCollectionParams
} from "test/foundry/Base/Factory/createCollectionBase.sol";

import { Enums } from "test/foundry/utils/enums.sol";

contract TestCreateCollection is CreateCollectionBase, Enums {
    IFactory[] deployedContracts;
    Deployer deployer;
    DeploySplitterBase splitterDeployer;

    function setUp() public {
        // Instantiate deployer contracts
        deployer = new Deployer();

        // Instantiate splitter deployer contract
        splitterDeployer = new DeploySplitterBase();

        // Create array of Factory instances to cover both 721 & 1155 Factories
        deployedContracts = [
            deployer.deployAll(ercTypes.ERC721).factory,
            deployer.deployAll(ercTypes.ERC1155).factory
        ];
    }

    function testCreateCollectionDefaultFuzzy(uint8 x) public {
        vm.assume(x < 2);
        vm.deal(currentSigner, 1000 ether);
        splitterDeployer.setCurrentSigner(currentSigner);
        address splitter = splitterDeployer._runSplitterDeploy_creatorOnly(
            deployedContracts[x]
        );
        address collectionAddress =
            createCollectionDefault(deployedContracts[x], splitter);
        assertTrue(collectionAddress != address(0));
    }

    function testCreateCollectionCustomSingleFuzzy(
        uint8 x,
        uint256 _price,
        uint128 _maxSupply,
        uint96 _royalty
    ) public {
        createCollectionAssumptions(x, _price, _maxSupply, _royalty);
        _createCollectionCustom(x, _price, _maxSupply, _royalty, 1);
    }

    function testCreateMultipleCollectionsWithSameSplitterFuzzy(
        uint8 x,
        uint256 _price,
        uint128 _maxSupply,
        uint96 _royalty
    ) public {
        createCollectionAssumptions(x, _price, _maxSupply, _royalty);
        _createCollectionCustom(x, _price, _maxSupply, _royalty, 10);
    }

    function testFailRoyaltyCreateCollectionCustomSingleFuzzy(
        uint8 x,
        uint256 _price,
        uint128 _maxSupply,
        uint96 _royalty
    ) public {
        // createCollectionAssumptions(x, _price, _maxSupply, _royalty);
        vm.assume(x < 2);
        vm.assume(_price < type(uint256).max);
        vm.assume(_maxSupply == 0);
        vm.assume(_royalty > 1001 || _royalty % 25 != 0);

        _createCollectionCustom(x, _price, _maxSupply, _royalty, 1);
    }

    function testFailRoyaltyCreateMultipleCollectionsWithSameSplitterFuzzy(
        uint8 x,
        uint256 _price,
        uint128 _maxSupply,
        uint96 _royalty
    ) public {
        // createCollectionAssumptions(x, _price, _maxSupply, _royalty);
        vm.assume(x < 2);
        vm.assume(_price < type(uint256).max);
        vm.assume(_maxSupply == 0);
        vm.assume(_royalty > 1001 || _royalty % 25 != 0);

        _createCollectionCustom(x, _price, _maxSupply, _royalty, 10);
    }

    function testFailZeroMaxSupplyCreateCollectionCustomSingleFuzzy(
        uint8 x,
        uint256 _price,
        uint128 _maxSupply,
        uint96 _royalty
    ) public {
        // createCollectionAssumptions(x, _price, _maxSupply, _royalty);
        vm.assume(x < 2);
        vm.assume(_price < type(uint256).max);
        vm.assume(_maxSupply == 0);
        vm.assume(_royalty < 1001 && _royalty % 25 == 0);

        _createCollectionCustom(x, _price, _maxSupply, _royalty, 1);
    }

    function testFailZeroMaxSupplyCreateMultipleCollectionsWithSameSplitterFuzzy(
        uint8 x,
        uint256 _price,
        uint128 _maxSupply,
        uint96 _royalty
    ) public {
        // createCollectionAssumptions(x, _price, _maxSupply, _royalty);
        vm.assume(x < 2);
        vm.assume(_price < type(uint256).max);
        vm.assume(_maxSupply == 0);
        vm.assume(_royalty < 1001 && _royalty % 25 == 0);

        _createCollectionCustom(x, _price, _maxSupply, _royalty, 10);
    }

    function _createCollectionCustom(
        uint8 x,
        uint256 _price,
        uint128 _maxSupply,
        uint96 _royalty,
        uint256 _amountToMint
    ) internal {
        vm.deal(currentSigner, 1000 ether);

        splitterDeployer.setCurrentSigner(currentSigner);
        address splitter = splitterDeployer._runSplitterDeploy_creatorOnly(
            deployedContracts[x]
        );

        for (uint256 i = 0; i < _amountToMint; i++) {
            string memory salt = string(
                abi.encodePacked("createCollectionSalt", i, block.timestamp)
            );
            address collectionAddress = createCollectionCustom(
                deployedContracts[x],
                splitter,
                CreateCollectionParams.generateCollectionParams(
                    1,
                    salt,
                    _price,
                    _maxSupply,
                    "https://test.com",
                    splitter,
                    _royalty,
                    new bytes32[](0)
                ),
                currentSigner
            );

            assertTrue(collectionAddress != address(0));
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
        vm.assume(_maxSupply > 0 && _maxSupply < type(uint256).max);
        vm.assume(_royalty < 1001 && _royalty % 25 == 0);
    }
}
