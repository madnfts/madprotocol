pragma solidity 0.8.19;

import { MockERC20 } from "test/foundry/Base/Tokens/ERC20/deployMockERC20.sol";
import { IMarketplace } from "test/foundry/Base/Marketplace/IMarketplace.sol";
import { IFactory } from "test/foundry/Base/Factory/IFactory.sol";
import { IRouter } from "test/foundry/Base/Router/IRouter.sol";

interface IDeployer {
    struct DeployedContracts {
        MockERC20 paymentToken;
        IMarketplace marketplace;
        IFactory factory;
        IRouter router;
    }
}
