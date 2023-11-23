// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.22;

import { IERC20 } from "contracts/lib/tokens/ERC20/interfaces/IERC20.sol";
import { SafeTransferLib } from "contracts/lib/utils/SafeTransferLib.sol";
import { RouterEvents } from "contracts/Shared/EventsAndErrors.sol";

abstract contract FeeHandlerFactory {
    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    error AddressNotValid();

    /// @notice The recipient address used for fees.
    address public recipient;

    // Native Token fees
    uint256 public feeCreateCollection = 1 ether;
    uint256 public feeCreateSplitter = 1 ether;

    struct Fee {
        uint256 feeAmount;
        bool isValid;
    }

    /// @notice ERC20 Mint fee store.
    mapping(address madFeeTokenAddress => Fee collectionPrice) private
        _feeCreateCollectionErc20;

    /// @notice ERC20 Burn fee store.
    mapping(address madFeeTokenAddress => Fee splitterPrice) private
        _feeCreateSplitterErc20;

    modifier isZeroAddress(address _address) {
        if (_address == address(0)) {
            revert AddressNotValid();
        }
        _;
    }

    function feeCreateCollectionErc20(address madFeeTokenAddress)
        public
        view
        isZeroAddress(madFeeTokenAddress)
        returns (Fee memory)
    {
        return _feeCreateCollectionErc20[madFeeTokenAddress];
    }

    function feeCreateSplitterErc20(address madFeeTokenAddress)
        public
        view
        isZeroAddress(madFeeTokenAddress)
        returns (Fee memory)
    {
        return _feeCreateSplitterErc20[madFeeTokenAddress];
    }

    ////////////////////////////////////////////////////////////////
    //                         HELPERS                            //
    ////////////////////////////////////////////////////////////////

    /// @notice Payment handler for mint and burn functions.
    /// @dev Function Sighash := 0x3bbed4a0
    function _handleFees(uint256 _fee) internal {
        // Check if msg.sender balance is less than the fee.. logic to check the
        // price
        // (if any) will be handled in the NFT contract itself.
        if (msg.value < _fee) revert RouterEvents.InvalidFees();

        // Transfer Fees to recipient..
        SafeTransferLib.safeTransferETH(payable(recipient), _fee);
    }

    /// @notice Payment handler for mint and burn functions.
    /// @dev Function Sighash := 0x3bbed4a0
    function _handleFees(
        address madFeeTokenAddress,
        function(address) external view returns (Fee memory) _feeErc20
    ) internal {
        // Check if msg.sender balance is less than the fee.. logic to check the
        // price
        // (if any) will be handled in the NFT contract itself.
        Fee memory feeErc20 = _feeErc20(madFeeTokenAddress);
        uint256 _fee = feeErc20.feeAmount;

        if (!feeErc20.isValid) {
            revert AddressNotValid();
        }

        if (IERC20(madFeeTokenAddress).balanceOf(msg.sender) < _fee) {
            revert RouterEvents.InvalidFees();
        }
        // Transfer Fees to recipient..
        SafeTransferLib.safeTransferFrom(
            IERC20(madFeeTokenAddress), msg.sender, recipient, _fee
        );
    }

    /// @notice Change the Factorys mint and burn fees.
    /// @dev access control / events are handled in MADFactoryBase
    /// @param _feeCreateCollection fee for creating a new collection
    /// @param _feeCreateSplitter fee for creating a new splitter
    function _setFees(uint256 _feeCreateCollection, uint256 _feeCreateSplitter)
        internal
    {
        feeCreateCollection = _feeCreateCollection;
        feeCreateSplitter = _feeCreateSplitter;
    }

    /// @notice Change the Factorys mint and burn fees for erc20 tokens.
    /// @dev access control / events are handled in MADFactoryBase
    /// @param _madFeeCreateCollectionErc20 fee for creating a new collection
    /// @param _madFeeCreateSplitterErc20 fee for creating a new splitter
    function _setFees(
        uint256 _madFeeCreateCollectionErc20,
        uint256 _madFeeCreateSplitterErc20,
        address madFeeTokenAddress
    ) internal isZeroAddress(madFeeTokenAddress) {
        _feeCreateCollectionErc20[madFeeTokenAddress] =
            Fee(_madFeeCreateCollectionErc20, true);
        _feeCreateSplitterErc20[madFeeTokenAddress] =
            Fee(_madFeeCreateSplitterErc20, true);
    }

    function _invalidateFee(
        address madFeeTokenAddress,
        bool invalidateCollectionFee,
        bool invalidateSplitterFee
    ) internal isZeroAddress(madFeeTokenAddress) {
        if (invalidateCollectionFee) {
            _feeCreateCollectionErc20[madFeeTokenAddress] = Fee(0, false);
        }
        if (invalidateSplitterFee) {
            _feeCreateSplitterErc20[madFeeTokenAddress] = Fee(0, false);
        }
    }
}
