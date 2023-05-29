// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import { FactoryVerifier } from "contracts/Shared/EventsAndErrors.sol";

interface IMarketplace {
    function setFactory(FactoryVerifier factory) external;
    function owner() external view returns (address);
    function swapRouter() external view returns (address);
    function recipient() external view returns (address);
    function erc20() external view returns (address);
    function MADFactory() external view returns (FactoryVerifier);
}
