// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import { Types } from "contracts/Shared/Types.sol";

interface IFactory {
    function name() external pure returns (string memory);

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

    function createCollection(
        uint8 _tokenType,
        string memory _tokenSalt,
        string memory _name,
        string memory _symbol,
        uint256 _price,
        uint256 _maxSupply,
        string memory _uri,
        address _splitter,
        uint96 _royalty,
        bytes32[] memory _extra
    ) external;

    // Storage
    function colInfo(bytes32)
        external
        view
        returns (
            address creator,
            uint8 colType,
            bytes32 colSalt,
            uint256 blocknumber,
            address splitter
        );

    function colTypes(uint256 index) external view returns (bytes memory);

    function creatorAuth(address _token, address _user)
        external
        view
        returns (bool stdout);
    function creatorCheck(bytes32 _colID)
        external
        view
        returns (address creator, bool check);
    function typeChecker(bytes32 _colID)
        external
        view
        returns (uint8 pointer);

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
    function addColType(uint256 index, bytes memory impl) external;
    function setMarket(address _market) external;
    function setOwner(address newOwner) external;
    function setRouter(address _router) external;
    function setSigner(address _signer) external;
}
