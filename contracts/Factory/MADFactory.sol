// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

import { MADFactoryBase } from "contracts/Factory/MADFactoryBase.sol";
import { Types } from "contracts/Shared/Types.sol";

contract MADFactory is MADFactoryBase {
    uint256 constant AMBASSADOR_SHARE_MIN = 101;
    uint256 constant AMBASSADOR_SHARE_MAX = 2001;
    uint256 constant PROJECT_SHARE_MIN = 101;
    uint256 constant PROJECT_SHARE_MAX = 10_001;

    address ADDRESS_ZERO = address(0);

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(address _paymentTokenAddress)
        MADFactoryBase(_paymentTokenAddress)
    { }

    /// @notice Core public token types deployment pusher.
    /// @dev Function Sighash := 0x73fd6808
    /// @dev Params passed in this function serve as common denominator
    /// for all token types.
    /// @dev Extra config options must be set directly by through token type
    /// specific functions in `MADRouter` contract.
    /// @dev Frontend must attent that salt values must have common pattern so
    /// to not replicate same output.
    /// @param params A `CreateCollectionParams` structure containing:
    ///   - tokenType: Token type as defined by MAD Front End - Example values
    /// legend: 0=None, 1=ERC721Basic; 2=ERC1155Basic, ... (see MAD Front End).;
    ///   - tokenSalt: Nonce/Entropy factor used by CREATE3 method
    ///     to generate collection deployment address. Must be always different
    /// to
    ///     avoid address collision.
    ///   - name: Name of the collection to be deployed.
    ///   - symbol: Symbol of the collection to be deployed.
    ///   - price: Public mint price of the collection to be deployed.
    ///   - maxSupply: Maximum supply of tokens to be minted of the
    ///     collection to be deployed
    ///     (Not used for ERC721Minimal token type, since it always equals to
    /// one).
    ///   - uri: The URL + CID to be added the tokenID and suffix (.json)
    ///     by the tokenURI function in the collection to be deployed.
    ///   - splitter: Previously deployed Splitter implementation to
    ///     validate and attach to collection.
    ///   - royalty: Ranges in between 0%-10%, in percentage basis points,
    ///     accepted (Min tick := 25).
    function createCollection(Types.CreateCollectionParams calldata params)
        public
    {
        emit CollectionCreated(
            params.splitter,
            _createCollection(params),
            params.name,
            params.symbol,
            params.royalty,
            params.maxSupply,
            params.price
            );
    }

    /// @notice Splitter deployment pusher.
    /// @dev Function Sighash := 0x9e5c4b70
    /// @param params A `CreateSplitterParams` structure containing:

    ///   - splitterSalt: Nonce/Entropy factor used by CREATE3 method
    ///         to generate payment splitter deployment address. Must be always
    ///         different to avoid address collision.

    ///   - ambassador: User may choose from one of the whitelisted addresses
    ///             to donate 1%-20% of secondary sales royalties (optional,
    /// will be disregarded if
    ///             left empty(value == address(0)).

    ///   - project: This is another optional address for which the splitter
    ///             contract can set a share.

    ///   - ambassadorShare: Percentage (1%-20%) of  sales & royalties tobe
    ///             assigned to an ambassador (optional, will be disregarded if
    /// left
    ///             empty(value == 0)).

    ///   - projectShare: Percentage (1%-100% of creator shares (after
    /// Ambassador))
    ///             This is the percentage of  sales & royalties to be donated
    /// to the project
    ///             address. This is disregarded if left empty.
    //

    // Project Support
    // Up to 100% of Creator Share after Ambassador share

    // Ambassador
    // Up to 20% of Creator Share before Project share
    function createSplitter(Types.CreateSplitterParams calldata params)
        public
        isThisOg
    {
        if (params.ambassador == ADDRESS_ZERO && params.project == ADDRESS_ZERO)
        {
            _splitterResolver(
                params,
                0 // _flag := no project/ no ambassador
            );
        } else if (
            params.ambassador != ADDRESS_ZERO && params.project == ADDRESS_ZERO
                && params.ambassadorShare > AMBASSADOR_SHARE_MIN
                && params.ambassadorShare < AMBASSADOR_SHARE_MAX
        ) {
            _splitterResolver(
                params,
                1 // _flag := ambassador only
            );
        } else if (
            params.project != ADDRESS_ZERO && params.ambassador == ADDRESS_ZERO
                && params.projectShare > PROJECT_SHARE_MIN
                && params.projectShare < PROJECT_SHARE_MAX
        ) {
            _splitterResolver(
                params,
                2 // _flag := project only
            );
        } else if (
            params.ambassador != ADDRESS_ZERO && params.project != ADDRESS_ZERO
                && params.ambassadorShare > AMBASSADOR_SHARE_MIN
                && params.ambassadorShare < AMBASSADOR_SHARE_MAX
                && params.projectShare > PROJECT_SHARE_MIN
                && params.projectShare < PROJECT_SHARE_MAX
        ) {
            _splitterResolver(
                params,
                3 // _flag := ambassador and project
            );
        } else {
            // revert SplitterFail();
            assembly {
                mstore(0x00, 0x00adecf0)
                revert(0x1c, 0x04)
            }
        }
    }
}
