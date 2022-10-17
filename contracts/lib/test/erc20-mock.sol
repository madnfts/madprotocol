// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.16;

import { ERC20 } from "../tokens/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(uint256 amountToMint)
        ERC20("Mock", "MOCK", 18)
    {
        mint(msg.sender, amountToMint);
    }

    function mint(address to, uint256 value) public virtual {
        _mint(to, value);
    }

    function burn(address from, uint256 value)
        public
        virtual
    {
        _burn(from, value);
    }
}
