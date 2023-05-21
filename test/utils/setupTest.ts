// testTemplate.ts
// import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Wallet } from "ethers";
import { ethers, network } from "hardhat";

import { MockERC20, SplitterImpl } from "../../src/types";

type WalletWithAddress = Wallet & SignerWithAddress;

export async function setupTest<T>({
  basicType,
  fixtureLoader,
}: {
  basicType: new (...args: any[]) => T;
  fixtureLoader: () => Promise<{ basic: T }>;
}) {
  let owner: WalletWithAddress;
  let amb: WalletWithAddress;
  let mad: WalletWithAddress;
  let acc01: WalletWithAddress;
  let acc02: WalletWithAddress;

  let res: any;
  let splitter: SplitterImpl;
  let erc20: MockERC20;
  let basic: T;

  const fundAmount: BigNumber =
    ethers.utils.parseEther("10000");
  const price: BigNumber = ethers.utils.parseEther("1");
  const change = "https://etherscan.io/address/";

  [owner, amb, mad, acc01, acc02] = await (
    ethers as any
  ).getSigners();
  await network.provider.send("hardhat_reset");

  //   const fixtureData = await loadFixture(fixtureLoader);
  //   basic = fixtureData.basic;

  return {
    owner,
    amb,
    mad,
    acc01,
    acc02,
    res,
    splitter,
    erc20,
    fundAmount,
    price,
    change,
    basic,
  };
}
