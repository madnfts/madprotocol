// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

import { ImplBase, SplitterImpl, ERC20, ERC2981, Counters, Strings, SafeTransferLib } from "contracts/MADTokens/common/ImplBase.sol";
import { ERC721, ERC721TokenReceiver } from "contracts/lib/tokens/ERC721/Base/ERC721.sol";

import { Types } from "contracts/Shared/Types.sol";

contract ERC721Basic is ERC721, ImplBase, ERC721TokenReceiver {
    using Counters for Counters.Counter;
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
            /*  */
            args._baseURI,
            args._price,
            args._maxSupply,
            args._splitter,
            args._fraction,
            args._router
            /*  */
        )
        ERC721(args._name, args._symbol)
    {
        erc20 = args._erc20;
        _extraArgsCheck(_extra);
    }

    ////////////////////////////////////////////////////////////////
    //                       OWNER MINTING                        //
    ////////////////////////////////////////////////////////////////

    function mintTo(
        address to,
        uint256 amount,
        address erc20Owner
    ) external payable authorised nonReentrant hasReachedMax(amount) {
        _paymentCheck(erc20Owner, 0);
        uint256 i;
        for (i; i < amount; ) {
            _safeMint(to, _incrementCounter());
            unchecked {
                ++i;
            }
        }
        _loopOverflow(i, amount);
        // Transfer event emited by parent ERC721 contract
    }

    function burn(uint256[] memory ids, address erc20Owner) external payable authorised {
        _paymentCheck(erc20Owner, 1);

        uint256 i;
        uint256 len = ids.length;
        for (i; i < len; ) {
            // delId();
            liveSupply.decrement();
            _burn(ids[i]);
            unchecked {
                ++i;
            }
        }
        _loopOverflow(i, len);
        // Transfer event emited by parent ERC721 contract
    }

    ////////////////////////////////////////////////////////////////
    //                          PUBLIC FX                         //
    ////////////////////////////////////////////////////////////////

    function mint(
        uint256 amount
    ) external payable nonReentrant publicMintAccess hasReachedMax(amount) publicMintPriceCheck(price, amount) {
        _paymentCheck(msg.sender, 2);
        uint256 i;
        for (i; i < amount; ) {
            _safeMint(msg.sender, _incrementCounter());
            unchecked {
                ++i;
            }
        }

        _loopOverflow(i, amount);
        // Transfer event emited by parent ERC721 contract
    }

    ////////////////////////////////////////////////////////////////
    //                           VIEW FX                          //
    ////////////////////////////////////////////////////////////////

    function tokenURI(uint256 id) public view virtual override(ERC721) returns (string memory) {
        if (id > mintCount) revert NotMintedYet();
        return string(abi.encodePacked(baseURI, Strings.toString(id), ".json"));
    }

    ////////////////////////////////////////////////////////////////
    //                     REQUIRED OVERRIDES                     //
    ////////////////////////////////////////////////////////////////

    function supportsInterface(bytes4 interfaceId) public pure virtual override(ERC721, ERC2981) returns (bool) {
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
