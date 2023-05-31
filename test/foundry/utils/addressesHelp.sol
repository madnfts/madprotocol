// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/src/Test.sol";

abstract contract AddressesHelp is Test {
    function createManyAddresses(
        uint256 numAddresses,
        string memory name,
        uint256 _deal
    ) internal returns (address[] memory addresses) {
        addresses = new address[](numAddresses);
        for (uint256 i = 0; i < numAddresses; i++) {
            addresses[i] = makeAddr(string(abi.encode(name, i)));
            vm.deal(addresses[i], _deal);
        }
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
