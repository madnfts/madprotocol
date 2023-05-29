pragma solidity 0.8.19;

import { ERC20 } from "contracts/lib/utils/SafeTransferLib.sol";

interface ISplitter {
    // Public getters
    function _shares(address account) external view returns (uint256);
    function _payees() external view returns (address[] memory);
    function payeesLength() external view returns (uint256);
    function totalShares() external view returns (uint256);
    function totalReleased() external view returns (uint256);
    function totalReleased(ERC20 token) external view returns (uint256);
    function released(address account) external view returns (uint256);
    function released(ERC20 token, address account)
        external
        view
        returns (uint256);
    function releasable(address account) external view returns (uint256);
    function releasable(ERC20 token, address account)
        external
        view
        returns (uint256);

    // Public methods
    function release(address payable account) external;
    function releaseAll() external;
    function release(ERC20 token, address account) external;
}
