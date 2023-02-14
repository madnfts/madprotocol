// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.16;

import { FactoryVerifier } from "./EventsAndErrors.sol";
import { MADMarketplace721 } from "./MADMarketplace721.sol";

// MAD Multi-Token Marketplace
// When calling deposit, the marketplace will swap the input token with the target token
// for ERC20; and the native version for non-erc20
// When withdrawing, the target token is returned (i.e. we do not return the original deposit token)

contract MADMarketplace721Swap is MADMarketplace721 {
    ////////////////////////////////////////////////////////////////
    //                           STORAGE                          //
    ////////////////////////////////////////////////////////////////
    mapping(address => bool) public supportedTokens;

    ////////////////////////////////////////////////////////////////
    //                         CONSTRUCTOR                        //
    ////////////////////////////////////////////////////////////////

    constructor(
        address _recipient,
        uint256 _minOrderDuration,
        FactoryVerifier _factory,
        address _paymentTokenAddress,
        address[] memory _tokens
    )
        MADMarketplace721(
            _recipient,
            _minOrderDuration,
            _factory,
            _paymentTokenAddress
        )
    {
        require(_tokens.length > 0, "Invalid tokens");

        for (uint256 i = 0; i < _tokens.length; i++) {
            supportedTokens[_tokens[i]] = true;
        }
    }

    function swapAndBid(bytes32 _order)
        public
        payable
        whenNotPaused
    {}

    function swapAndBuy(bytes32 _order)
      public
      payable
      whenNotPaused
    {}
}
