// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { IFactory } from "test/foundry/Base/Factory/IFactory.sol";
import { ISplitter, ERC20 } from "test/foundry/Base/Splitter/ISplitter.sol";
import { SplitterImpl } from "contracts/lib/splitter/SplitterImpl.sol";
import { Types } from "contracts/Shared/Types.sol";
import { Deployer } from "test/foundry/Deploy/deployer.t.sol";

import {
    IDeployer,
    IFactory,
    Enums
} from "test/foundry/Base/Deploy/deployerBase.sol";

import { SettersToggle } from "test/foundry/utils/setterToggle.sol";
import { SplitterHelpers } from "test/foundry/Base/Splitter/splitterHelpers.sol";

contract DeploySplitterBase is Enums, SettersToggle("defaultSplitterSigner") {
    using Types for Types.SplitterConfig;

    string public splitterSalt = "SplitterSalt";

    function updateSplitterSalt(string memory _splitterSalt) public {
        splitterSalt = _splitterSalt;
    }

    // Define default variables
    uint256 public ambassadorShare = 20;
    uint256 public projectShare = 30;

    address public ambassador = makeAddr("AmbassadorAddress");
    address public project = makeAddr("ProjectAddress");

    // Test the deployment
    function splitterDeployment(ISplitter.SplitterData memory splitterData)
        public
        returns (address splitterAddress)
    {
        // Prank tx.origin as well here otherwise the splitter will be owned by
        // the calling test contract
        vm.prank(splitterData.deployer, splitterData.deployer);

        splitterData.factory.splitterCheck(
            splitterData.splitterSalt,
            splitterData.ambassador,
            splitterData.project,
            splitterData.ambassadorShare,
            splitterData.projectShare
        );

        // emit log_named_address("sD: currentSigner", splitterData.deployer);

        splitterAddress = splitterData.factory.getDeployedAddress(
            splitterData.splitterSalt, splitterData.deployer
        );

        // emit log_named_address("sD: splitterAddress", splitterAddress);

        validateDeployment(splitterData, splitterAddress);
    }

    // Helper function to validate the deployment
    function validateDeployment(
        ISplitter.SplitterData memory splitterData,
        address splitterAddress
    ) public {
        bytes32 _splitterSalt = keccak256(
            abi.encode(splitterData.deployer, bytes(splitterData.splitterSalt))
        );

        Types.SplitterConfig memory config = splitterData.factory.splitterInfo(
            splitterData.deployer, splitterAddress
        );

        ISplitter splitter = ISplitter(splitterAddress);
        uint256 creatorShares = splitter._shares(splitterData.deployer);

        uint256 _payeesExpectedLength = splitterData.payeesExpected.length;

        uint256 totalShares = splitter.totalShares();
        uint256 sharesOrZero = totalShares - splitterData.ambassadorShare
            - splitterData.projectShare;

        assertTrue(
            splitterAddress != address(0),
            "Splitter address should not be zero."
        );

        assertTrue(
            splitterAddress == config.splitter,
            "Splitter address should match with storage splitter address."
        );

        assertTrue(
            _splitterSalt == config.splitterSalt,
            "Splitter salt should match with the stored splitter salt."
        );

        assertTrue(
            splitterData.ambassador == config.ambassador,
            "Ambassador address should match with the stored ambassador address."
        );

        assertTrue(
            splitterData.project == config.project,
            "Project address should match with the stored project address."
        );

        assertTrue(
            splitterData.ambassadorShare == config.ambShare,
            "Ambassador share should match with the stored ambassador share."
        );

        assertTrue(
            splitterData.projectShare == config.projectShare,
            "Project share should match with the stored project share."
        );

        assertTrue(true == config.valid, "Splitter must be valid.");

        assertTrue(
            _payeesExpectedLength == splitter.payeesLength(),
            "Payees Lengths should match expected"
        );

        assertTrue(
            sharesOrZero == creatorShares, "Creator shares should match."
        );
        assertTrue(totalShares == 100, "Shares should add up to 100");

        assertTrue(splitter.totalReleased() == 0, "Total released should be 0");

        assertTrue(
            splitter.totalReleased() == 0,
            "Total released for specific token should be 0"
        );

        assertZeroBalanceRelease(
            splitter, splitterData.deployer, splitterData.paymentToken
        );
        assertZeroBalanceRelease(
            splitter, splitterData.ambassador, splitterData.paymentToken
        );
        assertZeroBalanceRelease(
            splitter, splitterData.project, splitterData.paymentToken
        );

        // Assuming payees are returned in the order [ambassador, project,
        // currentSigner]
        emit log_array(splitterData.payeesExpected);
        for (uint256 i = 0; i < _payeesExpectedLength; ++i) {
            address payee = splitter._payees(i);
            assertTrue(
                payee == splitterData.payeesExpected[i],
                "Payees addresses should match."
            );
        }
    }

    function assertZeroBalanceRelease(
        ISplitter splitter,
        address _currentSigner,
        address _paymentToken
    ) public {
        assertTrue(
            splitter.released(_currentSigner) == 0,
            "Released amount for specific _currentSigner should be 0"
        );
        assertTrue(
            splitter.releasable(_currentSigner) == 0,
            "Releasable amount for specific _currentSigner should be 0"
        );

        // ERC20
        assertTrue(
            splitter.released(ERC20(_paymentToken), _currentSigner) == 0,
            "Released amount for specific token and _currentSigner should be 0"
        );

        assertTrue(
            splitter.releasable(ERC20(_paymentToken), _currentSigner) == 0,
            "Releasable amount for specific token and _currentSigner should be 0"
        );
    }

    function _runSplitterDeploy_creatorOnly(IFactory factory)
        public
        returns (address splitter)
    {
        return _runSplitterDeploy(
            ISplitter.SplitterData({
                factory: factory,
                deployer: currentSigner,
                splitterSalt: splitterSalt,
                ambassador: address(0),
                project: address(0),
                ambassadorShare: 0,
                projectShare: 0,
                payeesExpected: SplitterHelpers.getExpectedSplitterAddresses(
                    currentSigner, address(0), address(0)
                    ),
                paymentToken: factory.erc20()
            })
        );
    }

    function _runSplitterDeploy_ambassadorWithNoProject(
        IFactory factory,
        uint256 _ambassadorShare
    ) public returns (address splitter) {
        return _runSplitterDeploy(
            ISplitter.SplitterData({
                factory: factory,
                deployer: currentSigner,
                splitterSalt: splitterSalt,
                ambassador: ambassador,
                project: address(0),
                ambassadorShare: _ambassadorShare,
                projectShare: 0,
                payeesExpected: SplitterHelpers.getExpectedSplitterAddresses(
                    currentSigner, ambassador, address(0)
                    ),
                paymentToken: factory.erc20()
            })
        );
    }

    function _runSplitterDeploy_projectWithNoAmbassador(
        IFactory factory,
        uint256 _projectShare
    ) public returns (address splitter) {
        return _runSplitterDeploy(
            ISplitter.SplitterData({
                factory: factory,
                deployer: currentSigner,
                splitterSalt: splitterSalt,
                ambassador: address(0),
                project: project,
                ambassadorShare: 0,
                projectShare: _projectShare,
                payeesExpected: SplitterHelpers.getExpectedSplitterAddresses(
                    currentSigner, address(0), project
                    ),
                paymentToken: factory.erc20()
            })
        );
    }

    function _runSplitterDeploy_BothAmbassadorAndProject(
        IFactory factory,
        uint256 _ambassadorShare,
        uint256 _projectShare
    ) public returns (address splitter) {
        return _runSplitterDeploy(
            ISplitter.SplitterData({
                factory: factory,
                deployer: currentSigner,
                splitterSalt: splitterSalt,
                ambassador: ambassador,
                project: project,
                ambassadorShare: _ambassadorShare,
                projectShare: _projectShare,
                payeesExpected: SplitterHelpers.getExpectedSplitterAddresses(
                    currentSigner, ambassador, project
                    ),
                paymentToken: factory.erc20()
            })
        );
    }

    function _runSplitterDeploy(ISplitter.SplitterData memory splitterData)
        internal
        returns (address splitter)
    {
        splitter = splitterDeployment(splitterData);
        assertTrue(
            splitter != address(0), "Splitter address should not be zero."
        );
        // emit log_named_address("Splitter", splitter);
    }
}
