pragma solidity 0.8.19;

import "forge-std/src/Test.sol";
import {
    DeploySplitterBase,
    ISplitter,
    Deployer,
    IFactory
} from "test/foundry/Base/Splitter/deploySplitterBase.sol";

import { SplitterModifiers } from
    "test/foundry/Base/Splitter/splitterModifiers.sol";

contract TestSplitterDeployment is DeploySplitterBase, SplitterModifiers {
    IFactory[] deployedContracts;
    Deployer deployer;

    function setUp() public {
        // Instantiate deployer contracts
        deployer = new Deployer();

        // Create array of Factory instances to cover both 721 & 1155 Factories
        deployedContracts = [
            deployer.deployAll(ercTypes.ERC721).factory,
            deployer.deployAll(ercTypes.ERC1155).factory
        ];
    }

    // @dev tests the condition:
    // (_ambassador == address(0) && _project == address(0))
    function testSplitterDeployment_creatorOnly(uint8 x) public {
        vm.assume(x < deployedContracts.length);
        _runSplitterDeploy_creatorOnly(deployedContracts[x]);
    }

    /// @dev tests the condition:
    /// _ambassador != address(0) && _project == address(0)
    ///             && _ambassadorShare != 0 && _ambassadorShare < 21
    function testSplitterDeploymentFuzzy_ambassadorWithNoProject(
        uint256 _ambassadorShare,
        uint8 x
    ) public ambassadorWithNoProjectAssumptions(_ambassadorShare) {
        vm.assume(x < deployedContracts.length);
        _runSplitterDeploy_ambassadorWithNoProject(
            deployedContracts[x], _ambassadorShare
        );
    }

    /// @dev tests the condition:
    /// _project != address(0) && _ambassador == address(0)
    /// && _projectShare != 0 && _projectShare < 91
    function testSplitterDeploymentFuzzy_projectWithNoAmbassador(
        uint256 _projectShare,
        uint8 x
    ) public projectWithNoAmbassadorAssumptions(_projectShare) {
        vm.assume(x < deployedContracts.length);
        _runSplitterDeploy_projectWithNoAmbassador(
            deployedContracts[x], _projectShare
        );
    }

    /// @dev tests the condition:
    /// _ambassador != address(0) && _project != address(0)
    ///            && _ambassadorShare != 0 && _ambassadorShare < 21 &&
    /// _projectShare != 0
    ///             && _projectShare < 71
    function testSplitterDeploymentFuzzy_All(
        uint256 _ambassadorShare,
        uint256 _projectShare,
        uint8 x
    )
        public
        bothAmbassadorAndProjectAssumptions(_ambassadorShare, _projectShare)
    {
        vm.assume(x < deployedContracts.length);
        _runSplitterDeploy_BothAmbassadorAndProject(
            deployedContracts[x], _ambassadorShare, _projectShare
        );
    }
}
