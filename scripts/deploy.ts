import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import { config } from "dotenv";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { resolve } from "path";

import { MockERC20 } from "../src/types";

config({ path: resolve(__dirname, "./.env") });

const { UNISWAP_ROUTER, ERC20_TOKEN } = process.env;

const deployERC20 = async () => {
  const ERC20 = await ethers.getContractFactory("MockERC20");
  const erc20 = await ERC20.deploy(BigNumber.from(2).pow(255)) as MockERC20;
  console.log(`MockERC20 address: ${erc20.address}`);
  return erc20;
};

const deployMarketplace = async (erc20Address) => {
  const MADMarketplace721 = await ethers.getContractFactory("MADMarketplace721");
  const m721 = await MADMarketplace721.deploy(erc20Address, UNISWAP_ROUTER);
  console.log(`ERC721 Marketplace address: ${m721.address}`);

  const MADMarketplace1155 = await ethers.getContractFactory("MADMarketplace1155");
  const m1155 = await MADMarketplace1155.deploy(erc20Address, UNISWAP_ROUTER);
  console.log(`ERC1155 Marketplace address: ${m1155.address}`);

  return { m721, m1155 };
};

const deployFactory = async (erc20Address) => {
  const MADFactory = await ethers.getContractFactory("MADFactory");
  const factory = await MADFactory.deploy(erc20Address);
  console.log(`Factory address: ${factory.address}`);
  return factory;
};

const deployRouter = async (erc20Address, factoryAddress, deployerAddress ) => {
  const MADRouter = await ethers.getContractFactory("MADRouter");
  const router = await MADRouter.deploy(factoryAddress, erc20Address, deployerAddress);
  console.log(`Router address: ${router.address}`);
  return router;
};

const main = async () => {
  const ERC721Basic = await ethers.getContractFactory(
    "ERC721Basic",
  );
  const ERC1155Basic = await ethers.getContractFactory(
    "ERC1155Basic",
  );

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with ${deployer.address}`);

  try {


    let erc20Address = ethers.constants.AddressZero;
    if (ERC20_TOKEN === "mock") {
      let erc20 = await deployERC20();
      erc20Address = erc20.address;
    } else if (ERC20_TOKEN) {
      erc20Address = ERC20_TOKEN;
      console.log(`ERC20 address: ${erc20Address}`);
    }

    // const { m721, m1155 } = await deployMarketplace(erc20Address);

    const factory = await deployFactory(erc20Address);
    const router = await deployRouter(erc20Address, factory.address, deployer.address);
    await factory.connect(deployer).setRouter(router.address);

    console.log(`Router Address Set..`);

    await factory.addCollectionType(
      ethers.constants.One,
      ERC721Basic.bytecode,
    );

      console.log(`Collection Type ERC721 Added..`)

    await factory.addCollectionType(
      ethers.constants.Two,
      ERC1155Basic.bytecode,
    );

      console.log(`Collection Type ERC1155 Added..`)

    console.log("Deployment completed successfully.");
    process.exit(0);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();
