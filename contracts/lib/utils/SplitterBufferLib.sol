// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

library SplitterBufferLib {
    /// @dev Builds payees dynamic sized array buffer for `createSplitter`
    /// cases.
    function payeesBuffer(address amb, address project)
        internal
        view
        returns (address[] memory memOffset)
    {
        assembly {
            switch and(iszero(amb), iszero(project))
            case 1 {
                memOffset := mload(0x40)
                mstore(add(memOffset, 0x00), 1)
                mstore(add(memOffset, 0x20), caller())
                mstore(0x40, add(memOffset, 0x40))
            }
            case 0 {
                switch iszero(project)
                case 1 {
                    memOffset := mload(0x40)
                    mstore(add(memOffset, 0x00), 2)
                    mstore(add(memOffset, 0x20), amb)
                    mstore(add(memOffset, 0x40), caller())
                    mstore(0x40, add(memOffset, 0x60))
                }
                case 0 {
                    switch iszero(amb)
                    case 1 {
                        memOffset := mload(0x40)
                        mstore(add(memOffset, 0x00), 2)
                        mstore(add(memOffset, 0x20), project)
                        mstore(add(memOffset, 0x40), caller())
                        mstore(0x40, add(memOffset, 0x60))
                    }
                    case 0 {
                        memOffset := mload(0x40)
                        mstore(add(memOffset, 0x00), 3)
                        mstore(add(memOffset, 0x20), amb)
                        mstore(add(memOffset, 0x40), project)
                        mstore(add(memOffset, 0x60), caller())
                        mstore(0x40, add(memOffset, 0x80))
                    }
                }
            }
        }
    }

    /// @dev Builds shares dynamic sized array buffer for `createSplitter`
    /// cases.
    function sharesBuffer(uint256 _ambassadorShare, uint256 _projectShare)
        internal
        pure
        returns (uint256[] memory memOffset)
    {
        assembly {
            switch and(iszero(_ambassadorShare), iszero(_projectShare))
            case 1 {
                memOffset := mload(0x40)
                mstore(add(memOffset, 0x00), 1)
                mstore(add(memOffset, 0x20), 10000)
                mstore(0x40, add(memOffset, 0x40))
            }
            case 0 {
                switch iszero(_projectShare)
                case 1 {
                    memOffset := mload(0x40)
                    mstore(add(memOffset, 0x00), 2)
                    mstore(add(memOffset, 0x20), _ambassadorShare)
                    mstore(add(memOffset, 0x40), sub(10000, _ambassadorShare))
                    mstore(0x40, add(memOffset, 0x60))
                }
                case 0 {
                    switch iszero(_ambassadorShare)
                    case 1 {
                        memOffset := mload(0x40)
                        mstore(add(memOffset, 0x00), 2)
                        mstore(add(memOffset, 0x20), _projectShare)
                        mstore(add(memOffset, 0x40), sub(10000, _projectShare))
                        mstore(0x40, add(memOffset, 0x60))
                    }
                    case 0 {
                        memOffset := mload(0x40)
                        mstore(add(memOffset, 0x00), 3)
                        mstore(add(memOffset, 0x20), _ambassadorShare)
                        mstore(add(memOffset, 0x40), _projectShare)
                        mstore(
                            add(memOffset, 0x60),
                            sub(10000, add(_ambassadorShare, _projectShare))
                        )
                        mstore(0x40, add(memOffset, 0x80))
                    }
                }
            }
        }
    }
}
