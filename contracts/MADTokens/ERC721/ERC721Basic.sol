// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

import { ImplBase, ERC2981, Strings } from "contracts/MADTokens/common/ImplBase.sol";
import { ERC721 } from "contracts/lib/tokens/ERC721/Base/ERC721.sol";
import { Types } from "contracts/Shared/Types.sol";

//prettier-ignore
contract ERC721Basic is ERC721, ImplBase {

    bytes32 constant _NAME_SLOT = /*  */
    0x897572a87d0174092695c4d573af60ba2f538ab1e5fe57428eebc5ce7dad72bb;

    bytes32 constant _SYMBOL_SLOT = /*  */
    0x30ec9400a6906cefbe2888cc908b6b5efeceee7bcd5438fa93fc189e1bbe64ac;

    using Types for Types.ColArgs;
    using Strings for uint256;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(
        Types.ColArgs memory args,
        bytes32[] memory _extra
    )
        ImplBase(
            args._baseURI,
            args._price,
            args._maxSupply,
            args._splitter,
            args._fraction,
            args._router,
            args._erc20
        )
    {
        _setStringMemory(args._name, _NAME_SLOT);
        _setStringMemory(args._symbol, _SYMBOL_SLOT);
        
        _extraArgsCheck(_extra);
    }

    ////////////////////////////////////////////////////////////////
    //                       OWNER MINTING                        //
    ////////////////////////////////////////////////////////////////

    /// @dev Transfer event emited by parent ERC721 contract.
    /// @dev Function Sighash := 0x438b1b4b
    /// @dev Loop runs out of gas before overflowing.
    function mintTo(
        address to, 
        uint128 amount, 
        address erc20Owner
    ) 
        external 
        payable 
        authorised 
    {
        // require(amount < MAXSUPPLY_BOUND);
        _hasReachedMax(uint256(amount), maxSupply); 

        (uint256 fee, bool method) = 
        _ownerFeeCheck(0x40d097c3, erc20Owner);
        _ownerFeeHandler(method, fee, erc20Owner);

        (uint256 curId, uint256 endId) = _incrementCounter(uint256(amount));

        unchecked { do { _mint(to, curId); } while (++curId != endId); }
    }

    /// @dev Transfer event emited by parent ERC721 contract.
    /// @dev Function Sighash := 0x362c0cb5
    function burn(uint128[] calldata ids, address erc20Owner) 
        external 
        payable 
        authorised 
    {
        (uint256 fee, bool method) = 
        _ownerFeeCheck(0x44df8e70, erc20Owner);
        _ownerFeeHandler(method, fee, erc20Owner);

        uint256 len = ids.length; _decSupply(len);

        uint256 i;
        for (i; i < len; ) { _burn(uint256(ids[i])); unchecked { ++i; } }
        
        _loopOverflow(i, len);
    }

    ////////////////////////////////////////////////////////////////
    //                          PUBLIC FX                         //
    ////////////////////////////////////////////////////////////////

    /// @dev Transfer event emited by parent ERC721 contract.
    /// @dev Function Sighash := 0xa0712d68
    function mint(uint128 amount) external payable 
    {
        // require(amount < MAXSUPPLY_BOUND);
        _publicMintAccess();
        _hasReachedMax(uint256(amount), maxSupply);

        (uint256 fee, uint256 value, bool method) = 
        _publicMintPriceCheck(price, uint256(amount));
        _publicPaymentHandler(method, value, fee);

        (uint256 curId, uint256 endId) = _incrementCounter(uint256(amount));

        unchecked { do { _mint(msg.sender, curId); } while (++curId != endId); }
    }

    ////////////////////////////////////////////////////////////////
    //                           VIEW FX                          //
    ////////////////////////////////////////////////////////////////

    function tokenURI(uint256 id) 
        public 
        view 
        virtual override(ERC721) 
        returns (string memory) 
    {
        if ( id > mintCount() ) revert NotMintedYet();
        
        return string(
            abi.encodePacked( baseURI(), Strings.toString(id), ".json" )
        );
    }

    function name() public view virtual override(ERC721) returns (string memory) {
        return _readString(_NAME_SLOT);
    }

    function symbol() public view virtual override(ERC721) returns (string memory) {
        return _readString(_SYMBOL_SLOT);
    }

    function baseURI() public view returns (string memory) {
        return _readString(_BASE_URI_SLOT);
    }

    function totalSupply() public view returns (uint256) {
        return liveSupply();
    }

    ////////////////////////////////////////////////////////////////
    //                     REQUIRED OVERRIDES                     //
    ////////////////////////////////////////////////////////////////

    function supportsInterface(bytes4 interfaceId) 
        public 
        pure 
        virtual override(ERC721, ERC2981) 
        returns (bool) 
    {
        return
            // ERC165 Interface ID for ERC165
            interfaceId == 0x01ffc9a7 ||
            // ERC165 Interface ID for ERC721
            interfaceId == 0x80ac58cd ||
            // ERC165 Interface ID for ERC721Metadata
            interfaceId == 0x5b5e139f ||
            // ERC165 Interface ID for ERC2981
            interfaceId == 0x2a55205a;
    }
}
