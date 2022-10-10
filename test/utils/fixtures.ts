import {
  SignTypedDataVersion,
  TypedDataUtils,
  recoverTypedSignature,
  signTypedData,
} from "@metamask/eth-sig-util";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";

import {
  ERC721Basic,
  ERC721Lazy,
  ERC721Minimal,
  ERC721Whitelist,
  ERC1155Basic,
  ERC1155Lazy,
  ERC1155Minimal,
  ERC1155Whitelist,
  MockERC2981,
  SplitterImpl,
} from "../../src/types";
import {
  BasicFixture721,
  BasicFixture1155,
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
type SplitterAndBasic721 = SplitterFixture & BasicFixture721;
type SplitterAndWhitelist721 = SplitterFixture &
  WhitelistFixture721;
type SplitterAndLazy721 = SplitterFixture & LazyFixture721;

type SplitterAndMinimal1155 = SplitterFixture &
  MinimalFixture1155;
type SplitterAndBasic1155 = SplitterFixture &
  BasicFixture1155;
type SplitterAndWhitelist1155 = SplitterFixture &
  WhitelistFixture1155;
type SplitterAndLazy1155 = SplitterFixture & LazyFixture1155;

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

export async function minimalFixture721(): Promise<SplitterAndMinimal721> {
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

  const Minimal = await ethers.getContractFactory(
    "ERC721Minimal",
  );

  const minimal = (await Minimal.deploy(
    "721Minimal",
    "MIN",
    "ipfs://cid/id.json",
    ethers.utils.parseEther("1"),
    splitter.address,
    750,
    owner.address,
  )) as ERC721Minimal;
  return { minimal, splitter };
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

  const basic = (await Basic.deploy(
    "721Basic",
    "BASIC",
    "ipfs://cid/",
    ethers.utils.parseEther("1"),
    1000,
    splitter.address,
    750,
    owner.address,
  )) as ERC721Basic;
  return { basic, splitter };
}

export async function whitelistFixture721(): Promise<SplitterAndWhitelist721> {
  const Splitter = await ethers.getContractFactory(
    "SplitterImpl",
  );
  const [owner, amb, mad /*,  acc01, acc02 */] =
    await ethers.getSigners();
  const payees = [mad.address, amb.address, owner.address];
  const shares = [10, 20, 70];

  const splitter = (await Splitter.deploy(
    payees,
    shares,
  )) as SplitterImpl;

  const WL = await ethers.getContractFactory(
    "ERC721Whitelist",
  );

  const signers = await ethers.getSigners();
  const whitelisted = signers.slice(0, 2);
  const notwhitelisted = signers.slice(3, 5);

  const leaves = whitelisted.map(account =>
    padBuffer(account.address),
  );
  const tree = new MerkleTree(leaves, keccak256, {
    sort: true,
  });
  const merkleRoot: string = tree.getHexRoot();
  const proof: string[] = tree.getHexProof(
    padBuffer(whitelisted[0].address),
  );

  const wrongProof: string[] = tree.getHexProof(
    padBuffer(notwhitelisted[0].address),
  );

  const wl = (await WL.deploy(
    "721Whitelist",
    "WHITELIST",
    "ipfs://cid/",
    ethers.utils.parseEther("1"),
    1000,
    splitter.address,
    750,
    owner.address,
  )) as ERC721Whitelist;

  // asynchronous contract calls
  await wl.whitelistConfig(
    ethers.utils.parseEther("1"),
    100,
    merkleRoot,
  );
  // we pass the merkle root of the same addresses for test economy
  await wl.freeConfig(1, 10, merkleRoot);

  return {
    wl,
    splitter,
    proof,
    wrongProof,
    merkleRoot,
  };
}

export async function lazyFixture721(): Promise<SplitterAndLazy721> {
  const Splitter = await ethers.getContractFactory(
    "SplitterImpl",
  );
  const allSigners = await ethers.getSigners();
  const usrs = getSignerAddrs(3, allSigners);
  const vId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("voucher"),
  );

  const [owner, amb, mad] = await ethers.getSigners();
  const payees = [mad.address, amb.address, owner.address];
  const shares = [10, 20, 70];

  const splitter = (await Splitter.deploy(
    payees,
    shares,
  )) as SplitterImpl;

  const Lazy = await ethers.getContractFactory("ERC721Lazy");

  const signer = ethers.Wallet.createRandom();
  const wSigner = ethers.Wallet.createRandom();
  const signerAddr = (
    await signer.getAddress()
  ).toLowerCase();
  const pk = Buffer.from(signer.privateKey.slice(2), "hex");
  const wPk = Buffer.from(wSigner.privateKey.slice(2), "hex");

  const lazy = (await Lazy.deploy(
    "721Lazy",
    "LAZY",
    "ipfs://cid/",
    splitter.address,
    750,
    owner.address,
    signerAddr,
  )) as ERC721Lazy;

  const net = await lazy.provider.getNetwork();
  const chainId = net.chainId;
  const bnPrice = ethers.utils.parseEther("1");

  const domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ];
  const voucherType = [
    { name: "voucherId", type: "bytes32" },
    { name: "users", type: "address[]" },
    { name: "balances", type: "uint256[]" },
    { name: "amount", type: "uint256" },
    { name: "price", type: "uint256" },
  ];
  const domainData = {
    name: "721Lazy",
    version: "1",
    chainId: chainId,
    verifyingContract: lazy.address,
  };
  const Voucher = {
    voucherId: vId,
    users: usrs,
    balances: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    amount: 10,
    price: bnPrice.toString(),
  };
  const data = JSON.stringify({
    types: {
      EIP712Domain: domain,
      Voucher: voucherType,
    },
    primaryType: "Voucher",
    domain: domainData,
    message: Voucher,
  });

  const parsedData = JSON.parse(data);
  const signature = signTypedData({
    privateKey: pk,
    data: parsedData,
    version: SignTypedDataVersion.V4,
  });
  const wrongSig = signTypedData({
    privateKey: wPk,
    data: parsedData,
    version: SignTypedDataVersion.V4,
  });
  const recover = recoverTypedSignature({
    data: parsedData,
    signature: signature,
    version: SignTypedDataVersion.V4,
  });

  async function domainSeparator(
    name: string,
    version: string,
    chainId: number,
    verifyingContract: string,
  ) {
    return (
      "0x" +
      TypedDataUtils.hashStruct(
        "EIP712Domain",
        {
          name,
          version,
          chainId,
          verifyingContract,
        },
        { EIP712Domain: domain },
        SignTypedDataVersion.V4,
      ).toString("hex")
    );
  }

  const domainCheck = await domainSeparator(
    "721Lazy",
    "1",
    chainId,
    lazy.address,
  );
  const voucher = Voucher;
  const sigSplit = ethers.utils.splitSignature(signature);

  return {
    splitter,
    lazy,
    signature,
    sigSplit,
    signer,
    signerAddr,
    recover,
    domainCheck,
    wrongSig,
    voucher,
  };
}

export async function minimalFixture1155(): Promise<SplitterAndMinimal1155> {
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

  const Minimal = await ethers.getContractFactory(
    "ERC1155Minimal",
  );

  const minimal = (await Minimal.deploy(
    "ipfs://cid/id.json",
    ethers.utils.parseEther("1"),
    splitter.address,
    750,
    owner.address,
  )) as ERC1155Minimal;
  return { minimal, splitter };
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

  const Basic = await ethers.getContractFactory(
    "ERC1155Basic",
  );

  const basic = (await Basic.deploy(
    "ipfs://cid/",
    ethers.utils.parseEther("1"),
    1000,
    splitter.address,
    750,
    owner.address,
  )) as ERC1155Basic;
  return { basic, splitter };
}

export async function whitelistFixture1155(): Promise<SplitterAndWhitelist1155> {
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

  const WL = await ethers.getContractFactory(
    "ERC1155Whitelist",
  );

  const signers = await ethers.getSigners();
  const whitelisted = signers.slice(0, 2);
  const notwhitelisted = signers.slice(3, 5);

  const leaves = whitelisted.map(account =>
    padBuffer(account.address),
  );
  const tree = new MerkleTree(leaves, keccak256, {
    sort: true,
  });
  const merkleRoot: string = tree.getHexRoot();
  const proof: string[] = tree.getHexProof(
    padBuffer(whitelisted[0].address),
  );

  const wrongProof: string[] = tree.getHexProof(
    padBuffer(notwhitelisted[0].address),
  );

  const wl = (await WL.deploy(
    "ipfs://cid/",
    ethers.utils.parseEther("1"),
    1000,
    splitter.address,
    750,
    owner.address,
  )) as ERC1155Whitelist;

  // asynchronous contract calls
  await wl.whitelistConfig(
    ethers.utils.parseEther("1"),
    100,
    merkleRoot,
  );
  // we pass the merkle root of the same addresses for test economy
  await wl.freeConfig(1, 10, merkleRoot);

  return {
    wl,
    splitter,
    proof,
    wrongProof,
    merkleRoot,
  };
}

export async function lazyFixture1155(): Promise<SplitterAndLazy1155> {
  const Splitter = await ethers.getContractFactory(
    "SplitterImpl",
  );
  const allSigners = await ethers.getSigners();
  const usrs = getSignerAddrs(3, allSigners);
  const vId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("voucher"),
  );
  const vId2 = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("batch"),
  );

  const [owner, amb, mad] = await ethers.getSigners();
  const payees = [mad.address, amb.address, owner.address];
  const shares = [10, 20, 70];

  const splitter = (await Splitter.deploy(
    payees,
    shares,
  )) as SplitterImpl;

  const Lazy = await ethers.getContractFactory("ERC1155Lazy");

  const signer = ethers.Wallet.createRandom();
  const wSigner = ethers.Wallet.createRandom();
  const signerAddr = (
    await signer.getAddress()
  ).toLowerCase();
  const pk = Buffer.from(signer.privateKey.slice(2), "hex");
  const wPk = Buffer.from(wSigner.privateKey.slice(2), "hex");

  const lazy = (await Lazy.deploy(
    "ipfs://cid/",
    splitter.address,
    750,
    owner.address,
    signerAddr,
  )) as ERC1155Lazy;

  const net = await lazy.provider.getNetwork();
  const chainId = net.chainId;
  const bnPrice = ethers.utils.parseEther("1");

  const domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ];
  const voucherType = [
    { name: "voucherId", type: "bytes32" },
    { name: "users", type: "address[]" },
    { name: "balances", type: "uint256[]" },
    { name: "amount", type: "uint256" },
    { name: "price", type: "uint256" },
  ];
  const userBatchType = [
    { name: "voucherId", type: "bytes32" },
    { name: "ids", type: "uint256[]" },
    { name: "balances", type: "uint256[]" },
    { name: "price", type: "uint256" },
    { name: "user", type: "address" },
  ];
  const domainData = {
    name: "MAD",
    version: "1",
    chainId: chainId,
    verifyingContract: lazy.address,
  };
  const Voucher = {
    voucherId: vId,
    users: usrs,
    balances: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    amount: 10,
    price: bnPrice.toString(),
  };
  const UserBatch = {
    voucherId: vId2,
    ids: [1, 33, 7],
    balances: [1, 1, 1],
    price: bnPrice.toString(),
    user: owner.address,
  };
  const data = JSON.stringify({
    types: {
      EIP712Domain: domain,
      Voucher: voucherType,
    },
    primaryType: "Voucher",
    domain: domainData,
    message: Voucher,
  });
  const data2 = JSON.stringify({
    types: {
      EIP712Domain: domain,
      UserBatch: userBatchType,
    },
    primaryType: "UserBatch",
    domain: domainData,
    message: UserBatch,
  });

  const parsedData = JSON.parse(data);
  const parsedData2 = JSON.parse(data2);
  const vSig = signTypedData({
    privateKey: pk,
    data: parsedData,
    version: SignTypedDataVersion.V4,
  });
  const ubSig = signTypedData({
    privateKey: pk,
    data: parsedData2,
    version: SignTypedDataVersion.V4,
  });
  const wrongSig = signTypedData({
    privateKey: wPk,
    data: parsedData,
    version: SignTypedDataVersion.V4,
  });
  const vRecover = recoverTypedSignature({
    data: parsedData,
    signature: vSig,
    version: SignTypedDataVersion.V4,
  });
  const ubRecover = recoverTypedSignature({
    data: parsedData2,
    signature: ubSig,
    version: SignTypedDataVersion.V4,
  });

  async function domainSeparator(
    name: string,
    version: string,
    chainId: number,
    verifyingContract: string,
  ) {
    return (
      "0x" +
      TypedDataUtils.hashStruct(
        "EIP712Domain",
        {
          name,
          version,
          chainId,
          verifyingContract,
        },
        { EIP712Domain: domain },
        SignTypedDataVersion.V4,
      ).toString("hex")
    );
  }

  const domainCheck = await domainSeparator(
    "MAD",
    "1",
    chainId,
    lazy.address,
  );
  const voucher = Voucher;
  const userBatch = UserBatch;
  const vSigSplit = ethers.utils.splitSignature(vSig);
  const ubSigSplit = ethers.utils.splitSignature(ubSig);

  return {
    splitter,
    lazy,
    vSig,
    vSigSplit,
    vRecover,
    ubSig,
    ubSigSplit,
    ubRecover,
    signerAddr,
    signer,
    domainCheck,
    wrongSig,
    voucher,
    userBatch,
  };
}
