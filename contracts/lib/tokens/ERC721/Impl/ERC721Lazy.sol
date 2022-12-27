// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.16;

import { ERC721LazyEventsAndErrors } from "../Base/interfaces/ERC721EventAndErrors.sol";
import { ERC721, ERC721TokenReceiver } from "../Base/ERC721.sol";
import { ERC2981 } from "../../common/ERC2981.sol";
import { ERC20 } from "../../ERC20.sol";
import { ReentrancyGuard } from "../../../security/ReentrancyGuard.sol";
import { SplitterImpl } from "../../../splitter/SplitterImpl.sol";
import { Counters } from "../../../utils/Counters.sol";
import { Strings } from "../../../utils/Strings.sol";
import { Owned } from "../../../auth/Owned.sol";
import { SafeTransferLib } from "../../../utils/SafeTransferLib.sol";
import { Types } from "../../../../Types.sol";
import { FeeOracle } from "../../common/FeeOracle.sol";

contract ERC721Lazy is
    ERC721,
    ERC2981,
    ERC721LazyEventsAndErrors,
    ERC721TokenReceiver,
    Owned,
    ReentrancyGuard
{
    using Counters for Counters.Counter;
    using Strings for uint256;
    using Types for Types.Voucher;

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
            "Voucher(bytes32 voucherId,address[] users,uint256[] balances,uint256 amount,uint256 price)"
        );

    /// @dev The signer address used for lazy minting voucher validation.
    address public signer;

    Counters.Counter private liveSupply;

    string private baseURI;

    SplitterImpl public splitter;

    mapping(bytes32 => bool) public usedVouchers;

    uint256 private mintCount;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
        SplitterImpl _splitter,
        uint96 _fraction,
        address _router,
        address _signer
    ) ERC721(_name, _symbol) Owned(_router) {
        _CHAIN_ID_OG = block.chainid;
        _DOMAIN_SEPARATOR_OG = computeDS();
        signer = _signer;
        baseURI = _baseURI;
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
        address _signer = _verify(voucher, v, r, s);
        _lazyCheck(_signer, voucher);
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

    ////////////////////////////////////////////////////////////////
    //                         OWNER FX                           //
    ////////////////////////////////////////////////////////////////

    /// @dev Can only be updated by the Router's owner.
    function setSigner(address _signer) public onlyOwner {
        signer = _signer;

        emit SignerUpdated(_signer);
    }

    /// @notice Changes the `baseURI` value in storage.
    /// @dev Can only be accessed by the collection creator.
    function setBaseURI(string memory _baseURI)
        external
        onlyOwner
    {
        baseURI = _baseURI;

        emit BaseURISet(_baseURI);
    }

    function burn(uint256[] memory ids) external payable onlyOwner {
        _feeCheck(0x44df8e70);
        uint256 i;
        uint256 len = ids.length;
        // for (uint256 i = 1; i < ids.length; i++) {
        for (i; i < len; ) {
            // delId();
            liveSupply.decrement();
            _burn(ids[i]);
            unchecked {
                ++i;
            }
        }
        // assembly overflow check
        assembly {
            if lt(i, len) {
                mstore(0x00, "LOOP_OVERFLOW")
                revert(0x00, 0x20)
            }
        }
        // Transfer event emited by parent ERC721 contract
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

    function incrementCounter() private returns(uint256){
        _nextId();
        mintCount += 1;
        return mintCount;
    }

    /// @dev Checks for signer validity and if total balance provided in the message matches to voucher's record.
    function _lazyCheck(
        address _signer,
        Types.Voucher calldata voucher
    ) private view {
        if (_signer != signer) revert InvalidSigner();
        if (usedVouchers[voucher.voucherId])
            revert UsedVoucher();
        if (
            msg.value !=
            (voucher.price *
                voucher.amount *
                voucher.users.length)
        ) revert WrongPrice();
    }

    function _verifyVoucher(
        Types.Voucher calldata _voucher,
        // bytes calldata _sig
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view returns (address recovered) {
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
                                keccak256(
                                    abi.encodePacked(
                                        _voucher.balances
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

    function _verify(
        Types.Voucher calldata _voucher,
        // bytes calldata _sig
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view returns (address recovered) {
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
                                keccak256(
                                    abi.encodePacked(
                                        _voucher.balances
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

    function computeDS() internal view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    _DOMAIN_TYPEHASH,
                    keccak256(bytes(name)),
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
            _mint(_key, incrementCounter());
            // can't overflow due to have been previously validated by signer
            unchecked {
                ++j;
            }
        }
    }

    ////////////////////////////////////////////////////////////////
    //                           VIEW FX                          //
    ////////////////////////////////////////////////////////////////

    function getBaseURI()
        external
        view
        returns (string memory)
    {
        return baseURI;
    }

    function tokenURI(uint256 id)
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
                    baseURI,
                    Strings.toString(id),
                    ".json"
                )
            );
    }

    function totalSupply() public view returns (uint256) {
        return liveSupply.current();
    }

    function getMintCount() public view returns(uint256) {
        return mintCount;
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
    //                     INTERNAL FUNCTIONS                     //
    ////////////////////////////////////////////////////////////////

    function _feeCheck(bytes4 _method) internal view {
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
            if iszero(eq(callvalue(), _fee)) {
                mstore(0x00, 0xf7760f25)
                revert(0x1c, 0x04)
            }
        }
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
            interfaceId == 0x01ffc9a7 ||
            // ERC165 Interface ID for ERC721
            interfaceId == 0x80ac58cd ||
            // ERC165 Interface ID for ERC721Metadata
            interfaceId == 0x5b5e139f ||
            // ERC165 Interface ID for ERC2981
            interfaceId == 0x2a55205a;
    }
}
