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

    uint256 public constant MAX_BATCH_AMOUNT = 1000;

    error MaxBatchAmountExceeded();

    event PublicMintStateSet(uint256 indexed _id, bool _publicMintState);
    event BatchPublicMintStateSet(
        uint128[] indexed _ids, bool[] _publicMintStates
    );
    event MaxSupplySet(uint256 indexed _id, uint256 _maxSupply);

    event PublicMintLimitSet(uint256 indexed _id, uint256 _limit);

    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    /// @notice `_balanceRegistrar` bits layout.
    /// @dev Live supply counter for each id's balance, excludes burned tokens.
    /// @dev Mint counter for each id's balance, includes burnt count.
    /// `uint128`  [0...127]   := liveBalance
    /// `uint128`  [128...255] := mintCount
    /// (id) => (_balanceRegistrar{`uint128`,`uint128`})
    mapping(uint256 id => uint256 balanceRegistrar) internal _balanceRegistrar;

    mapping(uint256 id => uint256 maxSupply) public maxSupply;

    mapping(uint256 id => bool publicMintState) public publicMintState;

    /// max that public can mint per address
    uint256 public publicMintLimitDefault = 10;
    mapping(uint256 id => uint256 publicMintLimit) public publicMintLimit;
    mapping(uint256 id => mapping(address minter => uint256 minted)) public
        mintedByAddress;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(FactoryTypes.CollectionArgs memory args) ImplBase(args) {
        emit URI(args._baseURI, 0x00);
    }

    /**
     * @notice Set public mint limit, a private state-modifying function.
     * @dev Has modifiers: onlyOwner.
     * @param _id The id (uint256).
     * @param _limit The limit (uint256).
     * @custom:signature _setPublicMintLimit(uint256,uint256)
     * @custom:selector 0x8854696a
     */
    function setPublicMintLimit(uint256 _id, uint256 _limit) public onlyOwner {
        if (_limit == 0) revert ZeroPublicMintLimit();
        publicMintLimit[_id] = _limit;
        emit PublicMintLimitSet(_id, _limit);
    }

    /**
     * @notice Set max supply, a public state-modifying function.
     * @param id The id (uint256).
     * @param _maxSupply The max supply (uint256).
     * @custom:signature _setMaxSupply(uint256,uint256)
     * @custom:selector 0xfe61a3ac
     */
    function setMaxSupply(uint128 id, uint256 _maxSupply) public authorised {
        if (maxSupply[id] > 0) return; // MaxSupplyAlreadySet();
        if (_maxSupply > _MAXSUPPLY_BOUND) revert MaxSupplyBoundExceeded();
        if (_maxSupply == 0) revert ZeroMaxSupply();
        maxSupply[id] = _maxSupply;
        emit MaxSupplySet(id, _maxSupply);
    }

    /**
     * @notice Set max supply, a public state-modifying function.
     * @param ids List of uint256s.
     * @param _maxSupplies List of uint256s.
     * @custom:signature _batchSetMaxSupply(uint256[],uint256[])
     * @custom:selector 0x1cce9d3e
     */
    function batchSetMaxSupply(
        uint128[] calldata ids,
        uint256[] calldata _maxSupplies
    ) public authorised {
        uint256 idsLength = ids.length;
        if (idsLength > MAX_BATCH_AMOUNT) revert MaxBatchAmountExceeded();
        if (_maxSupplies.length != idsLength) revert ArrayLengthsMismatch();
        for (uint256 i = 0; i < idsLength; i++) {
            setMaxSupply(ids[i], _maxSupplies[i]);
        }
    }

    /**
     * @notice Set public mint state, a public state-modifying function.
     * @dev Has modifiers: onlyOwner.
     * @dev Emits PublicMintStateSet event.
     * @param _id The id (uint256).
     * @param _publicMintState The public mint state (bool).
     * @param _maxSupply The max supply of the id passed (can be 0 if already
     * set.) (uint256).
     * @custom:signature setPublicMintState(uint256,bool,uint256)
     * @custom:selector 0xb17e8bb9
     */
    function setPublicMintState(
        uint128 _id,
        bool _publicMintState,
        uint128 _maxSupply
    ) public onlyOwner {
        setMaxSupply(_id, _maxSupply);
        publicMintState[_id] = _publicMintState;

        emit PublicMintStateSet(_id, _publicMintState);
    }

    /**
     * @notice Set public mint state, a public state-modifying function.
     * @dev Has modifiers: onlyOwner.
     * @dev Emits PublicMintStateSet event.
     * @param _ids List of uint256s.
     * @param _publicMintStates List of bools.
     * @param _maxSupplies List of uint256s.
     * @custom:signature batchSetPublicMintState(uint256[],bool[],uint256[])
     * @custom:selector 0x73952a1c
     */
    function batchSetPublicMintState(
        uint128[] calldata _ids,
        bool[] calldata _publicMintStates,
        uint256[] calldata _maxSupplies
    ) public onlyOwner {
        uint256 idsLength = _ids.length;
        if (idsLength > MAX_BATCH_AMOUNT) revert MaxBatchAmountExceeded();
        for (uint256 i = 0; i < idsLength; i++) {
            setMaxSupply(_ids[i], _maxSupplies[i]);
            publicMintState[_ids[i]] = _publicMintStates[i];
        }
        emit BatchPublicMintStateSet(_ids, _publicMintStates);
    }

    ////////////////////////////////////////////////////////////////
    //                       OWNER MINTING                        //
    ////////////////////////////////////////////////////////////////

    /**
     * @notice Mint to, a public state-modifying function.
     * @notice Accepts ether.
     * @dev Has modifiers: authorised.
     * @dev maxSupply must be set before calling this function
     * @param to The to address.
     * @param _id The id (uint128).
     * @param amount The amount (uint128).
     * @custom:signature mintTo(address,uint128,uint128)
     * @custom:selector 0xf204ed59
     */
    function mintTo(address to, uint128 _id, uint128 amount)
        public
        payable
        authorised
    {
        _mint(to, _id, uint256(amount), "");
    }

    /**
     * @notice Mint batch to, a public state-modifying function.
     * @notice Accepts ether.
     * @dev Has modifiers: authorised.
     *  @dev maxSupply must be set before calling this function
     * @dev Transfer event emitted by parent ERC1155 contract.
     * @param to The to address.
     * @param ids List of uint128s.
     * @param amounts List of uint128s.
     * @custom:signature mintBatchTo(address,uint128[],uint128[])
     * @custom:selector 0x685d2ca5
     */
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

    /**
     * @notice Burn, a public state-modifying function.
     * @notice Accepts ether.
     * @dev Has modifiers: authorised.
     * @dev Transfer event emitted by parent ERC1155 contract.
     * @param from owner address.
     * @param id id of the token.
     * @param amount balance of the token.
     * @custom:signature burn(address,uint128,uint128)
     * @custom:selector 0xf06f04f2
     */
    function burn(address from, uint128 id, uint128 amount)
        public
        payable
        authorised
    {
        _burn(from, uint256(id), uint256(amount));
    }

    /**
     * @notice Burn batch, a public state-modifying function.
     * @notice Accepts ether.
     * @dev Has modifiers: authorised.
     * @dev Transfer event emitted by parent ERC1155 contract.
     * @param from The from address.
     * @param ids List of uint128s.
     * @param amounts List of uint128s.
     * @custom:signature burnBatch(address,uint128[],uint128[])
     * @custom:selector 0x7cc22f70
     */
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

    /**
     * @notice Mint, a public state-modifying function.
     * @notice Accepts ether.
     * @dev Has modifiers: routerOrPublic.
     * @dev Transfer event emitted by parent ERC1155 contract.
     * @dev maxSupply must be set before calling this function
     * @param _id The id (uint128).
     * @param amount The amount (uint128).
     * @custom:signature mint(uint128,uint128)
     * @custom:selector 0xdfe7a8e5
     */
    function mint(uint128 _id, uint128 amount) public payable routerOrPublic {
        _publicMint(msg.sender, _id, amount, msg.sender);
    }

    /**
     * @notice Mint, an external state-modifying function.
     * @notice Accepts ether.
     * @dev Has modifiers: routerOrPublic.
     * @dev Transfer event emitted by parent ERC1155 contract.
     * @dev maxSupply must be set before calling this function
     * @param _to The to address.
     * @param _id The id (uint128).
     * @param amount The amount (uint128).
     * @custom:signature mint(address,uint128,uint128)
     * @custom:selector 0x97622870
     */
    function mint(address _to, uint128 _id, uint128 amount)
        external
        payable
        routerOrPublic
    {
        _publicMint(_to, _id, amount, _to);
    }

    /**
     * @notice Public mint, a private state-modifying function.
     * @param to The to address.
     * @param _id The id (uint128).
     * @param amount The amount (uint128).
     * @param _minter The minter address.
     * @custom:signature _publicMint(address,uint128,uint128,address)
     * @custom:selector 0xb255074f
     */
    function _publicMint(
        address to,
        uint128 _id,
        uint128 amount,
        address _minter
    ) private {
        _preparePublicMint(uint256(amount), _minter, publicMintState[_id]);
        mintTo(to, _id, amount);
    }

    /**
     * @notice Mint batch, an external state-modifying function.
     * @notice Accepts ether.
     * @dev Has modifiers: routerOrPublic.
     * @dev Transfer event emitted by parent ERC1155 contract.
     * @param _to The to address.
     * @param ids List of uint128s.
     * @param amounts List of uint128s.
     * @custom:signature mintBatch(address,uint128[],uint128[])
     * @custom:selector 0x2c8701a4
     */
    function mintBatch(
        address _to,
        uint128[] memory ids,
        uint128[] calldata amounts
    ) external payable routerOrPublic {
        _publicMintBatch(_to, ids, amounts);
    }

    /**
     * @notice Public mint batch, a private state-modifying function.
     * @param _to The to address.
     * @param ids List of uint128s.
     * @param amounts List of uint128s.
     * @custom:signature _publicMintBatch(address,uint128[],uint128[])
     * @custom:selector 0xb4f59617
     */
    function _publicMintBatch(
        address _to,
        uint128[] memory ids,
        uint128[] calldata amounts
    ) private {
        uint256 len = ids.length;
        // Check every Public mint is true
        bool publicMintStateCheck = true;
        for (uint256 i = 0; i < len; i++) {
            if (publicMintState[ids[i]] == false) {
                publicMintStateCheck = false;
            }
        }
        _preparePublicMint(
            uint256(len * _sumAmounts(amounts)), _to, publicMintStateCheck
        );
        mintBatchTo(_to, ids, amounts);
    }

    /**
     * @notice Sum amounts, a private pure function.
     * @param amounts List of uint128 amounts.
     * @return result An uint256 value.
     * @custom:signature _sumAmounts(uint128[])
     * @custom:selector 0x05b479ea
     */
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

    /**
     * @notice Uri, a public view function.
     * @param id The id (uint256).
     * @return string Result of uri.
     * @custom:signature uri(uint256)
     * @custom:selector 0x0e89341c
     */
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

    /**
     * @notice Live balance, a public view function.
     * @dev Live supply counter for each id's balance, excludes burned tokens.
     * @param id The id (uint256).
     * @return uint256 Result of liveBalance.
     * @custom:signature liveBalance(uint256)
     * @custom:selector 0x1a759141
     */
    function liveBalance(uint256 id) public view returns (uint256) {
        return _balanceRegistrar[id] & _SR_UPPERBITS;
    }

    /**
     * @notice Balance count, a public view function.
     * @dev Mint counter for each id's balance, includes burnt count.
     * @param id The id (uint256).
     * @return uint256 Result of balanceCount.
     * @custom:signature balanceCount(uint256)
     * @custom:selector 0x42abcd66
     */
    function balanceCount(uint256 id) public view returns (uint256) {
        return _balanceRegistrar[id] >> _MINTCOUNT_BITPOS;
    }

    ////////////////////////////////////////////////////////////////
    //                     PRIVATE FUNCTIONS                     //
    ////////////////////////////////////////////////////////////////

    /**
     * @notice Public minted, a private state-modifying function.
     * @dev Increments the amount of tokens minted by the minter.
     * @dev Reverts if the amount minted by the minter exceeds the public mint
     * limit.
     * @param id The id (uint256).
     * @param _minter The minter address.
     * @param _amount The amount (uint256).
     * @custom:signature _publicMinted(uint256,address,uint256)
     * @custom:selector 0xd85a62bb
     */
    function _publicMinted(uint256 id, address _minter, uint256 _amount)
        private
    {
        uint256 amountMinted = mintedByAddress[id][_minter];
        if (amountMinted + _amount > publicMintLimit[id]) {
            revert MintLimitReached();
        }
        mintedByAddress[id][_minter] += _amount;
    }

    ////////////////////////////////////////////////////////////////
    //                     REQUIRED OVERRIDES                     //
    ////////////////////////////////////////////////////////////////

    /**
     * @notice Before token mint, an internal state-modifying function.
     * @param id The id (uint256).
     * @param amount The amount (uint256).
     * @custom:signature _beforeTokenMint(uint256,uint256)
     * @custom:selector 0xf2c5b6ef
     */
    function _beforeTokenMint(uint256 id, uint256 amount)
        internal
        virtual
        override(ERC1155)
    {
        if (amount == 0) {
            revert ZeroAmount();
        }
        uint128 maxBal = uint128(maxSupply[id]);
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

    /**
     * @notice Before token batch mint, an internal state-modifying function.
     * @param ids List of uint256s.
     * @param amounts List of uint256s.
     * @custom:signature _beforeTokenBatchMint(uint256[],uint256[])
     * @custom:selector 0x456aa33c
     */
    function _beforeTokenBatchMint(
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
                let id := mload(iLoc)
                let amount := mload(aLoc)

                if eq(amount, 0) {
                    // ZeroAmount()
                    mstore(0, 0x1f2a2005)
                    revert(28, 4)
                }

                // Compute the storage slot for the current id's entry in
                // _maxSupply
                mstore(0, id)
                mstore(32, maxSupply.slot)
                let maxSupplySlot := keccak256(0, 64)

                // Compute the storage slot for the current id's entry in
                // _balanceRegistrar
                mstore(0, id)
                mstore(32, _balanceRegistrar.slot)
                let balanceRegistrarSlot := keccak256(0, 64)

                let maxBal := sload(maxSupplySlot)
                let rawBal := sload(balanceRegistrarSlot)
                let newBal := add(amount, shr(_MINTCOUNT_BITPOS, rawBal))

                if gt(newBal, maxBal) {
                    // MaxSupplyReached()
                    mstore(0, 0xd05cb609)
                    revert(28, 4)
                }
                sstore(
                    balanceRegistrarSlot,
                    or(
                        add(and(_SR_UPPERBITS, rawBal), mload(aLoc)),
                        shl(_MINTCOUNT_BITPOS, newBal)
                    )
                )
            }
        }
    }

    /**
     * @notice Before token burn, an internal state-modifying function.
     * @param id The id (uint256).
     * @param amount The amount (uint256).
     * @custom:signature _beforeTokenBurn(uint256,uint256)
     * @custom:selector 0xd703ad60
     */
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

    /**
     * @notice Before token batch burn, an internal state-modifying function.
     * @param ids List of uint256s.
     * @param amounts List of uint256s.
     * @custom:signature _beforeTokenBatchBurn(uint256[],uint256[])
     * @custom:selector 0x5cf7a560
     */
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

    /**
     * @notice Supports interface, a public pure function.
     * @param interfaceId The interface id (bytes4).
     * @return bool Result of supportsInterface.
     * @custom:signature supportsInterface(bytes4)
     * @custom:selector 0x01ffc9a7
     */
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
