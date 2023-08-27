// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

// solhint-disable-next-line
import { MADBase, IERC20 } from "contracts/Shared/MADBase.sol";
import { FeeHandler } from "contracts/Router/FeeHandler.sol";

import {
    RouterEvents, FactoryVerifier
} from "contracts/Shared/EventsAndErrors.sol";

abstract contract MADRouterBase is MADBase, FeeHandler, RouterEvents {
    /// @notice Contract name.
    /// @dev Function Sighash := 0x06fdde03
    function name() public pure returns (string memory) {
        assembly {
            mstore(0x20, 0x20)
            mstore(0x46, 0x6726F75746572)
            return(0x20, 0x60)
        }
    }

    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////

    /// @dev The recipient address used for public mint fees.
    address public recipient;

    /// @notice FactoryVerifier connecting the router to madFactory.
    FactoryVerifier public madFactory;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    /// @notice Constructor requires a valid factory address and an optional
    /// erc20 payment token
    /// address.
    /// @param _paymentTokenAddress erc20 token address.
    /// @param _recipient Public mint fee recipient address.
    // B.1 - Remove maxFeeMint &  maxFeeBurn from constructor
    constructor(
        FactoryVerifier _factory,
        address _paymentTokenAddress,
        address _recipient
    ) {
        _setPaymentToken(_paymentTokenAddress);
        setFactory(_factory);
        setRecipient(_recipient);
    }

    ////////////////////////////////////////////////////////////////
    //                         OWNER FX                           //
    ////////////////////////////////////////////////////////////////

    /// @dev `madFactory` instance setter.
    /// @dev Function Signature := 0x612990fe
    function setFactory(FactoryVerifier _factory) public onlyOwner {
        assembly {
            if iszero(_factory) {
                mstore(0x00, 0xd92e233d)
                revert(0x1c, 0x04)
            }
            sstore(madFactory.slot, _factory)
        }
        emit FactoryUpdated(_factory);
    }

    /// @dev Setter for public mint / burn fee _recipient.
    /// @dev Function Sighash := 0x3bbed4a0
    function setRecipient(address _recipient) public onlyOwner {
        // require(_recipient != address(0), "Invalid address");

        assembly {
            if iszero(_recipient) {
                mstore(0x00, 0xd92e233d)
                revert(0x1c, 0x04)
            }
            sstore(recipient.slot, _recipient)
        }

        emit RecipientUpdated(_recipient);
    }

    /// @notice Change the Routers mint and burn fees.
    /// @param _feeMint New mint fee.
    /// @param _feeBurn New burn fee.
    function setFees(uint256 _feeMint, uint256 _feeBurn) public onlyOwner {
        _setFees(_feeMint, _feeBurn);
        emit FeesUpdated(_feeMint, _feeBurn);
    }

    /// @notice Change the Routers mint and burn fees for erc20 Tokens.
    /// @param _feeMint New mint fee.
    /// @param _feeBurn New burn fee.
    function setFees(uint256 _feeMint, uint256 _feeBurn, address erc20Address)
        public
        onlyOwner
    {
        _setFees(_feeMint, _feeBurn, erc20Address);
        emit FeesUpdated(_feeMint, _feeBurn);
    }

    ////////////////////////////////////////////////////////////////
    //                         HELPERS                            //
    ////////////////////////////////////////////////////////////////

    /// @notice Private auth-check mechanism that verifies `madFactory` storage.
    /// @dev Retrieves both `collectionId` (bytes32) and collection type (uint8)
    ///      for valid token and approved user.
    ///      Function Sighash := 0xdbf62b2e
    /// @param collectionId 721 / 1155 token address.
    function _tokenRender(address collectionId) internal view {
        if (!madFactory.creatorCheck(collectionId, msg.sender)) {
            revert NotCallersCollection();
        }
    }
}
