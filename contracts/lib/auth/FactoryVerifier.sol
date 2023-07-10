// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

/// @title Factory Verifier
/// @notice Core contract binding interface that connect both
/// `MADMarketplace` and `MADRouter` storage verifications made to `madFactory`.
interface FactoryVerifier {
    /// @dev 0x4ca88867
    error AccessDenied();

    /// @notice Authority validator for no-fee marketplace listing.
    /// @dev Function Sighash := 0x76de0f3d
    /// @dev Binds Marketplace's pull payment methods to Factory storage.
    /// @param _token Address of the traded token.
    /// @param _user Token Seller that must match collection creator for no-fee
    /// listing.
    /// @return stdout := 1 as boolean standard output.
    function creatorAuth(address _token, address _user)
        external
        view
        returns (bool stdout);

    /// @notice Authority validator for `MADRouter` creator settings and
    /// withdraw functions.
    /// @dev Function Sighash := 0xb64bd5eb
    /// @param _collectionId address collection ID value.
    /// @return creator address of the collection creator.
    /// @return check Boolean output to either approve or reject call's
    /// `tx.origin` function access.
    function creatorCheck(address _collectionId)
        external
        view
        returns (address creator, bool check);

    /// @dev Returns the collection type uint8 value in case token and user are
    /// authorized.
    /// @dev Function Sighash := 0xd93cb8fd
    function collectionTypeChecker(address _collectionId)
        external
        view
        returns (uint8 pointer);
}
