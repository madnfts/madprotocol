pragma solidity 0.8.19;

import "forge-std/src/Test.sol";
import {
    ISplitter,
    Deployer
} from "test/foundry/Base/Splitter/deploySplitterBase.sol";

import { Enums } from "test/foundry/utils/enums.sol";

import {
    CreateCollectionHelpers,
    DeploySplitterBase,
    IFactory,
    SplitterHelpers
} from "test/foundry/CreateCollection/createCollectionHelpers.sol";

contract TestCreateCollection is CreateCollectionHelpers, Enums {
    IFactory[] deployedContracts;
    Deployer deployer;
    DeploySplitterBase splitterDeployer;
    bool public isERC20;

    function setUp() public {
        // Instantiate deployer contracts
        deployer = new Deployer();

        // Instantiate splitter deployer contract
        splitterDeployer = new DeploySplitterBase();

        // Create array of Factory instances to cover both 721 & 1155 Factories
        deployedContracts = [deployer.deployAll(ercTypes.ERC721, isERC20).factory
        // deployer.deployAll(ercTypes.ERC1155).factory
        ];
    }

    function testCreateCollectionDefaultFuzzy(uint8 x) public {
        vm.assume(x < deployedContracts.length);
        vm.deal(currentSigner, 1000 ether);

        _createCollectionDefault(
            deployedContracts[x], splitterDeployer, currentSigner, 1 ether
        );
    }

    function testCreateCollectionCustomSingleFuzzy(
        uint8 x,
        uint256 _price,
        uint128 _maxSupply,
        uint96 _royalty
    ) public {
        _createCollectionAssumptions(_price, _maxSupply, _royalty);
        _createCollectionCustom(x, _price, _maxSupply, _royalty, 1);
    }

    function testCreateMultipleCollectionsWithSplitterFuzzy(
        uint8 x,
        uint256 _price,
        uint128 _maxSupply,
        uint96 _royalty
    ) public {
        _createCollectionAssumptions(_price, _maxSupply, _royalty);
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
        vm.assume(x < deployedContracts.length);
        IFactory factory = deployedContracts[x];

        _createCollectionsWithAllSplitterCombosCustom(
            currentSigner,
            splitterDeployer,
            _price,
            _maxSupply,
            _royalty,
            _amountToMint,
            address(factory),
            2000,
            1000,
            "https://example.com"
        );
    }
}
