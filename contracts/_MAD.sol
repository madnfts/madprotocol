// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

import { MADMarketplace1155} from "contracts/Marketplace/MADMarketplace1155.sol";
import { MADMarketplace721} from "contracts/Marketplace/MADMarketplace721.sol";
import { MADRouter1155} from "contracts/Router/MADRouter1155.sol";
import { MADRouter721} from "contracts/Router/MADRouter721.sol";
import { MADFactory1155} from "contracts/Factory/MADFactory1155.sol";
import { MADFactory721} from "contracts/Factory/MADFactory721.sol";

abstract contract _MAD {
    function name() external pure virtual returns (string memory);
}
