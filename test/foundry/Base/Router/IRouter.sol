// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { FactoryVerifier } from "contracts/Shared/EventsAndErrors.sol";

interface IRouter {
    function owner() external view returns (address);
    function recipient() external view returns (address);
    function erc20() external view returns (address);
    function madFactory() external view returns (FactoryVerifier);
}
