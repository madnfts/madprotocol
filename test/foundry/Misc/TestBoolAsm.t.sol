// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "test/lib/forge-std/src/Test.sol";

// shr / and is removing the value so it will always be 0 (false)

contract TestBoolASM is Test {
    /// @dev 0x2d0a3f8e
    error PublicMintClosed();

    bool publicMintState;

    function testFailBoolAsmOriginalWithShiftRight() public {
        publicMintState = true;
        _boolAsmOriginal();

        publicMintState = false;
        vm.expectRevert(0x2d0a3f8e);
        boolAsmNoShiftRight();
    }

    function testBoolAsmNoShiftRight() public {
        publicMintState = true;
        boolAsmNoShiftRight();

        publicMintState = false;
        vm.expectRevert(0x2d0a3f8e);
        boolAsmNoShiftRight();
    }

    function testShiftRightTrue() public {
        publicMintState = true;
        _shiftRight();
    }

    function testShiftRightFalse() public {
        publicMintState = false;
        _shiftRight();
    }

    function _boolAsmOriginal() public {
        assembly {
            if iszero(and(0x01, shr(0x08, sload(publicMintState.slot)))) {
                mstore(0, 0x2d0a3f8e)
                revert(28, 4)
            }
        }
    }

    function boolAsmNoShiftRight() public {
        assembly {
            if iszero(and(0x01, sload(publicMintState.slot))) {
                mstore(0, 0x2d0a3f8e)
                revert(28, 4)
            }
        }
    }

    function _shiftRight() internal {
        bytes32 boolState;
        bytes32 shifted;
        bytes32 anded;
        bytes32 zeroed;
        assembly {
            boolState := sload(publicMintState.slot)
            shifted := shr(0x08, boolState)
            // anded := and(0x01, shifted)
            zeroed := iszero(anded)
        }
        emit log_named_bytes32("BoolState", boolState);
        emit log_named_bytes32("Shifted", shifted);
        emit log_named_bytes32("Anded", anded);
        emit log_named_bytes32("Zeroed", zeroed);
    }
}
