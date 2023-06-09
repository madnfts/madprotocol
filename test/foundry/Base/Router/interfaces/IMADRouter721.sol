// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { IRouter } from "test/foundry/Base/Router/interfaces/IRouter.sol";

interface IMADRouter721 is IRouter {
    // Other Functions
    function basicMintTo(address _token, address _to, uint128 _amount)
        external;

    function burn(address _token, uint128[] memory _ids) external;

    // Setters
    function setBase(address _token, string memory _baseURI) external;
    function setBaseLock(address _token) external;

    function setMintState(address _token, bool _state) external;
    function withdraw(address _token, address _erc20) external;
}
