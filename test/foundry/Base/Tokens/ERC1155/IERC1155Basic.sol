// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import { IImplBase } from "test/foundry/Base/Tokens/common/IImplBase.sol";

interface IERC1155Basic is IImplBase {
    // View Functions
    function mintCount(uint256 id) external view returns (uint256);
    function balanceOf(address owner, uint256 id)
        external
        view
        returns (uint256 result);
    function balanceOfBatch(address[] memory owners, uint256[] memory ids)
        external
        view
        returns (uint256[] memory balances);

    // Difference between this and liveSupply ?
    function liveSupply(uint256 id) external view returns (uint256);

    function maxIdBalance() external view returns (uint128);
    function uri(uint256 id) external view returns (string memory);

    // Other Functions
    function burn(
        address[] memory from,
        uint128[] memory ids,
        uint128[] memory balances
    ) external payable;
    function burnBatch(
        address from,
        uint128[] memory ids,
        uint128[] memory amounts
    ) external payable;
    function mint(uint128 amount, uint128 balance) external payable;
    function mintBatch(uint128[] memory ids, uint128[] memory amounts)
        external
        payable;
    function mintBatchTo(
        address to,
        uint128[] memory ids,
        uint128[] memory amounts
    ) external payable;
    function mintTo(address to, uint128 amount, uint128 balance)
        external
        payable;
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external;
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external;
    function setApprovalForAll(address operator, bool isApproved) external;

    function withdraw() external payable;
    function withdrawERC20(address erc20) external;
    function publicMintLimit(uint256 _id) external view returns (uint256);
    function setPublicMintLimit(uint256 _id, uint256 _limit) external;
}
