// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.4;

/* 
DISCLAIMER: 
This contract hasn't been audited yet. Most likely contains unexpected bugs. 
Don't trust your funds to be held by this code before the final thoroughly tested and audited version release.
*/

import { MAD } from "./MAD.sol";

import { 
    FactoryEventsAndErrors721, 
    FactoryVerifier 
} from "./EventsAndErrors.sol";

import { 
    ERC721MinimalDeployer, 
    ERC721BasicDeployer,
    ERC721WhitelistDeployer,
    ERC721LazyDeployer
} from "./lib/deployers/ERC721Deployer.sol";

import { SplitterDeployer } from "./lib/deployers/SplitterDeployer.sol";

import { Pausable } from "./lib/security/Pausable.sol";
import { Owned } from "./lib/auth/Owned.sol";
import { ReentrancyGuard } from "./lib/security/ReentrancyGuard.sol";
import { DCPrevent } from "./lib/security/DCPrevent.sol";
import { Types, SplitterImpl } from "./Types.sol";

import { CREATE3, Bytes32AddressLib } from "./lib/utils/CREATE3.sol";

contract MADFactory721 is MAD,
    FactoryEventsAndErrors721,
    FactoryVerifier,
    ReentrancyGuard,
    DCPrevent(),
    Owned(msg.sender),
    Pausable
{
    using Types for Types.ERC721Type;
    using Types for Types.Collection721;
    using Types for Types.SplitterConfig;
    using Bytes32AddressLib for address;
    using Bytes32AddressLib for bytes32;

    /// @dev Function SigHash: 0x06fdde03
    function name()
        public
        pure
        override(MAD)
        returns (string memory)
    {
        assembly {
            mstore(0x20, 0x20)
            mstore(0x47, 0x07666163746F7279)
            return(0x20, 0x60)
        }
    }


    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    /// @dev `colIDs` are derived from adding 12 bytes of zeros to an collection's address.
    /// @dev colID => colInfo(salt/type/addr/time/splitter)
    mapping(bytes32 => Types.Collection721) public colInfo;

    /// @dev Maps an collection creator, of type address, to an array of `colIDs`.
    mapping(address => bytes32[]) public  userTokens;

    /// @dev Nested mapping that takes an collection creator as key of 
    /// an hashmap of splitter contracts to its respective deployment configs.
    mapping(address => mapping(address => Types.SplitterConfig))
        public splitterInfo;

    /// @dev Stores authorized ambassador addresses to be opted as shareholders of splitter contracts.  
    // mapping(address => bool) public ambWhitelist;

    /// @dev Instance of `MADRouter` being passed as parameter of collection's constructor.
    address public router;

    /// @dev Instance of `MADMarketplace` being passed as parameter of `creatorAuth`.
    address public market;

    /// @dev Self-reference pointer for assembly internal calls.
    // address private _this;

    /// @dev The signer address used for lazy minting voucher validation.
    address private signer;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor
    (
        address _marketplace, 
        address _router, 
        address _signer
    )
    {
        setMarket(_marketplace);
        setRouter(_router);
        setSigner(_signer);
    }

    ////////////////////////////////////////////////////////////////
    //                           CORE FX                          //
    ////////////////////////////////////////////////////////////////

    /// @notice Splitter deployment pusher.
    /// @dev Function Sighash := 0x9e5c4b70
    /// @param _splitterSalt Nonce/Entropy factor used by CREATE3 method. Must be always different to avoid address collision.
    /// to generate payment splitter deployment address.
    /// @param _ambassador User may choose from one of the whitelisted addresses to donate
    /// 1%-20% of secondary sales royalties (optional, will be disregarded if left empty(value == address(0)).
    /// @param _ambShare Percentage (1%-20%) of secondary sales royalties to be donated to an ambassador
    /// (optional, will be disregarded if left empty(value == 0)).
    function splitterCheck(
        string memory _splitterSalt,
        address _ambassador,
        uint256 _ambShare
    ) external nonReentrant isThisOg whenNotPaused {
        bytes32 splitterSalt = keccak256(
            bytes(_splitterSalt)
        );
        if (_ambassador == address(0)) {
            address[] memory _payees = _payeesBuffer(address(0), owner);
            uint256[] memory _shares = _sharesBuffer(0);

            address _splitter = SplitterDeployer._SplitterDeploy(
                _splitterSalt,
                _payees,
                _shares
            );

            splitterInfo[tx.origin][_splitter] = Types
                .SplitterConfig({
                    splitter: _splitter,
                    splitterSalt: splitterSalt,
                    ambassador: address(0),
                    ambShare: 0,
                    valid: true
                });

            emit SplitterCreated(
                tx.origin,
                _shares,
                _payees,
                _splitter
            );

        } else if (
            _ambShare != 0 && 
            _ambShare < 21 &&
            _ambassador != address(0)
            // ambWhitelist[_ambassador] == true
        ) {
            address[] memory _payees = _payeesBuffer(_ambassador, owner);
            uint256[] memory _shares = _sharesBuffer(_ambShare); 

            address _splitter = SplitterDeployer._SplitterDeploy(
                _splitterSalt,
                // [owner, _ambassador, tx.origin],
                _payees,
                // [10, _ambShare, 90 - _ambShare]
                _shares
            );

            splitterInfo[tx.origin][_splitter] = Types
                .SplitterConfig({
                    splitter: _splitter,
                    splitterSalt: splitterSalt,
                    ambassador: _ambassador,
                    ambShare: _ambShare,
                    valid: true
                });

            emit SplitterCreated(
                tx.origin,
                _shares,
                _payees,
                _splitter
            );

        } else { 
            // revert SplitterFail();
            assembly {
                mstore(0x00, 0x00adecf0)
                revert(0x1c, 0x04)
            
            }
        }
    }

    /// @notice Core public ERC721 token types deployment pusher.
    /// @dev Function Sighash := 0x73fd6808
    /// @dev Args passed as params in this function serve as common denominator for all token types.
    /// @dev Extra config options must be set directly by through token type specific functions in `MADRouter` contract.
    /// @dev Frontend must attent that salt values must have common pattern so to not replicate same output.
    /// @param _tokenType Values legend:
    /// 0=Minimal; 1=Basic; 2=Whitelist; 3=Lazy.
    /// @param _tokenSalt Nonce/Entropy factor used by CREATE3 method
    /// to generate collection deployment address. Must be always different to avoid address collision.
    /// @param _name Name of the collection to be deployed.
    /// @param _symbol Symbol of the collection to be deployed.
    /// @param _price Public mint price of the collection to be deployed.
    /// @param _maxSupply Maximum supply of tokens to be minted of the collection to be deployed
    /// (Not used for ERC721Minimal token type, since it always equals to one).
    /// @param _baseURI The URL + CID to be added the tokenID and suffix (.json) by the tokenURI function
    /// in the collection to be deployed (baseURI used as tokenURI itself for the ERC721Minimal token type).
    /// @param _splitter Previously deployed Splitter implementation so to validate and attach to collection.
    /// @param _royalty Ranges in between 0%-10%, in percentage basis points, accepted (Min tick := 25).
    function createCollection(
        uint8 _tokenType,
        string memory _tokenSalt,
        string memory _name,
        string memory _symbol,
        uint256 _price,
        uint256 _maxSupply,
        string memory _baseURI,
        address _splitter,
        uint256 _royalty
    )
        external
        nonReentrant
        isThisOg
        whenNotPaused
    {
        _limiter(_tokenType, _splitter);
        _royaltyLocker(_royalty);

        if (_tokenType < 1) {
        (bytes32 tokenSalt, address deployed) = 
            ERC721MinimalDeployer._721MinimalDeploy(
                _tokenSalt,
                _name,
                _symbol,
                _baseURI,
                _price,
                _splitter,
                router,
                _royalty
            );

        bytes32 colId = deployed.fillLast12Bytes();
        userTokens[tx.origin].push(colId);

        colInfo[colId] = Types.Collection721(
            tx.origin,
            Types.ERC721Type.ERC721Minimal,
            tokenSalt,
            block.number,
            _splitter
        );

        emit ERC721MinimalCreated(
            _splitter,
            deployed,
            tx.origin
        );
        }
        if (_tokenType == 1) {
            (bytes32 tokenSalt, address deployed) = 
            ERC721BasicDeployer._721BasicDeploy(
                _tokenSalt,
                _name,
                _symbol,
                _baseURI,
                _price,
                _maxSupply,
                _splitter,
                router,
                _royalty
            );

        bytes32 colId = deployed.fillLast12Bytes();
        userTokens[tx.origin].push(colId);

        colInfo[colId] = Types.Collection721(
            tx.origin,
            Types.ERC721Type.ERC721Basic,
            tokenSalt,
            block.number,
            _splitter
        );

        emit ERC721BasicCreated(
            _splitter,
            deployed,
            tx.origin
        );
        }
        if (_tokenType == 2) {
            (bytes32 tokenSalt, address deployed) = 
            ERC721WhitelistDeployer._721WhitelistDeploy(
                _tokenSalt,
                _name,
                _symbol,
                _baseURI,
                _price,
                _maxSupply,
                _splitter,
                router,
                _royalty
            );

        bytes32 colId = deployed.fillLast12Bytes();
        userTokens[tx.origin].push(colId);

        colInfo[colId] = Types.Collection721(
            tx.origin,
            Types.ERC721Type.ERC721Whitelist,
            tokenSalt,
            block.number,
            _splitter
        );

        emit ERC721WhitelistCreated(
            _splitter,
            deployed,
            tx.origin
        );
        }
        if (_tokenType > 2) {
            (bytes32 tokenSalt, address deployed) = 
            ERC721LazyDeployer._721LazyDeploy(
                    _tokenSalt,
                    _name,
                    _symbol,
                    _baseURI,
                    _splitter,
                    router,
                    signer,
                    _royalty
            );

        bytes32 colId = deployed.fillLast12Bytes();
        userTokens[tx.origin].push(colId);

        colInfo[colId] = Types.Collection721(
            tx.origin,
            Types.ERC721Type.ERC721Lazy,
            tokenSalt,
            block.number,
            _splitter
        );

        emit ERC721LazyCreated(
            _splitter,
            deployed,
            tx.origin
        );
        }
    }

    ////////////////////////////////////////////////////////////////
    //                         OWNER FX                           //
    ////////////////////////////////////////////////////////////////

        /// @dev Function Signature := 0x13af4035
    function setOwner(address newOwner)
        public
        override
        onlyOwner
    {
        // owner = newOwner;
        assembly {
            sstore(owner.slot, newOwner)
        }

        emit OwnerUpdated(msg.sender, newOwner);
    }
    
    /// @dev `MADMarketplace` instance setter.
    /// @dev Function Sighash := 
    function setMarket(address _market) public onlyOwner {
        assembly {
            sstore(market.slot, _market)
        }

        emit MarketplaceUpdated(_market);
    }

    /// @dev `MADRouter` instance setter.
    /// @dev Function Sighash := 0xc0d78655
    function setRouter(address _router) public onlyOwner {
        // router = _router;
        assembly {
            sstore(router.slot, _router)
        }

        emit RouterUpdated(_router);
    }

    /// @dev Setter for EIP712 signer/validator instance.
    /// @dev Function Sighash := 0x6c19e783
    function setSigner(address _signer) public onlyOwner {
        // signer = _signer;
        assembly {
            sstore(signer.slot, _signer)
        }

        emit SignerUpdated(_signer);
    }

    // /// @dev Add address to ambassador whitelist.
    // /// @dev Function Sighash := 0x295c25d5
    // function addAmbassador(address _whitelistedAmb)
    //     public
    //     onlyOwner
    // {
    //     // ambWhitelist[_whitelistedAmb] = true;
    //     assembly {
    //         mstore(0x00, _whitelistedAmb)
    //         mstore(0x20, ambWhitelist.slot)
    //         let ambSlot := keccak256(0x00, 0x40)
    //         sstore(ambSlot, 1)
    //     }

    //     emit AmbassadorAdded(_whitelistedAmb);
    // }

    // /// @dev Delete address from ambassador whitelist.
    // /// @dev Function Sighash := 0xf2d0e148
    // function delAmbassador(address _removedAmb)
    //     public
    //     onlyOwner
    // {
    //     // delete ambWhitelist[_removedAmb];
    //     assembly {
    //         mstore(0x00, _removedAmb)
    //         mstore(0x20, ambWhitelist.slot)
    //         let ambSlot := keccak256(0x00, 0x40)
    //         sstore(ambSlot, 0)
    //     }

    //     emit AmbassadorDeleted(_removedAmb);
    // }

    /// @notice Paused state initializer for security risk mitigation pratice.
    /// @dev Function Sighash := 0x8456cb59
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpaused state initializer for security risk mitigation pratice.
    /// @dev Function Sighash := 0x3f4ba83a
    function unpause() external onlyOwner {
        _unpause();
    }

    ////////////////////////////////////////////////////////////////
    //                           HELPERS                          //
    ////////////////////////////////////////////////////////////////

    /// @notice Everything in storage can be fetch through the 
    /// getters natively provided by all public mappings.
    /// @dev This public getter serve as a hook to ease frontend 
    /// fetching whilst estimating user's colID indexes.
    /// @dev Function Sighash := 0x8691fe46
    function getIDsLength(address _user) 
        external 
        view 
        returns (uint256) 
    {
        return userTokens[_user].length;
    }

    /// @inheritdoc FactoryVerifier
    function getColID(address _colAddress) external pure override(FactoryVerifier) returns (bytes32 colID) {
        colID = _colAddress.fillLast12Bytes();
        
    }

    /// @inheritdoc FactoryVerifier
    function typeChecker(bytes32 _colID) external override(FactoryVerifier) view returns(uint8 pointer) {
        _isRouter();
        Types.Collection721 storage col = colInfo[_colID];
        
        assembly {
            let x := sload(col.slot)
            pointer := shr(160, x)
        }
    }

    /// @dev Builds payees dynamic sized array buffer for `splitterCheck` cases.
    function _payeesBuffer(address amb, address castedAddr) 
    internal 
    view 
    returns (address[] memory memOffset) 
    {
        if (amb == address(0)) {
            assembly {
                memOffset := mload(0x40)
                mstore(add(memOffset, 0x00), 2)
                mstore(add(memOffset, 0x20), castedAddr)
                mstore(add(memOffset, 0x40), origin())
                mstore(0x40, add(memOffset, 0x60))
            }
        }
        else {
            assembly {
                memOffset := mload(0x40)
                mstore(add(memOffset, 0x00), 3)
                mstore(add(memOffset, 0x20), castedAddr)
                mstore(add(memOffset, 0x40), amb)
                mstore(add(memOffset, 0x60), origin())
                mstore(0x40, add(memOffset, 0x80))
            }
        }
    }

    /// @dev Builds shares dynamic sized array buffer for `splitterCheck` cases.
    function _sharesBuffer(uint256 _ambShare) 
    internal 
    pure 
    returns (uint256[] memory memOffset) 
    {
        if (_ambShare == 0) {
            assembly {
                memOffset := mload(0x40)
                mstore(add(memOffset, 0x00), 2) 
                mstore(add(memOffset, 0x20), 10) 
                mstore(add(memOffset, 0x40), 90) 
                mstore(0x40, add(memOffset, 0x60))
            }
        }
        else {
            assembly {
                memOffset := mload(0x40)
                mstore(add(memOffset, 0x00), 3)
                mstore(add(memOffset, 0x20), 10) 
                mstore(add(memOffset, 0x40), _ambShare) 
                mstore(add(memOffset, 0x60), sub(90,_ambShare)) 
                mstore(0x40, add(memOffset, 0x80))
            }
        }
    }

    /// @inheritdoc FactoryVerifier
    // prettier-ignore
    function creatorAuth(address _token, address _user) 
        external 
        override(FactoryVerifier) 
        view 
        returns(bool stdout) 
    {
        _isMarket();
        if (!_userRender(_user)) { assembly { stdout := 0 } }

        bytes32 buffer = 
            _token.fillLast12Bytes();
        bytes32[] memory digest = 
            new bytes32[](userTokens[_user].length);
        uint256 i;    
        uint256 len = digest.length;
        mapping(address => bytes32[]) storage usrTkns =
            userTokens;
        for (i; i < len;) {
            if(buffer == usrTkns[_user][i]) {
                stdout = true;
            } unchecked { ++i; } 
        }
    }

    /// @inheritdoc FactoryVerifier
    function creatorCheck(bytes32 _colID) 
    public
    override(FactoryVerifier)
    view
    returns(address creator, bool check) 
    {
        _isRouter();
        Types.Collection721 storage col = colInfo[_colID];
        
        assembly {
            let x := sload(col.slot)
            // bitmask to get the first 20 bytes of storage slot
            creator := and(x, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF)

            if eq(creator, origin()) {
                check := true
            }
        // if(!check) revert AccessDenied();
            if iszero(check) {
                mstore(0x00, 0x4ca88867)
                revert(0x1c, 0x04)
            }
        }
    }

    /// @dev Stablishes sealed/safe callpath for `MADRouter` contract.
    /// @dev Function Sighash := 0xb4d30bec
    function _isRouter() private view {
        // if (msg.sender != router) revert AccessDenied();
        assembly {
            // let stdin := sload(router.slot)
            // if eq(origin(), sload(router.slot)) {
            if iszero(eq(caller(), sload(router.slot))) {
                mstore(0x00, 0x4ca88867FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF)
                revert(0, 4) // (offset, length)
            }
        } 
    }

    /// @dev Stablishes sealed/safe callpath for `MADMarketplace` contract.
    /// @dev Function Sighash := 
    function _isMarket() private view {
        assembly {
            if iszero(eq(caller(), sload(market.slot))) {
                mstore(0x00, 0x4ca88867FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF)
                revert(0, 4) // (offset, length)
            }
        } 
    }

    function _limiter(
        uint8 _tokenType,
        address _splitter
    ) private view {
        bool val = splitterInfo[tx.origin][_splitter].valid;
        // require(_tokenType < 4, "INVALID_TYPE");
        // if (!splitterInfo[tx.origin][_splitter].valid)
        //     revert AccessDenied();
        assembly {
            if or(gt(_tokenType,3),iszero(val)) {
                mstore(0x00,0x4ca8886700000000000000000000000000000000000000000000000000000000)
                revert(0,4)
            }
        }
    }

    function _royaltyLocker(uint256 _share) 
    private 
    pure
    {
        assembly {
            if or(
                gt(_share,0x3E8),
                iszero(iszero(mod(_share,0x19)))) {
                    mstore(0x00, 0xe0e54ced)
                    revert(0x1c, 0x04)
                }
        }
    }

    /// @notice Private view helper that checks an user against `userTokens` storage slot.
    /// @dev Function Sighash := 0xbe749257
    /// @dev `creatorAuth` method extension.
    /// @return _stdout := 1 as boolean standard output.
    function _userRender(address _user) private view returns(bool _stdout){
        assembly {
            let freeMemoryPointer := mload(0x40)
            // sload(userTokens.slot)
            mstore(add(freeMemoryPointer, 32), userTokens.slot)
            mstore(add(freeMemoryPointer, 64), _user) 
            let hash := keccak256(freeMemoryPointer, 64)
            if iszero(sload(hash)) {
                _stdout := false
            }
        }
    }

    function getDeployedAddr(string memory _salt)
        public
        view
        returns (
            address
        )
    {
        bytes32 salt = keccak256(bytes(_salt));
        return CREATE3.getDeployed(salt);
    }
}
