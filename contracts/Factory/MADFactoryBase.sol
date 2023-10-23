// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

import { MADBase } from "contracts/Shared/MADBase.sol";
import {
    FactoryEventsAndErrorsBase,
    FactoryVerifier
} from "contracts/Shared/EventsAndErrors.sol";
import { DCPrevent } from "contracts/lib/security/DCPrevent.sol";
import { Types } from "contracts/Shared/Types.sol";
import { SplitterImpl } from "contracts/lib/splitter/SplitterImpl.sol";
import { CREATE3, Bytes32AddressLib } from "contracts/lib/utils/CREATE3.sol";
import { SplitterBufferLib as BufferLib } from
    "contracts/lib/utils/SplitterBufferLib.sol";

import { FeeHandlerFactory } from "contracts/Factory/FeeHandler.sol";

// prettier-ignore
abstract contract MADFactoryBase is
    MADBase,
    FactoryEventsAndErrorsBase,
    FactoryVerifier,
    DCPrevent,
    FeeHandlerFactory
{
    using Types for Types.CollectionArgs;
    using Types for Types.SplitterConfig;
    using Types for Types.Collection;
    using Bytes32AddressLib for address;
    using Bytes32AddressLib for bytes32;

    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    /// @dev Function SigHash: 0x06fdde03
    function name() public pure returns (string memory) {
        assembly {
            mstore(0x20, 0x20)
            mstore(0x47, 0x07666163746F7279)
            return(0x20, 0x60)
        }
    }

    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    /// @dev `collectionIds` are derived from a collection's address.
    mapping(address collectionId => Types.Collection) public collectionInfo;

    /// @dev Nested mapping that takes an collection creator as key of
    /// a hashmap of splitter contracts to its respective deployment configs.
    mapping(address => mapping(address => Types.SplitterConfig)) public
        splitterInfo;

    /// @dev Maps collection's index to its respective bytecode.
    mapping(uint256 collectionIndex => bytes collectionBytecode) public
        collectionTypes;

    /// @dev Maps a collection creator, of type address, to an array of
    /// `collectionIds`.
    mapping(address collectionOwner => address[] deployedCollections) public
        userTokens;

    /// @dev Instance of `MADRouter` being passed as parameter of collection's
    /// constructor.
    address public router;

    address public ADDRESS_ZERO = address(0);


    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(address _paymentTokenAddress) {
        _setPaymentToken(_paymentTokenAddress);
    }

    function _createCollection(Types.CreateCollectionParams calldata params)
        internal
        isThisOg
        returns (address)
    {
        _isZeroAddr(router);
        _limiter(params.tokenType, params.splitter);
        _royaltyLocker(params.royalty);
        if (address(erc20) != ADDRESS_ZERO){
            _handleFees(feeCreateCollection);
            }
        else {
            _handleFees(feeCreateCollectionErc20[address(erc20)], address(erc20));
        }

        if (params.maxSupply == 0) {
            revert ZeroMaxSupply();
        }
        address deployedCollection = _collectionDeploy(
            params.tokenType,
            params.tokenSalt,
            Types.CollectionArgs(
                params.name,
                params.symbol,
                params.uri,
                params.price,
                params.maxSupply,
                params.splitter,
                params.royalty,
                router,
                address(erc20),
                msg.sender
            )
        );

        userTokens[msg.sender].push(deployedCollection);

        collectionInfo[deployedCollection] = Types.Collection(
            msg.sender,
            params.tokenType,
            params.tokenSalt,
            block.number,
            params.splitter
        );
        return deployedCollection;
    }

    ////////////////////////////////////////////////////////////////
    //                           HELPERS                          //
    ///////////////////////////////////////////////////////////////

    function _createSplitter(
        Types.CreateSplitterParams calldata params,
        uint256 _flag
    ) internal {
        if (address(erc20) != ADDRESS_ZERO){
            _handleFees(feeCreateSplitter);
            }
        else {
            _handleFees(feeCreateSplitterErc20[address(erc20)], address(erc20));
        }

        uint256 projectShareParsed =
            ((10_000 - params.ambassadorShare) * params.projectShare) / 10_000;

        address[] memory _payees =
            BufferLib.payeesBuffer(params.ambassador, params.project);

        uint256[] memory _shares =
            BufferLib.sharesBuffer(params.ambassadorShare, projectShareParsed);

        address splitter =
            _splitterDeploy(params.splitterSalt, _payees, _shares);

        splitterInfo[msg.sender][splitter] = Types.SplitterConfig(
            splitter,
            params.splitterSalt,
            params.ambassador,
            params.project,
            params.ambassadorShare,
            projectShareParsed,
            true
        );

        emit SplitterCreated(msg.sender, _shares, _payees, splitter, _flag);
    }

    function _collectionDeploy(
        uint8 _tokenType,
        bytes32 _tokenSalt,
        Types.CollectionArgs memory _args
    ) internal returns (address deployed) {
        deployed = CREATE3.deploy(
            keccak256(abi.encode(msg.sender, _tokenSalt)),
            abi.encodePacked(
                // implementation
                collectionTypes[uint256(_tokenType)],
                abi.encode(_args)
            ),
            0
        );
    }

    function _splitterDeploy(
        bytes32 _salt,
        address[] memory _payees,
        uint256[] memory _shares
    ) internal returns (address deployed) {
        deployed = CREATE3.deploy(
            keccak256(abi.encode(msg.sender, _salt)),
            abi.encodePacked(
                type(SplitterImpl).creationCode, abi.encode(_payees, _shares)
            ),
            0
        );
    }

    /// @notice Everything in storage can be fetch through the
    /// getters natively provided by all public mappings.
    /// @dev This public getter serves as a hook to ease frontend
    /// fetching whilst estimating user's collectionId indexes.

    /// @dev Function Sighash := 0x8691fe46
    function getIDsLength(address _user) public view returns (uint256) {
        return userTokens[_user].length;
    }

    /// @inheritdoc FactoryVerifier
    function creatorAuth(address _token, address _user)
        external
        view
        override(FactoryVerifier)
        returns (bool stdout)
    {
        stdout = _userRender(_user);

        uint256 i;
        uint256 len = getIDsLength(_user);

        for (; i < len;) {
            if (_token == userTokens[_user][i]) {
                stdout = true;
                break;
            }
            unchecked {
                ++i;
            }
        }
    }

    /// @dev Reverts if provided share is greater
    /// than 1000 or does not fit the tick (i.e., 25).
    /// @dev Function Sighash := 0xe04dc3ca
    function _royaltyLocker(uint96 _share) internal pure {
        assembly {
            // (_share > 1000) || (_share % 25 != 0)
            if or(gt(_share, 0x3E8), iszero(iszero(mod(_share, 0x19)))) {
                mstore(0x00, 0xe0e54ced)
                revert(0x1c, 0x04)
            }
        }
    }

    /// @dev Function Sighash := 0x485a1cff
    function _limiter(uint8 _tokenType, address _splitter) internal view {
        bool val = splitterInfo[msg.sender][_splitter].valid;
        assembly {
            mstore(0, _tokenType)
            mstore(32, collectionTypes.slot)

            // collectionType not allowed or invalid splitter
            if or(iszero(sload(keccak256(0, 64))), iszero(val)) {
                mstore(0x00, 0x4ca88867) // AccessDenied()
                revert(0x1c, 0x04)
            }
        }
    }

    function _isZeroAddr(address _addr) private pure {
        assembly {
            if iszero(_addr) {
                // Revert ZeroAddress()
                mstore(0x00, 0xd92e233d)
                revert(0x1c, 0x04)
            }
        }
    }

    /// @notice Private view helper that checks an user against `userTokens`
    /// storage slot.
    /// @dev Function Sighash := 0xbe749257
    /// @dev `creatorAuth` method extension.
    /// @return _stdout := 1 as boolean standard output.
    function _userRender(address _user) private view returns (bool _stdout) {
        assembly {
            _stdout := true
            let pointer := mload(0x40)
            mstore(add(pointer, 32), userTokens.slot)
            mstore(add(pointer, 64), _user)
            let hash := keccak256(pointer, 64)
            if iszero(sload(hash)) { _stdout := false }
        }
    }

    /// @dev External getter for deployed splitters and collections.
    /// @dev Function Sighash := 0x499945ef
    function getDeployedAddress(bytes32 _salt, address _addr)
        public
        view
        returns (address)
    {
        bytes32 salt = keccak256(abi.encode(_addr, _salt));
        return CREATE3.getDeployed(salt);
    }

    ////////////////////////////////////////////////////////////////
    //                         OWNER FX                           //
    ////////////////////////////////////////////////////////////////

    /// @dev `MADRouter` instance setter.
    /// @dev Function Sighash := 0xc0d78655
    function setRouter(address _router) public onlyOwner {
        _isZeroAddr(_router);
        assembly {
            sstore(router.slot, _router)
        }

        emit RouterUpdated(_router);
    }

    /// @dev Setter for Collection types.
    /// @dev We allow a collectionType to be set as the zeroAddr,
    /// so its slot can be reset to default value.
    /// @dev Function Sighash := 0x7ebbf770
    function addCollectionType(uint256 index, bytes calldata impl)
        public
        onlyOwner
    {
        collectionTypes[index] = impl;

        emit CollectionTypeAdded(index);
    }

    ////////////////////////////////////////////////////////////////
    //                           HELPERS                          //
    ////////////////////////////////////////////////////////////////

    /// @inheritdoc FactoryVerifier
    /// @notice This function is used by `MADRouter` to check if a  collection
    /// creator is the same as the caller.
    /// @dev Function Sighash := 5033270c
    /// @param _collectionId address of the collection.
    /// @param _creator address of the collection creator.
    /// @return check Boolean output to either approve or reject call's
    function creatorCheck(address _collectionId, address _creator)
        external
        view
        override(FactoryVerifier)
        returns (bool check)
    {
        address creator = collectionInfo[_collectionId].creator;
        if (creator == _creator) {
            check = true;
        }
    }
}
