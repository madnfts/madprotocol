// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

// solhint-disable-next-line
import { MADBase, ERC20 } from "contracts/Shared/MADBase.sol";
import {
    RouterEvents, FactoryVerifier
} from "contracts/Shared/EventsAndErrors.sol";
import { FeeOracle } from "contracts/lib/tokens/common/FeeOracle.sol";

abstract contract MADRouterBase is MADBase, RouterEvents, FeeOracle {
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

    /// @notice Passed to feeLookup to return feeMint.
    bytes4 internal constant _MINSAFEMINT = 0x40d097c3;

    /// @notice Passed to feeLookup to return feeBurn.
    bytes4 internal constant _MINBURN = 0x44df8e70;

    /// @notice Mint fee store.
    // B.3 BlockHat Audit
    uint256 public feeMint = 0.25 ether; /* = 0 */

    /// @notice Burn fee store.
    uint256 public feeBurn; /* = 0 */

    /// @dev The recipient address used for public mint fees.
    address public recipient;

    /// @notice max fee that can be set for mint - B.1 remove from constructor
    uint256 public constant maxFeeMint = 2.5 ether; // 0.0003 ether

    /// @notice max fee that can be set for burn - B.1 remove from constructor
    uint256 public constant maxFeeBurn = 0.5 ether;

    /// @notice FactoryVerifier connecting the router to madFactory.
    FactoryVerifier public madFactory;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    /// @notice Constructor requires a valid factory address and an optional
    /// erc20 payment token
    /// address.
    /// @param _paymentTokenAddress erc20 token address | address(0).
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
    //                         HELPERS                            //
    ////////////////////////////////////////////////////////////////

    /// @notice Mint and burn fee lookup.
    /// @dev Function Sighash := 0xedc9e7a4
    /// @param sigHash _MINSAFEMINT | _MINBURN
    function feeLookup(bytes4 sigHash)
        external
        view
        override(FeeOracle)
        returns (uint256)
    {
        if (sigHash == _MINSAFEMINT) {
            return feeMint;
        } else if (sigHash == _MINBURN) {
            return feeBurn;
        } else {
            return 0;
        }
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

    /// @dev Setter for public mint fee _recipient.
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
    /// @dev Event emitted by token contract.
    ///      Function Sighash := 0x0b78f9c0
    /// @param _feeMint New mint fee.
    /// @param _feeBurn New burn fee.
    function setFees(uint256 _feeMint, uint256 _feeBurn) external onlyOwner {
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
    function _tokenRender(address collectionId)
        internal
        view
        returns (uint8 tokenType)
    {
        madFactory.creatorCheck(collectionId);
        tokenType = madFactory.collectionTypeChecker(collectionId);
    }

    // MODIFIERS
    function _checkTokenType(uint256 _tokenType) internal pure {
        if (_tokenType != 1) {
            revert InvalidType();
        }
    }
}
