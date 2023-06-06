pragma solidity 0.8.19;

import "forge-std/src/Test.sol";
import {
    DeploySplitterBase,
    ISplitter,
    IFactory,
    Deployer
} from "test/foundry/Base/Splitter/deploySplitterBase.sol";

import { CreateCollectionBase } from
    "test/foundry/Base/Factory/createCollectionBase.sol";

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

    function testCreateCollectionDefault(uint8 x) public {
        vm.assume(x == 0 || x == 1);
        vm.deal(currentSigner, 1000 ether);
        splitterDeployer.setCurrentSigner(currentSigner);
        address splitter = splitterDeployer._runSplitterDeploy_creatorOnly(
            deployedContracts[x]
        );
        createCollectionDefault(deployedContracts[x], splitter);
    }

    // function testCreateCollectionCustom(uint8 x) public {
    //     vm.assume(x == 0 || x == 1);
    //     vm.deal(defaultCollectionOwner, 1000 ether);
    //     address splitter =
    // _runSplitterDeploy_creatorOnly(deployedContracts[x]);
    //     createCollectionCustom(
    //         deployedContracts[x],
    //         splitter,
    //         CreateCollectionParams.defaultCollectionParams(),
    //         defaultCollectionOwner
    //     );
    // }
}
