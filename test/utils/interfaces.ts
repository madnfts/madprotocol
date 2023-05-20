import { BigNumber, Signature, Wallet, ethers } from "ethers";

import {
  ERC721Basic,
  ERC721Lazy,
  ERC721Minimal,
  ERC721Whitelist,
  ERC1155Basic,
  ERC1155Lazy,
  ERC1155Minimal,
  ERC1155Whitelist,
  IERC165__factory,
  IERC721Metadata__factory,
  IERC721__factory,
  IERC1155Metadata__factory,
  IERC1155__factory,
  IERC2981__factory,
  MADFactory721,
  MADFactory1155,
  MADMarketplace721,
  MADMarketplace1155,
  MADRouter721,
  MADRouter1155,
  MockERC20,
  MockERC2981,
  SplitterImpl,
} from "../../src/types";

// exported interfaces
export interface RoyaltiesFixture {
  erc2981: MockERC2981;
}
export interface ERC20Fixture {
  erc20: MockERC20;
}
export interface SplitterFixture {
  splitter: SplitterImpl;
}
export interface MinimalFixture721 {
  minimal: ERC721Minimal;
}
export interface BasicFixture721 {
  basic: ERC721Basic;
}
export interface WhitelistFixture721 {
  wl: ERC721Whitelist;
  proof: string[];
  wrongProof: string[];
  merkleRoot: string;
}
export interface LazyFixture721 {
  lazy: ERC721Lazy;
  signature: string;
  sigSplit: Signature;
  sigSplit2: Signature;
  signerAddr: string;
  signer: Wallet;
  recover: string;
  domainCheck: string;
  wrongSig: string;
  voucher: Voucher;
  voucher2: Voucher;
}
export interface Voucher {
  voucherId: string;
  users: string[];
  balances: number[];
  amount: number;
  price: string;
}

export interface MinimalFixture1155 {
  minimal: ERC1155Minimal;
}
export interface BasicFixture1155 {
  basic: ERC1155Basic;
}
export interface WhitelistFixture1155 {
  wl: ERC1155Whitelist;
  proof: string[];
  wrongProof: string[];
  merkleRoot: string;
}
export interface LazyFixture1155 {
  lazy: ERC1155Lazy;
  vSig: string;
  vSigSplit: Signature;
  vSigSplit2: Signature;
  vRecover: string;
  ubSig: string;
  ubSigSplit: Signature;
  ubRecover: string;
  signerAddr: string;
  signer: Wallet;
  domainCheck: string;
  wrongSig: string;
  voucher: Voucher;
  voucher2: Voucher;
  userBatch: UserBatch;
}
export interface UserBatch {
  voucherId: string;
  ids: number[];
  balances: number[];
  price: string;
  user: string;
}

export interface MADFixture721 {
  f721: MADFactory721;
  m721: MADMarketplace721;
  r721: MADRouter721;
}
export interface MADFixture721ERC20 {
  f721: MADFactory721;
  m721: MADMarketplace721;
  r721: MADRouter721;
  erc20: MockERC20;
}
export interface MADFixture1155 {
  f1155: MADFactory1155;
  m1155: MADMarketplace1155;
  r1155: MADRouter1155;
}
export interface MADFixture1155ERC20 {
  f1155: MADFactory1155;
  m1155: MADMarketplace1155;
  r1155: MADRouter1155;
  erc20: MockERC20;
}

export interface ColArgs {
  _name: string;
  _symbol: string;
  _baseURI: string;
  _price: BigNumber;
  _maxSupply: BigNumber;
  _splitter: string;
  _fraction: BigNumber;
  _router: string;
  _erc20: string;
}

// exported consts
// 0x5b5e139f
export const ERC721MetadataInterface =
  IERC721Metadata__factory.createInterface();
// 0x01ffc9a7
export const ERC165Interface =
  IERC165__factory.createInterface();
// 0x2a55205a
export const ERC2981Interface =
  IERC2981__factory.createInterface();
// 0x80ac58cd
export const ERC721Interface =
  IERC721__factory.createInterface();
// 0xd9b67a26
export const ERC1155Interface =
  IERC1155__factory.createInterface();
// 0x0e89341c
export const ERC1155MetadataInterface =
  IERC1155Metadata__factory.createInterface();

// exported fx
export function getInterfaceID(
  contractInterface: ethers.utils.Interface,
) {
  let interfaceID: ethers.BigNumber = ethers.constants.Zero;
  const functions: string[] = Object.keys(
    contractInterface.functions,
  );
  for (let i = 0; i < functions.length; i++) {
    interfaceID = interfaceID.xor(
      contractInterface.getSighash(functions[i]),
    );
  }

  return { interfaceID };
}
