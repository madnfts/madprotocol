// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.4;

import { ERC1155LazyEventsAndErrors } from "../Base/interfaces/ERC1155EventAndErrors.sol";
import { ERC1155B as ERC1155, ERC1155TokenReceiver } from "../Base/ERC1155B.sol";
import { ERC2981 } from "../../common/ERC2981.sol";
import { ERC20 } from "../../ERC20.sol";
import { ReentrancyGuard } from "../../../security/ReentrancyGuard.sol";
import { SplitterImpl } from "../../../splitter/SplitterImpl.sol";
import { Counters } from "../../../utils/Counters.sol";
import { Strings } from "../../../utils/Strings.sol";
import { Owned } from "../../../auth/Owned.sol";
import { SafeTransferLib } from "../../../utils/SafeTransferLib.sol";
import { Types } from "../../../../Types.sol";

contract ERC1155Lazy is
    ERC1155,
    ERC2981,
    ERC1155LazyEventsAndErrors,
    ERC1155TokenReceiver,
    Owned,
    ReentrancyGuard
{
    using Counters for Counters.Counter;
    using Strings for uint256;
    using Types for Types.Voucher;
    using Types for Types.UserBatch;

    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    uint256 internal immutable _CHAIN_ID_OG;

    bytes32 internal immutable _DOMAIN_SEPARATOR_OG;

    bytes32 private constant _DOMAIN_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );

    bytes32 private constant _VOUCHER_TYPEHASH =
        keccak256(
            "Voucher(bytes32 voucherId,address[] users,uint256 amount,uint256 price)"
        );

    bytes32 private constant _USERBATCH_TYPEHASH =
        keccak256(
            "UserBatch(bytes32 voucherId,uint256[] ids,uint256 price,address user)"
        );

    /// @dev The signer address used for lazy minting voucher validation.
    address private signer;

    Counters.Counter private liveSupply;

    string private _uri;

    SplitterImpl public splitter;

    mapping(bytes32 => bool) public usedVouchers;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(
        string memory __uri,
        SplitterImpl _splitter,
        uint96 _fraction,
        address _router,
        address _signer
    ) Owned(_router) {
        _CHAIN_ID_OG = block.chainid;
        _DOMAIN_SEPARATOR_OG = computeDS();
        signer = _signer;
        _uri = __uri;
        splitter = _splitter;

        _royaltyFee = _fraction;
        _royaltyRecipient = payable(splitter);

        emit SignerUpdated(_signer);
        emit RoyaltyFeeSet(_royaltyFee);
        emit RoyaltyRecipientSet(_royaltyRecipient);
    }

    ////////////////////////////////////////////////////////////////
    //                        LAZY MINT                           //
    ////////////////////////////////////////////////////////////////

    /// @notice This method enables offchain ledgering of tokens to establish onchain provenance as
    /// long as a trusted signer can be retrieved as the validator of such contract state update.
    /// @dev Neither `totalSupply` nor `price` accountings for any of the possible mint
    /// types(e.g., public, free/gifted, toCreator) need to be recorded by the contract;
    /// since its condition checking control flow takes place in offchain databases.
    function lazyMint(
        Types.Voucher calldata voucher,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable nonReentrant {
        address _signer = _verifyVoucher(voucher, v, r, s);
        _voucherCheck(_signer, voucher);
        usedVouchers[voucher.voucherId] = true;
        uint256 len = voucher.users.length;
        uint256 i;
        for (i; i < len; ) {
            _userMint(voucher.amount, voucher.users[i]);
            // can't overflow due to have been previously validated by signer
            unchecked {
                ++i;
            }
        }
    }

    /// @notice `_batchMint` version of `lazyMint`.
    function lazyMintBatch(
        Types.UserBatch calldata userBatch,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable nonReentrant {
        address _signer = _verifyBatch(userBatch, v, r, s);
        _batchCheck(_signer, userBatch);
        usedVouchers[userBatch.voucherId] = true;

        uint256 len = userBatch.ids.length;
        uint256 i;
        for (i; i < len; ) {
            liveSupply.increment();
            // can't overflow due to have been previously validated by signer
            unchecked {
                ++i;
            }
        }
        _batchMint(userBatch.user, userBatch.ids, "");
    }

    ////////////////////////////////////////////////////////////////
    //                         OWNER FX                           //
    ////////////////////////////////////////////////////////////////

    /// @dev Can only be updated by the Router's owner.
    function setSigner(address _signer) public onlyOwner {
        signer = _signer;

        emit SignerUpdated(_signer);
    }

    /// @notice Changes the `_uri` value in storage.
    /// @dev Can only be accessed by the collection creator.
    function setURI(string memory __uri) external onlyOwner {
        _uri = __uri;

        emit BaseURISet(__uri);
    }

    /// @dev Burns an arbitrary length array of ids of different owners.
    function burn(uint256[] memory ids) external onlyOwner {
        uint256 i;
        uint256 len = ids.length;
        // for (uint256 i = 0; i < ids.length; i++) {
        for (i; i < len; ) {
            // delId();
            liveSupply.decrement();
            _burn(ids[i]);
            unchecked {
                ++i;
            }
        }
        assembly {
            if lt(i, len) {
                mstore(0x00, "LOOP_OVERFLOW")
                revert(0x00, 0x20)
            }
        }
        // Transfer events emited by parent ERC1155 contract
    }

    /// @dev Burns an arbitrary length array of ids owned by a single account.
    function burnBatch(address from, uint256[] memory ids)
        external
        onlyOwner
    {
        uint256 i;
        uint256 len = ids.length;
        for (i; i < len; ) {
            // delId();
            liveSupply.decrement();
            unchecked {
                ++i;
            }
        }
        assembly {
            if lt(i, len) {
                mstore(0x00, "LOOP_OVERFLOW")
                revert(0x00, 0x20)
            }
        }
        _batchBurn(from, ids);
        // Transfer event emited by parent ERC1155 contract
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
    //                          HELPER FX                         //
    ////////////////////////////////////////////////////////////////

    function _nextId() private returns (uint256) {
        liveSupply.increment();
        return liveSupply.current();
    }

    /// @dev Checks for signer validity and if total balance provided in the message matches to voucher's record.
    function _voucherCheck(
        address _signer,
        Types.Voucher calldata voucher
    ) private view {
        if (_signer != signer) revert InvalidSigner();
        if (usedVouchers[voucher.voucherId] == true)
            revert UsedVoucher();
        if (
            msg.value !=
            (voucher.price *
                voucher.amount *
                voucher.users.length)
        ) revert WrongPrice();
    }

    /// @dev Checks for signer validity and if total balance provided in the message matches to voucher's record.
    function _batchCheck(
        address _signer,
        Types.UserBatch calldata userBatch
    ) private view {
        if (_signer != signer) revert InvalidSigner();
        if (usedVouchers[userBatch.voucherId] == true)
            revert UsedVoucher();
        if (
            msg.value !=
            (userBatch.price * userBatch.ids.length)
        ) revert WrongPrice();
    }

    function _verifyVoucher(
        Types.Voucher calldata _voucher,
        // bytes calldata _sig
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal view returns (address recovered) {
        unchecked {
            recovered = ecrecover(
                keccak256(
                    abi.encodePacked(
                        "\x19\x01",
                        DOMAIN_SEPARATOR(),
                        keccak256(
                            abi.encode(
                                _VOUCHER_TYPEHASH,
                                _voucher.voucherId,
                                keccak256(
                                    abi.encodePacked(
                                        _voucher.users
                                    )
                                ),
                                _voucher.amount,
                                _voucher.price
                            )
                        )
                    )
                ),
                v,
                r,
                s
            );
        }
    }

    function _verifyBatch(
        Types.UserBatch calldata _userBatch,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal view returns (address recovered) {
        unchecked {
            recovered = ecrecover(
                keccak256(
                    abi.encodePacked(
                        "\x19\x01",
                        DOMAIN_SEPARATOR(),
                        keccak256(
                            abi.encode(
                                _USERBATCH_TYPEHASH,
                                _userBatch.voucherId,
                                keccak256(
                                    abi.encodePacked(
                                        _userBatch.ids
                                    )
                                ),
                                _userBatch.price,
                                _userBatch.user
                            )
                        )
                    )
                ),
                v,
                r,
                s
            );
        }
    }

    function computeDS() internal view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    _DOMAIN_TYPEHASH,
                    keccak256(bytes("MAD")),
                    keccak256("1"),
                    block.chainid,
                    address(this)
                )
            );
    }

    function _userMint(uint256 _amount, address _key)
        internal
    {
        uint256 j;
        while (j < _amount) {
            _mint(_key, _nextId(), "");
            // can't overflow due to have been previously validated by signer
            unchecked {
                ++j;
            }
        }
    }

    ////////////////////////////////////////////////////////////////
    //                           VIEW FX                          //
    ////////////////////////////////////////////////////////////////

    function getURI() external view returns (string memory) {
        return _uri;
    }

    function uri(uint256 id)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (id > totalSupply()) revert NotMintedYet();
        return
            string(
                abi.encodePacked(
                    _uri,
                    Strings.toString(id),
                    ".json"
                )
            );
    }

    function totalSupply() public view returns (uint256) {
        return liveSupply.current();
    }

    function DOMAIN_SEPARATOR()
        public
        view
        returns (bytes32)
    {
        return
            block.chainid == _CHAIN_ID_OG
                ? _DOMAIN_SEPARATOR_OG
                : computeDS();
    }

    ////////////////////////////////////////////////////////////////
    //                     REQUIRED OVERRIDES                     //
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
