// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.4;

//// @title Counters
//// @author Matt Condon (@shrugs)
//// @author Modified from OpenZeppelin Contracts
//// (https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol)
//// @notice Provides counters that can only be incremented, decremented or reset.
//// @dev Include with `using Counters for Counters.Counter;`
library Counters {
    struct Counter {
        //// @dev Interactions must be restricted to the library's function.
        uint256 _value; // default: 0
    }

    function current(Counter storage counter)
        internal
        view
        returns (uint256)
    {
        return counter._value;
    }

    function increment(Counter storage counter) internal {
        unchecked {
            counter._value++; /* += 1; */
        }
    }

    function decrement(Counter storage counter) internal {
        uint256 value = counter._value;
        require(value > 0, "DECREMENT_OVERFLOW");
        unchecked {
            counter._value--; /* = value - 1; */
        }
    }

    function reset(Counter storage counter) internal {
        unchecked {
            counter._value = 0x00;
        }
    }
}
