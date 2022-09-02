import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import { ethers } from "hardhat";

const hre = require("hardhat");

const main = async () => {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with ${deployer.address}`);

  const MADMarketplace721 = await ethers.getContractFactory(
    "MADMarketplace721",
  );
  const m721 = await MADMarketplace721.deploy(
    deployer.address, // recipient addr
    300, // min order duration
    ethers.constants.AddressZero, // factory addr
  );

  console.log(`ERC721 Marketplace address: ${m721.address}`);

  const MADFactory721 = await ethers.getContractFactory(
    "MADFactory721",
  );
  const f721 = await MADFactory721.deploy(
    m721.address, // marketplace addr
    ethers.constants.AddressZero, // router addr
    deployer.address, // lazy signer addr
  );
  console.log(`ERC721 Factory address: ${f721.address}`);

  const MADRouter721 = await ethers.getContractFactory(
    "MADRouter721",
  );
  const r721 = await MADRouter721.deploy(f721.address);
  console.log(`ERC721 Router address: ${r721.address}`);

  await m721.connect(deployer).setFactory(f721.address);
  await f721.connect(deployer).setRouter(r721.address);

  console.log(` Core 721 Auth transfers executed.`);

  const MADMarketplace1155 = await ethers.getContractFactory(
    "MADMarketplace1155",
  );
  const m1155 = await MADMarketplace1155.deploy(
    deployer.address, // recipient addr
    300, // min order duration
    ethers.constants.AddressZero, // factory addr
  );

  console.log(
    `ERC1155 Marketplace address: ${m1155.address}`,
  );

  const MADFactory1155 = await ethers.getContractFactory(
    "MADFactory1155",
  );
  const f1155 = await MADFactory1155.deploy(
    m1155.address, // marketplace addr
    ethers.constants.AddressZero, // router addr
    deployer.address, // lazy signer addr
  );
  console.log(`ERC1155 Factory address: ${f1155.address}`);

  const MADRouter1155 = await ethers.getContractFactory(
    "MADRouter1155",
  );
  const r1155 = await MADRouter1155.deploy(f1155.address);
  console.log(`ERC1155 Router address: ${r1155.address}`);

  await m1155.connect(deployer).setFactory(f1155.address);
  await f1155.connect(deployer).setRouter(r1155.address);

  console.log(`Core 1155 Auth transfers executed.`);

  //verify
  await hre.run("verify:verify", {
    address: m721.address,
    constructorArguments: [
      deployer.address,
      300,
      ethers.constants.AddressZero,
    ],
  });
  await hre.run("verify:verify", {
    address: m1155.address,
    constructorArguments: [
      deployer.address,
      300,
      ethers.constants.AddressZero,
    ],
  });

  await hre.run("verify:verify", {
    address: r721.address,
    constructorArguments: [f721.address],
  });
  await hre.run("verify:verify", {
    address: r1155.address,
    constructorArguments: [f1155.address],
  });

  await hre.run("verify:verify", {
    address: f721.address,
    constructorArguments: [
      m721.address,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
    ],
  });
  await hre.run("verify:verify", {
    address: f1155.address,
    constructorArguments: [
      m1155.address,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
    ],
  });
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.log(error);
    process.exit(1);
  });
