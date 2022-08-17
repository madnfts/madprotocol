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
    deployer.address,
    300,
    ethers.constants.AddressZero,
  );

  console.log(`ERC721 Marketplace address: ${m721.address}`);

  const MADFactory721 = await ethers.getContractFactory(
    "MADFactory721",
  );
  const f721 = await MADFactory721.deploy(
    m721.address,
    ethers.constants.AddressZero,
    ethers.constants.AddressZero,
  );
  console.log(`ERC721 Factory address: ${f721.address}`);

  const MADRouter721 = await ethers.getContractFactory(
    "MADRouter721",
  );
  const r721 = await MADRouter721.deploy(f721.address);
  console.log(`ERC721 Router address: ${r721.address}`);

  await m721.connect(deployer).setFactory(f721.address);
  await f721.connect(deployer).setRouter(r721.address);
  await f721.connect(deployer).setSigner(deployer.address);
  // await r721.connect(deployer).setSigner(deployer.address);

  console.log(`Auth transfers executed.`);

  //verify
  // const verify = async () => {
  await hre.run("verify:verify", {
    address: m721.address,
    constructorArguments: [
      deployer.address,
      300,
      ethers.constants.AddressZero,
    ],
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
    address: r721.address,
    constructorArguments: [f721.address],
  });
  // };

  // verify()
  //   .then(() => process.exit(0))
  //   .catch(error => {
  //     console.log(error);
  //     process.exit(1);
  //   });
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.log(error);
    process.exit(1);
  });
