// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.4;

import { ERC1155MinimalEventsAndErrors } from "../Base/interfaces/ERC1155EventAndErrors.sol";
import { ERC1155B as ERC1155, ERC1155TokenReceiver } from "../Base/ERC1155B.sol";
import { ERC2981 } from "../../common/ERC2981.sol";
import { ERC20 } from "../../ERC20.sol";
import { SplitterImpl } from "../../../splitter/SplitterImpl.sol";
import { Owned } from "../../../auth/Owned.sol";
import { SafeTransferLib } from "../../../utils/SafeTransferLib.sol";

contract ERC1155Minimal is
    ERC1155,
    ERC2981,
    ERC1155MinimalEventsAndErrors,
    ERC1155TokenReceiver,
    Owned
{
    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    SplitterImpl public splitter;
    uint256 public price;
    string private _uri;
    /// @dev  default := false
    bool private minted;
    /// @dev  default := false
    bool public publicMintState;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    /// @dev The fee of royalties denominator is 10000 in BPS.
    constructor(
        string memory _tokenURI,
        uint256 _price,
        SplitterImpl _splitter,
        uint96 _fraction,
        address _router
    ) Owned(_router) {
        _uri = _tokenURI;
        price = _price;
        splitter = _splitter;
        _royaltyFee = _fraction;
        _royaltyRecipient = payable(splitter);

        emit RoyaltyFeeSet(_royaltyFee);
        emit RoyaltyRecipientSet(_royaltyRecipient);
    }

    ////////////////////////////////////////////////////////////////
    //                          OWNER FX                          //
    ////////////////////////////////////////////////////////////////

    /// @dev Can't be reminted if already minted, due to boolean.
    function safeMint(address to) external onlyOwner {
        if (minted == true) revert AlreadyMinted();

        minted = true;
        _mint(to, 1, "");
    }

    /// @dev Can't be reburnt since `minted` is not updated to false.
    function burn() external onlyOwner {
        _burn(1);
    }

    function setPublicMintState(bool _publicMintState)
        external
        onlyOwner
    {
        publicMintState = _publicMintState;

        emit PublicMintStateSet(publicMintState);
    }

    function withdraw() external onlyOwner {
        uint256 len = splitter.payeesLength();
        address[] memory addrs = new address[](len);
        uint256[] memory values = new uint256[](len);
        uint256 _val = address(this).balance;
        uint256 i;
        for (i; i < len; ) {
            address addr = splitter._payees(i);
            uint256 share = splitter._shares(addr);
            addrs[i] = addr;
            values[i] = ((_val * (share * 1e2)) / 10_000);
            unchecked {
                ++i;
            }
        }
        uint256 j;
        while (j < len) {
            SafeTransferLib.safeTransferETH(
                addrs[j],
                values[j]
            );
            unchecked {
                ++j;
            }
        }
    }

    function withdrawERC20(ERC20 _token) external onlyOwner {
        uint256 len = splitter.payeesLength();
        address[] memory addrs = new address[](len);
        uint256[] memory values = new uint256[](len);
        uint256 i;
        uint256 _val = _token.balanceOf(address(this));
        for (i; i < len; ) {
            address addr = splitter._payees(i);
            uint256 share = splitter._shares(addr);
            addrs[i] = addr;
            values[i] = ((_val * (share * 1e2)) / 10_000);
            unchecked {
                ++i;
            }
        }
        uint256 j;
        while (j < len) {
            SafeTransferLib.safeTransfer(
                _token,
                addrs[j],
                values[j]
            );
            unchecked {
                ++j;
            }
        }
    }

    ////////////////////////////////////////////////////////////////
    //                           USER FX                          //
    ////////////////////////////////////////////////////////////////

    function publicMint() external payable {
        if (!publicMintState) revert PublicMintOff();
        if (msg.value != price) revert WrongPrice();
        if (minted == true) revert AlreadyMinted();

        minted = true;
        _mint(msg.sender, 1, "");
    }

    ////////////////////////////////////////////////////////////////
    //                           VIEW FX                          //
    ////////////////////////////////////////////////////////////////

    function uri(uint256 id)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (id != 1) revert InvalidId();
        if (!minted) revert NotMinted();
        return _uri;
    }

    ////////////////////////////////////////////////////////////////
    //                      REQUIRED OVERRIDES                    //
    ////////////////////////////////////////////////////////////////

    function supportsInterface(bytes4 interfaceId)
        public
        pure
        virtual
        override(ERC2981)
        returns (bool)
    {
        return
            // ERC165 Interface ID for ERC165
            interfaceId == 0x01ffc9a7 ||
            // ERC165 Interface ID for ERC1155
            interfaceId == 0xd9b67a26 ||
            // ERC165 Interface ID for ERC1155MetadataURI
            interfaceId == 0x0e89341c ||
            // ERC165 Interface ID for ERC2981
            interfaceId == 0x2a55205a;
    }
}
