// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

library SplitterBufferLib {
    /// @dev Builds payees dynamic sized array buffer for `splitterCheck` cases.
    function _payeesBuffer(address amb, address project) internal view returns (address[] memory memOffset) {
        assembly {
            switch and(iszero(amb), iszero(project))
            case 1 {
                memOffset := mload(0x40)
                mstore(add(memOffset, 0x00), 1)
                mstore(add(memOffset, 0x20), origin())
                mstore(0x40, add(memOffset, 0x40))
            }
            case 0 {
                switch iszero(project)
                case 1 {
                    memOffset := mload(0x40)
                    mstore(add(memOffset, 0x00), 2)
                    mstore(add(memOffset, 0x20), amb)
                    mstore(add(memOffset, 0x40), origin())
                    mstore(0x40, add(memOffset, 0x60))
                }
                case 0 {
                    switch iszero(amb)
                    case 1 {
                        memOffset := mload(0x40)
                        mstore(add(memOffset, 0x00), 2)
                        mstore(add(memOffset, 0x20), project)
                        mstore(add(memOffset, 0x40), origin())
                        mstore(0x40, add(memOffset, 0x60))
                    }
                    case 0 {
                        memOffset := mload(0x40)
                        mstore(add(memOffset, 0x00), 3)
                        mstore(add(memOffset, 0x20), amb)
                        mstore(add(memOffset, 0x40), project)
                        mstore(add(memOffset, 0x60), origin())
                        mstore(0x40, add(memOffset, 0x80))
                    }
                }
            }
        }
    }

    /// @dev Builds shares dynamic sized array buffer for `splitterCheck` cases.
    function _sharesBuffer(
        uint256 _ambShare,
        uint256 _projectShare
    ) internal pure returns (uint256[] memory memOffset) {
        assembly {
            switch and(iszero(_ambShare), iszero(_projectShare))
            case 1 {
                memOffset := mload(0x40)
                mstore(add(memOffset, 0x00), 1)
                mstore(add(memOffset, 0x20), 100)
                mstore(0x40, add(memOffset, 0x40))
            }
            case 0 {
                switch iszero(_projectShare)
                case 1 {
                    memOffset := mload(0x40)
                    mstore(add(memOffset, 0x00), 2)
                    mstore(add(memOffset, 0x20), _ambShare)
                    mstore(add(memOffset, 0x40), sub(100, _ambShare))
                    mstore(0x40, add(memOffset, 0x60))
                }
                case 0 {
                    switch iszero(_ambShare)
                    case 1 {
                        memOffset := mload(0x40)
                        mstore(add(memOffset, 0x00), 2)
                        mstore(add(memOffset, 0x20), _projectShare)
                        mstore(add(memOffset, 0x40), sub(100, _projectShare))
                        mstore(0x40, add(memOffset, 0x60))
                    }
                    case 0 {
                        memOffset := mload(0x40)
                        mstore(add(memOffset, 0x00), 3)
                        mstore(add(memOffset, 0x20), _ambShare)
                        mstore(add(memOffset, 0x40), _projectShare)
                        mstore(add(memOffset, 0x60), sub(100, add(_ambShare, _projectShare)))
                        mstore(0x40, add(memOffset, 0x80))
                    }
                }
            }
        }
    }
}
