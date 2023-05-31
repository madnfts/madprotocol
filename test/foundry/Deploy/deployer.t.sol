// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/src/Test.sol";
import { DeployERC20 } from "test/foundry/Base/ERC20/deployMockERC20.sol";

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
} from "test/foundry/Deploy/IDeployer.sol";

contract Deployer is IDeployer, Enums, Test {
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
    address owner = makeAddr("owner");
    address recipientMarketplace = makeAddr("RecipientMarketplace");
    address factorySigner = makeAddr("factorySigner");
    address recipientRouter = makeAddr("RecipientRouter");
    address swapRouter = makeAddr("SwapRouter");

    function setUp() public {
        // vm.startPrank(owner);
        vm.deal(owner, 1000 ether);
    }

    function testFailDeployAll() public {
        deployAll(ercTypes.None);
    }

    function testDeployAllErc721() public {
        deployAll(ercTypes.ERC721);
    }

    function testDeployAllErc1155() public {
        deployAll(ercTypes.ERC1155);
    }

    function deployAll(ercTypes ercType)
        public
        returns (DeployedContracts memory deployedContracts)
    {
        // First, deploy the ERC20 token contract
        paymentToken = erc20Deployer._deploy(owner);

        // Deploy Marketplace
        marketplace = marketplaceDeployer.deployMarketplaceCustom(
            ercType,
            owner,
            recipientMarketplace,
            address(paymentToken),
            swapRouter
        );

        // Deploy Factory
        factory = factoryDeployer.deployFactoryCustom(
            ercType,
            owner,
            address(marketplace),
            factorySigner,
            address(paymentToken)
        );

        // Deploy Router
        router = routerDeployer.deployRouterCustom(
            ercType,
            owner,
            recipientRouter,
            address(paymentToken),
            address(factory)
        );

        marketplaceDeployer.setFactory(marketplace, address(factory), owner);
        factoryDeployer.setRouter(factory, address(router), owner);

        // Return the addresses of the deployed contracts in an array
        deployedContracts = DeployedContracts({
            paymentToken: paymentToken,
            marketplace: marketplace,
            factory: factory,
            router: router
        });
    }
}
