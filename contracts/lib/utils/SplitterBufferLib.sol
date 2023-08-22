// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.19;

library SplitterBufferLib {
    /// @dev Builds payees dynamic sized array buffer for `createSplitter`
    /// cases.
    function payeesBuffer(address _amb, address _project)
        internal
        view
        returns (address[] memory memOffset)
    {
        memOffset = new address[](3);
        address _msgSender = msg.sender;

        if (_amb == address(0) && _project == address(0)) {
            memOffset = new address[](1);
            memOffset[0] = _msgSender;
        } else if (_project == address(0)) {
            memOffset = new address[](2);
            memOffset[0] = _amb;
            memOffset[1] = _msgSender;
        } else if (_amb == address(0)) {
            memOffset = new address[](2);
            memOffset[0] = _project;
            memOffset[1] = _msgSender;
        } else {
            memOffset = new address[](3);
            memOffset[0] = _amb;
            memOffset[1] = _project;
            memOffset[2] = _msgSender;
        }
    }

    /// @dev Builds shares dynamic sized array buffer for `createSplitter`
    /// cases.
    function sharesBuffer(uint256 _ambassadorShare, uint256 _projectShare)
        internal
        pure
        returns (uint256[] memory memOffset)
    {
        if (_ambassadorShare == 0 && _projectShare == 0) {
            memOffset = new uint256[](1);
            memOffset[0] = 10_000;
        } else {
            if (_projectShare == 0) {
                memOffset = new uint256[](2);
                memOffset[0] = _ambassadorShare;
                memOffset[1] = 10_000 - _ambassadorShare;
            } else if (_ambassadorShare == 0) {
                memOffset = new uint256[](2);
                memOffset[0] = _projectShare;
                memOffset[1] = 10_000 - _projectShare;
            } else {
                memOffset = new uint256[](3);
                memOffset[0] = _ambassadorShare;
                memOffset[1] = _projectShare;
                memOffset[2] = 10_000 - (_ambassadorShare + _projectShare);
            }
        }
        return memOffset;
    }
}
