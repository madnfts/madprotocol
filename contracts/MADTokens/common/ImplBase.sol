// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

import { ERC2981 } from "contracts/lib/tokens/common/ERC2981.sol";
import { TwoFactor } from "contracts/lib/auth/TwoFactor.sol";
import { Strings } from "contracts/lib/utils/Strings.sol";
import { PaymentManager } from "contracts/MADTokens/common/PaymentManager.sol";
// solhint-disable-next-line
import {
    ImplBaseEventsAndErrors,
    _BASE_URI_LOCKED,
    _PUBLIC_MINT_STATE_SET,
    _BASE_URI_SET,
    _ROYALTY_FEE_SET,
    _ROYALTY_RECIPIENT_SET
} from "contracts/MADTokens/common/interfaces/ImplBaseEventsAndErrors.sol";

abstract contract ImplBase is
    ERC2981,
    ImplBaseEventsAndErrors,
    TwoFactor,
    PaymentManager
{
    bytes32 internal constant _BASE_URI_SLOT = /*  */
        0xdd05fcb58e4c0a1a429c1a9d6607c399731f1ef0b81be85c3f7701c0333c82fc;

    uint256 internal constant _SR_UPPERBITS = (1 << 128) - 1;
    uint256 internal constant _MAXSUPPLY_BOUND = 1 << 128;
    uint256 internal constant _MINTCOUNT_BITPOS = 128;

    using Strings for uint256;

    ////////////////////////////////////////////////////////////////
    //                          IMMUTABLE                         //
    ////////////////////////////////////////////////////////////////

    /// @notice Public mint price.
    uint256 public immutable price;

    /// @notice Capped max supply.
    uint128 public immutable maxSupply;

    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    /// @notice `_supplyRegistrar` bits layout.
    /// @dev Live supply counter, excludes burned tokens.
    /// `uint128`  [0...127]   := liveSupply
    /// @dev Mint counter, includes burnt count.
    /// `uint128`  [128...255] := mintCount
    uint256 internal _supplyRegistrar;

    // /// @notice total amount of fees accumulated.
    // uint256 public feeCount;

    /// @notice Lock the URI (default := false).
    /// @dev The URI can't be unlocked.
    bool public uriLock;
    /// @notice Public mint state default := false.
    bool public publicMintState;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(
        string memory _baseURI,
        uint256 _price,
        uint256 _maxSupply,
        address _splitter,
        uint96 _royaltyPercentage,
        address _router,
        address _erc20
    )
        payable
        /*  */
        TwoFactor(_router, tx.origin)
        PaymentManager(_splitter, _erc20)
        ERC2981(uint256(_royaltyPercentage))
    {
        require(_maxSupply < _MAXSUPPLY_BOUND, "MAXSUPPLY_BOUND_EXCEEDED");

        // immutable
        price = _price;
        maxSupply = uint128(_maxSupply);

        _setStringMemory(_baseURI, _BASE_URI_SLOT);

        assembly {
            // emit RoyaltyFeeSet(uint256(_royaltyPercentage));
            log2(0, 0, _ROYALTY_FEE_SET, _royaltyPercentage)
            // emit RoyaltyRecipientSet(payable(_splitter));
            log2(0, 0, _ROYALTY_RECIPIENT_SET, _splitter)
        }
    }

    ////////////////////////////////////////////////////////////////
    //                         OWNER FX                           //
    ////////////////////////////////////////////////////////////////

    function setBaseURI(string calldata _baseURI) public authorised {
        if (uriLock) revert URILocked();
        // bytes(_baseURI).length > 32 ? revert() : baseURI = _baseURI;
        _setStringCalldata(_baseURI, _BASE_URI_SLOT);
        emit BaseURISet(_baseURI);

        // @audit Error in testing - hashes do not match - are we emitting the
        // correct data?
        // assembly { log2(0, 0, _BASE_URI_SET, calldataload(0x44)) }
    }

    /// @dev `uriLock` and `publicMintState` already
    /// packed in the same slot of storage.
    function setBaseURILock() public authorised {
        uriLock = true;
        assembly {
            // emit BaseURILocked(baseURI);
            log1(0, 0, _BASE_URI_LOCKED)
        }
    }

    /// @dev `uriLock` and `publicMintState` already
    /// packed in the same slot of storage.
    function setPublicMintState(bool _publicMintState) public authorised {
        publicMintState = _publicMintState;
        assembly {
            // emit PublicMintStateSet(_publicMintState);
            log2(0, 0, _PUBLIC_MINT_STATE_SET, _publicMintState)
        }
    }

    ////////////////////////////////////////////////////////////////
    //                       OWNER WITHDRAW                       //
    ////////////////////////////////////////////////////////////////

    function withdraw(address recipient) public authorised {
        _withdraw(recipient);
    }

    function withdrawERC20(address token, address recipient)
        public
        authorised
    {
        _withdrawERC20(token, recipient);
    }

    ////////////////////////////////////////////////////////////////
    //                           VIEW FX                          //
    ////////////////////////////////////////////////////////////////

    function baseURI() public view returns (string memory) {
        return _readString(_BASE_URI_SLOT);
    }

    function totalSupply() public view returns (uint256) {
        return liveSupply();
    }

    function royaltyInfo(uint256, uint256 salePrice)
        public
        view
        virtual
        override(ERC2981)
        returns (address receiver, uint256 royaltyAmount)
    {
        receiver = payable(splitter);
        royaltyAmount = (salePrice * _royaltyFee) / 10_000;
    }

    function liveSupply() public view returns (uint256 _liveSupply) {
        assembly {
            _liveSupply := and(_SR_UPPERBITS, sload(_supplyRegistrar.slot))
        }
    }

    function mintCount() public view returns (uint256 _mintCount) {
        assembly {
            _mintCount := shr(_MINTCOUNT_BITPOS, sload(_supplyRegistrar.slot))
        }
    }

    ////////////////////////////////////////////////////////////////
    //                     INTERNAL FUNCTIONS                     //
    ////////////////////////////////////////////////////////////////

    function _incrementCounter(uint256 _amount)
        internal
        returns (uint256 _nextId, uint256 _mintCount)
    {
        // liveSupply = liveSupply + amount;
        // mintCount = mintCount + amount;
        // uint256 curId = mintCount + 1;
        assembly {
            let _prev := shr(_MINTCOUNT_BITPOS, sload(_supplyRegistrar.slot))
            let _liveSupply :=
                add(and(_SR_UPPERBITS, sload(_supplyRegistrar.slot)), _amount)
            _nextId := add(_prev, 0x01)
            _mintCount := add(_prev, _amount)

            sstore(
                _supplyRegistrar.slot,
                or(_liveSupply, shl(_MINTCOUNT_BITPOS, _mintCount))
            )
        }
    }

    function _prepareOwnerMint(uint256 amount, address erc20Owner)
        internal
        returns (uint256 curId, uint256 endId)
    {
        // require(amount < _MAXSUPPLY_BOUND && balance < _MAXSUPPLY_BOUND);
        _hasReachedMax(uint256(amount), maxSupply);

        (uint256 fee, bool method) = _ownerFeeCheck(0x40d097c3, erc20Owner);

        _ownerFeeHandler(method, fee, erc20Owner);

        return _incrementCounter(uint256(amount));
    }

    function _preparePublicMint(uint256 amount, uint256 totalCost)
        internal
        returns (uint256 curId, uint256 endId)
    {
        _publicMintAccess();

        _hasReachedMax(amount, maxSupply);

        (uint256 fee, uint256 value, bool method) =
            _publicMintPriceCheck(price, totalCost);

        _publicPaymentHandler(method, value, fee);

        return _incrementCounter(amount);
    }

    function _publicMintAccess() internal view {
        assembly {
            if iszero(sload(publicMintState.slot)) {
                mstore(0, 0x2d0a3f8e)
                revert(28, 4)
            }
        }
    }

    function _hasReachedMax(uint256 _amount, uint256 _maxSupply)
        internal
        view
    {
        assembly {
            // if (mintCount + amount > maxSupply)
            if gt(
                add(
                    shr(_MINTCOUNT_BITPOS, sload(_supplyRegistrar.slot)),
                    _amount
                ),
                _maxSupply
            ) {
                // revert MaxSupplyReached();
                mstore(0, 0xd05cb609)
                revert(28, 4)
            }
        }
    }

    function _decSupply(uint256 _amount) internal {
        assembly {
            let _liveSupply := and(_SR_UPPERBITS, sload(_supplyRegistrar.slot))
            if or(
                iszero(_liveSupply), gt(sub(_liveSupply, _amount), _liveSupply)
            ) {
                // DecOverflow()
                mstore(0x00, 0xce3a3d37)
                revert(0x1c, 0x04)
            }
        }
        _supplyRegistrar = _supplyRegistrar - _amount;
    }

    function _readString(bytes32 _slot)
        internal
        view
        returns (string memory _string)
    {
        assembly {
            let len := sload(_slot)
            mstore(_string, shr(0x01, and(len, 0xFF)))
            mstore(add(_string, 0x20), and(len, not(0xFF)))
            mstore(0x40, add(_string, 0x40))
        }
    }

    function _setStringCalldata(string calldata _string, bytes32 _slot)
        internal
    {
        assembly {
            if lt(0x1f, _string.length) { invalid() }
            sstore(_slot, or(calldataload(0x44), shl(0x01, calldataload(0x24))))
        }
    }

    function _setStringMemory(string memory _string, bytes32 _slot) internal {
        assembly {
            let len := mload(_string)
            if lt(0x1f, len) { invalid() }
            sstore(_slot, or(mload(add(_string, 0x20)), shl(0x01, len)))
        }
    }

    function _loopOverflow(uint256 _index, uint256 _end) internal pure {
        assembly {
            if lt(_index, _end) {
                // LoopOverflow()
                mstore(0x00, 0xdfb035c9)
                revert(0x1c, 0x04)
            }
        }
    }

    // use to check that any extra args are required are passed
    // Override if required but this will return nothing.
    function _extraArgsCheck(bytes32[] memory _extra) internal pure virtual {
        // if (_extra.length != 0) revert WrongArgsLength();
        // assembly {
        //     if iszero(iszero(mload(_extra))) {
        //         mstore(0, 0x7734d3ab)
        //         revert(28, 4)
        //     }
        // }
    }

    function _getFeeValue(bytes4 _method)
        internal
        view
        virtual
        override(PaymentManager)
        returns (uint256 value)
    {
        // value = _size == 0 ?
        // 0 : FeeOracle(_router).feeLookup(_method);
        bytes memory c = abi.encodeWithSelector(0xedc9e7a4, _method);
        assembly {
            let _router := shr(12, sload(router.slot))
            switch iszero(extcodesize(_router))
            case 1 { value := 0 }
            case 0 {
                pop(staticcall(gas(), _router, add(c, 32), mload(c), 0, 32))
                value := mload(0)
            }
        }
    }
}
