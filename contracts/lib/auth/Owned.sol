// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

/// @notice Simple single owner authorization mixin.
/// @author Modified from Solmate
/// (https://github.com/Rari-Capital/solmate/blob/main/src/auth/Owned.sol)

abstract contract Owned {
    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /// @dev 0x1648fd01
    error NotAuthorised();

    event OwnerUpdated(address indexed user, address indexed newOwner);

    /*//////////////////////////////////////////////////////////////
                            OWNERSHIP STORAGE
    //////////////////////////////////////////////////////////////*/

    address public owner;

    modifier onlyOwner() virtual {
        if (msg.sender != owner) revert NotAuthorised();
        _;
    }

    modifier notZeroAddress(address _owner) {
        assembly {
            if iszero(_owner) {
                // Revert ZeroAddress()
                mstore(0x00, 0xd92e233d)
                revert(0x1c, 0x04)
            }
        }
        _;
    }

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _owner) notZeroAddress(_owner) {
        owner = _owner;

        emit OwnerUpdated(address(0), _owner);
    }

    /*//////////////////////////////////////////////////////////////
                             OWNERSHIP LOGIC
    //////////////////////////////////////////////////////////////*/

    function setOwner(address newOwner)
        public
        onlyOwner
        notZeroAddress(newOwner)
    {
        assembly {
            sstore(owner.slot, newOwner)
        }

        emit OwnerUpdated(msg.sender, newOwner);
    }
}
