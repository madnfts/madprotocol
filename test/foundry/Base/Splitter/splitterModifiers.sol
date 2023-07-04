// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "forge-std/src/Test.sol";

abstract contract SplitterModifiers is Test {
    /// _ambassador != address(0) && _project == address(0)
    ///             && _ambassadorShare != 0 && _ambassadorShare < 21
    modifier ambassadorWithNoProjectAssumptions(uint256 _ambassadorShare) {
        vm.assume(_ambassadorShare > 0 && _ambassadorShare < 21);
        _;
    }

    /// _project != address(0) && _ambassador == address(0)
    /// && _projectShare != 0 && _projectShare < 101
    modifier projectWithNoAmbassadorAssumptions(uint256 _projectShare) {
        vm.assume(_projectShare > 0 && _projectShare < 101);
        _;
    }

    /// _ambassador != address(0) && _project != address(0)
    ///            && _ambassadorShare != 0 && _ambassadorShare < 21 &&
    /// _projectShare != 0
    ///             && _projectShare < 71
    modifier bothAmbassadorAndProjectAssumptions(
        uint256 _ambassadorShare,
        uint256 _projectShare
    ) {
        vm.assume(_ambassadorShare > 0 && _ambassadorShare < 21);
        vm.assume(_projectShare > 0 && _projectShare < 81);
        _;
    }
}
