// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

import { ImplBase, ERC2981, Strings } from "contracts/MADTokens/common/ImplBase.sol";
import { ERC1155 } from "contracts/lib/tokens/ERC1155/Base/ERC1155.sol";
import { Types } from "contracts/Shared/Types.sol";

contract ERC1155Basic is ERC1155, ImplBase {
    using Types for Types.ColArgs;
    using Strings for uint256;

    ////////////////////////////////////////////////////////////////
    //                          IMMUTABLE                         //
    ////////////////////////////////////////////////////////////////

    /// @dev Max balance allowed to be minted for each id.
    uint128 public immutable maxIdBalance;

    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    /// @notice `balanceRegistrar` bits layout.
    /// @dev Live supply counter for each id's balance, excludes burned tokens.
    /// @dev Mint counter for each id's balance, includes burnt count.
    /// `uint128`  [0...127]   := liveBalance
    /// `uint128`  [128...255] := balanceCount
    /// (id) => (balanceRegistrar{`uint128`,`uint128`})
    mapping(uint256 => uint256) internal balanceRegistrar;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(Types.ColArgs memory args, bytes32[] memory _extra)
        /*  */
        ImplBase(args._baseURI, args._price, args._maxSupply, args._splitter, args._fraction, args._router, args._erc20)
    /*  */
    {
        maxIdBalance = uint128(uint256(bytes32(args._maxSupply)));

        emit URI(args._baseURI, 0x00);
    }

    ////////////////////////////////////////////////////////////////
    //                       OWNER MINTING                        //
    ////////////////////////////////////////////////////////////////

    /// @dev Transfer event emited by parent ERC1155 contract.
    /// @dev Loop runs out of gas before overflowing.
    /// @dev Function Signature := 0xf745586f
    function mintTo(
        address to,
        uint128 amount,
        /// @todo FE must be adadpted here.
        uint128 balance,
        address erc20Owner
    ) external payable authorised {
        (uint256 curId, uint256 endId) = _prepareOwnerMint(amount, erc20Owner);

        unchecked {
            do {
                _mint(to, curId, uint256(balance), "");
            } while (curId++ != endId);
        }
    }

    /// @dev Transfer event emited by parent ERC1155 contract.
    function mintBatchTo(address to, uint128[] memory ids, uint128[] memory amounts, address erc20Owner)
        external
        payable
        authorised
    {
        uint256 len = ids.length;
        _prepareOwnerMint(len, erc20Owner);

        uint256[] memory _ids;
        uint256[] memory _amounts;
        assembly {
            _ids := ids
            _amounts := amounts
        }
        _batchMint(to, _ids, _amounts, "");
    }

    /// @dev Transfer events emited by parent ERC1155 contract.
    function burn(address[] memory from, uint128[] memory ids, uint128[] memory balances, address erc20Owner)
        external
        payable
        authorised
    {
        (uint256 fee, bool method) = _ownerFeeCheck(0x44df8e70, erc20Owner);
        _ownerFeeHandler(method, fee, erc20Owner);

        uint256 len = ids.length;
        _decSupply(len);

        assembly {
            if iszero(and(eq(len, mload(balances)), eq(len, mload(from)))) {
                mstore(0, 0x3b800a46)
                revert(28, 4)
            } // ArrayLengthsMismatch()
        }

        uint256 i;
        for (i; i < len;) {
            _burn(from[i], uint256(ids[i]), uint256(balances[i]));
            unchecked {
                ++i;
            }
        }
        _loopOverflow(i, len);
    }

    /// @dev Transfer event emited by parent ERC1155 contract.
    function burnBatch(address from, uint128[] memory ids, uint128[] memory amounts, address erc20Owner)
        external
        payable
        authorised
    {
        (uint256 fee, bool method) = _ownerFeeCheck(0x44df8e70, erc20Owner);
        _ownerFeeHandler(method, fee, erc20Owner);

        _decSupply(ids.length);

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

    /// @dev Transfer events emited by parent ERC1155 contract.
    function mint(uint128 amount, uint128 balance) external payable {
        (uint256 curId, uint256 endId) = _preparePublicMint(uint256(amount), uint256(amount * balance));

        unchecked {
            do {
                _mint(msg.sender, curId, uint256(balance), "");
            } while (curId++ != endId);
        }
    }

    /// @dev Transfer event emited by parent ERC1155 contract.
    function mintBatch(uint128[] memory ids, uint128[] calldata amounts) external payable {
        uint256 len = ids.length;

        _preparePublicMint(len, uint256(len * _sumAmounts(amounts)));

        uint128[] memory _amountsCasted = amounts;
        uint256[] memory _amounts;
        uint256[] memory _ids;
        assembly {
            _ids := ids
            _amounts := _amountsCasted
        }

        _batchMint(msg.sender, _ids, _amounts, "");
    }

    function _sumAmounts(uint128[] calldata amounts) private pure returns (uint256 result) {
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

    function uri(uint256 id) public view virtual override(ERC1155) returns (string memory) {
        if (balanceCount(id) != 0) {
            // NotMintedYet()
            assembly {
                mstore(0, 0xbad086ea)
                revert(28, 4)
            }
        }
        return string(abi.encodePacked(baseURI(), Strings.toString(id), ".json"));
    }

    function baseURI() public view returns (string memory) {
        return _readString(_BASE_URI_SLOT);
    }

    function totalSupply() public view returns (uint256) {
        return liveSupply();
    }

    function liveBalance(uint256 id) public view returns (uint256) {
        return balanceRegistrar[id] & SR_UPPERBITS;
    }

    function balanceCount(uint256 id) public view returns (uint256) {
        return balanceRegistrar[id] >> MINTCOUNT_BITPOS;
    }

    ////////////////////////////////////////////////////////////////
    //                     REQUIRED OVERRIDES                     //
    ////////////////////////////////////////////////////////////////

    function _beforeTokenMint(uint256 id, uint256 amount) internal virtual override(ERC1155) {
        uint128 maxBal = maxIdBalance;
        assembly {
            mstore(32, balanceRegistrar.slot)
            mstore(0, id)

            let sLoc := keccak256(0, 64)

            let rawBal := sload(sLoc)

            let newBal := add(amount, shr(MINTCOUNT_BITPOS, rawBal))

            if gt(newBal, maxBal) {
                // MaxSupplyReached()
                mstore(0, 0xd05cb609)
                revert(28, 4)
            }
            sstore(sLoc, or(add(and(SR_UPPERBITS, rawBal), amount), shl(MINTCOUNT_BITPOS, newBal)))
        }
    }

    function _beforeTokenBatchMint(uint256[] memory ids, uint256[] memory amounts) internal virtual override(ERC1155) {
        uint128 maxBal = maxIdBalance;
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
                mstore(32, balanceRegistrar.slot)
                mstore(0, mload(iLoc))
                let sLoc := keccak256(0, 64)
                let rawBal := sload(sLoc)
                let newBal := add(mload(aLoc), shr(MINTCOUNT_BITPOS, rawBal))
                if gt(newBal, maxBal) {
                    // MaxSupplyReached()
                    mstore(0, 0xd05cb609)
                    revert(28, 4)
                }
                sstore(sLoc, or(add(and(SR_UPPERBITS, rawBal), mload(aLoc)), shl(MINTCOUNT_BITPOS, newBal)))
            }
        }
    }

    function _beforeTokenBurn(uint256 id, uint256 amount) internal virtual override(ERC1155) {
        assembly {
            mstore(32, balanceRegistrar.slot)
            mstore(0, id)
            let sLoc := keccak256(0, 64)
            let _liveBalance := and(SR_UPPERBITS, sload(sLoc))
            let _newBalance := sub(_liveBalance, amount)
            if or(iszero(_liveBalance), gt(_newBalance, _liveBalance)) {
                // DecOverflow()
                mstore(0x00, 0xce3a3d37)
                revert(0x1c, 0x04)
            }
            sstore(sLoc, _newBalance)
        }
    }

    function _beforeTokenBatchBurn(uint256[] memory ids, uint256[] memory amounts) internal virtual override(ERC1155) {
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
                mstore(32, balanceRegistrar.slot)
                mstore(0, mload(iLoc))
                let sLoc := keccak256(0, 64)
                let _liveBalance := and(SR_UPPERBITS, sload(sLoc))
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

    function supportsInterface(bytes4 interfaceId) public pure virtual override(ERC1155, ERC2981) returns (bool) {
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
