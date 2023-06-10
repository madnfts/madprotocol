// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { IRouter } from "test/foundry/Base/Router/interfaces/IRouter.sol";

interface IMADRouter1155 {
    // Mint Functions
    function basicMintBatchTo(
        address _token,
        address _to,
        uint128[] memory _ids,
        uint128[] memory _balances
    ) external;

    function basicMintTo(
        address _token,
        address _to,
        uint128 _amount,
        uint128 _balance
    ) external;

    // Burn
    function batchBurn(
        address _token,
        address _from,
        uint128[] memory _ids,
        uint128[] memory _balances
    ) external;

    function burn(
        address _token,
        uint128[] memory _ids,
        address[] memory to,
        uint128[] memory _amount
    ) external;

    // Setters
    function setBaseURI(address _token, string memory _uri) external;
    function setURILock(address _token) external;

    function setMintState(address _token, bool _state) external;

    // Withdraw
    function withdraw(address _token, address _erc20) external;
}
