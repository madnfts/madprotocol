// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.22;
// solhint-disable-next-line

import {
    ImplBase,
    ERC2981,
    Strings,
    FactoryTypes
} from "contracts/MADTokens/common/ImplBase.sol";
import { ERC1155 } from "contracts/lib/tokens/ERC1155/Base/ERC1155.sol";

contract ERC1155Basic is ERC1155, ImplBase {
    using FactoryTypes for FactoryTypes.CollectionArgs;
    using Strings for uint256;

    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    /// @notice `_balanceRegistrar` bits layout.
    /// @dev Live supply counter for each id's balance, excludes burned tokens.
    /// @dev Mint counter for each id's balance, includes burnt count.
    /// `uint128`  [0...127]   := liveBalance
    /// `uint128`  [128...255] := mintCount
    /// (id) => (_balanceRegistrar{`uint128`,`uint128`})
    mapping(uint256 => uint256) internal _balanceRegistrar;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(FactoryTypes.CollectionArgs memory args) ImplBase(args) {
        emit URI(args._baseURI, 0x00);
    }

    ////////////////////////////////////////////////////////////////
    //                       OWNER MINTING                        //
    ////////////////////////////////////////////////////////////////

    /// @dev Transfer event emitted by parent ERC1155 contract.
    /// @dev Loop runs out of gas before overflowing.
    /// @dev Function Signature := 0xf745586f
    function mintTo(address to, uint128 amount, uint128 _id)
        public
        payable
        authorised
    {
        _mint(to, _id, uint256(amount), "");
    }

    /// @dev Transfer event emitted by parent ERC1155 contract.
    function mintBatchTo(
        address to,
        uint128[] memory ids,
        uint128[] memory amounts
    ) public payable authorised {
        uint256[] memory _ids;
        uint256[] memory _amounts;
        assembly {
            _ids := ids
            _amounts := amounts
        }
        _batchMint(to, _ids, _amounts, "");
    }

    /// @dev Transfer events emitted by parent ERC1155 contract.
    function burn(
        address[] memory from,
        uint128[] memory ids,
        uint128[] memory balances
    ) public payable authorised {
        uint256 len = ids.length;
        assembly {
            if iszero(and(eq(len, mload(balances)), eq(len, mload(from)))) {
                mstore(0, 0x3b800a46)
                revert(28, 4)
            } // ArrayLengthsMismatch()
        }

        for (uint256 i = 0; i < len; ++i) {
            _burn(from[i], uint256(ids[i]), uint256(balances[i]));
        }
    }

    /// @dev Transfer event emitted by parent ERC1155 contract.
    function burnBatch(
        address from,
        uint128[] memory ids,
        uint128[] memory amounts
    ) public payable authorised {
        uint256[] memory _ids;
        uint256[] memory _amounts;
        assembly {
            _ids := ids
            _amounts := amounts
        }

        _batchBurn(from, _ids, _amounts);
    }

    ////////////////////////////////////////////////////////////////
    //                          PUBLIC FX                         //
    ////////////////////////////////////////////////////////////////

    /// @dev Transfer events emitted by parent ERC1155 contract.
    function mint(uint128 _id, uint128 amount) public payable routerOrPublic {
        _publicMint(msg.sender, _id, amount, msg.sender);
    }

    function mint(address _to, uint128 _id, uint128 amount)
        external
        payable
        routerOrPublic
    {
        _publicMint(_to, _id, amount, _to);
    }

    function _publicMint(
        address to,
        uint128 _id,
        uint128 amount,
        address _minter
    ) private {
        _preparePublicMint(uint256(amount), _minter);
        mintTo(to, _id, amount);
    }

    /// @dev Transfer event emitted by parent ERC1155 contract.
    function mintBatch(
        address _to,
        uint128[] memory ids,
        uint128[] calldata amounts
    ) external payable routerOrPublic {
        _publicMintBatch(_to, ids, amounts);
    }

    function _publicMintBatch(
        address _to,
        uint128[] memory ids,
        uint128[] calldata amounts
    ) private {
        uint256 len = ids.length;
        _preparePublicMint(uint256(len * _sumAmounts(amounts)), _to);

        mintBatchTo(_to, ids, amounts);
    }

    function _sumAmounts(uint128[] calldata amounts)
        private
        pure
        returns (uint256 result)
    {
        assembly {
            if amounts.length {
                let end := add(amounts.offset, shl(0x05, amounts.length))
                let i := amounts.offset
                for {
                    /*  */
                } iszero(returndatasize()) {
                    /*  */
                } {
                    result := add(result, calldataload(i))
                    i := add(i, 0x20)
                    if iszero(lt(i, end)) { break }
                }
            }
        }
    }

    ////////////////////////////////////////////////////////////////
    //                           VIEW FX                          //
    ////////////////////////////////////////////////////////////////

    function uri(uint256 id)
        public
        view
        virtual
        override(ERC1155)
        returns (string memory)
    {
        if (balanceCount(id) == 0) {
            // NotMintedYet()
            assembly {
                mstore(0, 0xbad086ea)
                revert(28, 4)
            }
        }
        return string(abi.encodePacked(baseURI, Strings.toString(id), ".json"));
    }

    function liveBalance(uint256 id) public view returns (uint256) {
        return _balanceRegistrar[id] & _SR_UPPERBITS;
    }

    function balanceCount(uint256 id) public view returns (uint256) {
        return _balanceRegistrar[id] >> _MINTCOUNT_BITPOS;
    }

    ////////////////////////////////////////////////////////////////
    //                     REQUIRED OVERRIDES                     //
    ////////////////////////////////////////////////////////////////

    function _beforeTokenMint(uint256 id, uint256 amount)
        internal
        virtual
        override(ERC1155)
    {
        uint128 maxBal = maxSupply;
        assembly {
            mstore(32, _balanceRegistrar.slot)
            mstore(0, id)

            let sLoc := keccak256(0, 64)

            let rawBal := sload(sLoc)

            let newBal := add(amount, shr(_MINTCOUNT_BITPOS, rawBal))

            if gt(newBal, maxBal) {
                // MaxSupplyReached()
                mstore(0, 0xd05cb609)
                revert(28, 4)
            }
            sstore(
                sLoc,
                or(
                    add(and(_SR_UPPERBITS, rawBal), amount),
                    shl(_MINTCOUNT_BITPOS, newBal)
                )
            )
        }
    }

    function _beforeTokenBatchMint(
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal virtual override(ERC1155) {
        uint128 maxBal = maxSupply;
        assembly {
            let idsLen := mload(ids)
            if iszero(eq(idsLen, mload(amounts))) {
                // ArrayLengthsMismatch()
                mstore(0, 0x3b800a46)
                revert(28, 4)
            }
            let iLoc := add(ids, 32)
            let aLoc := add(amounts, 32)
            for { let end := add(iLoc, shl(5, idsLen)) } iszero(eq(iLoc, end)) {
                iLoc := add(iLoc, 32)
                aLoc := add(aLoc, 32)
            } {
                mstore(32, _balanceRegistrar.slot)
                mstore(0, mload(iLoc))
                let sLoc := keccak256(0, 64)
                let rawBal := sload(sLoc)
                let newBal := add(mload(aLoc), shr(_MINTCOUNT_BITPOS, rawBal))
                if gt(newBal, maxBal) {
                    // MaxSupplyReached()
                    mstore(0, 0xd05cb609)
                    revert(28, 4)
                }
                sstore(
                    sLoc,
                    or(
                        add(and(_SR_UPPERBITS, rawBal), mload(aLoc)),
                        shl(_MINTCOUNT_BITPOS, newBal)
                    )
                )
            }
        }
    }

    function _beforeTokenBurn(uint256 id, uint256 amount)
        internal
        virtual
        override(ERC1155)
    {
        assembly {
            mstore(32, _balanceRegistrar.slot)
            mstore(0, id)
            let sLoc := keccak256(0, 64)
            let _liveBalance := and(_SR_UPPERBITS, sload(sLoc))
            let _newBalance := sub(_liveBalance, amount)
            if or(iszero(_liveBalance), gt(_newBalance, _liveBalance)) {
                // DecOverflow()
                mstore(0x00, 0xce3a3d37)
                revert(0x1c, 0x04)
            }
            sstore(sLoc, _newBalance)
        }
    }

    function _beforeTokenBatchBurn(
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal virtual override(ERC1155) {
        assembly {
            let idsLen := mload(ids)
            if iszero(eq(idsLen, mload(amounts))) {
                // ArrayLengthsMismatch()
                mstore(0, 0x3b800a46)
                revert(28, 4)
            }
            let iLoc := add(ids, 32)
            let aLoc := add(amounts, 32)
            for { let end := add(iLoc, shl(5, idsLen)) } iszero(eq(iLoc, end)) {
                iLoc := add(iLoc, 32)
                aLoc := add(aLoc, 32)
            } {
                mstore(32, _balanceRegistrar.slot)
                mstore(0, mload(iLoc))
                let sLoc := keccak256(0, 64)
                let _liveBalance := and(_SR_UPPERBITS, sload(sLoc))
                let _newBalance := sub(_liveBalance, mload(aLoc))
                if or(iszero(_liveBalance), gt(_newBalance, _liveBalance)) {
                    // DecOverflow()
                    mstore(0x00, 0xce3a3d37)
                    revert(0x1c, 0x04)
                }
                sstore(sLoc, _liveBalance)
            }
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        pure
        virtual
        override(ERC1155, ERC2981)
        returns (bool)
    {
        return
        // ERC165 Interface ID for ERC165
        interfaceId == 0x01ffc9a7
        // ERC165 Interface ID for ERC1155
        || interfaceId == 0xd9b67a26
        // ERC165 Interface ID for ERC1155MetadataURI
        || interfaceId == 0x0e89341c
        // ERC165 Interface ID for ERC2981
        || interfaceId == 0x2a55205a;
    }
}
