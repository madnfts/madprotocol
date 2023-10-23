// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

import { IERC20 } from "contracts/lib/tokens/IERC20.sol";
import { SafeTransferLib } from "contracts/lib/utils/SafeTransferLib.sol";
import { RouterEvents } from "contracts/Shared/EventsAndErrors.sol";

abstract contract FeeHandlerFactory {
    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    /// @notice The recipient address used for public mint fees.
    address public recipient;

    uint256 public feeCreateCollection = 0.0001 ether;
    uint256 public feeCreateSplitter = 0.0001 ether;

    /// @notice ERC20 Mint fee store.
    mapping(address erc20token => uint256 collectionPrice) public feeCreateCollectionErc20;

    /// @notice ERC20 Burn fee store.
    mapping(address erc20token => uint256 splitterPrice) public feeCreateSplitterErc20;


    ////////////////////////////////////////////////////////////////
    //                         HELPERS                            //
    ////////////////////////////////////////////////////////////////

    /// @notice Payment handler for mint and burn functions.
    /// @dev Function Sighash := 0x3bbed4a0
    function _handleFees(uint256 _fee)
        internal
    {
        // Check if msg.sender balance is less than the fee.. logic to check the
        // price
        // (if any) will be handled in the NFT contract itself.
        if (msg.value < _fee) revert RouterEvents.InvalidFees();

        // Transfer Fees to recipient..
        SafeTransferLib.safeTransferETH(payable(recipient), _fee);
    }

    /// @notice Payment handler for mint and burn functions.
    /// @dev Function Sighash := 0x3bbed4a0
    function _handleFees(uint256 _fee, address erc20Address)
        internal
    {
        // Check if msg.sender balance is less than the fee.. logic to check the
        // price
        // (if any) will be handled in the NFT contract itself.
        if (IERC20(erc20Address).balanceOf(msg.sender) < _fee) {
            revert RouterEvents.InvalidFees();
        }

        // Transfer Fees to recipient..
        SafeTransferLib.safeTransferFrom(
            IERC20(erc20Address), msg.sender, recipient, _fee
        );
    }

    /// @notice Change the Routers mint and burn fees.
    /// @dev access control / events are handled in MADRouterBase
    /// @param _feeCreateCollection fee for creating a new collection
    /// @param _feeCreateSplitter fee for creating a new splitter
    function _setFees(uint256 _feeCreateCollection, uint256 _feeCreateSplitter) internal {
        feeCreateCollection = _feeCreateCollection;
        feeCreateSplitter = _feeCreateSplitter;
    }

    /// @notice Change the Routers mint and burn fees for erc20 tokens.
    /// @dev access control / events are handled in MADRouterBase
    /// @param _feeCreateCollectionErc20 fee for creating a new collection
    /// @param _feeCreateSplitterErc20 fee for creating a new splitter
    function _setFees(uint256 _feeCreateCollectionErc20, uint256 _feeCreateSplitterErc20, address erc20Address)
        internal
    {
        feeCreateCollectionErc20[erc20Address] = _feeCreateCollectionErc20;
        feeCreateSplitterErc20[erc20Address] = _feeCreateSplitterErc20;
    }
}
