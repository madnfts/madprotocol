// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/src/Test.sol";
import { IFactory } from "test/foundry/Base/Factory/IFactory.sol";
import { ISplitter } from "test/foundry/Base/Splitter/ISplitter.sol";
import { SplitterImpl } from "contracts/lib/splitter/SplitterImpl.sol";
import { Types } from "contracts/Shared/Types.sol";

contract DeploySplitterBase is Test {
    using Types for Types.SplitterConfig;

    // Test the deployment
    function splitterDeployment(ISplitter.SplitterData memory splitterData)
        public
        returns (address splitterAddress)
    {
        // Prank tx.origin as well here otherwise the splitter will be owned by
        // the calling contract
        vm.prank(splitterData.deployer, splitterData.deployer);

        splitterData.factory.splitterCheck(
            splitterData.splitterSalt,
            splitterData.ambassador,
            splitterData.project,
            splitterData.ambassadorShare,
            splitterData.projectShare
        );

        // emit log_named_address("sD: deployer", splitterData.deployer);

        splitterAddress = splitterData.factory.getDeployedAddr(
            splitterData.splitterSalt, splitterData.deployer
        );

        // emit log_named_address("sD: splitterAddress", splitterAddress);

        validateDeployment(splitterData, splitterAddress);
    }

    // Helper function to validate the deployment
    function validateDeployment(
        ISplitter.SplitterData memory splitterData,
        address splitterAddress
    ) private {
        bytes32 splitterSalt = keccak256(
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
            splitterSalt == config.splitterSalt,
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

        assertZeroBalance(splitter, splitterData.deployer);
        assertZeroBalance(splitter, splitterData.ambassador);
        assertZeroBalance(splitter, splitterData.project);

        // Assuming payees are returned in the order [ambassador, project,
        // deployer]
        emit log_array(splitterData.payeesExpected);
        for (uint256 i = 0; i < _payeesExpectedLength; ++i) {
            address payee = splitter._payees(i);
            assertTrue(
                payee == splitterData.payeesExpected[i],
                "Payees addresses should match."
            );
        }
    }

    function assertZeroBalance(ISplitter splitter, address account) private {
        assertTrue(
            splitter.released(account) == 0,
            "Released amount for specific account should be 0"
        );
        assertTrue(
            splitter.releasable(account) == 0,
            "Releasable amount for specific account should be 0"
        );

        // TODO: ERC20
        // assertTrue(
        //     splitter.released(yourERC20TokenInstance, yourAccountAddress) ==
        // 0,
        //     "Released amount for specific token and account should be 0"
        // );

        // assertTrue(
        //     splitter.releasable(yourERC20TokenInstance, yourAccountAddress)
        // == 0,
        //     "Releasable amount for specific token and account should be 0"
        // );
    }
}
