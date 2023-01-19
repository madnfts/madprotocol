// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.16;

interface ERC721MinimalEventsAndErrors {
    ////////////////////////////////////////////////////////////////
    //                           EVENTS                           //
    ////////////////////////////////////////////////////////////////

    event RoyaltyRecipientSet(address indexed newRecipient);
    event RoyaltyFeeSet(uint256 indexed newRoyaltyFee);
    event PublicMintStateSet(bool indexed newPublicMintState);

    ////////////////////////////////////////////////////////////////
    //                           ERRORS                           //
    ////////////////////////////////////////////////////////////////

    /// @dev 0xddefae28
    error AlreadyMinted();
    /// @dev 0x50eb1142
    error PublicMintOff();
    /// @dev 0xf7760f25
    error WrongPrice();
    /// @dev 0xdfa1a408
    error InvalidId();
    /// @dev 0x4d5e5fb3
    error NotMinted();
}

interface ERC721BasicEventsAndErrors {
    ////////////////////////////////////////////////////////////////
    //                           EVENTS                           //
    ////////////////////////////////////////////////////////////////

    event BaseURISet(string indexed newBaseURI);
    event BaseURILocked(string indexed baseURI);
    event RoyaltyRecipientSet(address indexed newRecipient);
    event RoyaltyFeeSet(uint256 indexed newRoyaltyFee);
    event PublicMintStateSet(bool indexed newPublicState);

    ////////////////////////////////////////////////////////////////
    //                           ERRORS                           //
    ////////////////////////////////////////////////////////////////

    /// @dev 0x2d0a3f8e
    error PublicMintClosed();
    /// @dev 0xd05cb609
    error MaxSupplyReached();
    /// @dev 0xbad086ea
    error NotMintedYet();
    /// @dev 0xf7760f25
    error WrongPrice();
    /// @dev 0xdfb035c9
    error LoopOverflow();
    /// @dev ?
    error UriLocked();
}

interface ERC721WhitelistEventsAndErrors {
    ////////////////////////////////////////////////////////////////
    //                           EVENTS                           //
    ////////////////////////////////////////////////////////////////

    event BaseURISet(string indexed newBaseURI);
    event BaseURILocked(string indexed baseURI);
    event RoyaltyRecipientSet(address indexed newRecipient);
    event RoyaltyFeeSet(uint256 indexed newRoyaltyFee);
    event PublicMintStateSet(bool indexed newPublicState);
    event FreeClaimStateSet(bool indexed freeClaimState);
    event WhitelistMintStateSet(
        bool indexed newWhitelistState
    );
    event WhitelistConfigSet(
        uint256 indexed newWhitelistPrice,
        uint256 indexed newMaxWhitelistSupply,
        bytes32 indexed newMerkleRoot
    );
    event FreeConfigSet(
        uint256 newFreeAmount,
        uint256 indexed newMaxFree,
        bytes32 indexed newMerkleRoot
    );

    ////////////////////////////////////////////////////////////////
    //                           ERRORS                           //
    ////////////////////////////////////////////////////////////////

    /// @dev 0x2d0a3f8e
    error PublicMintClosed();
    /// @dev 0x700a6c1f
    error WhitelistMintClosed();
    /// @dev 0xf44170cb
    error FreeClaimClosed();
    /// @dev 0xfc3fc71f
    error MaxMintReached();
    /// @dev 0xf90c1bdb
    error MaxFreeReached();
    /// @dev 0xa554e6e1
    error MaxWhitelistReached();
    /// @dev 0x646cf558
    error AlreadyClaimed();
    /// @dev 0xf7760f25
    error WrongPrice();
    /// @dev 0xbad086ea
    error NotMintedYet();
    /// @dev 0x3b8474be
    error AddressDenied();
    /// @dev 0xdfb035c9
    error LoopOverflow();
    /// @dev ?
    error UriLocked();
}

interface ERC721LazyEventsAndErrors {
    ////////////////////////////////////////////////////////////////
    //                           EVENTS                           //
    ////////////////////////////////////////////////////////////////

    event SignerUpdated(address indexed newSigner);
    event BaseURISet(string indexed newBaseURI);
    event BaseURILocked(string indexed baseURI);
    event RoyaltyRecipientSet(address indexed newRecipient);
    event RoyaltyFeeSet(uint256 indexed newRoyaltyFee);

    ////////////////////////////////////////////////////////////////
    //                           ERRORS                           //
    ////////////////////////////////////////////////////////////////

    /// @dev 0x815e1d64
    error InvalidSigner();
    /// @dev 0xe647f413
    error UsedVoucher();
    /// @dev 0xf7760f25
    error WrongPrice();
    /// @dev 0xbad086ea
    error NotMintedYet();
    /// @dev ?
    error UriLocked();
}
