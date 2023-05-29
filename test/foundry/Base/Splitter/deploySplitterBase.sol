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
    function splitterDeployment(
        IFactory factory,
        address deployer,
        string calldata splitterSalt,
        address ambassador,
        address project,
        uint256 ambassadorShare,
        uint256 projectShare,
        address[] calldata payeesExpected
    ) public returns (address splitterAddress) {
        // Deploy the splitter contract
        vm.prank(deployer);
        factory.splitterCheck(
            splitterSalt, ambassador, project, ambassadorShare, projectShare
        );

        splitterAddress = factory.getDeployedAddr(splitterSalt, deployer);

        emit log_named_address("sD: splitterAddress", splitterAddress);

        validateDeployment(
            factory,
            deployer,
            splitterAddress,
            ambassadorShare,
            projectShare,
            payeesExpected
        );
    }

    // Helper function to validate the deployment
    function validateDeployment(
        IFactory factory,
        address deployer,
        address splitterAddress,
        uint256 ambassadorShare,
        uint256 projectShare,
        address[] calldata payeesExpected
    ) private {
        Types.SplitterConfig memory config =
            factory.splitterInfo(deployer, splitterAddress);

        uint256 totalShares = 100;
        uint256 sharesOrZero = totalShares - ambassadorShare - projectShare;

        ISplitter instance = ISplitter(splitterAddress);
        uint256 creatorShares = instance._shares(deployer);

        assertTrue(
            splitterAddress != address(0),
            "Splitter address should not be zero."
        );
        assertTrue(
            splitterAddress == config.splitter,
            "Splitter address should match with storage splitter address."
        );
        assertTrue(
            sharesOrZero == creatorShares, "Creator shares should match."
        );

        // Assuming payees are returned in the order [ambassador, project,
        // deployer]
        address[] memory payees = instance._payees();
        assertTrue(
            compareAddressArray(payees, payeesExpected),
            "Payees addresses should match."
        );
    }

    // Helper function to compare two address arrays
    function compareAddressArray(
        address[] memory array1,
        address[] memory array2
    ) private pure returns (bool) {
        if (array1.length != array2.length) {
            return false;
        }
        for (uint256 i = 0; i < array1.length; i++) {
            if (array1[i] != array2[i]) {
                return false;
            }
        }
        return true;
    }
}
