// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { IMarketplace } from
    "test/foundry/Base/Marketplace/interfaces/IMarketplace.sol";

interface IMADMarketplace1155 is IMarketplace {
    function feeSelector(uint256, uint256, uint256)
        external
        view
        returns (bool);

    function orderIdByToken(address, uint256, uint256, uint256)
        external
        view
        returns (bytes32);

    // Auctions
    function dutchAuction(
        address _token,
        uint256 _id,
        uint256 _amount,
        uint256 _startPrice,
        uint256 _endPrice,
        uint256 _endTime
    ) external;

    function englishAuction(
        address _token,
        uint256 _id,
        uint256 _amount,
        uint256 _startPrice,
        uint256 _endTime
    ) external;

    function fixedPrice(
        address _token,
        uint256 _id,
        uint256 _amount,
        uint256 _price,
        uint256 _endTime
    ) external;

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) external returns (bytes4);

    function onERC1155Received(address, address, uint256, uint256, bytes memory)
        external
        returns (bytes4);

    function orderInfo(bytes32)
        external
        view
        returns (
            uint256 tokenId,
            uint256 amount,
            uint256 startPrice,
            uint256 endPrice,
            uint256 startTime,
            uint256 endTime,
            uint256 lastBidPrice,
            address lastBidder,
            address token,
            address seller,
            uint8 orderType,
            bool isSold
        );

    function tokenOrderLength(address _token, uint256 _id, uint256 _amount)
        external
        view
        returns (uint256);
}
