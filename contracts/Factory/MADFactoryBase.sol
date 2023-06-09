// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

import { MAD } from "contracts/MAD.sol";
import { MADBase, ERC20 } from "contracts/Shared/MADBase.sol";
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

// prettier-ignore
abstract contract MADFactoryBase is
    MAD,
    MADBase,
    FactoryEventsAndErrorsBase,
    FactoryVerifier,
    DCPrevent
{
    using Types for Types.ColArgs;
    using Types for Types.SplitterConfig;
    using Types for Types.Collection;
    using Bytes32AddressLib for address;
    using Bytes32AddressLib for bytes32;

    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    /// @dev `collectionIds` are derived from adding 12 bytes of zeros to an
    /// collection's address.
    /// @dev collectionId => collectionInfo(salt/type/addr/time/splitter)
    mapping(bytes32 => Types.Collection) public collectionInfo;

    /// @dev Function SigHash: 0x06fdde03
    function name() external pure override(MAD) returns (string memory) {
        assembly {
            mstore(0x20, 0x20)
            mstore(0x47, 0x07666163746F7279)
            return(0x20, 0x60)
        }
    }

    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    /// @dev Maps collection's index to its respective bytecode.
    mapping(uint256 => bytes) public collectionTypes;

    /// @dev Maps a collection creator, of type address, to an array of
    /// `collectionIds`.
    mapping(address => bytes32[]) public userTokens;

    /// @dev Nested mapping that takes an collection creator as key of
    /// an hashmap of splitter contracts to its respective deployment configs.
    mapping(address => mapping(address => Types.SplitterConfig)) public
        splitterInfo;

    /// @dev Instance of `MADRouter` being passed as parameter of collection's
    /// constructor.
    address public router;

    /// @dev Instance of `MADMarketplace` being passed as parameter of
    /// `creatorAuth`.
    address public market;

    /// @dev The signer address used for lazy minting voucher validation.
    address public signer;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(
        address _marketplace,
        address _signer,
        address _paymentTokenAddress
    ) {
        // F.1 BlockHat Audit
        // `setSigner` and `setMarket`
        // already handle the zeroAddress case.
        if (_paymentTokenAddress == address(0)) {
            revert ZeroAddress();
        }
        setMarket(_marketplace);
        setSigner(_signer);
        _setPaymentToken(_paymentTokenAddress);
    }

    /// @notice Core public ERC721 token types deployment pusher.
    /// @dev Function Sighash := 0x73fd6808
    /// @dev Args passed as params in this function serve as common denominator
    /// for all token types.
    /// @dev Extra config options must be set directly by through token type
    /// specific functions in
    /// `MADRouter` contract.
    /// @dev Frontend must attent that salt values must have common pattern so
    /// to not replicate same
    /// output.
    /// @param _tokenType Values legend:
    /// 0=None; 1=Basic;
    /// @param _tokenSalt Nonce/Entropy factor used by CREATE3 method
    /// to generate collection deployment address. Must be always different to
    /// avoid address
    /// collision.
    /// @param _name Name of the collection to be deployed.
    /// @param _symbol Symbol of the collection to be deployed.
    /// @param _price Public mint price of the collection to be deployed.
    /// @param _maxSupply Maximum supply of tokens to be minted of the
    /// collection to be deployed
    /// (Not used for ERC721Minimal token type, since it always equals to one).
    /// @param _baseURI The URL + CID to be added the tokenID and suffix (.json)
    /// by the tokenURI
    /// function
    /// in the collection to be deployed (
    /// @param _splitter Previously deployed Splitter implementation so to
    /// validate and attach to
    /// collection.
    /// @param _royalty Ranges in between 0%-10%, in percentage basis points,
    /// accepted (Min tick :=
    /// 25).
    function _createCollection(
        uint8 _tokenType,
        string memory _tokenSalt,
        string memory _name,
        string memory _symbol,
        uint256 _price,
        uint256 _maxSupply,
        string memory _baseURI,
        address _splitter,
        uint96 _royalty,
        bytes32[] memory _extra
    ) internal isThisOg returns (address) {
        _limiter(_tokenType, _splitter);
        _royaltyLocker(_royalty);

        Types.ColArgs memory args = Types.ColArgs(
            _name,
            _symbol,
            _baseURI,
            _price,
            _maxSupply,
            _splitter,
            _royalty,
            router,
            address(erc20)
        );

        if (_maxSupply == 0) {
            revert ZeroMaxSupply();
        }

        (bytes32 tokenSalt, address deployed) =
            _collectionDeploy(_tokenType, _tokenSalt, args, _extra);

        bytes32 collectionId = deployed.fillLast12Bytes();
        userTokens[msg.sender].push(collectionId);

        collectionInfo[collectionId] = Types.Collection(
            msg.sender, _tokenType, tokenSalt, block.number, _splitter
        );
        return deployed;
    }

    ////////////////////////////////////////////////////////////////
    //                           CORE FX                          //
    ////////////////////////////////////////////////////////////////

    /// @notice Splitter deployment pusher.
    /// @dev Function Sighash := 0x9e5c4b70
    /// @param _splitterSalt Nonce/Entropy factor used by CREATE3 method. Must
    /// be always different
    /// to avoid address
    /// collision.
    /// to generate payment splitter deployment address.
    /// @param _ambassador User may choose from one of the whitelisted addresses
    /// to donate
    /// 1%-20% of secondary sales royalties (optional, will be disregarded if
    /// left empty(value ==
    /// address(0)).
    /// @param _ambShare Percentage (1%-20%) of secondary sales royalties to be
    /// donated to an
    /// ambassador
    /// (optional, will be disregarded if left empty(value == 0)).
    function splitterCheck(
        string calldata _splitterSalt,
        address _ambassador,
        address _project,
        uint256 _ambShare,
        uint256 _projectShare
    ) public isThisOg {
        bytes32 splitterSalt =
            keccak256(abi.encode(msg.sender, bytes(_splitterSalt)));

        if (_ambassador == address(0) && _project == address(0)) {
            _splitterResolver(
                splitterSalt,
                address(0), // _ambassador
                address(0), // _project
                0, // _ambShare
                0, // _projectShare
                0 // _flag := no project/ambassador
            );
        } else if (
            _ambassador != address(0) && _project == address(0)
                && _ambShare != 0 && _ambShare < 21
        ) {
            _splitterResolver(
                splitterSalt,
                _ambassador, // _ambassador
                address(0), // _project
                _ambShare, // _ambShare
                0, // _projectShare
                1 // _flag := ambassador only
            );
        } else if (
            _project != address(0) && _ambassador == address(0)
                && _projectShare != 0 && _projectShare < 91
        ) {
            _splitterResolver(
                splitterSalt,
                address(0), // _ambassador
                _project, // _project
                0, // _ambShare
                _projectShare, // _projectShare
                2 // _flag := project only
            );
        } else if (
            _ambassador != address(0) && _project != address(0)
                && _ambShare != 0 && _ambShare < 21 && _projectShare != 0
                && _projectShare < 71
        ) {
            _splitterResolver(
                splitterSalt,
                _ambassador, // _ambassador
                _project, // _project
                _ambShare, // _ambShare
                _projectShare, // _projectShare
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

    ////////////////////////////////////////////////////////////////
    //                           HELPERS                          //
    ////////////////////////////////////////////////////////////////

    /// @notice Everything in storage can be fetch through the
    /// getters natively provided by all public mappings.
    /// @dev This public getter serve as a hook to ease frontend
    /// fetching whilst estimating user's collectionId indexes.

    /// @dev Function Sighash := 0x8691fe46
    function getIDsLength(address _user) external view returns (uint256) {
        return userTokens[_user].length;
    }

    /// @inheritdoc FactoryVerifier
    function getCollectionId(address _colAddress)
        external
        pure
        override(FactoryVerifier)
        returns (bytes32 collectionId)
    {
        collectionId = _colAddress.fillLast12Bytes();
    }

    function _splitterResolver(
        bytes32 _splitterSalt,
        address _ambassador,
        address _project,
        uint256 _ambShare,
        uint256 _projectShare,
        uint256 _flag
    ) internal {
        address[] memory _payees =
            BufferLib._payeesBuffer(_ambassador, _project);

        uint256[] memory _shares =
            BufferLib._sharesBuffer(_ambShare, _projectShare);

        address splitter = _splitterDeploy(_splitterSalt, _payees, _shares);

        splitterInfo[msg.sender][splitter] = Types.SplitterConfig(
            splitter,
            _splitterSalt,
            _ambassador,
            _project,
            _ambShare,
            _projectShare,
            true
        );

        emit SplitterCreated(msg.sender, _shares, _payees, splitter, _flag);
    }

    function _collectionDeploy(
        uint8 _tokenType,
        string memory _tokenSalt,
        Types.ColArgs memory _args,
        bytes32[] memory _extra
    ) internal returns (bytes32 tokenSalt, address deployed) {
        tokenSalt = keccak256(abi.encode(msg.sender, bytes(_tokenSalt)));

        deployed = CREATE3.deploy(
            tokenSalt,
            abi.encodePacked(
                // implementation
                collectionTypes[uint256(_tokenType)],
                abi.encode(_args, _extra)
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
            _salt,
            abi.encodePacked(
                type(SplitterImpl).creationCode, abi.encode(_payees, _shares)
            ),
            0
        );
    }

    /// @inheritdoc FactoryVerifier
    function creatorAuth(address _token, address _user)
        external
        view
        override(FactoryVerifier)
        returns (bool stdout)
    {
        _isMarket();
        stdout = _userRender(_user);

        uint256 i;
        bytes32 buffer = _token.fillLast12Bytes();
        bytes32[] memory digest = new bytes32[](userTokens[_user].length);
        uint256 len = digest.length;
        mapping(address => bytes32[]) storage usrTkns = userTokens;
        for (; i < len;) {
            if (buffer == usrTkns[_user][i]) {
                stdout = true;
            }
            unchecked {
                ++i;
            }
        }
    }

    /// @dev Stablishes sealed/safe callpath for `MADRouter` contract.
    /// @dev Function Sighash := 0xb4d30bec
    function _isRouter() internal view {
        // if (msg.sender != router) revert AccessDenied();
        assembly {
            if iszero(eq(caller(), sload(router.slot))) {
                mstore(0x00, 0x4ca88867)
                revert(0x1c, 0x04)
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
                mstore(0x00, 0x4ca88867)
                revert(0x1c, 0x04)
            }
        }
    }

    function _isZeroAddr(address _addr) private pure {
        assembly {
            if iszero(_addr) {
                // Revert InvalidAddress()
                mstore(0x00, 0xe6c4247b)
                revert(0x1c, 0x04)
            }
        }
    }

    /// @dev Stablishes sealed/safe callpath for `MADMarketplace` contract.
    /// @dev Function Sighash := 0x4d922dcc
    function _isMarket() private view {
        assembly {
            if iszero(eq(caller(), sload(market.slot))) {
                mstore(0x00, 0x4ca88867)
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
            let pointer := mload(0x40)
            mstore(add(pointer, 32), userTokens.slot)
            mstore(add(pointer, 64), _user)
            let hash := keccak256(pointer, 64)
            if iszero(sload(hash)) { _stdout := false }
        }
    }

    /// @dev External getter for deployed splitters and collections.
    /// @dev Function Sighash := 0x499945ef
    function getDeployedAddress(string memory _salt, address _addr)
        public
        view
        returns (address)
    {
        bytes32 salt = keccak256(abi.encode(_addr, bytes(_salt)));
        return CREATE3.getDeployed(salt);
    }

    ////////////////////////////////////////////////////////////////
    //                         OWNER FX                           //
    ////////////////////////////////////////////////////////////////

    /// @dev `MADMarketplace` instance setter.
    /// @dev Function Sighash := 0x6dcea85f
    function setMarket(address _market) public onlyOwner {
        _isZeroAddr(_market);
        assembly {
            sstore(market.slot, _market)
        }

        emit MarketplaceUpdated(_market);
    }

    /// @dev `MADRouter` instance setter.
    /// @dev Function Sighash := 0xc0d78655
    function setRouter(address _router) external onlyOwner {
        _isZeroAddr(_router);
        assembly {
            sstore(router.slot, _router)
        }

        emit RouterUpdated(_router);
    }

    /// @dev Setter for EIP712 signer/validator instance.
    /// @dev Function Sighash := 0x6c19e783
    function setSigner(address _signer) public onlyOwner {
        _isZeroAddr(_signer);
        assembly {
            sstore(signer.slot, _signer)
        }

        emit SignerUpdated(_signer);
    }

    /// @dev Setter for Collection types.
    /// @dev We allow a colectionType to be set as the zeroAddr,
    /// so its slot can be reset to default value.
    /// @dev Function Sighash := 0x7ebbf770
    function addColType(uint256 index, bytes calldata impl) public onlyOwner {
        collectionTypes[index] = impl;

        emit ColTypeUpdated(index);
    }

    ////////////////////////////////////////////////////////////////
    //                           HELPERS                          //
    ////////////////////////////////////////////////////////////////

    /// @notice Everything in storage can be fetch through the
    /// getters natively provided by all public mappings.
    /// @dev This public getter serve as a hook to ease frontend
    /// fetching whilst estimating user's collectionId indexes.
    /// @dev Function Sighash := 0x8691fe46

    /// @inheritdoc FactoryVerifier
    function typeChecker(bytes32 _collectionId)
        external
        view
        override(FactoryVerifier)
        returns (uint8 pointer)
    {
        _isRouter();
        Types.Collection storage collection = collectionInfo[_collectionId];

        assembly {
            let x := sload(collection.slot)
            pointer := shr(160, x)
        }
    }

    /// @inheritdoc FactoryVerifier
    function creatorCheck(bytes32 _collectionId)
        external
        view
        override(FactoryVerifier)
        returns (address creator, bool check)
    {
        _isRouter();
        Types.Collection storage collection = collectionInfo[_collectionId];

        assembly {
            let x := sload(collection.slot)
            // bitmask to get the first 20 bytes of storage slot
            creator := and(x, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF)

            if eq(creator, origin()) { check := true }
            // if(!check) revert AccessDenied();
            if iszero(check) {
                mstore(0x00, 0x4ca88867)
                revert(0x1c, 0x04)
            }
        }
    }
}
