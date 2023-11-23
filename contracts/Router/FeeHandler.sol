// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.22;

import { IERC20 } from "contracts/lib/tokens/ERC20/interfaces/IERC20.sol";
import { SafeTransferLib } from "contracts/lib/utils/SafeTransferLib.sol";
import { RouterEvents } from "contracts/Shared/EventsAndErrors.sol";

abstract contract FeeHandler {
    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    /// @notice The recipient address used for public mint fees.
    address public recipient;

    /// @notice Passed to feeLookup to return feeMint.
    bytes4 internal constant _FEE_MINT = 0x40d097c3;

    /// @notice Passed to feeLookup to return feeBurn.
    bytes4 internal constant _FEE_BURN = 0x44df8e70;

    /// @notice Mint fee store.
    // audit B.3 BlockHat Audit
    uint256 public feeMint = 1 ether;

    /// @notice Burn fee store.
    uint256 public feeBurn = 1 ether; /* = 0 */

    struct Fee {
        uint256 feeAmount;
        bool isValid;
    }

    /// @notice ERC20 Mint fee store.
    mapping(address madFeeTokenAddress => Fee mintPrice) private _feeMintErc20;

    /// @notice ERC20 Burn fee store.
    mapping(address madFeeTokenAddress => Fee burnPrice) private _feeBurnErc20;

    modifier isZeroAddress(address _address) {
        if (_address == address(0)) {
            revert RouterEvents.AddressNotValid();
        }
        _;
    }

    function feeMintErc20(address madFeeTokenAddress)
        public
        view
        isZeroAddress(madFeeTokenAddress)
        returns (Fee memory)
    {
        return _feeMintErc20[madFeeTokenAddress];
    }

    function feeBurnErc20(address madFeeTokenAddress)
        public
        view
        isZeroAddress(madFeeTokenAddress)
        returns (Fee memory)
    {
        return _feeBurnErc20[madFeeTokenAddress];
    }

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

    /// @notice Payment handler for mint and burn functions.
    /// @dev Function Sighash := 0x3bbed4a0
    /// @param _feeType _FEE_MINT | _FEE_BURN
    function _handleFees(bytes4 _feeType, uint256 _amount)
        internal
        returns (uint256 _fee)
    {
        _fee = feeLookup(_feeType) * _amount;
        // Check if msg.value balance is less than the fee.. logic to check the
        // price
        // (if any) will be handled in the NFT contract itself.
        if (msg.value < _fee) revert RouterEvents.InvalidFees();

        // Transfer Fees to recipient..
        SafeTransferLib.safeTransferETH(payable(recipient), _fee);
    }

    /// @notice Payment handler for mint and burn functions.
    /// @param _amount  Amount of tokens to be minted or burned.
    /// @param madFeeTokenAddress  Address of the ERC20 token to be used as
    /// payment token.
    /// @param _feeErc20  Function to return the fee amount and validity of the
    /// fee token.
    function _handleFees(
        uint256 _amount,
        address madFeeTokenAddress,
        function (address) external view returns (Fee memory) _feeErc20
    ) internal {
        Fee memory feeErc20 = _feeErc20(madFeeTokenAddress);
        if (!feeErc20.isValid) {
            revert RouterEvents.AddressNotValid();
        }
        uint256 _fee = feeErc20.feeAmount * _amount;
        // Check if msg.sender balance is less than the fee.. logic to check the
        // price
        // (if any) will be handled in the NFT contract itself.
        if (IERC20(madFeeTokenAddress).balanceOf(msg.sender) < _fee) {
            revert RouterEvents.InvalidFees();
        }

        // Transfer Fees to recipient..
        SafeTransferLib.safeTransferFrom(
            IERC20(madFeeTokenAddress), msg.sender, recipient, _fee
        );
    }

    /// @notice Change the Routers mint and burn fees.
    /// @dev access control / events are handled in MADRouterBase
    /// @param _feeMint New mint fee.
    /// @param _feeBurn New burn fee.
    function _setFees(uint256 _feeMint, uint256 _feeBurn) internal {
        feeMint = _feeMint;
        feeBurn = _feeBurn;
    }

    /// @notice Change the Routers mint and burn fees for erc20 tokens.
    /// @dev access control / events are handled in MADRouterBase
    /// @param _feeMint New mint fee.
    /// @param _feeBurn New burn fee.
    function _setFees(
        uint256 _feeMint,
        uint256 _feeBurn,
        address madFeeTokenAddress
    ) internal isZeroAddress(madFeeTokenAddress) {
        _feeMintErc20[madFeeTokenAddress] = Fee(_feeMint, true);
        _feeBurnErc20[madFeeTokenAddress] = Fee(_feeBurn, true);
    }

    function _invalidateFee(
        address madFeeTokenAddress,
        bool invalidateBurnFee,
        bool invalidateMintFee
    ) internal isZeroAddress(madFeeTokenAddress) {
        if (invalidateMintFee) {
            _feeMintErc20[madFeeTokenAddress] = Fee(0, false);
        }
        if (invalidateBurnFee) {
            _feeBurnErc20[madFeeTokenAddress] = Fee(0, false);
        }
    }
}
