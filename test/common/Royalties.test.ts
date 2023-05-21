import "@nomicfoundation/hardhat-chai-matchers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Wallet } from "ethers";
import { ethers, network } from "hardhat";

import { MockERC2981 } from "../../src/types";
import { erc2981Fixture } from "../utils/fixtures";
import {
  ERC165Interface,
  ERC2981Interface,
  getInterfaceID,
} from "../utils/interfaces";

describe("Royalties", () => {
  type WalletWithAddress = Wallet & SignerWithAddress;
  let owner: WalletWithAddress;
  let acc01: WalletWithAddress;
  let erc2981: MockERC2981;
  const price: BigNumber = ethers.utils.parseEther("1");

  before("Set signers and reset network", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [owner, acc01] = await (ethers as any).getSigners();
    await network.provider.send("hardhat_reset");
  });
  beforeEach("Load deployment fixtures", async () => {
    ({ erc2981 } = await loadFixture(erc2981Fixture));
  });

  it("Royalties should initialize", async () => {
    await erc2981.deployed();
    expect(erc2981).to.be.ok;
    await expect(await erc2981.deployTransaction)
      .to.emit(erc2981, "RoyaltyFeeSet")
      .withArgs(750)
      .and.to.emit(erc2981, "RoyaltyRecipientSet")
      .withArgs(owner.address);
  });
  it("Should retrive royalty info", async () => {
    const share = BigNumber.from(750);
    const base = BigNumber.from(10000);
    const amount = price.mul(share).div(base);
    const tx = await erc2981.royaltyInfo(1, price);
    expect(tx[0]).to.eq(owner.address);
    expect(tx[1]).to.eq(amount);
  });

  // it("Should accept recipient and fee change", async () => {
  //   const tx1 = await erc2981.setRoyaltyRecipient(
  //     acc01.address,
  //   );
  //   const tx2 = await erc2981.setRoyaltyFee(1000);
  //   const tx3 = await erc2981.callStatic.royaltyInfo(
  //     1,
  //     price,
  //   );
  //   const share = BigNumber.from(1000);
  //   const base = BigNumber.from(10000);
  //   const amount = price.mul(share).div(base);

  //   expect(tx1).to.be.ok;
  //   expect(tx2).to.be.ok;

  //   await expect(
  //     erc2981.connect(acc01).setRoyaltyFee(share),
  //   ).to.be.revertedWith("UNAUTHORIZED");
  //   await expect(
  //     erc2981
  //       .connect(acc01)
  //       .setRoyaltyRecipient(acc01.address),
  //   ).to.be.revertedWith("UNAUTHORIZED");

  //   await expect(tx2).to.emit(erc2981, "RoyaltyFeeSet");
  //   await expect(tx1).to.emit(erc2981, "RoyaltyRecipientSet");

  //   expect(tx3[0]).to.eq(acc01.address);
  //   expect(tx3[1]).to.eq(amount);
  // });
  it("Should support interfaces", async () => {
    const erc165 =
      getInterfaceID(ERC165Interface).interfaceID._hex;
    const ierc2981 = getInterfaceID(ERC2981Interface)
      .interfaceID._hex;

    const instrospec =
      await erc2981.callStatic.supportsInterface(erc165);
    const royalty =
      await erc2981.callStatic.supportsInterface(ierc2981);

    await expect(instrospec).to.eq(true);
    await expect(royalty).to.eq(true);
  });
});
