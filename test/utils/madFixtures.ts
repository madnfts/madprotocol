import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";

import {
  MADFactory721,
  MADFactory1155,
  MADMarketplace721,
  MADMarketplace1155,
  MADRouter721,
  MADRouter1155,
  MockERC20,
} from "../../src/types";
import { getSignerAddrs } from "./fixtures";
import {
  MADFixture721,
  MADFixture721ERC20,
  MADFixture1155,
  MADFixture1155ERC20,
} from "./interfaces";

// types
export type OrderDetails721 = {
  orderType: number;
  seller: string;
  token: string;
  tokenId: BigNumber;
  startPrice: BigNumber;
  endPrice: BigNumber;
  startTime: BigNumber;
  endTime: BigNumber;
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
  startTime: BigNumber;
  endTime: BigNumber;
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

const sharedRouterAddress =
  "0xE592427A0AEce92De3Edee1F18E0157C05861564";

const wmatic_addr =
  "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";

// exported consts
export const dead = ethers.constants.AddressZero;

async function getWMatic(): Promise<MockERC20> {
  const wrapped: MockERC20 = (await ethers.getContractAt(
    "contracts/lib/test/erc20-mock.sol:ERC20",
    wmatic_addr,
  )) as MockERC20;

  return wrapped;
}

async function createERC20(): Promise<MockERC20> {
  const ERC20 = await ethers.getContractFactory("MockERC20");
  const erc20 = (await ERC20.deploy(
    BigNumber.from(2).pow(255),
  )) as MockERC20;
  return await erc20.deployed();
}

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

type SharedDeployResult = {
  owner: string[];
  Marketplace: any;
  Factory: any;
  Router: any;
};

async function _deployShared(
  contractType: string,
): Promise<SharedDeployResult> {
  const Marketplace = await ethers.getContractFactory(
    `MADMarketplace${contractType}`,
  );
  const Router = await ethers.getContractFactory(
    `MADRouter${contractType}`,
  );

  // Library deployers
  const SplitterDeployer = await ethers.getContractFactory(
    "SplitterDeployer",
  );
  const splDep = await SplitterDeployer.deploy();

  const BasicDeployer = await ethers.getContractFactory(
    `ERC${contractType}BasicDeployer`,
  );
  const basDep = await BasicDeployer.deploy();

  const lib: { [key: string]: string } = {
    SplitterDeployer: splDep.address,
  };

  lib[`ERC${contractType}BasicDeployer`] = basDep.address;

  const Factory = await ethers.getContractFactory(
    `MADFactory${contractType}`,
    {
      libraries: lib,
    },
  );

  const allSigners = await ethers.getSigners();
  const owner = getSignerAddrs(1, allSigners);
  return { owner, Marketplace, Factory, Router };
}
// Base 721 fixture
async function createMadFixture721(
  erc20?: MockERC20,
  swapRouterAddress?: string,
): Promise<MADFixture721 | MADFixture721ERC20> {
  var erc20Address;
  // common setup
  if (erc20) {
    erc20Address = erc20.address;
  }

  const { owner, Marketplace, Factory, Router } =
    await _deployShared("721");

  const m721 = (await Marketplace.deploy(
    owner[0],
    erc20Address || dead,
    swapRouterAddress || dead,
  )) as MADMarketplace721;

  const f721 = (await Factory.deploy(
    m721.address,
    owner[0],
    erc20Address || dead,
  )) as MADFactory721;

  const r721 = (await Router.deploy(
    f721.address,
    erc20Address || dead,
    owner[0],
  )) as MADRouter721;

  await f721.setRouter(r721.address);
  await m721.setFactory(f721.address);

  // return { f721, m721, r721 };
  return { f721, m721, r721, erc20 };
}

// Base 1155 fixture
async function createMadFixture1155(
  erc20?: MockERC20,
  swapRouterAddress?: string,
): Promise<MADFixture1155 | MADFixture1155ERC20> {
  var erc20Address;
  // common setup
  if (erc20) {
    erc20Address = erc20.address;
  }

  const { owner, Marketplace, Factory, Router } =
    await _deployShared("1155");

  const m1155 = (await Marketplace.deploy(
    owner[0],
    erc20Address || dead,
    swapRouterAddress || dead,
  )) as MADMarketplace1155;

  const f1155 = (await Factory.deploy(
    m1155.address,
    owner[0],
    erc20Address || dead,
  )) as MADFactory1155;

  const r1155 = (await Router.deploy(
    f1155.address,
    erc20Address || dead,
    owner[0],
  )) as MADRouter1155;

  await f1155.setRouter(r1155.address);
  await m1155.setFactory(f1155.address);

  // return { f1155, m1155, r1155 };
  return { f1155, m1155, r1155, erc20 };
}

export async function madFixture721A(): Promise<MADFixture721> {
  return createMadFixture721() as Promise<MADFixture721>;
}

export async function madFixture721B(): Promise<MADFixture721> {
  return createMadFixture721() as Promise<MADFixture721>;
}

export async function madFixture721C(): Promise<MADFixture721> {
  return createMadFixture721() as Promise<MADFixture721>;
}

export async function madFixture721D(): Promise<MADFixture721ERC20> {
  return createMadFixture721(
    await createERC20(),
    sharedRouterAddress,
  ) as Promise<MADFixture721ERC20>;
}

export async function madFixture721E(): Promise<MADFixture721ERC20> {
  return createMadFixture721(
    await createERC20(),
    sharedRouterAddress,
  ) as Promise<MADFixture721ERC20>;
}

export async function madFixture721F(): Promise<MADFixture721ERC20> {
  return createMadFixture721(
    await getWMatic(),
    sharedRouterAddress,
  ) as Promise<MADFixture721ERC20>;
}

export async function madFixture1155A(): Promise<MADFixture1155> {
  return createMadFixture1155() as Promise<MADFixture1155>;
}

export async function madFixture1155B(): Promise<MADFixture1155> {
  return createMadFixture1155() as Promise<MADFixture1155>;
}

export async function madFixture1155C(): Promise<MADFixture1155> {
  return createMadFixture1155() as Promise<MADFixture1155>;
}

export async function madFixture1155D(): Promise<MADFixture1155ERC20> {
  return createMadFixture1155(
    await createERC20(),
    sharedRouterAddress,
  ) as Promise<MADFixture1155ERC20>;
}

export async function madFixture1155E(): Promise<MADFixture1155ERC20> {
  return createMadFixture1155(
    await createERC20(),
    sharedRouterAddress,
  ) as Promise<MADFixture1155ERC20>;
}

export async function madFixture1155F(): Promise<MADFixture1155ERC20> {
  return createMadFixture1155(
    await getWMatic(),
    sharedRouterAddress,
  ) as Promise<MADFixture1155ERC20>;
}
