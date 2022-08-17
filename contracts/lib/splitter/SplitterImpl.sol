// SPDX-License-Identifier: AGPL-3.0-only

/// @title Payment splitter base contract that allows to split Ether payments among a group of accounts.
/// @author Modified from OpenZeppelin Contracts
/// (https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/finance/PaymentSplitter.sol)

pragma solidity 0.8.4;

import "../utils/SafeTransferLib.sol";

// import "./Address.sol";

/// @notice The split can be in equal parts or in any other arbitrary proportion.
/// The way this is specified is by assigning each account to a number of shares.
/// Of all the Ether that this contract receives, each account will then be able to claim
/// an amount proportional to the percentage of total shares they were assigned.

/// @dev `PaymentSplitter` follows a _pull payment_ model. This means that payments are not
/// automatically forwarded to the accounts but kept in this contract, and the actual transfer
/// is triggered asa separate step by calling the {release} function.

/// @dev This contract assumes that ERC20 tokens will behave similarly to native tokens (Ether).
/// Rebasing tokens, and tokens that apply fees during transfers, are likely to not be supported
/// as expected. If in doubt, we encourage you to run tests before sending real value to this contract.

contract SplitterImpl {
    event PayeeAdded(address account, uint256 shares);
    event PaymentReleased(address to, uint256 amount);
    event PaymentReceived(address from, uint256 amount);
    event ERC20PaymentReleased(
        ERC20 indexed token,
        address to,
        uint256 amount
    );

    uint256 private _totalShares;
    uint256 private _totalReleased;

    mapping(address => uint256) private _shares;
    mapping(address => uint256) private _released;
    address[] private _payees;

    mapping(ERC20 => uint256) private _erc20TotalReleased;
    mapping(ERC20 => mapping(address => uint256))
        private _erc20Released;

    /// @dev Creates an instance of `PaymentSplitter` where each account in `payees`
    /// is assigned the number of shares at the matching position in the `shares` array.
    /// @dev All addresses in `payees` must be non-zero. Both arrays must have the same
    /// non-zero length, and there must be no duplicates in `payees`.
    constructor(
        address[] memory payees,
        uint256[] memory shares_
    ) payable {
        require(
            payees.length == shares_.length,
            "LENGTH_MISMATCH"
        );
        require(
            payees.length != 0, /* > 0 */
            "NO_PAYEES"
        );
        uint256 i;
        uint256 len = payees.length;
        for (i; i < len; ) {
            _addPayee(payees[i], shares_[i]);
            unchecked {
                ++i;
            }
        }
        // no risk of loop overflow since payees are bounded by factory parameters
    }

    /// @dev The Ether received will be logged with {PaymentReceived} events.
    /// Note that these events are not fully reliable: it's possible for a contract
    /// to receive Ether without triggering this function. This only affects the
    /// reliability of the events, and not the actual splitting of Ether.
    receive() external payable virtual {
        emit PaymentReceived(msg.sender, msg.value);
    }

    /// @dev Getter for the total shares held by payees.
    function totalShares() public view returns (uint256) {
        return _totalShares;
    }

    /// @dev Getter for the total amount of Ether already released.
    function totalReleased() public view returns (uint256) {
        return _totalReleased;
    }

    /// @dev Getter for the total amount of `token` already released.
    /// `token` should be the address of an ERC20 contract.
    function totalReleased(ERC20 token)
        public
        view
        returns (uint256)
    {
        return _erc20TotalReleased[token];
    }

    /// @dev Getter for the amount of shares held by an account.
    function shares(address account)
        public
        view
        returns (uint256)
    {
        return _shares[account];
    }

    /// @dev Getter for the amount of Ether already released to a payee.
    function released(address account)
        public
        view
        returns (uint256)
    {
        return _released[account];
    }

    /// @dev Getter for the amount of `token` tokens already released to a payee.
    /// `token` should be the address of an ERC20 contract.
    function released(ERC20 token, address account)
        public
        view
        returns (uint256)
    {
        return _erc20Released[token][account];
    }

    /// @dev Getter for the address of the payee number `index`.
    function payee(uint256 index)
        public
        view
        returns (address)
    {
        return _payees[index];
    }

    /// @dev Getter for the amount of payee's releasable Ether.
    function releasable(address account)
        public
        view
        returns (uint256)
    {
        uint256 totalReceived = address(this).balance +
            totalReleased();
        return
            _pendingPayment(
                account,
                totalReceived,
                released(account)
            );
    }

    /// @dev Getter for the amount of payee's releasable `token` tokens.
    /// `token` should be the address of an ERC20 contract.
    function releasable(ERC20 token, address account)
        public
        view
        returns (uint256)
    {
        uint256 totalReceived = token.balanceOf(
            address(this)
        ) + totalReleased(token);
        return
            _pendingPayment(
                account,
                totalReceived,
                released(token, account)
            );
    }

    /// @dev Triggers a transfer to `account` of the amount of Ether they are owed,
    /// according to their percentage of the total shares and their previous withdrawals.
    function release(address payable account) public virtual {
        require(
            _shares[account] != 0, /* > 0 */
            "NO_SHARES"
        );

        uint256 payment = releasable(account);

        require(payment != 0, "DENIED_ACCOUNT");
        // require(
        //     address(this).balance >= payment,
        //     "INSUFFICIENT_BALANCE"
        // );

        _released[account] += payment;
        _totalReleased += payment;

        // Address.sendValue(account, payment);
        SafeTransferLib.safeTransferETH(account, payment);
        emit PaymentReleased(account, payment);
    }

    /// @dev Triggers a transfer to `account` of the amount of `token` tokens
    /// they are owed, according to their percentage of the total shares and
    /// their previous withdrawals. `token` must be the address of an ERC20 contract.
    function release(ERC20 token, address account)
        public
        virtual
    {
        require(
            _shares[account] != 0, /* > 0 */
            "NO_SHARES"
        );

        uint256 payment = releasable(token, account);

        require(payment != 0, "DENIED_ACCOUNT");
        // require(
        //     token.balanceOf(address(this)) >= payment,
        //     "INSUFFICIENT_BALANCE"
        // );

        _erc20Released[token][account] += payment;
        _erc20TotalReleased[token] += payment;

        SafeTransferLib.safeTransfer(token, account, payment);
        emit ERC20PaymentReleased(token, account, payment);
    }

    /// @dev internal logic for computing the pending payment of an `account`,
    /// given the token historical balances and already released amounts.
    function _pendingPayment(
        address account,
        uint256 totalReceived,
        uint256 alreadyReleased
    ) private view returns (uint256) {
        return
            (totalReceived * _shares[account]) /
            _totalShares -
            alreadyReleased;
    }

    /// @dev Add a new payee to the contract.
    /// @param account The address of the payee to add.
    /// @param shares_ The number of shares owned by the payee.
    function _addPayee(address account, uint256 shares_)
        private
    {
        require(account != address(0), "DEAD_ADDRESS");
        require(
            shares_ != 0, /* > 0 */
            "INVALID_SHARE"
        );
        require(_shares[account] == 0, "ALREADY_PAYEE");

        _payees.push(account);
        _shares[account] = shares_;
        _totalShares = _totalShares + shares_;
        emit PayeeAdded(account, shares_);
    }
}
