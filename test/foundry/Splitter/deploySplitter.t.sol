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
    ///             && _ambassadorShare > 99 && _ambassadorShare < 2001
    function testSplitterDeploymentFuzzy_ambassadorWithNoProject(
        uint16 _ambassadorShare,
        uint8 x
    ) public ambassadorWithNoProjectAssumptions(_ambassadorShare) {
        vm.assume(x < deployedContracts.length);
        _runSplitterDeploy_ambassadorWithNoProject(
            deployedContracts[x], uint256(_ambassadorShare)
        );
    }

    /// @dev tests the condition:
    /// _project != address(0) && _ambassador == address(0)
    /// && _projectShare > 99 && _projectShare < 10001
    function testSplitterDeploymentFuzzy_projectWithNoAmbassador(
        uint16 _projectShare,
        uint8 x
    ) public projectWithNoAmbassadorAssumptions(_projectShare) {
        vm.assume(x < deployedContracts.length);
        _runSplitterDeploy_projectWithNoAmbassador(
            deployedContracts[x], uint256(_projectShare)
        );
    }

    /// @dev tests the condition:
    /// _ambassador != address(0) && _project != address(0)
    ///            && _ambassadorShare > 99 && _ambassadorShare < 2001 &&
    /// _projectShare > 99
    ///             && _projectShare < 10001
    function testSplitterDeploymentFuzzy_All(
        uint16 _ambassadorShare,
        uint16 _projectShare,
        uint8 x
    )
        public
        bothAmbassadorAndProjectAssumptions(_ambassadorShare, _projectShare)
    {
        vm.assume(x < deployedContracts.length);
        _runSplitterDeploy_BothAmbassadorAndProject(
            deployedContracts[x],
            uint256(_ambassadorShare),
            uint256(_projectShare)
        );
    }

    /// @dev tests the condition:
    /// _ambassador != address(0) && _project != address(0)
    ///            && _ambassadorShare > 99 && _ambassadorShare < 2001 &&
    /// _projectShare > 99
    ///             && _projectShare < 10001
    function testSplitterDeployment_All() public {
        _runSplitterDeploy_BothAmbassadorAndProject(
            deployedContracts[0], 2000, 2000
        );
    }
}
