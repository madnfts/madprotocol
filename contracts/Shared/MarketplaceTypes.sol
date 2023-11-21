// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.22;

import { IERC721 } from
    "contracts/lib/tokens/ERC721/Base/interfaces/IERC721.sol";
import { IERC1155 } from
    "contracts/lib/tokens/ERC1155/Base/interfaces/IERC1155.sol";

// prettier-ignore
library MarketplaceTypes {
    /// @param orderType Values legend:
    /// 0=Fixed Price; 1=Dutch Auction; 2=English Auction.
    /// @param endTime Equals to canceled order when value is set to 0.
    struct Order721 {
        /// @dev Storage:
        uint256 tokenId;
        /// order.slot
        uint256 startPrice;
        /// add(order.slot, 1)
        uint256 endPrice;
        /// add(order.slot, 2)
        uint256 startTime;
        /// add(order.slot, 3)
        uint256 endTime;
        /// add(order.slot, 4)
        uint256 lastBidPrice;
        /// add(order.slot, 5)
        address lastBidder;
        /// add(order.slot, 6)
        IERC721 token;
        /// add(order.slot, 7)
        address seller;
        /// add(order.slot, 8)),shr(20, not(0))
        uint8 orderType;
        /// shr(160,sload(add(order.slot, 8)))
        bool isSold;
    }
    /// shr(168,sload(add(order.slot, 8)))

    /// @param orderType Values legend:
    /// 0=Fixed Price; 1=Dutch Auction; 2=English Auction.
    /// @param endTime Equals to canceled order when value is set to 0.
    struct Order1155 {
        /// @dev Storage:
        uint256 tokenId;
        /// order.slot
        uint256 amount;
        /// add(order.slot, 1)
        uint256 startPrice;
        /// add(order.slot, 2)
        uint256 endPrice;
        /// add(order.slot, 3)
        uint256 startTime;
        /// add(order.slot, 4)
        uint256 endTime;
        /// add(order.slot, 5)
        uint256 lastBidPrice;
        /// add(order.slot, 6)
        address lastBidder;
        /// add(order.slot, 7)
        IERC1155 token;
        /// add(order.slot, 8)
        address seller;
        /// add(order.slot, 9)),shr(20, not(0))
        uint8 orderType;
        /// shr(160,sload(add(order.slot, 9)))
        bool isSold;
    }
    /// shr(168,sload(add(order.slot, 9)))
}
