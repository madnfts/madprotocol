// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.22;

import { IERC20 } from "contracts/lib/tokens/IERC20.sol";
import { SafeTransferLib } from "contracts/lib/utils/SafeTransferLib.sol";
import { RouterEvents } from "contracts/Shared/EventsAndErrors.sol";

abstract contract FeeHandlerFactory {
    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

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
    mapping(address erc20token => Fee collectionPrice) public
        feeCreateCollectionErc20;

    /// @notice ERC20 Burn fee store.
    mapping(address erc20token => Fee splitterPrice) public
        feeCreateSplitterErc20;

    error AddressNotValid();

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
    function _handleFees(uint256 _fee, address madFeeTokenAddress) internal {
        // Check if msg.sender balance is less than the fee.. logic to check the
        // price
        // (if any) will be handled in the NFT contract itself.
        if (!feeCreateCollectionErc20[madFeeTokenAddress].isValid) {
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
    /// @param _feeCreateCollectionErc20 fee for creating a new collection
    /// @param _feeCreateSplitterErc20 fee for creating a new splitter
    function _setFees(
        uint256 _feeCreateCollectionErc20,
        uint256 _feeCreateSplitterErc20,
        address madFeeTokenAddress
    ) internal {
        if (madFeeTokenAddress == address(0)) {
            revert AddressNotValid();
        }
        feeCreateCollectionErc20[madFeeTokenAddress] =
            Fee(_feeCreateCollectionErc20, true);
        feeCreateSplitterErc20[madFeeTokenAddress] =
            Fee(_feeCreateSplitterErc20, true);
    }
}
