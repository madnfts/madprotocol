import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Fixture } from "ethereum-waffle";
import { BigNumber, Signer } from "ethers";
import { ethers } from "hardhat";

import {
  MADFactory721,
  MADMarketplace721,
  MADRouter721,
} from "../../src/types";
import { getSignerAddrs } from "./fixtures";
import { MADFixture721 } from "./interfaces";

// export const allSigners = ethers.getSigners();
export const dead = ethers.constants.AddressZero;

export const mFixture721: Fixture<MADFixture721> =
  async function (): Promise<MADFixture721> {
    const { f721, m721, r721 } = await madFixture721();
    return { f721, m721, r721 };
  };

async function madFixture721(): Promise<MADFixture721> {
  const SplitterDeployer = await ethers.getContractFactory(
    "SplitterDeployer",
  );
  const splDep = await SplitterDeployer.deploy();

  const MinimalDeployer = await ethers.getContractFactory(
    "ERC721MinimalDeployer",
  );
  const minDep = await MinimalDeployer.deploy();

  const BasicDeployer = await ethers.getContractFactory(
    "ERC721BasicDeployer",
  );
  const basDep = await BasicDeployer.deploy();

  const WhitelistDeployer = await ethers.getContractFactory(
    "ERC721WhitelistDeployer",
  );
  const wlDep = await WhitelistDeployer.deploy();

  const LazyDeployer = await ethers.getContractFactory(
    "ERC721LazyDeployer",
  );
  const lazyDep = await LazyDeployer.deploy();

  const Factory = await ethers.getContractFactory(
    "MADFactory721",
    {
      libraries: {
        ERC721MinimalDeployer: minDep.address,
        ERC721BasicDeployer: basDep.address,
        ERC721WhitelistDeployer: wlDep.address,
        ERC721LazyDeployer: lazyDep.address,
        SplitterDeployer: splDep.address,
      },
    },
  );
  const Marketplace = await ethers.getContractFactory(
    "MADMarketplace721",
  );
  const Router = await ethers.getContractFactory(
    "MADRouter721",
  );

  const allSigners = await ethers.getSigners();
  const owner = getSignerAddrs(1, allSigners);

  const m721 = (await Marketplace.deploy(
    owner[0],
    300,
    dead,
  )) as MADMarketplace721;

  const f721 = (await Factory.deploy(
    m721.address,
    ethers.constants.AddressZero,
    owner[0],
  )) as MADFactory721;

  const r721 = (await Router.deploy(
    f721.address,
  )) as MADRouter721;

  await f721.setRouter(r721.address);
  await m721.setFactory(f721.address);

  return { f721, m721, r721 };
}
