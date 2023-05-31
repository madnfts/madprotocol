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

        emit log_named_address("sD: deployer", splitterData.deployer);

        splitterAddress = splitterData.factory.getDeployedAddr(
            splitterData.splitterSalt, splitterData.deployer
        );

        emit log_named_address("sD: splitterAddress", splitterAddress);

        validateDeployment(splitterData, splitterAddress);
    }

    // Helper function to validate the deployment
    function validateDeployment(
        ISplitter.SplitterData memory splitterData,
        address splitterAddress
    ) private {
        Types.SplitterConfig memory config = splitterData.factory.splitterInfo(
            splitterData.deployer, splitterAddress
        );

        uint256 _payeesExpectedLength = splitterData.payeesExpected.length;

        uint256 totalShares = 100;
        uint256 sharesOrZero = totalShares - splitterData.ambassadorShare
            - splitterData.projectShare;

        ISplitter instance = ISplitter(splitterAddress);
        uint256 creatorShares = instance._shares(splitterData.deployer);

        assertTrue(
            splitterAddress != address(0),
            "Splitter address should not be zero."
        );

        assertTrue(
            splitterAddress == config.splitter,
            "Splitter address should match with storage splitter address."
        );

        // assertTrue(
        //     _splitterSalt == config.splitterSalt,
        //     "Splitter salt should match with the stored splitter salt."
        // );

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

        assertTrue(
            true == config.valid,
            "Valid field should match with the stored valid field."
        );

        assertTrue(
            _payeesExpectedLength == instance.payeesLength(),
            "Payees Lengths should match expected"
        );

        assertTrue(
            sharesOrZero == creatorShares, "Creator shares should match."
        );

        // Assuming payees are returned in the order [ambassador, project,
        // deployer]
        address[] memory payees;
        for (uint256 i = 0; i < _payeesExpectedLength; i++) {
            address payee = instance._payees(i);
            assertTrue(
                payee == splitterData.payeesExpected[i],
                "Payees addresses should match."
            );
            payees[i] = payee;
        }

        assertTrue(
            compareAddressArray(payees, splitterData.payeesExpected),
            "Payees addresses should match."
        );
    }

    // Helper function to compare two address arrays
    function compareAddressArray(
        address[] memory array1,
        address[] memory array2
    ) private pure returns (bool) {
        uint256 len = array1.length;
        if (len != array2.length) {
            return false;
        }
        for (uint256 i = 0; i < len; i++) {
            if (array1[i] != array2[i]) {
                return false;
            }
        }
        return true;
    }
}
