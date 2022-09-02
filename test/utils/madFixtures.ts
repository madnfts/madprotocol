import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import {
  MADFactory721,
  MADFactory1155,
  MADMarketplace721,
  MADMarketplace1155,
  MADRouter721,
  MADRouter1155,
} from "../../src/types";
import { getSignerAddrs } from "./fixtures";
import { MADFixture721, MADFixture1155 } from "./interfaces";

// types
export type OrderDetails721 = {
  orderType: number;
  seller: string;
  token: string;
  tokenId: BigNumber;
  startPrice: BigNumber;
  endPrice: BigNumber;
  startBlock: BigNumber;
  endBlock: BigNumber;
  lastBidPrice: BigNumber;
  lastBidder: string;
  isSold: boolean;
};
export type OrderDetails1155 = {
  orderType: number;
  seller: string;
  token: string;
  tokenId: BigNumber;
  amount: BigNumber;
  startPrice: BigNumber;
  endPrice: BigNumber;
  startBlock: BigNumber;
  endBlock: BigNumber;
  lastBidPrice: BigNumber;
  lastBidder: string;
  isSold: boolean;
};
export type SplitterConfig = {
  splitter: string;
  splitterSalt: string;
  ambassador: string;
  ambShare: BigNumber;
  valid: boolean;
};
export type Collection = {
  creator: string;
  colType: number;
  colSalt: string;
  blocknumber: BigNumber;
  splitter: string;
};

// exported consts
export const dead = ethers.constants.AddressZero;

export const getOrderId721 = (
  blocknum: number,
  _token: string,
  _id: number,
  _seller: string,
): string => {
  const _hash = ethers.utils.solidityKeccak256(
    ["uint256", "address", "uint256", "address"],
    [blocknum, _token, _id, _seller],
  );
  return _hash;
};

export const getOrderId1155 = (
  blocknum: number,
  _token: string,
  _id: number,
  _amount: number,
  _seller: string,
): string => {
  const _hash = ethers.utils.solidityKeccak256(
    ["uint256", "address", "uint256", "uint256", "address"],
    [blocknum, _token, _id, _amount, _seller],
  );
  return _hash;
};

// exported async functions
export async function madFixture721A(): Promise<MADFixture721> {
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

export async function madFixture721B(): Promise<MADFixture721> {
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

export async function madFixture721C(): Promise<MADFixture721> {
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

export async function madFixture1155A(): Promise<MADFixture1155> {
  const SplitterDeployer = await ethers.getContractFactory(
    "SplitterDeployer",
  );
  const splDep = await SplitterDeployer.deploy();

  const MinimalDeployer = await ethers.getContractFactory(
    "ERC1155MinimalDeployer",
  );
  const minDep = await MinimalDeployer.deploy();

  const BasicDeployer = await ethers.getContractFactory(
    "ERC1155BasicDeployer",
  );
  const basDep = await BasicDeployer.deploy();

  const WhitelistDeployer = await ethers.getContractFactory(
    "ERC1155WhitelistDeployer",
  );
  const wlDep = await WhitelistDeployer.deploy();

  const LazyDeployer = await ethers.getContractFactory(
    "ERC1155LazyDeployer",
  );
  const lazyDep = await LazyDeployer.deploy();

  const Factory = await ethers.getContractFactory(
    "MADFactory1155",
    {
      libraries: {
        ERC1155MinimalDeployer: minDep.address,
        ERC1155BasicDeployer: basDep.address,
        ERC1155WhitelistDeployer: wlDep.address,
        ERC1155LazyDeployer: lazyDep.address,
        SplitterDeployer: splDep.address,
      },
    },
  );
  const Marketplace = await ethers.getContractFactory(
    "MADMarketplace1155",
  );
  const Router = await ethers.getContractFactory(
    "MADRouter1155",
  );

  const allSigners = await ethers.getSigners();
  const owner = getSignerAddrs(1, allSigners);

  const m1155 = (await Marketplace.deploy(
    owner[0],
    300,
    dead,
  )) as MADMarketplace1155;

  const f1155 = (await Factory.deploy(
    m1155.address,
    ethers.constants.AddressZero,
    owner[0],
  )) as MADFactory1155;

  const r1155 = (await Router.deploy(
    f1155.address,
  )) as MADRouter1155;

  await f1155.setRouter(r1155.address);
  await m1155.setFactory(f1155.address);

  return { f1155, m1155, r1155 };
}

export async function madFixture1155B(): Promise<MADFixture1155> {
  const SplitterDeployer = await ethers.getContractFactory(
    "SplitterDeployer",
  );
  const splDep = await SplitterDeployer.deploy();

  const MinimalDeployer = await ethers.getContractFactory(
    "ERC1155MinimalDeployer",
  );
  const minDep = await MinimalDeployer.deploy();

  const BasicDeployer = await ethers.getContractFactory(
    "ERC1155BasicDeployer",
  );
  const basDep = await BasicDeployer.deploy();

  const WhitelistDeployer = await ethers.getContractFactory(
    "ERC1155WhitelistDeployer",
  );
  const wlDep = await WhitelistDeployer.deploy();

  const LazyDeployer = await ethers.getContractFactory(
    "ERC1155LazyDeployer",
  );
  const lazyDep = await LazyDeployer.deploy();

  const Factory = await ethers.getContractFactory(
    "MADFactory1155",
    {
      libraries: {
        ERC1155MinimalDeployer: minDep.address,
        ERC1155BasicDeployer: basDep.address,
        ERC1155WhitelistDeployer: wlDep.address,
        ERC1155LazyDeployer: lazyDep.address,
        SplitterDeployer: splDep.address,
      },
    },
  );
  const Marketplace = await ethers.getContractFactory(
    "MADMarketplace1155",
  );
  const Router = await ethers.getContractFactory(
    "MADRouter1155",
  );

  const allSigners = await ethers.getSigners();
  const owner = getSignerAddrs(1, allSigners);

  const m1155 = (await Marketplace.deploy(
    owner[0],
    300,
    dead,
  )) as MADMarketplace1155;

  const f1155 = (await Factory.deploy(
    m1155.address,
    ethers.constants.AddressZero,
    owner[0],
  )) as MADFactory1155;

  const r1155 = (await Router.deploy(
    f1155.address,
  )) as MADRouter1155;

  await f1155.setRouter(r1155.address);
  await m1155.setFactory(f1155.address);

  return { f1155, m1155, r1155 };
}

export async function madFixture1155C(): Promise<MADFixture1155> {
  const SplitterDeployer = await ethers.getContractFactory(
    "SplitterDeployer",
  );
  const splDep = await SplitterDeployer.deploy();

  const MinimalDeployer = await ethers.getContractFactory(
    "ERC1155MinimalDeployer",
  );
  const minDep = await MinimalDeployer.deploy();

  const BasicDeployer = await ethers.getContractFactory(
    "ERC1155BasicDeployer",
  );
  const basDep = await BasicDeployer.deploy();

  const WhitelistDeployer = await ethers.getContractFactory(
    "ERC1155WhitelistDeployer",
  );
  const wlDep = await WhitelistDeployer.deploy();

  const LazyDeployer = await ethers.getContractFactory(
    "ERC1155LazyDeployer",
  );
  const lazyDep = await LazyDeployer.deploy();

  const Factory = await ethers.getContractFactory(
    "MADFactory1155",
    {
      libraries: {
        ERC1155MinimalDeployer: minDep.address,
        ERC1155BasicDeployer: basDep.address,
        ERC1155WhitelistDeployer: wlDep.address,
        ERC1155LazyDeployer: lazyDep.address,
        SplitterDeployer: splDep.address,
      },
    },
  );
  const Marketplace = await ethers.getContractFactory(
    "MADMarketplace1155",
  );
  const Router = await ethers.getContractFactory(
    "MADRouter1155",
  );

  const allSigners = await ethers.getSigners();
  const owner = getSignerAddrs(1, allSigners);

  const m1155 = (await Marketplace.deploy(
    owner[0],
    300,
    dead,
  )) as MADMarketplace1155;

  const f1155 = (await Factory.deploy(
    m1155.address,
    ethers.constants.AddressZero,
    owner[0],
  )) as MADFactory1155;

  const r1155 = (await Router.deploy(
    f1155.address,
  )) as MADRouter1155;

  await f1155.setRouter(r1155.address);
  await m1155.setFactory(f1155.address);

  return { f1155, m1155, r1155 };
}
