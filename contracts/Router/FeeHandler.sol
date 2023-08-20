// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

import { RouterEvents } from "contracts/Shared/EventsAndErrors.sol";

abstract contract FeeHandler {
    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    /// @notice Passed to feeLookup to return feeMint.
    bytes4 internal constant _FEE_MINT = 0x40d097c3;

    /// @notice Passed to feeLookup to return feeBurn.
    bytes4 internal constant _FEE_BURN = 0x44df8e70;

    /// @notice Mint fee store.
    // audit B.3 BlockHat Audit
    uint256 public feeMint = 0.25 ether;

    /// @notice Burn fee store.
    uint256 public feeBurn; /* = 0 */

    /// @notice Mint fee store.
    mapping(address erc20token => uint256 mintPrice) public feeMintErc20;

    /// @notice Burn fee store.
    mapping(address erc20token => uint256 burnPrice) public feeBurnErc20;

    /// @notice max fee that can be set for mint - B.1 remove from constructor
    uint256 public constant maxFeeMint = 2.5 ether; // 0.0003 ether

    /// @notice max fee that can be set for burn - B.1 remove from constructor
    uint256 public constant maxFeeBurn = 0.5 ether;

    ////////////////////////////////////////////////////////////////
    //                         HELPERS                            //
    ////////////////////////////////////////////////////////////////

    /// @notice Mint and burn fee lookup.
    /// @dev Function Sighash := 0xedc9e7a4
    /// @param sigHash _FEE_MINT | _FEE_BURN
    function feeLookup(bytes4 sigHash) internal view returns (uint256) {
        if (sigHash == _FEE_MINT) {
            return feeMint;
        } else if (sigHash == _FEE_BURN) {
            return feeBurn;
        } else {
            return 0;
        }
    }

    /// @notice Mint and burn fee lookup for erc20 tokens.
    /// @dev Function Sighash := 0xedc9e7a4
    /// @param sigHash _FEE_MINT | _FEE_BURN
    function feeLookup(bytes4 sigHash, address erc20Address)
        internal
        view
        returns (uint256)
    {
        if (sigHash == _FEE_MINT) {
            return feeMintErc20[erc20Address];
        } else if (sigHash == _FEE_BURN) {
            return feeBurnErc20[erc20Address];
        } else {
            return 0;
        }
    }

    /// @notice Payment check for mint and burn functions.
    /// @dev Function Sighash := 0x3bbed4a0
    /// @param _feeType _FEE_MINT | _FEE_BURN
    function _paymentCheck(bytes4 _feeType) internal view {
        uint256 _fee = feeLookup(_feeType);
        if (msg.value >= _fee) revert RouterEvents.InvalidFees();
    }

    /// @notice Change the Routers mint and burn fees.
    /// @dev access control / events are handled in MADRouterBase
    /// @param _feeMint New mint fee.
    /// @param _feeBurn New burn fee.
    function _setFees(uint256 _feeMint, uint256 _feeBurn) internal {
        // require(_feeMint <= maxFeeMint && _feeBurn <= maxFeeBurn, "Invalid
        // fee settings, beyond
        // max");
        assembly {
            if or(gt(_feeMint, maxFeeMint), gt(_feeBurn, maxFeeBurn)) {
                mstore(0x00, 0x2d8768f9)
                revert(0x1c, 0x04)
            }
            sstore(feeBurn.slot, _feeBurn)
            sstore(feeMint.slot, _feeMint)
        }
    }

    /// @notice Change the Routers mint and burn fees for erc20 tokens.
    /// @dev access control / events are handled in MADRouterBase
    /// @param _feeMint New mint fee.
    /// @param _feeBurn New burn fee.
    function _setFees(uint256 _feeMint, uint256 _feeBurn, address erc20Address)
        internal
    {
        feeMintErc20[erc20Address] = _feeMint;
        feeBurnErc20[erc20Address] = _feeBurn;
    }
}
