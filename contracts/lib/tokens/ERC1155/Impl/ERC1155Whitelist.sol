// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.4;

import { ERC1155WhitelistEventsAndErrors } from "../Base/interfaces/ERC1155EventAndErrors.sol";
import { ERC1155B as ERC1155, ERC1155TokenReceiver } from "../Base/ERC1155B.sol";
import { ERC2981 } from "../../common/ERC2981.sol";
import { ERC20 } from "../../ERC20.sol";

import { Owned } from "../../../auth/Owned.sol";
import { ReentrancyGuard } from "../../../security/ReentrancyGuard.sol";
import { MerkleProof } from "../../../utils/MerkleProof.sol";
import { SplitterImpl } from "../../../splitter/SplitterImpl.sol";
import { Counters } from "../../../utils/Counters.sol";
import { Strings } from "../../../utils/Strings.sol";
import { SafeTransferLib } from "../../../utils/SafeTransferLib.sol";
import { FeeOracle } from "../../common/FeeOracle.sol";

contract ERC1155Whitelist is
    ERC1155,
    ERC2981,
    ERC1155WhitelistEventsAndErrors,
    ERC1155TokenReceiver,
    Owned,
    ReentrancyGuard
{
    using Counters for Counters.Counter;
    using Strings for uint256;

    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    Counters.Counter private liveSupply;

    string private _uri;
    uint256 public publicPrice;
    uint256 public maxSupply;

    /// @dev default := false.
    bool public publicMintState;
    SplitterImpl public splitter;

    // merkle
    uint256 public whitelistPrice;
    uint256 public maxWhitelistSupply;
    bytes32 public whitelistMerkleRoot;
    /// @dev default := false.
    bool public whitelistMintState;
    /// @dev Current whitelist supply.
    uint256 public whitelistMinted;

    // free
    uint256 public maxFree;
    uint256 public freeSupply;
    bytes32 public claimListMerkleRoot;
    /// @dev default := false
    bool public freeClaimState;
    /// @dev Default amount to be claimed as free in a collection.
    uint256 public freeAmount;
    /// @dev Stores the amount of whitelist minted tokens of an address.
    /// @dev For fetching purposes and max free claim control.
    mapping(address => bool) public claimed;

    ////////////////////////////////////////////////////////////////
    //                          MODIFIERS                         //
    ////////////////////////////////////////////////////////////////

    modifier publicMintAccess() {
        if (!publicMintState) revert PublicMintClosed();
        _;
    }

    modifier whitelistMintAccess() {
        if (!whitelistMintState) revert WhitelistMintClosed();
        _;
    }

    modifier freeClaimAccess() {
        if (!freeClaimState) revert FreeClaimClosed();
        _;
    }

    modifier hasReachedMax(uint256 amount) {
        if (
            totalSupply() + amount >
            maxSupply - maxWhitelistSupply - maxFree
        ) revert MaxMintReached();
        _;
    }

    modifier canMintFree(uint256 amount) {
        if (freeSupply + amount > maxFree)
            revert MaxFreeReached();
        if (totalSupply() + amount > maxSupply)
            revert MaxMintReached();
        _;
    }

    modifier whitelistMax(uint8 amount) {
        if (whitelistMinted + amount > maxWhitelistSupply)
            revert MaxWhitelistReached();
        if (totalSupply() + amount > maxSupply)
            revert MaxMintReached();
        _;
    }

    modifier priceCheck(uint256 _price, uint256 amount) {
        if (_price * amount != msg.value) revert WrongPrice();
        _;
    }

    modifier balanceMatchesTotal(uint256 amount, uint256[] memory balances, uint256 balanceTotal) {
        uint256 i;
        uint256 total = balanceTotal;
        for (i; i < balances.length;) {
            total = total - balances[i++];
        }

        require(total == 0 && amount == balances.length, "INVALID_AMOUNT");
        _;
    }

    modifier merkleVerify(
        bytes32[] calldata merkleProof,
        bytes32 root
    ) {
        if (
            !MerkleProof.verify(
                merkleProof,
                root,
                bytes32(uint256(uint160(msg.sender)))
            )
        ) revert AddressDenied();
        _;
    }

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(
        string memory __uri,
        uint256 _price,
        uint256 _maxSupply,
        SplitterImpl _splitter,
        uint96 _fraction,
        address _router
    ) Owned(_router) {
        _uri = __uri;
        publicPrice = _price;
        maxSupply = _maxSupply;
        splitter = _splitter;

        _royaltyFee = _fraction;
        _royaltyRecipient = payable(splitter);

        emit RoyaltyFeeSet(_royaltyFee);
        emit RoyaltyRecipientSet(_royaltyRecipient);
    }

    ////////////////////////////////////////////////////////////////
    //                         OWNER FX                           //
    ////////////////////////////////////////////////////////////////

    function whitelistConfig(
        uint256 _price,
        uint256 _supply,
        bytes32 _root
    ) external onlyOwner {
        whitelistPrice = _price;
        maxWhitelistSupply = _supply;
        whitelistMerkleRoot = _root;

        emit WhitelistConfigSet(_price, _supply, _root);
    }

    function freeConfig(
        uint256 _freeAmount,
        uint256 _maxFree,
        bytes32 _claimListMerkleRoot
    ) external onlyOwner {
        freeAmount = _freeAmount;
        maxFree = _maxFree;
        claimListMerkleRoot = _claimListMerkleRoot;

        emit FreeConfigSet(
            _freeAmount,
            _maxFree,
            _claimListMerkleRoot
        );
    }

    function setURI(string memory __uri) external onlyOwner {
        _uri = __uri;

        emit BaseURISet(__uri);
    }

    function setPublicMintState(bool _publicMintState)
        external
        onlyOwner
    {
        publicMintState = _publicMintState;

        emit PublicMintStateSet(_publicMintState);
    }

    function setWhitelistMintState(bool _whitelistMintState)
        external
        onlyOwner
    {
        whitelistMintState = _whitelistMintState;

        emit WhitelistMintStateSet(_whitelistMintState);
    }

    function setFreeClaimState(bool _freeClaimState)
        external
        onlyOwner
    {
        freeClaimState = _freeClaimState;

        emit FreeClaimStateSet(_freeClaimState);
    }

    /// @dev Burns an arbitrary length array of ids of different owners.
    function burn(address[] memory owners, uint256[] memory ids, uint256[] memory amounts) external payable onlyOwner {
        _feeCheck(0x44df8e70);
        uint256 i;
        uint256 len = ids.length;
        require(len == owners.length && len == amounts.length, "INVALID_AMOUNT");
        for (i; i < len; ) {
            liveSupply.decrement();
            _burn(owners[i], ids[i], amounts[i]);
            unchecked {
                ++i;
            }
        }
        assembly {
            if lt(i, len) {
                mstore(0x00, 0xdfb035c9)
                revert(0x1c, 0x04)
            }
        }
        // Transfer events emited by parent ERC1155 contract
    }

    /// @dev Burns an arbitrary length array of ids owned by a single account.
    function burnBatch(address from, uint256[] memory ids, uint256[] memory amounts)
        external
        payable
        onlyOwner
    {
        _feeCheck(0x44df8e70);
        uint256 i;
        uint256 len = ids.length;
        require(len == amounts.length, "INVALID_AMOUNT");
        for (i; i < len; ) {
            // delId();
            liveSupply.decrement();
            unchecked {
                ++i;
            }
        }
        assembly {
            if lt(i, len) {
                mstore(0x00, 0xdfb035c9)
                revert(0x1c, 0x04)
            }
        }
        _batchBurn(from, ids, amounts);
        // Transfer events emited by parent ERC1155 contract
    }

    function mintToCreator(uint256 amount, uint256[] memory balances, uint256 balanceTotal)
        external
        payable
        nonReentrant
        onlyOwner
        canMintFree(balanceTotal)
        balanceMatchesTotal(amount, balances, balanceTotal)
    {
        _feeCheck(0x40d097c3);
        uint256 i;
        freeSupply += balanceTotal;
        for (i; i < amount; ) {
            _mint(tx.origin, _nextId(), balances[i], "");
            unchecked {
                ++i;
            }
        }
        assembly {
            if lt(i, amount) {
                mstore(0x00, 0xdfb035c9)
                revert(0x1c, 0x04)
            }
        }
        // Transfer events emited by parent ERC1155 contract
    }

    function mintBatchToCreator(uint256[] memory ids, uint256[] memory balances, uint256 balanceTotal)
        external
        payable
        nonReentrant
        onlyOwner
        balanceMatchesTotal(ids.length, balances, balanceTotal)
    {
        _feeCheck(0x40d097c3);
        uint256 len = ids.length;

        _canBatchToCreator(balanceTotal);
        freeSupply += balanceTotal;

        uint256 i;

        for (i; i < len; ) {
            liveSupply.increment(balances[i]);
            unchecked {
                ++i;
            }
        }
        assembly {
            if lt(i, len) {
                mstore(0x00, 0xdfb035c9)
                revert(0x1c, 0x04)
            }
        }

        _batchMint(tx.origin, ids, balances, "");
        // Transfer event emitted by parent ERC1155 contract
    }

    /// @dev Mints one token per address.
    function giftTokens(address[] calldata addresses, uint256[] memory balances, uint256 balanceTotal)
        external
        payable
        nonReentrant
        onlyOwner
        canMintFree(balanceTotal)
        balanceMatchesTotal(addresses.length, balances, balanceTotal)
    {
        _feeCheck(0x40d097c3);
        uint256 amountGifted = balanceTotal;
        uint256 len = addresses.length;
        
        freeSupply += amountGifted;

        uint256 i;
        for (i; i < len; ) {
            _mint(addresses[i], _nextId(), balances[i], "");
            unchecked {
                ++i;
            }
        }

        assembly {
            if lt(i, len) {
                mstore(0x00, 0xdfb035c9)
                revert(0x1c, 0x04)
            }
        }
        // Transfer events emitted by parent ERC1155 contract
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

    function mint(uint256 amount, uint256[] memory balances, uint256 balanceTotal)
        external
        payable
        nonReentrant
        publicMintAccess
        hasReachedMax(balanceTotal)
        priceCheck(publicPrice, balanceTotal)
        balanceMatchesTotal(amount, balances, balanceTotal)
    {
        uint256 i;

        for (i; i < amount; ) {
            _mint(msg.sender, _nextId(), balances[i], "");
            unchecked {
                ++i;
            }
        }

        assembly {
            if lt(i, amount) {
                mstore(0x00, 0xdfb035c9)
                revert(0x1c, 0x04)
            }
        }

        // Transfer events emitted by parent ERC1155 contract
    }

    function mintBatch(uint256[] memory ids, uint256[] memory balances)
        external
        payable
        nonReentrant
        publicMintAccess
    {
        uint256 len = ids.length;
        require(len == balances.length, "INVALID_AMOUNT");

        uint256 i;
        uint256 total = liveSupply.current();
        for (i; i < len; ) {
            liveSupply.increment(balances[i]);
            unchecked {
                ++i;
            }
        }
        assembly {
            if lt(i, len) {
                mstore(0x00, 0xdfb035c9)
                revert(0x1c, 0x04)
            }
        }
        _canBatchMint(liveSupply.current() - total);

        _batchMint(msg.sender, ids, balances, "");
        // Transfer event emitted by parent ERC1155 contract
    }

    function whitelistMint(
        uint8 amount,
        uint256[] memory balances,
        uint256 balanceTotal,
        bytes32[] calldata merkleProof
    )
        external
        payable
        nonReentrant
        whitelistMintAccess
        priceCheck(whitelistPrice, balanceTotal)
        merkleVerify(merkleProof, whitelistMerkleRoot)
        whitelistMax(amount)
    {
        uint256 i;
        uint256 total = 0;
        for (i; i < amount; ) {
            total += balances[i];
            _mint(msg.sender, _nextId(), balances[i], "");
            unchecked {
                ++i;
            }
        }
        require(total == balanceTotal, "INVALID_TOTAL");
        unchecked {
            whitelistMinted += balanceTotal;
        }
        // assembly overflow check
        assembly {
            if lt(i, amount) {
                mstore(0x00, 0xdfb035c9)
                revert(0x1c, 0x04)
            }
        }
        // Transfer events emitted by parent ERC1155 contract
    }

    function whitelistMintBatch(
        uint256[] memory ids,
        uint256[] memory balances,
        bytes32[] calldata merkleProof
    )
        external
        payable
        nonReentrant
        whitelistMintAccess
        merkleVerify(merkleProof, whitelistMerkleRoot)
    {
        uint256 len = ids.length;
        require(len == balances.length, "INVALID_AMOUNT");

        uint256 i;
        uint256 total = liveSupply.current();
        unchecked {
            for (i; i < len; ++i) {
                liveSupply.increment(balances[i]);
            }
        }
        // assembly overflow check
        assembly {
            if lt(i, len) {
                mstore(0x00, 0xdfb035c9)
                revert(0x1c, 0x04)
            }
        }

        _canWhitelistBatch(liveSupply.current() - total);
        whitelistMinted += liveSupply.current() - total;

        _batchMint(msg.sender, ids, balances, "");
        // Transfer event emitted in parent ERC1155 contract
    }

    function claimFree(uint256[] memory balances, uint256 balanceTotal, bytes32[] calldata merkleProof)
        external
        freeClaimAccess
        merkleVerify(merkleProof, claimListMerkleRoot)
        canMintFree(freeAmount)
        balanceMatchesTotal(balances.length, balances, balanceTotal)
    {
        if (claimed[msg.sender] == true)
            revert AlreadyClaimed();
        unchecked {
            claimed[msg.sender] = true;
            freeSupply += freeAmount;
        }

        uint256 j;
        while (j < freeAmount) {
            _mint(msg.sender, _nextId(), 1, "");
            unchecked {
                ++j;
            }
        }
        // assembly overflow check
        assembly {
            if lt(j, sload(freeAmount.slot)) {
                mstore(0x00, 0xdfb035c9)
                revert(0x1c, 0x04)
            }
        }
        // Transfer events emitted by parent ERC1155 contract
    }

    ////////////////////////////////////////////////////////////////
    //                          HELPER FX                         //
    ////////////////////////////////////////////////////////////////

    function _nextId() private returns (uint256) {
        liveSupply.increment();
        return liveSupply.current();
    }

    function _canBatchToCreator(uint256 _amount)
        private
        view
    {
        if (freeSupply + _amount > maxFree)
            revert MaxFreeReached();
        if (totalSupply() + _amount > maxSupply)
            revert MaxMintReached();
    }

    function _canBatchMint(uint256 amount) private view {
        if (
            totalSupply() + amount >
            maxSupply - maxWhitelistSupply - maxFree
        ) revert MaxMintReached();
        if (publicPrice * amount != msg.value)
            revert WrongPrice();
    }

    function _canWhitelistBatch(uint256 amount) private view {
        if (whitelistPrice * amount != msg.value)
            revert WrongPrice();
        if (whitelistMinted + amount > maxWhitelistSupply)
            revert MaxWhitelistReached();
        if (totalSupply() + amount > maxSupply)
            revert MaxMintReached();
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
        if (id > totalSupply()) {
            // revert("NotMintedYet");
            assembly {
                mstore(0x00, 0xbad086ea)
                revert(0x1c, 0x04)
            }
        }

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
