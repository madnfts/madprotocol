// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.22;

uint256 constant _BASE_URI_LOCKED =
    0x8f0a54da7ee5bbe880036935fcef1dc9f0568cbde68bcbd5e1eedd56df052ca0;

uint256 constant _PUBLIC_MINT_STATE_SET =
    0x2f3b349e2956d565a50532dcc875a49be7f558411642122cf5e50ca9b4bb14e6;

uint256 constant _BASE_URI_SET =
    0xf9c7803e94e0d3c02900d8a90893a6d5e90dd04d32a4cfe825520f82bf9f32f6;

uint256 constant _ROYALTY_FEE_SET =
    0xc36422dcc77a5c93a5c48743078f8130c9fcc2a0ff893904ee62a3565688117c;

uint256 constant _ROYALTY_RECIPIENT_SET =
    0x2a5a1009e36beb67c3a1ada61dd1343d7e9ec62c70965492fbaa06234f8316b1;

interface ImplBaseEventsAndErrors {
    ////////////////////////////////////////////////////////////////
    //                           EVENTS                           //
    ////////////////////////////////////////////////////////////////

    /// @dev 0xf9c7803e94e0d3c02900d8a90893a6d5e90dd04d32a4cfe825520f82bf9f32f6
    event BaseURISet(string indexed newBaseURI);

    /// @dev 0x8f0a54da7ee5bbe880036935fcef1dc9f0568cbde68bcbd5e1eedd56df052ca0
    event BaseURILocked(string indexed baseURI); /* string indexed baseURI */

    /// @dev 0x2a5a1009e36beb67c3a1ada61dd1343d7e9ec62c70965492fbaa06234f8316b1
    event RoyaltyRecipientSet(address indexed newRecipient);

    /// @dev 0xc36422dcc77a5c93a5c48743078f8130c9fcc2a0ff893904ee62a3565688117c
    event RoyaltyFeeSet(uint256 indexed newRoyaltyFee);

    /// @dev 0x2f3b349e2956d565a50532dcc875a49be7f558411642122cf5e50ca9b4bb14e6
    event PublicMintStateSet(bool indexed newPublicState);

    ////////////////////////////////////////////////////////////////
    //                           ERRORS                           //
    ////////////////////////////////////////////////////////////////

    /// @dev 0x2d0a3f8e
    error PublicMintClosed();
    /// @dev 0xd05cb609
    error MaxSupplyReached();
    /// @dev 0xd9fda788
    error MaxSupplyAlreadySet();
    /// @dev 0xbad086ea
    error NotMintedYet();
    /// @dev 0xf7760f25
    error WrongPrice();
    /// @dev 0xdfb035c9
    error LoopOverflow();
    /// @dev 0x31d1c0a3
    error URILocked();
    /// @dev 0x7734d3ab
    error WrongArgsLength();
    /// @dev 0xce3a3d37
    error DecOverflow();
    /// @dev 0xf56dc29c
    error RouterIsEnabled();
    ///@dev 0xd5b3df7a
    error MaxSupplyBoundExceeded();
    /// @dev 0x4ca88867
    error ZeroMaxSupply();
    /// @dev 0xa3f7d515
    error ZeroPublicMintLimit();
    /// @dev 0x303b682f
    error MintLimitReached();
    /// @dev 0x1f2a2005
    error ZeroAmount();
    /// @dev 0xfe37c8dc
    error MaxLoopAmountExceeded();
}
