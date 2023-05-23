import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import {
  BigNumber,
  ContractReceipt,
  ContractTransaction,
  Wallet,
} from "ethers";
import { ethers } from "hardhat";

import {
  MADFactory721,
  MADFactory1155,
} from "../../src/types";
import { SplitterConfig } from "./madFixtures";

const newCollectionSalt = "New Collection";
export const _basicSalt = "BasicSalt";

export type WalletWithAddress = Wallet & SignerWithAddress;
export type FactoryType = MADFactory721 | MADFactory1155;

export const price: BigNumber = ethers.utils.parseEther("1");
export const feePrice = "0.25";

// SPLITTER HELPERS
export const _splitterSalt = "MADSplitter1";

export function getSaltHash(
  addr: string,
  _splitterSalt: string,
): string {
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["address", "bytes"],
    [addr, ethers.utils.toUtf8Bytes(_splitterSalt)],
  );

  const hash = ethers.utils.keccak256(encoded);

  return hash;
}

export async function splitterDeployment(
  factory: FactoryType,
  acc: WalletWithAddress,
  _splitterSalt: string,
  ambassador: string,
  project: string,
  ambShare: number,
  projShare: number,
  payeesExpected: Array<string>,
  indexedLogIndex: number,
  dataLogIndex: number,
): Promise<string> {
  const tx: ContractTransaction = await factory
    .connect(acc)
    .splitterCheck(
      _splitterSalt,
      ambassador,
      project,
      ambShare,
      projShare,
    );

  const sharesOrZero = `${ambShare ? ambShare + "," : ""}${
    projShare ? projShare + "," : ""
  }`;
  console.log(sharesOrZero);

  const rc: ContractReceipt = await tx.wait();
  const indexed = rc.logs[indexedLogIndex].data;
  const data = rc.logs[dataLogIndex].data;

  const splitterAddress = await factory.getDeployedAddr(
    _splitterSalt,
    acc.address,
  );
  const creator = ethers.utils.defaultAbiCoder.decode(
    ["address"],
    indexed,
  );

  const args = ethers.utils.defaultAbiCoder.decode(
    ["uint256[]", "address[]", "address"],
    data,
  );

  const payees = args[1].toString();
  const shares = args[0].toString();
  const splitter = args[2].toString();

  const instance = await ethers.getContractAt(
    "SplitterImpl",
    splitterAddress,
  );
  const creatorShares = await instance.callStatic._shares(
    acc.address,
  );

  const storage: SplitterConfig =
    await factory.callStatic.splitterInfo(
      acc.address,
      splitterAddress,
    );

  expect(tx).to.be.ok;
  await expect(tx).to.emit(factory, "SplitterCreated");
  expect(creator.toString()).to.eq(acc.address);
  expect(shares).to.eq(
    `${sharesOrZero}${100 - ambShare - projShare}`,
  );
  expect(payees).to.eq(payeesExpected.toString());

  expect(splitter).to.eq(splitterAddress);
  expect(ethers.BigNumber.from(creatorShares)).to.eq(
    100 - ambShare - projShare,
  );
  expect(storage.splitter).to.eq(splitterAddress);
  expect(storage.splitterSalt).to.eq(
    getSaltHash(acc.address, _splitterSalt),
  );
  expect(storage.ambassador).to.eq(ambassador);
  expect(storage.ambShare).to.eq(
    ethers.BigNumber.from(ambShare),
  );
  expect(storage.valid).to.eq(true);
  return splitterAddress;
}

// END SPLITTER HELPERS

// misc helpers
export async function createCollection(
  factory: FactoryType,
  account: WalletWithAddress,
  salt: string,
  splitterAddress: string,
): Promise<ContractTransaction> {
  return await factory
    .connect(account)
    .createCollection(
      1,
      salt,
      newCollectionSalt,
      "BASIC",
      price,
      1000,
      "ipfs://cid/",
      splitterAddress,
      750,
      [],
    );
}

export async function validateCreation(
  factory: FactoryType,
  event: string,
  account: SignerWithAddress,
  splitterAddress: string,
  salt: string,
  tx: Promise<ContractTransaction>,
  expectedColID: number = 0,
): Promise<void> {
  const basicAddr = await factory.callStatic.getDeployedAddr(
    salt,
    account.address,
  );

  const colID = await factory.callStatic.getColID(basicAddr);
  const storage = await factory.callStatic.userTokens(
    account.address,
    ethers.BigNumber.from(expectedColID),
  );
  const colInfo = await factory.callStatic.colInfo(colID);

  expect(tx).to.be.ok;
  expect(storage).to.eq(colID);
  expect(colInfo.blocknumber).to.eq(
    ethers.BigNumber.from(
      await factory.provider.getBlockNumber(),
    ),
  );
  expect(colInfo.colType).to.eq(1);
  expect(colInfo.creator).to.eq(account.address);
  expect(colInfo.splitter).to.eq(splitterAddress);
  expect(colInfo.colSalt).to.eq(
    getSaltHash(account.address, salt),
  );

  await expect(tx)
    .to.emit(factory, event)
    .withArgs(
      splitterAddress,
      basicAddr,
      newCollectionSalt,
      "BASIC",
      750,
      1000,
      price,
    );
}

export async function createCollections(
  factory: MADFactory721 | MADFactory1155,
  account: WalletWithAddress,
  _splitterSalt: string,
  amb: WalletWithAddress,
  dead: string,
  basicSalt: string,
  numberOfCols: number,
  event: string,
) {
  const splitterAddress = await splitterDeployment(
    factory,
    account,
    _splitterSalt,
    amb.address,
    dead,
    20,
    0,
    [amb.address, account.address],
    1,
    2,
  );

  for (let i = 0; i < numberOfCols; i++) {
    const salt = `${basicSalt} Number ${i}`;
    const tx = createCollection(
      factory,
      account,
      salt,
      splitterAddress,
    );
    await validateCreation(
      factory,
      event,
      account,
      splitterAddress,
      salt,
      tx,
      i,
    );
  }

  expect(await factory.getIDsLength(account.address)).to.eq(
    numberOfCols,
  );
}

export async function testColID(
  factory: MADFactory721 | MADFactory1155,
  account: WalletWithAddress,
): Promise<void> {
  const addr = await factory.getDeployedAddr(
    _basicSalt,
    account.address,
  );
  const colID = addr
    .toLowerCase()
    .concat("000000000000000000000000");
  const tx = await factory.getColID(addr);

  expect(tx).to.be.ok;
  expect(tx).to.eq(colID);
}
