// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.22;

import { EventsAndErrorsBase } from "contracts/Shared/EventsAndErrors.sol";
import { IERC20 } from "contracts/lib/tokens/ERC20/interfaces/IERC20.sol";
import { Owned } from "contracts/lib/auth/Owned.sol";

abstract contract MADBase is EventsAndErrorsBase, Owned(msg.sender) { }
