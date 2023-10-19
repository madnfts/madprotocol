// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "forge-std/src/Test.sol";
import { DeployerBase } from "test/foundry/Base/Deploy/deployerBase.sol";

contract Deployer is DeployerBase {
    bool public isERC20;

    function setUp() public {
        vm.deal(currentSigner, 1000 ether);
    }

    function testFailDeployAll() public {
        deployAll(ercTypes.None, isERC20);
    }

    function testDeployAllErc721() public {
        deployAll(ercTypes.ERC721, isERC20);
    }

    function testDeployAllErc1155() public {
        deployAll(ercTypes.ERC1155, isERC20);
    }
}
