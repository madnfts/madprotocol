// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

import { EventsAndErrorsBase } from "contracts/Shared/EventsAndErrors.sol";
import { ERC20 } from "contracts/lib/tokens/ERC20.sol";
import { Owned } from "contracts/lib/auth/Owned.sol";

abstract contract MADBase is EventsAndErrorsBase, Owned(msg.sender) {
    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    /// @notice ERC20 payment token address.
    ERC20 public erc20;

    ////////////////////////////////////////////////////////////////
    //                         OWNER FX                           //
    ////////////////////////////////////////////////////////////////

    /// @notice Enables the contract's owner to change payment token address.
    /// @dev Function Signature := 0x46e36a79
    function _setPaymentToken(address _paymentTokenAddress) internal {
        // require(_paymentTokenAddress != address(0), "Invalid token address");
        if (_paymentTokenAddress == address(0)) revert ZeroAddress();
        erc20 = ERC20(_paymentTokenAddress);

        emit PaymentTokenUpdated(_paymentTokenAddress);
    }
}
