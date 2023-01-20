// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.16;

import { FactoryVerifier } from "./lib/auth/FactoryVerifier.sol";
import { IERC721, IERC1155 } from "./Types.sol";

interface FactoryEventsAndErrors721 {
    ////////////////////////////////////////////////////////////////
    //                           EVENTS                           //
    ////////////////////////////////////////////////////////////////

    event MarketplaceUpdated(address indexed newMarket);
    event RouterUpdated(address indexed newRouter);
    event SignerUpdated(address indexed newSigner);

    event SplitterCreated(
        address indexed creator,
        uint256[] shares,
        address[] payees,
        address splitter,
        uint256 flag
    );

    event ERC721MinimalCreated(
        address indexed newSplitter,
        address indexed newCollection,
        string name,
        string symbol,
        uint256 royalties,
        uint256 maxSupply,
        uint256 mintPrice
    );
    event ERC721BasicCreated(
        address indexed newSplitter,
        address indexed newCollection,
        string name,
        string symbol,
        uint256 royalties,
        uint256 maxSupply,
        uint256 mintPrice
    );
    event ERC721WhitelistCreated(
        address indexed newSplitter,
        address indexed newCollection,
        string name,
        string symbol,
        uint256 royalties,
        uint256 maxSupply,
        uint256 mintPrice
    );
    event ERC721LazyCreated(
        address indexed newSplitter,
        address indexed newCollection,
        string name,
        string symbol,
        uint256 royalties,
        uint256 maxSupply,
        uint256 mintPrice
    );
    event PaymentTokenUpdated(
        address indexed newPaymentToken
    );

    ////////////////////////////////////////////////////////////////
    //                           ERRORS                           //
    ////////////////////////////////////////////////////////////////

    /// @dev 0x00adecf0
    error SplitterFail();
    /// @dev 0xe0e54ced
    error InvalidRoyalty();
}

interface FactoryEventsAndErrors1155 {
    ////////////////////////////////////////////////////////////////
    //                           EVENTS                           //
    ////////////////////////////////////////////////////////////////

    event MarketplaceUpdated(address indexed newMarket);
    event RouterUpdated(address indexed newRouter);
    event SignerUpdated(address indexed newSigner);

    event SplitterCreated(
        address indexed creator,
        uint256[] shares,
        address[] payees,
        address splitter,
        uint256 flag
    );

    event ERC1155MinimalCreated(
        address indexed newSplitter,
        address indexed newCollection,
        string name,
        string symbol,
        uint256 royalties,
        uint256 maxSupply,
        uint256 mintPrice
    );
    event ERC1155BasicCreated(
        address indexed newSplitter,
        address indexed newCollection,
        string name,
        string symbol,
        uint256 royalties,
        uint256 maxSupply,
        uint256 mintPrice
    );
    event ERC1155WhitelistCreated(
        address indexed newSplitter,
        address indexed newCollection,
        string name,
        string symbol,
        uint256 royalties,
        uint256 maxSupply,
        uint256 mintPrice
    );
    event ERC1155LazyCreated(
        address indexed newSplitter,
        address indexed newCollection,
        string name,
        string symbol,
        uint256 royalties,
        uint256 maxSupply,
        uint256 mintPrice
    );
    event PaymentTokenUpdated(
        address indexed newPaymentToken
    );

    ////////////////////////////////////////////////////////////////
    //                           ERRORS                           //
    ////////////////////////////////////////////////////////////////

    /// @dev 0x00adecf0
    error SplitterFail();
    /// @dev 0xe0e54ced
    error InvalidRoyalty();
}

interface MarketplaceEventsAndErrors721 {
    ////////////////////////////////////////////////////////////////
    //                           EVENTS                           //
    ////////////////////////////////////////////////////////////////

    event FactoryUpdated(FactoryVerifier indexed newFactory);
    event RecipientUpdated(address indexed newRecipient);
    event PaymentTokenUpdated(
        address indexed newPaymentToken
    );

    event AuctionSettingsUpdated(
        uint256 indexed newMinDuration,
        uint256 indexed newIncrement,
        uint256 newMinBidValue,
        uint256 indexed newMaxDuration
    );

    event MakeOrder(
        IERC721 indexed token,
        uint256 id,
        bytes32 indexed hash,
        address seller
    );
    event CancelOrder(
        IERC721 indexed token,
        uint256 id,
        bytes32 indexed hash,
        address seller
    );
    event Bid(
        IERC721 indexed token,
        uint256 id,
        bytes32 indexed hash,
        address bidder,
        uint256 bidPrice
    );
    event Claim(
        IERC721 indexed token,
        uint256 id,
        bytes32 indexed hash,
        address seller,
        address taker,
        uint256 price
    );

    event FeesUpdated(uint256 feeVal2, uint256 feeVal3);

    ////////////////////////////////////////////////////////////////
    //                           ERRORS                           //
    ////////////////////////////////////////////////////////////////

    /// @dev 0xf7760f25
    error WrongPrice();
    /// @dev 0x90b8ec18
    error TransferFailed();
    /// @dev 0x0863b103
    error InvalidBidder();
    /// @dev 0xdf9428da
    error CanceledOrder();
    /// @dev 0x70f8f33a
    error ExceedsMaxEP();
    /// @dev 0x4ca88867
    error AccessDenied();
    /// @dev 0x921dbfec
    error NeedMoreTime();
    /// @dev 0x07ae5744
    error NotBuyable();
    /// @dev 0x3e0827ab
    error BidExists();
    /// @dev 0xf88b07a3
    error SoldToken();
    /// @dev 0x2af0c7f8
    error Timeout();
    /// @dev 0xffc96cb0
    error EAOnly();
}

interface MarketplaceEventsAndErrors1155 {
    ////////////////////////////////////////////////////////////////
    //                           EVENTS                           //
    ////////////////////////////////////////////////////////////////

    event FactoryUpdated(FactoryVerifier indexed newFactory);
    event RecipientUpdated(address indexed newRecipient);
    event PaymentTokenUpdated(
        address indexed newPaymentToken
    );

    event AuctionSettingsUpdated(
        uint256 indexed newMinDuration,
        uint256 indexed newIncrement,
        uint256 newMinBidValue,
        uint256 indexed newMaxDuration
    );

    event MakeOrder(
        IERC1155 indexed token,
        uint256 id,
        uint256 amount,
        bytes32 indexed hash,
        address seller
    );
    event CancelOrder(
        IERC1155 indexed token,
        uint256 id,
        uint256 amount,
        bytes32 indexed hash,
        address seller
    );
    event Bid(
        IERC1155 indexed token,
        uint256 id,
        uint256 amount,
        bytes32 indexed hash,
        address bidder,
        uint256 bidPrice
    );
    event Claim(
        IERC1155 indexed token,
        uint256 id,
        uint256 amount,
        bytes32 indexed hash,
        address seller,
        address taker,
        uint256 price
    );

    event FeesUpdated(uint256 feeVal2, uint256 feeVal3);

    ////////////////////////////////////////////////////////////////
    //                           ERRORS                           //
    ////////////////////////////////////////////////////////////////

    /// @dev 0xf7760f25
    error WrongPrice();
    /// @dev 0x90b8ec18
    error TransferFailed();
    /// @dev 0x0863b103
    error InvalidBidder();
    /// @dev 0xdf9428da
    error CanceledOrder();
    /// @dev 0x70f8f33a
    error ExceedsMaxEP();
    /// @dev 0x4ca88867
    error AccessDenied();
    /// @dev 0x921dbfec
    error NeedMoreTime();
    /// @dev 0x07ae5744
    error NotBuyable();
    /// @dev 0x3e0827ab
    error BidExists();
    /// @dev 0xf88b07a3
    error SoldToken();
    /// @dev 0x2af0c7f8
    error Timeout();
    /// @dev 0xffc96cb0
    error EAOnly();
}

interface RouterEvents {
    ////////////////////////////////////////////////////////////////
    //                           EVENTS                           //
    ////////////////////////////////////////////////////////////////

    event TokenFundsWithdrawn(
        bytes32 indexed _id,
        uint8 indexed _type,
        address indexed _payee
    );

    event PublicMintState(
        bytes32 indexed _id,
        uint8 indexed _type,
        bool indexed _state
    );

    event WhitelistMintState(
        bytes32 indexed _id,
        uint8 indexed _type,
        bool indexed _state
    );

    event FreeClaimState(
        bytes32 indexed _id,
        uint8 indexed _type,
        bool indexed _state
    );

    event BaseURI(
        bytes32 indexed _id,
        string indexed _baseURI
    );

    event FeesUpdated(uint256 burnFees, uint256 mintFees);

    event PaymentTokenUpdated(
        address indexed newPaymentToken
    );

    event RecipientUpdated(address indexed newRecipient);

    /// @dev 0xf7760f25
    error WrongPrice();
}
