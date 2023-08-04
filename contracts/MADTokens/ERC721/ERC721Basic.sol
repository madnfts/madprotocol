// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.19;

// solhint-disable-next-line
import {
    ImplBase,
    ERC2981,
    Strings,
    Types
} from "contracts/MADTokens/common/ImplBase.sol";
import { ERC721 } from "contracts/lib/tokens/ERC721/Base/ERC721.sol";

//prettier-ignore
contract ERC721Basic is ERC721, ImplBase {
    bytes32 private constant _NAME_SLOT = /*  */
        0x897572a87d0174092695c4d573af60ba2f538ab1e5fe57428eebc5ce7dad72bb;

    bytes32 private constant _SYMBOL_SLOT = /*  */
        0x30ec9400a6906cefbe2888cc908b6b5efeceee7bcd5438fa93fc189e1bbe64ac;

    using Types for Types.CollectionArgs;
    using Strings for uint256;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(Types.CollectionArgs memory args) ImplBase(args) {
        _setStringMemory(args._name, _NAME_SLOT);
        _setStringMemory(args._symbol, _SYMBOL_SLOT);
    }

    ////////////////////////////////////////////////////////////////
    //                       OWNER MINTING                        //
    ////////////////////////////////////////////////////////////////

    /// @dev Transfer event emitted by parent ERC721 contract.
    /// @dev Function Sighash := 0x438b1b4b
    /// @dev Loop runs out of gas before overflowing.
    function mintTo(address to, uint128 amount) external payable authorised {
        (uint256 curId, uint256 endId) = _prepareOwnerMint(amount);

        unchecked {
            do {
                _mint(to, curId);
            } while (curId++ != endId);
        }
    }

    ////////////////////////////////////////////////////////////////
    //                          PUBLIC FX                         //
    ////////////////////////////////////////////////////////////////

    /// @notice public mint function if madRouter is not authorised.
    /// This will open up public minting to any contract or EOA if the owner has
    /// disabled the authorisation for the router.
    /// Otherwise, Mad Protocol will handle the public minting.
    /// @dev Transfer event emitted by parent ERC721 contract.
    /// @dev Function Sighash := 0xa0712d68
    /// @param amount The amount of tokens to mint.
    function mint(uint128 amount) external payable {
        if (routerHasAuthority) {
            revert RouterIsEnabled();
        }

        _publicMint(msg.sender, amount);
    }

    /// @notice public mint function if madRouter is authorised.
    /// @dev Transfer event emitted by parent ERC721 contract.
    /// @dev Function Sighash := 0xbe29184f
    /// @param to The address to mint to.
    /// @param amount The amount of tokens to mint.
    function mint(address to, uint128 amount) external payable authorised {
        _publicMint(to, amount);
    }

    function _publicMint(address to, uint128 amount) private {
        (uint256 curId, uint256 endId) =
            _preparePublicMint(uint256(amount), uint256(amount));
        unchecked {
            do {
                _mint(to, curId);
            } while (curId++ != endId);
        }
    }

    /// @dev Transfer event emitted by parent ERC721 contract.
    /// @dev Function Sighash := 0x362c0cb5
    function burn(uint128[] calldata ids) external payable {
        uint256 len = ids.length;
        _decSupply(len);

        uint256 i;
        for (i; i < len;) {
            _burn(uint256(ids[i]));
            unchecked {
                ++i;
            }
        }

        _loopOverflow(i, len);
    }

    ////////////////////////////////////////////////////////////////
    //                           VIEW FX                          //
    ////////////////////////////////////////////////////////////////

    function tokenURI(uint256 id)
        public
        view
        virtual
        override(ERC721)
        returns (string memory)
    {
        if (id > mintCount()) revert NotMintedYet();

        return
            string(abi.encodePacked(baseURI(), Strings.toString(id), ".json"));
    }

    function name()
        public
        view
        virtual
        override(ERC721)
        returns (string memory)
    {
        return _readString(_NAME_SLOT);
    }

    function symbol()
        public
        view
        virtual
        override(ERC721)
        returns (string memory)
    {
        return _readString(_SYMBOL_SLOT);
    }

    ////////////////////////////////////////////////////////////////
    //                     REQUIRED OVERRIDES                     //
    ////////////////////////////////////////////////////////////////

    function supportsInterface(bytes4 interfaceId)
        public
        pure
        virtual
        override(ERC721, ERC2981)
        returns (bool)
    {
        return
        // ERC165 Interface ID for ERC165
        interfaceId == 0x01ffc9a7
        // ERC165 Interface ID for ERC721
        || interfaceId == 0x80ac58cd
        // ERC165 Interface ID for ERC721Metadata
        || interfaceId == 0x5b5e139f
        // ERC165 Interface ID for ERC2981
        || interfaceId == 0x2a55205a;
    }
}
