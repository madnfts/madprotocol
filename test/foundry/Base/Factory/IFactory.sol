// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import { Types } from "contracts/Shared/Types.sol";

interface IFactory {
    // Deployment
    function owner() external view returns (address);
    function market() external view returns (address);
    function signer() external view returns (address);
    function erc20() external view returns (address);
    function router() external view returns (address);

    function splitterCheck(
        string calldata _splitterSalt,
        address ambassador,
        address project,
        uint256 ambShare,
        uint256 projShare
    ) external;

    // Storage
    function colTypes(uint256 index) external view returns (bytes memory);
    function userTokens(address user)
        external
        view
        returns (bytes32[] memory);

    function splitterInfo(address creator, address splitterContract)
        external
        view
        returns (Types.SplitterConfig memory);

    // Helpers
    function getIDsLength(address _user) external view returns (uint256);
    function getColID(address _colAddress)
        external
        pure
        returns (bytes32 colID);
    function getDeployedAddr(string memory _salt, address _addr)
        external
        view
        returns (address);

    // Owner functions
    function setMarket(address _market) external;
    function setRouter(address _router) external;
    function setSigner(address _signer) external;
    function addColType(uint256 index, bytes calldata impl) external;
}
