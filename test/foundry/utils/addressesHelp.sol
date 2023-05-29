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

    // function testMintPublicNfts(uint x) public {
    //     vm.assume(x > 100 && x < 1000, "x must be between 100 and 1000");
    //     address[] minters = createManyAddresses(100, "NftMinter");

    //     for (uint i = 0; i < 100; i++) {
    //         uint amount = x;
    //         mint(amount);
    //         assert(nft.balanceof == amount);
    //             }
}
