// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { FactoryVerifier } from "contracts/Shared/EventsAndErrors.sol";

interface IRouter {
    // Pure Functions
    function name() external pure returns (string memory);

    // View Functions
    function owner() external view returns (address);
    function recipient() external view returns (address);
    function erc20() external view returns (address);
    function madFactory() external view returns (FactoryVerifier);

    function feeBurn() external view returns (uint256);
    function feeMint() external view returns (uint256);
    function maxFeeBurn() external view returns (uint256);
    function maxFeeMint() external view returns (uint256);

    function feeLookup(bytes4 sigHash) external view returns (uint256 fee);

    // Setter Functions
    function setFactory(address _factory) external;
    function setOwner(address newOwner) external;
    function setRecipient(address _recipient) external;

    function setFees(uint256 _feeMint, uint256 _feeBurn) external;

    function setFees(uint256 _feeMint, uint256 _feeBurn, address erc20Token)
        external;

    struct Fee {
        uint256 feeAmount;
        bool isValid;
    }

    function feeMintErc20(address erc20Token) external view returns (Fee memory);
    function feeBurnErc20(address erc20Token) external view returns (Fee memory);
}
