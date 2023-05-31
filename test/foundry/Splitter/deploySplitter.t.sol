pragma solidity ^0.8.19;

import "forge-std/src/Test.sol";
import { DeploySplitterBase } from
    "test/foundry/Base/Splitter/deploySplitterBase.sol";

import {
    Deployer,
    MockERC20,
    IMarketplace,
    IFactory,
    IRouter
} from "test/foundry/Deploy/deployer.t.sol";

import { ISplitter } from "test/foundry/Base/Splitter/ISplitter.sol";

contract TestSplitterDeployment is Test {
    Deployer deployer;
    MockERC20 public paymentToken;
    IMarketplace public marketplace;
    IFactory public factory;
    IRouter public router;

    DeploySplitterBase tester;

    // Define variables
    address acc = makeAddr("DeployerSplitter");
    string splitterSalt = "SplitterSalt";
    address ambassador = makeAddr("AmbassadorAddress");
    address project = makeAddr("ProjectAddress");
    uint256 ambassadorShare = 20;
    uint256 projectShare = 30;

    // Provide expected payees' addresses
    address[] payeesExpected_All = [ambassador, project, acc];
    address[] payeesExpected_noAmbassadorNoProject = [acc];
    address[] payeesExpected_ambassadorWithNoProject = [ambassador, acc];
    address[] payeesExpected_projectWithNoAmbassador = [project, acc];

    function setUp() public {
        // Instantiate TestSplitterDeployment contract
        tester = new DeploySplitterBase();
        // Instantiate deployer contracts
        deployer = new Deployer();
        // Deploy all contracts
        address[4] memory deployedContracts = deployer.deployAll(1);

        factory = IFactory(deployedContracts[2]);
        paymentToken = MockERC20(deployedContracts[0]);
        marketplace = IMarketplace(deployedContracts[1]);
        router = IRouter(deployedContracts[3]);
    }

    // @dev tests the condition:
    // (_ambassador == address(0) && _project == address(0))
    function testSplitterDeployment_noAmbassadorNoProject() public {
        _runSplitterDeploy(
            ISplitter.SplitterData({
                factory: factory,
                deployer: acc,
                splitterSalt: splitterSalt,
                ambassador: address(0),
                project: address(0),
                ambassadorShare: 0,
                projectShare: 0,
                payeesExpected: payeesExpected_noAmbassadorNoProject
            })
        );
    }

    /// @dev tests the condition:
    /// _ambassador != address(0) && _project == address(0)
    ///             && _ambShare != 0 && _ambShare < 21
    function testSplitterDeployment_ambassadorWithNoProject() public {
        _runSplitterDeploy(
            ISplitter.SplitterData({
                factory: factory,
                deployer: acc,
                splitterSalt: splitterSalt,
                ambassador: ambassador,
                project: address(0),
                ambassadorShare: ambassadorShare,
                projectShare: projectShare,
                payeesExpected: payeesExpected_ambassadorWithNoProject
            })
        );
    }

    /// @dev tests the condition:
    /// _project != address(0) && _ambassador == address(0)
    /// && _projectShare != 0 && _projectShare < 91
    function testSplitterDeployment_projectWithNoAmbassador() public {
        _runSplitterDeploy(
            ISplitter.SplitterData({
                factory: factory,
                deployer: acc,
                splitterSalt: splitterSalt,
                ambassador: address(0),
                project: project,
                ambassadorShare: ambassadorShare,
                projectShare: 90,
                payeesExpected: payeesExpected_projectWithNoAmbassador
            })
        );
    }

    /// @dev tests the condition:
    /// _ambassador != address(0) && _project != address(0)
    ///            && _ambShare != 0 && _ambShare < 21 && _projectShare != 0
    ///             && _projectShare < 71
    function testSplitterDeployment_projectAll() public {
        _runSplitterDeploy(
            ISplitter.SplitterData({
                factory: factory,
                deployer: acc,
                splitterSalt: splitterSalt,
                ambassador: ambassador,
                project: project,
                ambassadorShare: ambassadorShare,
                projectShare: projectShare,
                payeesExpected: payeesExpected_All
            })
        );
    }

    function testFuzzSplitterAll(
        // address _acc,
        // string memory _splitterSalt,
        // address _ambassador,
        // address _project,
        uint256 _ambassadorShare,
        uint256 _projectShare
    ) public {
        vm.assume(_ambassadorShare > 0 && _ambassadorShare < 21);
        vm.assume(_projectShare > 0 && _projectShare < 71);

        _runSplitterDeploy(
            ISplitter.SplitterData({
                factory: factory,
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
        emit log_named_address("Splitter", splitter);
    }
}
