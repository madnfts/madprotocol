// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "forge-std/src/Test.sol";
import { DeployERC20 } from "test/foundry/Base/Tokens/ERC20/deployMockERC20.sol";

import { DeployMarketplaceBase } from
    "test/foundry/Base/Marketplace/deployMarketplaceBase.sol";
import { DeployFactoryBase } from
    "test/foundry/Base/Factory/deployFactoryBase.sol";
import { DeployRouterBase } from "test/foundry/Base/Router/deployRouterBase.sol";

import { Enums } from "test/foundry/utils/enums.sol";

import {
    IDeployer,
    IRouter,
    IFactory,
    IMarketplace,
    MockERC20
} from "test/foundry/Base/Deploy/IDeployer.sol";

import { ERC721Basic } from "contracts/MADTokens/ERC721/ERC721Basic.sol";
import { ERC1155Basic } from "contracts/MADTokens/ERC1155/ERC1155Basic.sol";

import { SettersToggle } from "test/foundry/utils/setterToggle.sol";

abstract contract DeployerBase is
    IDeployer,
    Enums,
    SettersToggle("defaultMADOwner")
{
    MockERC20 public paymentToken;
    IMarketplace public marketplace;
    IFactory public factory;
    IRouter public router;

    // Instantiate deployer contracts
    DeployMarketplaceBase marketplaceDeployer = new DeployMarketplaceBase();
    DeployFactoryBase factoryDeployer = new DeployFactoryBase();
    DeployRouterBase routerDeployer = new DeployRouterBase();

    DeployERC20 erc20Deployer = new DeployERC20();

    // Create necessary addresses
    address recipientMarketplace = makeAddr("RecipientMarketplace");
    address factorySigner = makeAddr("factorySigner");
    address recipientRouter = makeAddr("RecipientRouter");
    address swapRouter = makeAddr("SwapRouter");

    function deployAll(ercTypes ercType)
        public
        returns (DeployedContracts memory deployedContracts)
    {
        // First, deploy the ERC20 token contract
        paymentToken = erc20Deployer._deploy(currentSigner);

        // Deploy Marketplace
        marketplace = marketplaceDeployer.deployMarketplaceCustom(
            ercType,
            currentSigner,
            recipientMarketplace,
            address(paymentToken),
            swapRouter
        );

        // Deploy Factory
        factory = factoryDeployer.deployFactoryCustom(
            ercType,
            currentSigner,
            address(marketplace),
            factorySigner,
            address(paymentToken)
        );

        // Deploy Router
        router = routerDeployer.deployRouterCustom(
            ercType,
            currentSigner,
            recipientRouter,
            address(paymentToken),
            address(factory)
        );

        marketplaceDeployer.setFactory(
            marketplace, address(factory), currentSigner
        );
        factoryDeployer.setRouter(factory, address(router), currentSigner);

        factoryDeployer.setTokenType(
            factory, currentSigner, 1, type(ERC721Basic).creationCode
        );
        factoryDeployer.setTokenType(
            factory, currentSigner, 1, type(ERC1155Basic).creationCode
        );

        // Return the addresses of the deployed contracts in an array
        deployedContracts = DeployedContracts({
            paymentToken: paymentToken,
            marketplace: marketplace,
            factory: factory,
            router: router
        });
    }
}
