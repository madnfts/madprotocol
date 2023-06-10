// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "forge-std/src/Test.sol";
import { IRouter } from "test/foundry/Base/Router/interfaces/IRouter.sol";

abstract contract RouterBaseFunctions is Test {
    function _setRouterFees(
        address _owner,
        IRouter router,
        uint256 _feeMint,
        uint256 _feeBurn
    ) internal {
        vm.prank(_owner);
        router.setFees(_feeMint, _feeBurn);
        assertTrue(router.feeMint() == _feeMint);
        assertTrue(router.feeBurn() == _feeBurn);
    }
}
