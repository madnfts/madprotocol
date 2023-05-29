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

contract TestSplitterDeployment is Test {
    Deployer deployer;
    MockERC20 public paymentToken;
    IMarketplace public marketplace;
    IFactory public factory;
    IRouter public router;

    DeploySplitterBase tester;

    // Define variables
    address acc = makeAddr("NewAccount");
    string splitterSalt = "SplitterSalt";
    address ambassador = makeAddr("AmbassadorAddress");
    address project = makeAddr("ProjectAddress");
    uint256 ambassadorShare = 20;
    uint256 projectShare = 30;

    // Provide expected payees' addresses
    address[] payeesExpected = [ambassador, project, acc];

    function setUp() public {
        // Instantiate TestSplitterDeployment contract
        tester = new DeploySplitterBase();
        // Instantiate deployer contracts
        deployer = new Deployer();
        // Deploy all contracts
        address[4] memory deployedContracts = deployer.deployAll(1);

        paymentToken = MockERC20(deployedContracts[0]);
        marketplace = IMarketplace(deployedContracts[1]);
        factory = IFactory(deployedContracts[2]);
        router = IRouter(deployedContracts[3]);
    }

    function testFuzzSplitter(
        // address _acc,
        // string memory _splitterSalt,
        // address _ambassador,
        // address _project,
        uint256 _ambassadorShare,
        uint256 _projectShare
    ) public {
        vm.assume(_ambassadorShare > 0 && _ambassadorShare <= 20);
        vm.assume(_projectShare > 0 && _projectShare <= 30);
        vm.assume(_ambassadorShare + _projectShare > 0);
        vm.assume(_ambassadorShare + _projectShare < 90);

        // address[] memory _payeesExpected;
        // _payeesExpected[0] = _ambassador;
        // _payeesExpected[1] = _project;
        // _payeesExpected[2] = _acc;

        tester.splitterDeployment(
            factory,
            acc,
            splitterSalt,
            ambassador,
            project,
            _ambassadorShare,
            _projectShare,
            payeesExpected
        );
    }

    function testSplitterDeployment() public {
        // Call the testDeployment function
        tester.splitterDeployment(
            factory,
            acc,
            splitterSalt,
            ambassador,
            project,
            ambassadorShare,
            projectShare,
            payeesExpected
        );
    }
}
