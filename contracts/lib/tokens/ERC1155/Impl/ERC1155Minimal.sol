// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.16;

import { ERC1155MinimalEventsAndErrors } from "../Base/interfaces/ERC1155EventAndErrors.sol";
import { ERC1155B as ERC1155, ERC1155TokenReceiver } from "../Base/ERC1155B.sol";
import { ERC2981 } from "../../common/ERC2981.sol";
import { ERC20 } from "../../ERC20.sol";
import { SplitterImpl } from "../../../splitter/SplitterImpl.sol";
import { Owned } from "../../../auth/Owned.sol";
import { SafeTransferLib } from "../../../utils/SafeTransferLib.sol";
import { FeeOracle } from "../../common/FeeOracle.sol";

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
    ERC20 public erc20;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    /// @dev The fee of royalties denominator is 10000 in BPS.
    constructor(
        string memory _tokenURI,
        uint256 _price,
        SplitterImpl _splitter,
        uint96 _fraction,
        address _router,
        ERC20 _erc20
    ) Owned(_router) {
        _uri = _tokenURI;
        price = _price;
        splitter = _splitter;
        _royaltyFee = _fraction;
        _royaltyRecipient = payable(splitter);
        erc20 = _erc20;

        emit RoyaltyFeeSet(_royaltyFee);
        emit RoyaltyRecipientSet(_royaltyRecipient);
    }

    ////////////////////////////////////////////////////////////////
    //                          OWNER FX                          //
    ////////////////////////////////////////////////////////////////

    /// @dev Can't be reminted if already minted, due to boolean, amount cant be > 1.
    /// @dev Allows msg.value payments only if !erc20
    function safeMint(address to, uint256 amount) external payable onlyOwner {
        if (address(erc20) != address(0)) revert("INVALID_TYPE");
        _feeCheck(0x40d097c3, msg.value);
        if (minted) revert AlreadyMinted();
        if (amount > 1) revert InvalidId();

        minted = true;
        _mint(to, 1, amount, "");
    }

    /// @dev Can't be reminted if already minted, due to boolean, amount cant be > 1.
    /// @dev Allows erc20 payments only if erc20 exists
    /// @dev msg.sender = router
    /// @dev erc20Owner = paying user
    function safeMint(address to, uint256 amount, address erc20Owner) external payable onlyOwner {
        if (address(erc20) == address(0)) revert("INVALID_TYPE");
        uint256 value = erc20.allowance(erc20Owner, address(this));
        _feeCheck(0x40d097c3, value);
        if (minted) revert AlreadyMinted();
        if (amount > 1) revert InvalidId();

        SafeTransferLib.safeTransferFrom(erc20, erc20Owner, address(this), value);
        minted = true;
        _mint(to, 1, amount, "");
    }

    /// @dev Can't be reburnt since `minted` is not updated to false.
    /// @dev Allows msg.value payments only if !erc20
    function burn(address to, uint256 amount) external payable onlyOwner {
        if (address(erc20) != address(0)) revert("INVALID_TYPE");
        _feeCheck(0x44df8e70, msg.value);
        _burn(to, 1, amount);
    }

    /// @dev Can't be reburnt since `minted` is not updated to false.
    /// @dev Allows erc20 payments only if erc20 exists
    function burn(address to, uint256 amount, address erc20Owner) external payable onlyOwner {
        if (address(erc20) == address(0)) revert("INVALID_TYPE");
        uint256 value = erc20.allowance(erc20Owner, address(this));
        _feeCheck(0x44df8e70, value);
        SafeTransferLib.safeTransferFrom(erc20, erc20Owner, address(this), value);
        _burn(to, 1, amount);
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

    /// @dev Allows msg.value payments only if !erc20
    function publicMint(uint256 balance) external payable {
        if (address(erc20) != address(0)) revert("INVALID_TYPE");
        if (!publicMintState) revert PublicMintOff();
        if (msg.value != price) revert WrongPrice();
        if (minted) revert AlreadyMinted();

        minted = true;
        _mint(msg.sender, 1, balance, "");
    }

    /// @dev Allows erc20 payments only if erc20 exists
    function publicMint(uint256 balance, address erc20Owner) external payable {
        if (address(erc20) == address(0)) revert("INVALID_TYPE");
        if (!publicMintState) revert PublicMintOff();
        uint256 value = erc20.allowance(erc20Owner, address(this));
        if (value != price) revert WrongPrice();
        if (minted) revert AlreadyMinted();
        
        SafeTransferLib.safeTransferFrom(erc20, erc20Owner, address(this), value);
        minted = true;
        _mint(msg.sender, 1, balance, "");
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
    //                     INTERNAL FUNCTIONS                     //
    ////////////////////////////////////////////////////////////////

    function _feeCheck(bytes4 _method, uint256 _value) internal view {
        address _owner = owner;
        uint32 size;
        assembly {
            size := extcodesize(_owner)
        }
        if (size == 0) {
            return; 
        }
        uint256 _fee = FeeOracle(owner).feeLookup(_method);
        assembly {
            if iszero(eq(_value, _fee)) {
                mstore(0x00, 0xf7760f25)
                revert(0x1c, 0x04)
            }
        }
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
