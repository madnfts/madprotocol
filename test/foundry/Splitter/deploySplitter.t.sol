pragma solidity ^0.8.19;

import "forge-std/src/Test.sol";
import { DeploySplitterBase } from
    "test/foundry/Base/Splitter/deploySplitterBase.sol";

import {
    Deployer,
    IDeployer,
    MockERC20,
    IMarketplace,
    IFactory,
    IRouter,
    Enums
} from "test/foundry/Deploy/deployer.t.sol";

import { ISplitter } from "test/foundry/Base/Splitter/ISplitter.sol";

contract TestSplitterDeployment is Test, Enums {
    Deployer deployer;
    IFactory public factory;

    DeploySplitterBase tester;

    IFactory[] deployedContracts;

    // Define variables
    address acc = makeAddr("DeployerSplitter");
    string splitterSalt = "SplitterSalt";
    address ambassador = makeAddr("AmbassadorAddress");
    address project = makeAddr("ProjectAddress");
    uint256 ambassadorShare = 20;
    uint256 projectShare = 30;

    // Provide expected payees' addresses
    address[] payeesExpected_onlyCreator = [acc];
    address[] payeesExpected_ambassadorWithNoProject = [ambassador, acc];
    address[] payeesExpected_projectWithNoAmbassador = [project, acc];
    address[] payeesExpected_All = [ambassador, project, acc];

    function setUp() public {
        // Instantiate TestSplitterDeployment contract
        tester = new DeploySplitterBase();
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
        vm.assume(x == 0 || x == 1);
        _runSplitterDeploy(
            ISplitter.SplitterData({
                factory: deployedContracts[x],
                deployer: acc,
                splitterSalt: splitterSalt,
                ambassador: address(0),
                project: address(0),
                ambassadorShare: 0,
                projectShare: 0,
                payeesExpected: payeesExpected_onlyCreator
            })
        );
    }

    /// @dev tests the condition:
    /// _ambassador != address(0) && _project == address(0)
    ///             && _ambShare != 0 && _ambShare < 21
    function testSplitterDeploymentFuzzy_ambassadorWithNoProject(
        uint256 _ambassadorShare,
        uint8 x
    ) public {
        vm.assume(_ambassadorShare > 0 && _ambassadorShare < 21);
        vm.assume(x == 0 || x == 1);
        _runSplitterDeploy(
            ISplitter.SplitterData({
                factory: deployedContracts[x],
                deployer: acc,
                splitterSalt: splitterSalt,
                ambassador: ambassador,
                project: address(0),
                ambassadorShare: _ambassadorShare,
                projectShare: 0,
                payeesExpected: payeesExpected_ambassadorWithNoProject
            })
        );
    }

    /// @dev tests the condition:
    /// _project != address(0) && _ambassador == address(0)
    /// && _projectShare != 0 && _projectShare < 91
    function testSplitterDeploymentFuzzy_projectWithNoAmbassador(
        uint256 _projectShare,
        uint8 x
    ) public {
        vm.assume(_projectShare > 0 && _projectShare < 91);
        vm.assume(x == 0 || x == 1);
        _runSplitterDeploy(
            ISplitter.SplitterData({
                factory: deployedContracts[x],
                deployer: acc,
                splitterSalt: splitterSalt,
                ambassador: address(0),
                project: project,
                ambassadorShare: 0,
                projectShare: _projectShare,
                payeesExpected: payeesExpected_projectWithNoAmbassador
            })
        );
    }

    /// @dev tests the condition:
    /// _ambassador != address(0) && _project != address(0)
    ///            && _ambShare != 0 && _ambShare < 21 && _projectShare != 0
    ///             && _projectShare < 71
    function testSplitterDeploymentFuzzy_All(
        uint256 _ambassadorShare,
        uint256 _projectShare,
        uint8 x
    ) public {
        vm.assume(_ambassadorShare > 0 && _ambassadorShare < 21);
        vm.assume(_projectShare > 0 && _projectShare < 71);
        vm.assume(x == 0 || x == 1);
        _runSplitterDeploy(
            ISplitter.SplitterData({
                factory: deployedContracts[x],
                deployer: acc,
                splitterSalt: splitterSalt,
                ambassador: ambassador,
                project: project,
                ambassadorShare: _ambassadorShare,
                projectShare: _projectShare,
                payeesExpected: payeesExpected_All
            })
        );
    }

    function _runSplitterDeploy(ISplitter.SplitterData memory splitterData)
        private
    {
        address splitter = tester.splitterDeployment(splitterData);
        assertTrue(
            splitter != address(0), "Splitter address should not be zero."
        );
        // emit log_named_address("Splitter", splitter);
    }
}
