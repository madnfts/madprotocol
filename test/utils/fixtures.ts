import {
  SignTypedDataVersion,
  TypedDataUtils,
  recoverTypedSignature,
  signTypedData,
} from "@metamask/eth-sig-util";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Signer } from "ethers";
import { ethers } from "hardhat";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";

import {
  ERC721Basic, // ERC721Lazy,
  // ERC721Minimal,
  // ERC721Whitelist,
  ERC1155Basic, // ERC1155Lazy,
  // ERC1155Minimal,
  // ERC1155Whitelist,
  MockERC20,
  MockERC2981,
  SplitterImpl,
} from "../../src/types";
import {
  BasicFixture721,
  BasicFixture1155,
  ColArgs,
  ERC20Fixture,
  LazyFixture721,
  LazyFixture1155,
  MinimalFixture721,
  MinimalFixture1155,
  RoyaltiesFixture,
  SplitterFixture,
  WhitelistFixture721,
  WhitelistFixture1155,
} from "./interfaces";

// types
type SplitterAndMinimal721 = SplitterFixture &
  MinimalFixture721;
type SplitterAndMinimal721ERC20 = SplitterFixture &
  MinimalFixture721 &
  ERC20Fixture;
type SplitterAndBasic721 = SplitterFixture & BasicFixture721;
type SplitterAndBasic721ERC20 = SplitterFixture &
  BasicFixture721 &
  ERC20Fixture;
type SplitterAndWhitelist721 = SplitterFixture &
  WhitelistFixture721;
type SplitterAndWhitelist721ERC20 = SplitterFixture &
  WhitelistFixture721 &
  ERC20Fixture;
type SplitterAndLazy721 = SplitterFixture & LazyFixture721;
type SplitterAndLazy721ERC20 = SplitterFixture &
  LazyFixture721 &
  ERC20Fixture;

type SplitterAndMinimal1155 = SplitterFixture &
  MinimalFixture1155;
type SplitterAndMinimal1155ERC20 = SplitterFixture &
  MinimalFixture1155 &
  ERC20Fixture;
type SplitterAndBasic1155 = SplitterFixture &
  BasicFixture1155;
type SplitterAndBasic1155ERC20 = SplitterFixture &
  BasicFixture1155 &
  ERC20Fixture;
type SplitterAndWhitelist1155 = SplitterFixture &
  WhitelistFixture1155;
type SplitterAndWhitelist1155ERC20 = SplitterFixture &
  WhitelistFixture1155 &
  ERC20Fixture;
type SplitterAndLazy1155 = SplitterFixture & LazyFixture1155;
type SplitterAndLazy1155ERC20 = SplitterFixture &
  LazyFixture1155 &
  ERC20Fixture;

export const maxSupply = ethers.BigNumber.from(1000);

// exported consts
export const signer = ethers.provider.getSigner();

export const getSignerAddrs = (
  amount: number,
  addrs: SignerWithAddress[],
): string[] => {
  const signers: string[] = [];
  const buffr = addrs.slice(0, amount);
  for (let i = 0; i < amount; i++) {
    signers.push(buffr[i].address);
  }
  return signers;
};

export const randomSigners = (amount: number): Signer[] => {
  const signers: Signer[] = [];
  for (let i = 0; i < amount; i++) {
    signers.push(ethers.Wallet.createRandom());
  }
  return signers;
};

export const getError = (Error: string) =>
  ethers.utils
    .keccak256(ethers.utils.toUtf8Bytes(Error))
    .slice(0, 10);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const padBuffer = (addr: any) => {
  return Buffer.from(
    addr.substr(2).padStart(32 * 2, 0),
    "hex",
  );
};

// exported async functions
export async function erc2981Fixture(): Promise<RoyaltiesFixture> {
  const [owner] = await ethers.getSigners();
  const ERC2981 = await ethers.getContractFactory(
    "MockERC2981",
  );

  const erc2981 = (await ERC2981.deploy(
    750,
    owner.address,
  )) as MockERC2981;

  return { erc2981 };
}

export async function splitterFixture(): Promise<SplitterFixture> {
  const Splitter = await ethers.getContractFactory(
    "SplitterImpl",
  );
  const [owner, amb, mad] = await ethers.getSigners();
  const payees = [mad.address, amb.address, owner.address];
  const shares = [10, 20, 70];

  const splitter = (await Splitter.deploy(
    payees,
    shares,
  )) as SplitterImpl;

  return { splitter };
}

export async function basicFixture721(): Promise<SplitterAndBasic721> {
  const Splitter = await ethers.getContractFactory(
    "SplitterImpl",
  );
  const [owner, amb, mad] = await ethers.getSigners();
  const payees = [mad.address, amb.address, owner.address];
  const shares = [10, 20, 70];

  const splitter = (await Splitter.deploy(
    payees,
    shares,
  )) as SplitterImpl;

  const Basic = await ethers.getContractFactory(
    "ERC721Basic",
  );

  const args: ColArgs = {
    _name: "721Basic",
    _symbol: "BASIC",
    _baseURI: "ipfs://cid/",
    _price: ethers.utils.parseEther("1"),
    _maxSupply: ethers.BigNumber.from(1000),
    _splitter: splitter.address,
    _fraction: ethers.BigNumber.from(750),
    _router: mad.address,
    _erc20: ethers.constants.AddressZero,
  };

  const basic = (await Basic.deploy(args, [])) as ERC721Basic;
  return { basic, splitter };
}

export async function basicFixture721ERC20(): Promise<SplitterAndBasic721ERC20> {
  const ERC20 = await ethers.getContractFactory("MockERC20");
  const erc20 = (await ERC20.deploy(
    BigNumber.from(2).pow(255),
  )) as MockERC20;

  const Splitter = await ethers.getContractFactory(
    "SplitterImpl",
  );
  const [owner, amb, mad] = await ethers.getSigners();
  const payees = [mad.address, amb.address, owner.address];
  const shares = [10, 20, 70];

  const splitter = (await Splitter.deploy(
    payees,
    shares,
  )) as SplitterImpl;

  const Basic = await ethers.getContractFactory(
    "ERC721Basic",
  );

  const args: ColArgs = {
    _name: "721Basic",
    _symbol: "BASIC",
    _baseURI: "ipfs://cid/",
    _price: ethers.utils.parseEther("1"),
    _maxSupply: ethers.BigNumber.from(1000),
    _splitter: splitter.address,
    _fraction: ethers.BigNumber.from(750),
    _router: mad.address,
    _erc20: erc20.address,
  };

  const basic = (await Basic.deploy(args, [])) as ERC721Basic;
  return { basic, splitter, erc20 };
}

export async function basicFixture1155(): Promise<SplitterAndBasic1155> {
  const Splitter = await ethers.getContractFactory(
    "SplitterImpl",
  );
  const [owner, amb, mad] = await ethers.getSigners();
  const payees = [mad.address, amb.address, owner.address];
  const shares = [10, 20, 70];

  const splitter = (await Splitter.deploy(
    payees,
    shares,
  )) as SplitterImpl;

  console.log(splitter.address);

  const Basic = await ethers.getContractFactory(
    "ERC1155Basic",
  );

  const args: ColArgs = {
    _name: "",
    _symbol: "",
    _baseURI: "ipfs://cid/",
    _price: ethers.utils.parseEther("1"),
    _maxSupply: maxSupply,
    _splitter: splitter.address,
    _fraction: ethers.BigNumber.from(750),
    _router: mad.address,
    _erc20: ethers.constants.AddressZero,
  };

  const basic = (await Basic.deploy(
    args,
    [],
  )) as ERC1155Basic;
  return { basic, splitter };
}

export async function basicFixture1155ERC20(): Promise<SplitterAndBasic1155ERC20> {
  const ERC20 = await ethers.getContractFactory("MockERC20");
  const erc20 = (await ERC20.deploy(
    BigNumber.from(2).pow(255),
  )) as MockERC20;

  const Splitter = await ethers.getContractFactory(
    "SplitterImpl",
  );
  const [owner, amb, mad] = await ethers.getSigners();
  const payees = [mad.address, amb.address, owner.address];
  const shares = [10, 20, 70];

  const splitter = (await Splitter.deploy(
    payees,
    shares,
  )) as SplitterImpl;

  const Basic = await ethers.getContractFactory(
    "ERC1155Basic",
  );

  const args: ColArgs = {
    _name: "",
    _symbol: "",
    _baseURI: "ipfs://cid/",
    _price: ethers.utils.parseEther("1"),
    _maxSupply: maxSupply,
    _splitter: splitter.address,
    _fraction: ethers.BigNumber.from(750),
    _router: owner.address,
    _erc20: erc20.address,
  };

  const basic = (await Basic.deploy(
    args,
    [],
  )) as ERC1155Basic;
  return { basic, splitter, erc20 };
}
