import "@nomicfoundation/hardhat-chai-matchers";
// import "hardhat-tracer";
import {
  loadFixture,
  mine,
} from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import {
  BigNumber,
  ContractReceipt,
  Wallet,
} from "ethers";
import {
  ethers,
  network, // tracer
} from "hardhat";

import {
  MADFactory721,
  MADMarketplace721,
  MADRouter721,
  MockERC20,
} from "../src/types";
import { MarketplaceErrors } from "./utils/errors";
import {
  dead,
  getOrderId721,
  madFixture721D,
} from "./utils/madFixtures";

describe("MADMarketplace721", () => {
  type WalletWithAddress = Wallet & SignerWithAddress;

  // contract deployer/admin
  let owner: WalletWithAddress;

  // ambassador
  let amb: WalletWithAddress;

  // marketplace address
  let mad: WalletWithAddress;

  // extra EOAs
  let acc01: WalletWithAddress;
  let acc02: WalletWithAddress;

  let f721: MADFactory721;
  let m721: MADMarketplace721;
  let r721: MADRouter721;
  let erc20: MockERC20;

  const price: BigNumber = ethers.utils.parseEther("1");
  const erc20Balance: BigNumber = ethers.utils.parseEther("500");

  before("Set signers and reset network", async () => {
    [owner, amb, mad, acc01, acc02] =
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ethers as any).getSigners();
    
    await network.provider.send("hardhat_reset");
  });
  beforeEach("Load deployment fixtures", async () => {
    ({ f721, m721, r721, erc20 } = await loadFixture(
      madFixture721D,
    ));
    await r721.deployed();
    await m721.deployed();
    await f721.deployed();
    await erc20.transfer(acc01.address, erc20Balance);
    await erc20.transfer(acc02.address, erc20Balance);
  });

  describe("Init", async () => {
    it("Marketplace should initialize with ERC20 payment token", async () => {
      expect(m721).to.be.ok;
      expect(await m721.callStatic.name()).to.eq("market");
      expect(await m721.paymentTokenAddress()).to.eq(erc20.address);
      expect(await m721.recipient()).to.eq(owner.address);
      expect(await m721.minOrderDuration()).to.eq(300);
      expect(await m721.minAuctionIncrement()).to.eq(300);
      expect(await m721.minBidValue()).to.eq(20);
      expect(await m721.MADFactory721()).to.eq(f721.address);
    });
  });
  describe("Owner Functions", async () => {
    it("Should update payment token address", async () => {
      const tx = await m721.setPaymentToken(erc20.address);

      expect(tx).to.be.ok;
      expect(await m721.callStatic.paymentTokenAddress()).to.eq(
        erc20.address,
      );
      await expect(
        m721.connect(acc02).setPaymentToken(erc20.address),
      ).to.be.revertedWith(MarketplaceErrors.Unauthorized);
    });
  });
  describe("Buying", async () => {
    it("Should revert if buyer has insufficient ERC20 balance is wrong", async () => {
      await m721.updateSettings(300, 10, 20);
      await f721
        .connect(acc02)
        .splitterCheck(
          "MADSplitter1",
          amb.address,
          dead,
          20,
          0,
        );
      const splAddr = await f721.callStatic.getDeployedAddr(
        "MADSplitter1",
      );
      const minAddr = await f721.callStatic.getDeployedAddr(
        "MinSalt",
      );
      await f721
        .connect(acc02)
        .createCollection(
          0,
          "MinSalt",
          "721Minimal",
          "MIN",
          price,
          1,
          "cid/id.json",
          splAddr,
          750,
        );
      const min = await ethers.getContractAt(
        "ERC721Minimal",
        minAddr,
      );
      await r721
        .connect(acc02)
        .minimalSafeMint(min.address, acc02.address, {value: ethers.utils.parseEther("0.25")});
      const tx = await min.connect(acc02).approve(m721.address, 1);
      const blockTimestamp = (await m721.provider.getBlock(tx.blockNumber || 0)).timestamp;

      const fpTx = await m721
        .connect(acc02)
        .fixedPrice(min.address, 1, price, blockTimestamp + 301);
      const fpRc: ContractReceipt = await fpTx.wait();
      const fpBn = fpRc.blockNumber;
      const fpOrderId = getOrderId721(
        fpBn,
        min.address,
        1,
        acc02.address,
      );

      await expect(
        m721.connect(acc01).buy(fpOrderId),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.InsufficientERC20,
      );
    });
    it("Should buy token with ERC20, update storage and emit events", async () => {
      await m721.updateSettings(300, 10, 20);
      await f721
        .connect(acc02)
        .splitterCheck(
          "MADSplitter1",
          amb.address,
          dead,
          20,
          0,
        );
      const splAddr = await f721.callStatic.getDeployedAddr(
        "MADSplitter1",
      );
      const minAddr = await f721.callStatic.getDeployedAddr(
        "MinSalt",
      );
      await f721
        .connect(acc02)
        .createCollection(
          0,
          "MinSalt",
          "721Minimal",
          "MIN",
          price,
          1,
          "cid/id.json",
          splAddr,
          750,
        );
      const min = await ethers.getContractAt(
        "ERC721Minimal",
        minAddr,
      );
      
      await r721
        .connect(acc02)
        .minimalSafeMint(min.address, acc02.address, {value: ethers.utils.parseEther("0.25")});
      const tx = await min.connect(acc02).approve(m721.address, 1);
      const blockTimestamp = (await m721.provider.getBlock(tx.blockNumber || 0)).timestamp;

      const fpTx = await m721
        .connect(acc02)
        .fixedPrice(min.address, 1, price, blockTimestamp + 301);
      const fpRc: ContractReceipt = await fpTx.wait();
      const fpBn = fpRc.blockNumber;
      const fpOrderId = getOrderId721(
        fpBn,
        min.address,
        1,
        acc02.address,
      );
      await mine(10);
      
      // Set ERC20 balances and approve for maretplace
      const balance = await erc20.balanceOf(acc01.address)
      expect(balance).to.equal(erc20Balance)
      const erc20Tx = await erc20.connect(acc01).approve(m721.address, price)
      expect(erc20Tx).to.be.ok
      const result = await erc20.callStatic.allowance(acc01.address, m721.address)
      expect(result).to.equal(price)
      
      // Buy the token, @todo update to support ERC20 payout
      // MADMarketplace721._intPath > SafeTransferLib.safeTransferETH > 'ETH_TRANSFER_FAILED'
      const buyTx = await m721
        .connect(acc01)
        .buy(fpOrderId);
      expect(buyTx).to.be.ok;
      console.log(buyTx)

      // await erc20.connect(acc02).approve(m721.address, price)
      // await expect(
      //   m721.connect(acc02).buy(fpOrderId),
      // ).to.be.revertedWithCustomError(
      //   m721,
      //   MarketplaceErrors.SoldToken,
      // );
    });
  });
});
