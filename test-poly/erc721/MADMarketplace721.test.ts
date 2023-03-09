import "@nomicfoundation/hardhat-chai-matchers";
// import "hardhat-tracer";
import {
  loadFixture,
  mine,
  mineUpTo,
} from "@nomicfoundation/hardhat-network-helpers";
import { setNextBlockTimestamp } from "@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import {
  BigNumber,
  ContractReceipt,
  ContractTransaction,
  Wallet,
} from "ethers";
import {
  artifacts,
  ethers,
  network, // tracer
} from "hardhat";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";

import {
  ERC721Whitelist,
  MADFactory721,
  MADMarketplace721,
  MADRouter721,
  SplitterImpl,
} from "../../src/types";
import { MarketplaceErrors } from "./../utils/errors";
import { padBuffer } from "./../utils/fixtures";
import {
  OrderDetails721,
  dead,
  getOrderId721,
  madFixture721C,
} from "./../utils/madFixtures";

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
  // let erc20: MockERC20;
  // let splitter: SplitterImpl;
  // let wl: ERC721Whitelist;
  // let whitelist: ERC721Whitelist;

  const price: BigNumber = ethers.utils.parseEther("1");

  before("Set signers and reset network", async () => {
    [owner, amb, mad, acc01, acc02] =
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ethers as any).getSigners();

    await network.provider.send("hardhat_reset");
  });
  beforeEach("Load deployment fixtures", async () => {
    ({ f721, m721, r721 } = await loadFixture(
      madFixture721C,
    ));
    await r721.deployed();
    await m721.deployed();
    await f721.deployed();
  });

  describe("Init", async () => {
    it("Marketplace should initialize", async () => {
      // await m721.deployed();
      expect(m721).to.be.ok;

      // check each global var
      // tracer.enabled = true;
      // tracer.nameTags[m721.address] = "MADMarketplace721";
      expect(await m721.callStatic.name()).to.eq("market");
      // tracer.enabled = false;
      expect(await m721.recipient()).to.eq(owner.address);
      expect(await m721.minOrderDuration()).to.eq(300);
      expect(await m721.minAuctionIncrement()).to.eq(300);
      expect(await m721.minBidValue()).to.eq(20);
      expect(await m721.MADFactory721()).to.eq(f721.address);
    });
  });
  describe("Owner Functions", async () => {
    it("Should update factory address", async () => {
      const tx = await m721.setFactory(r721.address);

      expect(tx).to.be.ok;
      await expect(tx)
        .to.emit(m721, "FactoryUpdated")
        .withArgs(r721.address);
      await expect(
        m721.connect(acc01).setFactory(acc01.address),
      ).to.be.revertedWith(MarketplaceErrors.Unauthorized);
    });
    it("Should update marketplace settings", async () => {
      const tx = await m721.updateSettings(
        600,
        150,
        40,
        31536000,
      );

      expect(tx).to.be.ok;
      await expect(tx)
        .to.emit(m721, "AuctionSettingsUpdated")
        .withArgs(150, 600, 40, 31536000);
      await expect(
        m721
          .connect(acc01)
          .updateSettings(300, 100, 40, 31536000),
      ).to.be.revertedWith(MarketplaceErrors.Unauthorized);
    });
    it("Should initialize paused and unpaused states", async () => {
      const orderId = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("hash"),
      );
      const addr = await f721.callStatic.getDeployedAddr(
        "salt",
      );
      const tx = await m721.pause();

      expect(tx).to.be.ok;
      await expect(m721.withdraw()).to.be.ok;
      await expect(
        m721.connect(acc01).pause(),
      ).to.be.revertedWith(MarketplaceErrors.Unauthorized);
      await expect(
        m721.fixedPrice(addr, 1, price, 1),
      ).to.be.revertedWith(MarketplaceErrors.Paused);
      await expect(
        m721.dutchAuction(addr, 1, price, price, 1),
      ).to.be.revertedWith(MarketplaceErrors.Paused);
      await expect(
        m721.englishAuction(addr, 1, price, 1),
      ).to.be.revertedWith(MarketplaceErrors.Paused);
      await expect(m721.bid(orderId)).to.be.revertedWith(
        MarketplaceErrors.Paused,
      );
      await expect(m721.buy(orderId)).to.be.revertedWith(
        MarketplaceErrors.Paused,
      );
      await expect(m721.claim(orderId)).to.be.revertedWith(
        MarketplaceErrors.Paused,
      );
      await expect(m721.bid(orderId)).to.be.revertedWith(
        MarketplaceErrors.Paused,
      );
      await expect(
        m721.connect(acc02).unpause(),
      ).to.be.revertedWith(MarketplaceErrors.Unauthorized);
      expect(await m721.unpause()).to.be.ok;
    });
    it("Should update recipient", async () => {
      const tx = await m721.setRecipient(mad.address);

      expect(tx).to.be.ok;
      expect(await m721.callStatic.recipient()).to.eq(
        mad.address,
      );
      await expect(
        m721.connect(acc02).setRecipient(acc01.address),
      ).to.be.revertedWith(MarketplaceErrors.Unauthorized);
    });
    it("Should update contract's owner", async () => {
      const tx = await m721.setOwner(mad.address);

      expect(tx).to.be.ok;
      await expect(tx)
        .to.emit(m721, "OwnerUpdated")
        .withArgs(owner.address, mad.address);
      expect(await m721.callStatic.owner()).to.eq(
        mad.address,
      );
      await expect(
        m721.connect(acc02).setOwner(acc01.address),
      ).to.be.revertedWith(MarketplaceErrors.Unauthorized);
    });
    it("Should withdraw to owner", async () => {
      const bal1 = await owner.getBalance();
      await m721.pause();
      await mad.sendTransaction({
        to: m721.address,
        value: price.mul(ethers.BigNumber.from(100)),
      });
      const tx = await m721.connect(owner).withdraw();
      const bal2 = await owner.getBalance();
      await m721.unpause();

      expect(tx).to.be.ok;
      expect(bal1).to.be.lt(bal2);
      await expect(m721.withdraw()).to.be.revertedWith(
        MarketplaceErrors.Unpaused,
      );
    });
    it("Should delete order", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      const zero = ethers.constants.Zero;
      // await f721.addAmbassador(amb.address);
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
      // const colID = await f721.callStatic.getColID(minAddr);
      const min = await ethers.getContractAt(
        "ERC721Minimal",
        minAddr,
      );
      const tx_ = await r721
        .connect(acc02)
        .setMintState(minAddr, true, 0);

      const blockTimestamp = (
        await m721.provider.getBlock(tx_.blockNumber || 0)
      ).timestamp;
      await r721
        .connect(acc02)
        .minimalSafeMint(minAddr, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      await min.connect(acc02).approve(m721.address, 1);
      const fixepPrice: ContractTransaction = await m721
        .connect(acc02)
        .fixedPrice(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const rc: ContractReceipt = await fixepPrice.wait();
      const bn = rc.blockNumber;
      const orderId = getOrderId721(
        bn,
        minAddr,
        1,
        acc02.address,
      );

      const cBal1 = await min.callStatic.balanceOf(
        acc02.address,
      );

      await m721.pause();

      const tx = await m721.delOrder(
        orderId,
        minAddr,
        1,
        acc02.address,
      );
      await m721.unpause();

      const cBal2 = await min.callStatic.balanceOf(
        acc02.address,
      );

      const _null: OrderDetails721 = {
        orderType: 0,
        seller: dead,
        token: dead,
        tokenId: zero,
        startPrice: zero,
        endPrice: zero,
        startTime: zero,
        endTime: zero,
        lastBidPrice: zero,
        lastBidder: dead,
        isSold: false,
      };

      const orderInfo: OrderDetails721 =
        await m721.callStatic.orderInfo(orderId);

      expect(tx).to.be.ok;
      expect(cBal1).to.eq(0);
      expect(cBal2).to.eq(1);
      await expect(
        m721.callStatic.orderIdBySeller(acc02.address, 0),
      ).to.be.revertedWithoutReason;
      await expect(
        m721.callStatic.orderIdByToken(min.address, 1, 0),
      ).to.be.revertedWithoutReason;
      expect(orderInfo.orderType).to.eq(_null.orderType);
      expect(orderInfo.seller).to.eq(_null.seller);
      expect(orderInfo.token).to.eq(_null.token);
      expect(orderInfo.tokenId).to.eq(_null.tokenId);
      expect(orderInfo.startPrice).to.eq(_null.startPrice);
      expect(orderInfo.endPrice).to.eq(_null.endPrice);
      expect(orderInfo.startTime).to.eq(_null.startTime);
      expect(orderInfo.endTime).to.eq(_null.endTime);
      expect(orderInfo.lastBidPrice).to.eq(
        _null.lastBidPrice,
      );
      expect(orderInfo.lastBidder).to.eq(_null.lastBidder);
      expect(orderInfo.isSold).to.eq(_null.isSold);

      await expect(
        m721.delOrder(orderId, minAddr, 1, acc02.address),
      ).to.be.revertedWith(MarketplaceErrors.Unpaused);
    });
  });
  describe("Fixed Price Listing", async () => {
    it("Should revert if transaction approval hasn't been set", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
      const tx = await f721
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

      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      await r721
        .connect(acc02)
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      await expect(
        m721
          .connect(acc01)
          .fixedPrice(
            min.address,
            1,
            price,
            blockTimestamp + 301,
          ),
      ).to.be.revertedWith(MarketplaceErrors.WrongFrom);
      await expect(
        m721
          .connect(acc02)
          .fixedPrice(
            min.address,
            1,
            price,
            blockTimestamp + 301,
          ),
      ).to.be.revertedWith(MarketplaceErrors.NotAuthorized);
    });
    it("Should revert if duration is less than min allowed", async () => {
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      await expect(
        m721
          .connect(acc02)
          .fixedPrice(min.address, 1, price, 0),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.NeedMoreTime,
      );
      await expect(
        m721
          .connect(acc02)
          .fixedPrice(min.address, 1, price, blockTimestamp),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.NeedMoreTime,
      );
    });
    it("Should revert if duration is less than min allowed", async () => {
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp =
        (await m721.provider.getBlock(tx.blockNumber || 0))
          .timestamp + 31536002; // + 2 sec from the contact setting 31536000 should fail, +1 sec will still pass

      await expect(
        m721
          .connect(acc02)
          .fixedPrice(min.address, 1, price, 0),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.NeedMoreTime,
      );
      await expect(
        m721
          .connect(acc02)
          .fixedPrice(min.address, 1, price, blockTimestamp),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.NeedMoreTime,
      );
    });
    it("Should revert if price is invalid", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      await expect(
        m721
          .connect(acc02)
          .fixedPrice(
            min.address,
            1,
            0,
            blockTimestamp + 301,
          ),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.WrongPrice,
      );
    });
    it("Should list fixed price order, update storage and emit event", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const fpTx = await m721
        .connect(acc02)
        .fixedPrice(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const fpRc: ContractReceipt = await fpTx.wait();
      const fpBn = fpRc.blockNumber;

      const storage: OrderDetails721 = {
        orderType: 0,
        seller: acc02.address,
        token: minAddr,
        tokenId: ethers.constants.One,
        startPrice: price,
        endPrice: ethers.constants.Zero,
        startTime: ethers.BigNumber.from(blockTimestamp + 1),
        endTime: ethers.BigNumber.from(blockTimestamp + 301),
        lastBidPrice: ethers.constants.Zero,
        lastBidder: dead,
        isSold: false,
      };

      const fpOrderId = getOrderId721(
        fpBn,
        min.address,
        1,
        acc02.address,
      );
      const orderInfo: OrderDetails721 =
        await m721.callStatic.orderInfo(fpOrderId);

      expect(fpTx).to.be.ok;
      expect(orderInfo.orderType).to.eq(storage.orderType);
      expect(orderInfo.seller).to.eq(storage.seller);
      expect(orderInfo.token).to.eq(storage.token);
      expect(orderInfo.tokenId).to.eq(storage.tokenId);
      expect(orderInfo.startPrice).to.eq(storage.startPrice);
      expect(orderInfo.endPrice).to.eq(storage.endPrice);
      expect(orderInfo.startTime).to.eq(storage.startTime);
      expect(orderInfo.endTime).to.eq(storage.endTime);

      expect(
        await m721.callStatic.tokenOrderLength(minAddr, 1),
      ).to.eq(1);
      expect(
        await m721.callStatic.orderIdByToken(minAddr, 1, 0),
      ).to.eq(fpOrderId);
      expect(
        await m721.callStatic.orderIdBySeller(
          acc02.address,
          0,
        ),
      ).to.eq(fpOrderId);
      expect(
        await m721.callStatic.sellerOrderLength(
          acc02.address,
        ),
      ).to.eq(1);

      expect(await min.callStatic.ownerOf(1)).to.eq(
        m721.address,
      );

      await expect(fpTx)
        .to.emit(m721, "MakeOrder")
        .withArgs(minAddr, 1, fpOrderId, acc02.address);
    });
    it("Should handle multiple fixed price orders", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
      await f721
        .connect(acc02)
        .createCollection(
          2,
          "salt",
          "721Whitelist",
          "WHITE",
          price,
          1000,
          "ipfs://cid/",
          splAddr,
          750,
        );

      const wlAddr = await f721.callStatic.getDeployedAddr(
        "salt",
      );

      const whitelist = await ethers.getContractAt(
        "ERC721Whitelist",
        wlAddr,
      );

      const root = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("root"),
      );

      await r721
        .connect(acc02)
        .freeSettings(wlAddr, 1, 10, root);

      await r721
        .connect(acc02)
        .gift(
          wlAddr,
          [
            mad.address,
            acc01.address,
            acc02.address,
            owner.address,
            amb.address,
          ],
          { value: ethers.utils.parseEther("0.25") },
        );
      await whitelist.connect(mad).approve(m721.address, 1);
      await whitelist.connect(acc01).approve(m721.address, 2);
      await whitelist.connect(acc02).approve(m721.address, 3);
      await whitelist.connect(owner).approve(m721.address, 4);
      const tx = await whitelist
        .connect(amb)
        .approve(m721.address, 5);

      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const fpTx1 = await m721
        .connect(mad)
        .fixedPrice(
          whitelist.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const fpRc1: ContractReceipt = await fpTx1.wait();
      const fpBn1 = fpRc1.blockNumber;

      const fpTx2 = await m721
        .connect(acc01)
        .fixedPrice(
          whitelist.address,
          2,
          price,
          blockTimestamp + 301,
        );
      const fpRc2: ContractReceipt = await fpTx2.wait();
      const fpBn2 = fpRc2.blockNumber;

      const fpTx3 = await m721
        .connect(acc02)
        .fixedPrice(
          whitelist.address,
          3,
          price,
          blockTimestamp + 301,
        );
      const fpRc3: ContractReceipt = await fpTx3.wait();
      const fpBn3 = fpRc3.blockNumber;

      const fpTx4 = await m721
        .connect(owner)
        .fixedPrice(
          whitelist.address,
          4,
          price,
          blockTimestamp + 301,
        );
      const fpRc4: ContractReceipt = await fpTx4.wait();
      const fpBn4 = fpRc4.blockNumber;

      const fpTx5 = await m721
        .connect(amb)
        .fixedPrice(
          whitelist.address,
          5,
          price,
          blockTimestamp + 301,
        );
      const fpRc5: ContractReceipt = await fpTx5.wait();
      const fpBn5 = fpRc5.blockNumber;

      const fpOrderId1 = getOrderId721(
        fpBn1,
        whitelist.address,
        1,
        mad.address,
      );
      const fpOrderId2 = getOrderId721(
        fpBn2,
        whitelist.address,
        2,
        acc01.address,
      );
      const fpOrderId3 = getOrderId721(
        fpBn3,
        whitelist.address,
        3,
        acc02.address,
      );
      const fpOrderId4 = getOrderId721(
        fpBn4,
        whitelist.address,
        4,
        owner.address,
      );
      const fpOrderId5 = getOrderId721(
        fpBn5,
        whitelist.address,
        5,
        amb.address,
      );

      const tx1 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        1,
      );
      const tx2 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        2,
      );
      const tx3 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        3,
      );
      const tx4 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        4,
      );
      const tx5 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        5,
      );

      const txA = await m721.callStatic.orderIdByToken(
        whitelist.address,
        1,
        0,
      );
      const txB = await m721.callStatic.orderIdByToken(
        whitelist.address,
        2,
        0,
      );
      const txC = await m721.callStatic.orderIdByToken(
        whitelist.address,
        3,
        0,
      );
      const txD = await m721.callStatic.orderIdByToken(
        whitelist.address,
        4,
        0,
      );
      const txE = await m721.callStatic.orderIdByToken(
        whitelist.address,
        5,
        0,
      );

      const tx6 = await m721.callStatic.orderIdBySeller(
        mad.address,
        0,
      );
      const tx7 = await m721.callStatic.orderIdBySeller(
        acc01.address,
        0,
      );
      const tx8 = await m721.callStatic.orderIdBySeller(
        acc02.address,
        0,
      );
      const tx9 = await m721.callStatic.orderIdBySeller(
        owner.address,
        0,
      );
      const tx10 = await m721.callStatic.orderIdBySeller(
        amb.address,
        0,
      );

      const txF = await m721.callStatic.sellerOrderLength(
        mad.address,
      );
      const txG = await m721.callStatic.sellerOrderLength(
        acc01.address,
      );
      const txH = await m721.callStatic.sellerOrderLength(
        acc02.address,
      );
      const txI = await m721.callStatic.sellerOrderLength(
        owner.address,
      );
      const txJ = await m721.callStatic.sellerOrderLength(
        amb.address,
      );

      const owner1 = await whitelist.callStatic.ownerOf(1);
      const owner2 = await whitelist.callStatic.ownerOf(2);
      const owner3 = await whitelist.callStatic.ownerOf(3);
      const owner4 = await whitelist.callStatic.ownerOf(4);
      const owner5 = await whitelist.callStatic.ownerOf(5);

      expect(fpTx1).to.be.ok;
      expect(fpTx2).to.be.ok;
      expect(fpTx3).to.be.ok;
      expect(fpTx4).to.be.ok;
      expect(fpTx5).to.be.ok;

      expect(tx1).to.be.ok.and.to.eq(1);
      expect(tx2).to.be.ok.and.to.eq(1);
      expect(tx3).to.be.ok.and.to.eq(1);
      expect(tx4).to.be.ok.and.to.eq(1);
      expect(tx5).to.be.ok.and.to.eq(1);

      expect(txA).to.be.ok.and.to.eq(fpOrderId1);
      expect(txB).to.be.ok.and.to.eq(fpOrderId2);
      expect(txC).to.be.ok.and.to.eq(fpOrderId3);
      expect(txD).to.be.ok.and.to.eq(fpOrderId4);
      expect(txE).to.be.ok.and.to.eq(fpOrderId5);

      expect(tx6).to.be.ok.and.to.eq(fpOrderId1);
      expect(tx7).to.be.ok.and.to.eq(fpOrderId2);
      expect(tx8).to.be.ok.and.to.eq(fpOrderId3);
      expect(tx9).to.be.ok.and.to.eq(fpOrderId4);
      expect(tx10).to.be.ok.and.to.eq(fpOrderId5);

      expect(txF).to.be.ok.and.to.eq(1);
      expect(txG).to.be.ok.and.to.eq(1);
      expect(txH).to.be.ok.and.to.eq(1);
      expect(txI).to.be.ok.and.to.eq(1);
      expect(txJ).to.be.ok.and.to.eq(1);

      expect(owner1).to.be.ok.and.to.eq(m721.address);
      expect(owner2).to.be.ok.and.to.eq(m721.address);
      expect(owner3).to.be.ok.and.to.eq(m721.address);
      expect(owner4).to.be.ok.and.to.eq(m721.address);
      expect(owner5).to.be.ok.and.to.eq(m721.address);

      await expect(fpTx1)
        .to.emit(m721, "MakeOrder")
        .withArgs(wlAddr, 1, fpOrderId1, mad.address);
      await expect(fpTx2)
        .to.emit(m721, "MakeOrder")
        .withArgs(wlAddr, 2, fpOrderId2, acc01.address);
      await expect(fpTx3)
        .to.emit(m721, "MakeOrder")
        .withArgs(wlAddr, 3, fpOrderId3, acc02.address);
      await expect(fpTx4)
        .to.emit(m721, "MakeOrder")
        .withArgs(wlAddr, 4, fpOrderId4, owner.address);
      await expect(fpTx5)
        .to.emit(m721, "MakeOrder")
        .withArgs(wlAddr, 5, fpOrderId5, amb.address);
    });
  });
  describe("Dutch Auction Listing", async () => {
    it("Should revert if transaction approval hasn't been set", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
      const tx = await f721
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
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      await r721
        .connect(acc02)
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      await expect(
        m721
          .connect(acc01)
          .dutchAuction(
            min.address,
            1,
            price,
            0,
            blockTimestamp + 301,
          ),
      ).to.be.revertedWith(MarketplaceErrors.WrongFrom);
      await expect(
        m721
          .connect(acc02)
          .dutchAuction(
            min.address,
            1,
            price,
            0,
            blockTimestamp + 301,
          ),
      ).to.be.revertedWith(MarketplaceErrors.NotAuthorized);
    });
    it("Should revert if duration is less than min allowed", async () => {
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      await expect(
        m721
          .connect(acc02)
          .dutchAuction(
            min.address,
            1,
            price,
            0,
            blockTimestamp,
          ),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.NeedMoreTime,
      );
      await expect(
        m721
          .connect(acc02)
          .dutchAuction(
            min.address,
            1,
            price,
            0,
            blockTimestamp,
          ),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.NeedMoreTime,
      );
    });
    it("Should revert if duration is greater than max allowed", async () => {
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp =
        (await m721.provider.getBlock(tx.blockNumber || 0))
          .timestamp + 31536002; // + 2 sec from the contact setting 31536000 should fail, +1 sec will still pass

      await expect(
        m721
          .connect(acc02)
          .dutchAuction(
            min.address,
            1,
            price,
            0,
            blockTimestamp,
          ),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.NeedMoreTime,
      );
      await expect(
        m721
          .connect(acc02)
          .dutchAuction(
            min.address,
            1,
            price,
            0,
            blockTimestamp,
          ),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.NeedMoreTime,
      );
    });
    it("Should revert if startPrice is invalid", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      await expect(
        m721
          .connect(acc02)
          .dutchAuction(
            min.address,
            1,
            2,
            3,
            blockTimestamp + 301,
          ),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.ExceedsMaxEP,
      );
      await expect(
        m721
          .connect(acc02)
          .dutchAuction(min.address, 1, 3, 3, 700),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.ExceedsMaxEP,
      );
    });
    it("Should list dutch auction order, update storage and emit event", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;
      const daTx = await m721
        .connect(acc02)
        .dutchAuction(
          min.address,
          1,
          price,
          0,
          blockTimestamp + 301,
        );
      const daRc: ContractReceipt = await daTx.wait();
      const daBn = daRc.blockNumber;

      const storage: OrderDetails721 = {
        orderType: 1,
        seller: acc02.address,
        token: minAddr,
        tokenId: ethers.constants.One,
        startPrice: price,
        endPrice: ethers.constants.Zero,
        startTime: ethers.BigNumber.from(blockTimestamp + 1),
        endTime: ethers.BigNumber.from(blockTimestamp + 301),
        lastBidPrice: ethers.constants.Zero,
        lastBidder: dead,
        isSold: false,
      };

      const daOrderId = getOrderId721(
        daBn,
        min.address,
        1,
        acc02.address,
      );
      const orderInfo: OrderDetails721 =
        await m721.callStatic.orderInfo(daOrderId);

      expect(daTx).to.be.ok;
      expect(orderInfo.orderType).to.eq(storage.orderType);
      expect(orderInfo.seller).to.eq(storage.seller);
      expect(orderInfo.token).to.eq(storage.token);
      expect(orderInfo.tokenId).to.eq(storage.tokenId);
      expect(orderInfo.startPrice).to.eq(storage.startPrice);
      expect(orderInfo.endPrice).to.eq(storage.endPrice);
      expect(orderInfo.startTime).to.eq(storage.startTime);
      expect(orderInfo.endTime).to.eq(storage.endTime);

      expect(
        await m721.callStatic.tokenOrderLength(minAddr, 1),
      ).to.eq(1);
      expect(
        await m721.callStatic.orderIdByToken(minAddr, 1, 0),
      ).to.eq(daOrderId);
      expect(
        await m721.callStatic.orderIdBySeller(
          acc02.address,
          0,
        ),
      ).to.eq(daOrderId);
      expect(
        await m721.callStatic.sellerOrderLength(
          acc02.address,
        ),
      ).to.eq(1);

      expect(await min.callStatic.ownerOf(1)).to.eq(
        m721.address,
      );

      await expect(daTx)
        .to.emit(m721, "MakeOrder")
        .withArgs(minAddr, 1, daOrderId, acc02.address);
    });
    it("Should handle multiple dutch auction orders", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
      await f721
        .connect(acc02)
        .createCollection(
          2,
          "salt",
          "721Whitelist",
          "WHITE",
          price,
          1000,
          "ipfs://cid/",
          splAddr,
          750,
        );

      const wlAddr = await f721.callStatic.getDeployedAddr(
        "salt",
      );

      const whitelist = await ethers.getContractAt(
        "ERC721Whitelist",
        wlAddr,
      );

      const root = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("root"),
      );

      await r721
        .connect(acc02)
        .freeSettings(wlAddr, 1, 10, root);

      await r721
        .connect(acc02)
        .gift(
          wlAddr,
          [
            mad.address,
            acc01.address,
            acc02.address,
            owner.address,
            amb.address,
          ],
          { value: ethers.utils.parseEther("0.25") },
        );
      await whitelist.connect(mad).approve(m721.address, 1);
      await whitelist.connect(acc01).approve(m721.address, 2);
      await whitelist.connect(acc02).approve(m721.address, 3);
      await whitelist.connect(owner).approve(m721.address, 4);
      const tx = await whitelist
        .connect(amb)
        .approve(m721.address, 5);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const daTx1 = await m721
        .connect(mad)
        .dutchAuction(
          whitelist.address,
          1,
          price,
          0,
          blockTimestamp + 301,
        );
      const daRc1: ContractReceipt = await daTx1.wait();
      const daBn1 = daRc1.blockNumber;

      const daTx2 = await m721
        .connect(acc01)
        .dutchAuction(
          whitelist.address,
          2,
          price,
          0,
          blockTimestamp + 301,
        );
      const daRc2: ContractReceipt = await daTx2.wait();
      const daBn2 = daRc2.blockNumber;

      const daTx3 = await m721
        .connect(acc02)
        .dutchAuction(
          whitelist.address,
          3,
          price,
          0,
          blockTimestamp + 301,
        );
      const daRc3: ContractReceipt = await daTx3.wait();
      const daBn3 = daRc3.blockNumber;

      const daTx4 = await m721
        .connect(owner)
        .dutchAuction(
          whitelist.address,
          4,
          price,
          0,
          blockTimestamp + 301,
        );
      const daRc4: ContractReceipt = await daTx4.wait();
      const daBn4 = daRc4.blockNumber;

      const daTx5 = await m721
        .connect(amb)
        .dutchAuction(
          whitelist.address,
          5,
          price,
          0,
          blockTimestamp + 301,
        );
      const daRc5: ContractReceipt = await daTx5.wait();
      const daBn5 = daRc5.blockNumber;

      const daOrderId1 = getOrderId721(
        daBn1,
        whitelist.address,
        1,
        mad.address,
      );
      const daOrderId2 = getOrderId721(
        daBn2,
        whitelist.address,
        2,
        acc01.address,
      );
      const daOrderId3 = getOrderId721(
        daBn3,
        whitelist.address,
        3,
        acc02.address,
      );
      const daOrderId4 = getOrderId721(
        daBn4,
        whitelist.address,
        4,
        owner.address,
      );
      const daOrderId5 = getOrderId721(
        daBn5,
        whitelist.address,
        5,
        amb.address,
      );

      const tx1 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        1,
      );
      const tx2 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        2,
      );
      const tx3 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        3,
      );
      const tx4 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        4,
      );
      const tx5 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        5,
      );

      const txA = await m721.callStatic.orderIdByToken(
        whitelist.address,
        1,
        0,
      );
      const txB = await m721.callStatic.orderIdByToken(
        whitelist.address,
        2,
        0,
      );
      const txC = await m721.callStatic.orderIdByToken(
        whitelist.address,
        3,
        0,
      );
      const txD = await m721.callStatic.orderIdByToken(
        whitelist.address,
        4,
        0,
      );
      const txE = await m721.callStatic.orderIdByToken(
        whitelist.address,
        5,
        0,
      );

      const tx6 = await m721.callStatic.orderIdBySeller(
        mad.address,
        0,
      );
      const tx7 = await m721.callStatic.orderIdBySeller(
        acc01.address,
        0,
      );
      const tx8 = await m721.callStatic.orderIdBySeller(
        acc02.address,
        0,
      );
      const tx9 = await m721.callStatic.orderIdBySeller(
        owner.address,
        0,
      );
      const tx10 = await m721.callStatic.orderIdBySeller(
        amb.address,
        0,
      );

      const txF = await m721.callStatic.sellerOrderLength(
        mad.address,
      );
      const txG = await m721.callStatic.sellerOrderLength(
        acc01.address,
      );
      const txH = await m721.callStatic.sellerOrderLength(
        acc02.address,
      );
      const txI = await m721.callStatic.sellerOrderLength(
        owner.address,
      );
      const txJ = await m721.callStatic.sellerOrderLength(
        amb.address,
      );

      const owner1 = await whitelist.callStatic.ownerOf(1);
      const owner2 = await whitelist.callStatic.ownerOf(2);
      const owner3 = await whitelist.callStatic.ownerOf(3);
      const owner4 = await whitelist.callStatic.ownerOf(4);
      const owner5 = await whitelist.callStatic.ownerOf(5);

      expect(daTx1).to.be.ok;
      expect(daTx2).to.be.ok;
      expect(daTx3).to.be.ok;
      expect(daTx4).to.be.ok;
      expect(daTx5).to.be.ok;

      expect(tx1).to.be.ok.and.to.eq(1);
      expect(tx2).to.be.ok.and.to.eq(1);
      expect(tx3).to.be.ok.and.to.eq(1);
      expect(tx4).to.be.ok.and.to.eq(1);
      expect(tx5).to.be.ok.and.to.eq(1);

      expect(txA).to.be.ok.and.to.eq(daOrderId1);
      expect(txB).to.be.ok.and.to.eq(daOrderId2);
      expect(txC).to.be.ok.and.to.eq(daOrderId3);
      expect(txD).to.be.ok.and.to.eq(daOrderId4);
      expect(txE).to.be.ok.and.to.eq(daOrderId5);

      expect(tx6).to.be.ok.and.to.eq(daOrderId1);
      expect(tx7).to.be.ok.and.to.eq(daOrderId2);
      expect(tx8).to.be.ok.and.to.eq(daOrderId3);
      expect(tx9).to.be.ok.and.to.eq(daOrderId4);
      expect(tx10).to.be.ok.and.to.eq(daOrderId5);

      expect(txF).to.be.ok.and.to.eq(1);
      expect(txG).to.be.ok.and.to.eq(1);
      expect(txH).to.be.ok.and.to.eq(1);
      expect(txI).to.be.ok.and.to.eq(1);
      expect(txJ).to.be.ok.and.to.eq(1);

      expect(owner1).to.be.ok.and.to.eq(m721.address);
      expect(owner2).to.be.ok.and.to.eq(m721.address);
      expect(owner3).to.be.ok.and.to.eq(m721.address);
      expect(owner4).to.be.ok.and.to.eq(m721.address);
      expect(owner5).to.be.ok.and.to.eq(m721.address);

      await expect(daTx1)
        .to.emit(m721, "MakeOrder")
        .withArgs(wlAddr, 1, daOrderId1, mad.address);
      await expect(daTx2)
        .to.emit(m721, "MakeOrder")
        .withArgs(wlAddr, 2, daOrderId2, acc01.address);
      await expect(daTx3)
        .to.emit(m721, "MakeOrder")
        .withArgs(wlAddr, 3, daOrderId3, acc02.address);
      await expect(daTx4)
        .to.emit(m721, "MakeOrder")
        .withArgs(wlAddr, 4, daOrderId4, owner.address);
      await expect(daTx5)
        .to.emit(m721, "MakeOrder")
        .withArgs(wlAddr, 5, daOrderId5, amb.address);
    });
  });
  describe("English Auction Listing", async () => {
    it("Should revert if transaction approval hasn't been set", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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

      const tx = await r721
        .connect(acc02)
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });

      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      await expect(
        m721
          .connect(acc01)
          .englishAuction(
            min.address,
            1,
            price,
            blockTimestamp + 301,
          ),
      ).to.be.revertedWith(MarketplaceErrors.WrongFrom);
      await expect(
        m721
          .connect(acc02)
          .englishAuction(
            min.address,
            1,
            price,
            blockTimestamp + 301,
          ),
      ).to.be.revertedWith(MarketplaceErrors.NotAuthorized);
    });
    it("Should revert if duration is less than min allowed", async () => {
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);

      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      await expect(
        m721
          .connect(acc02)
          .englishAuction(
            min.address,
            1,
            price,
            blockTimestamp,
          ),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.NeedMoreTime,
      );
      await expect(
        m721
          .connect(acc02)
          .englishAuction(min.address, 1, price, 300),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.NeedMoreTime,
      );
    });
    it("Should revert if duration is greater than max allowed", async () => {
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);

      const blockTimestamp =
        (await m721.provider.getBlock(tx.blockNumber || 0))
          .timestamp + 31536002; // + 2 sec from the contact setting 31536000 should fail, +1 sec will still pass

      await expect(
        m721
          .connect(acc02)
          .englishAuction(
            min.address,
            1,
            price,
            blockTimestamp,
          ),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.NeedMoreTime,
      );
      await expect(
        m721
          .connect(acc02)
          .englishAuction(min.address, 1, price, 300),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.NeedMoreTime,
      );
    });
    it("Should revert if startPrice is invalid", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      await expect(
        m721
          .connect(acc02)
          .englishAuction(
            min.address,
            1,
            0,
            blockTimestamp + 301,
          ),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.WrongPrice,
      );
    });
    it("Should list english auction order, update storage and emit event", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;
      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc: ContractReceipt = await eaTx.wait();
      const eaBn = eaRc.blockNumber;

      const storage: OrderDetails721 = {
        orderType: 2,
        seller: acc02.address,
        token: minAddr,
        tokenId: ethers.constants.One,
        startPrice: price,
        endPrice: ethers.constants.Zero,
        startTime: ethers.BigNumber.from(blockTimestamp + 1),
        endTime: ethers.BigNumber.from(blockTimestamp + 301),
        lastBidPrice: ethers.constants.Zero,
        lastBidder: dead,
        isSold: false,
      };

      const eaOrderId = getOrderId721(
        eaBn,
        min.address,
        1,
        acc02.address,
      );
      const orderInfo: OrderDetails721 =
        await m721.callStatic.orderInfo(eaOrderId);

      expect(eaTx).to.be.ok;
      expect(orderInfo.orderType).to.eq(storage.orderType);
      expect(orderInfo.seller).to.eq(storage.seller);
      expect(orderInfo.token).to.eq(storage.token);
      expect(orderInfo.tokenId).to.eq(storage.tokenId);
      expect(orderInfo.startPrice).to.eq(storage.startPrice);
      expect(orderInfo.endPrice).to.eq(storage.endPrice);
      expect(orderInfo.startTime).to.eq(storage.startTime);
      expect(orderInfo.endTime).to.eq(storage.endTime);

      expect(
        await m721.callStatic.tokenOrderLength(minAddr, 1),
      ).to.eq(1);
      expect(
        await m721.callStatic.orderIdByToken(minAddr, 1, 0),
      ).to.eq(eaOrderId);
      expect(
        await m721.callStatic.orderIdBySeller(
          acc02.address,
          0,
        ),
      ).to.eq(eaOrderId);
      expect(
        await m721.callStatic.sellerOrderLength(
          acc02.address,
        ),
      ).to.eq(1);

      expect(await min.callStatic.ownerOf(1)).to.eq(
        m721.address,
      );

      await expect(eaTx)
        .to.emit(m721, "MakeOrder")
        .withArgs(minAddr, 1, eaOrderId, acc02.address);
    });
    it("Should handle multiple english auction orders", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
      await f721
        .connect(acc02)
        .createCollection(
          2,
          "salt",
          "721Whitelist",
          "WHITE",
          price,
          1000,
          "ipfs://cid/",
          splAddr,
          750,
        );

      const wlAddr = await f721.callStatic.getDeployedAddr(
        "salt",
      );

      const whitelist = await ethers.getContractAt(
        "ERC721Whitelist",
        wlAddr,
      );

      const root = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("root"),
      );

      await r721
        .connect(acc02)
        .freeSettings(wlAddr, 1, 10, root);

      await r721
        .connect(acc02)
        .gift(
          wlAddr,
          [
            mad.address,
            acc01.address,
            acc02.address,
            owner.address,
            amb.address,
          ],
          { value: ethers.utils.parseEther("0.25") },
        );
      await whitelist.connect(mad).approve(m721.address, 1);
      await whitelist.connect(acc01).approve(m721.address, 2);
      await whitelist.connect(acc02).approve(m721.address, 3);
      await whitelist.connect(owner).approve(m721.address, 4);
      const tx = await whitelist
        .connect(amb)
        .approve(m721.address, 5);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const eaTx1 = await m721
        .connect(mad)
        .englishAuction(
          whitelist.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc1: ContractReceipt = await eaTx1.wait();
      const eaBn1 = eaRc1.blockNumber;

      const eaTx2 = await m721
        .connect(acc01)
        .englishAuction(
          whitelist.address,
          2,
          price,
          blockTimestamp + 301,
        );
      const eaRc2: ContractReceipt = await eaTx2.wait();
      const eaBn2 = eaRc2.blockNumber;

      const eaTx3 = await m721
        .connect(acc02)
        .englishAuction(
          whitelist.address,
          3,
          price,
          blockTimestamp + 301,
        );
      const eaRc3: ContractReceipt = await eaTx3.wait();
      const eaBn3 = eaRc3.blockNumber;

      const eaTx4 = await m721
        .connect(owner)
        .englishAuction(
          whitelist.address,
          4,
          price,
          blockTimestamp + 301,
        );
      const eaRc4: ContractReceipt = await eaTx4.wait();
      const eaBn4 = eaRc4.blockNumber;

      const eaTx5 = await m721
        .connect(amb)
        .englishAuction(
          whitelist.address,
          5,
          price,
          blockTimestamp + 301,
        );
      const eaRc5: ContractReceipt = await eaTx5.wait();
      const eaBn5 = eaRc5.blockNumber;

      const eaOrderId1 = getOrderId721(
        eaBn1,
        whitelist.address,
        1,
        mad.address,
      );
      const eaOrderId2 = getOrderId721(
        eaBn2,
        whitelist.address,
        2,
        acc01.address,
      );
      const eaOrderId3 = getOrderId721(
        eaBn3,
        whitelist.address,
        3,
        acc02.address,
      );
      const eaOrderId4 = getOrderId721(
        eaBn4,
        whitelist.address,
        4,
        owner.address,
      );
      const eaOrderId5 = getOrderId721(
        eaBn5,
        whitelist.address,
        5,
        amb.address,
      );

      const tx1 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        1,
      );
      const tx2 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        2,
      );
      const tx3 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        3,
      );
      const tx4 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        4,
      );
      const tx5 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        5,
      );

      const txA = await m721.callStatic.orderIdByToken(
        whitelist.address,
        1,
        0,
      );
      const txB = await m721.callStatic.orderIdByToken(
        whitelist.address,
        2,
        0,
      );
      const txC = await m721.callStatic.orderIdByToken(
        whitelist.address,
        3,
        0,
      );
      const txD = await m721.callStatic.orderIdByToken(
        whitelist.address,
        4,
        0,
      );
      const txE = await m721.callStatic.orderIdByToken(
        whitelist.address,
        5,
        0,
      );

      const tx6 = await m721.callStatic.orderIdBySeller(
        mad.address,
        0,
      );
      const tx7 = await m721.callStatic.orderIdBySeller(
        acc01.address,
        0,
      );
      const tx8 = await m721.callStatic.orderIdBySeller(
        acc02.address,
        0,
      );
      const tx9 = await m721.callStatic.orderIdBySeller(
        owner.address,
        0,
      );
      const tx10 = await m721.callStatic.orderIdBySeller(
        amb.address,
        0,
      );

      const txF = await m721.callStatic.sellerOrderLength(
        mad.address,
      );
      const txG = await m721.callStatic.sellerOrderLength(
        acc01.address,
      );
      const txH = await m721.callStatic.sellerOrderLength(
        acc02.address,
      );
      const txI = await m721.callStatic.sellerOrderLength(
        owner.address,
      );
      const txJ = await m721.callStatic.sellerOrderLength(
        amb.address,
      );

      const owner1 = await whitelist.callStatic.ownerOf(1);
      const owner2 = await whitelist.callStatic.ownerOf(2);
      const owner3 = await whitelist.callStatic.ownerOf(3);
      const owner4 = await whitelist.callStatic.ownerOf(4);
      const owner5 = await whitelist.callStatic.ownerOf(5);

      expect(eaTx1).to.be.ok;
      expect(eaTx2).to.be.ok;
      expect(eaTx3).to.be.ok;
      expect(eaTx4).to.be.ok;
      expect(eaTx5).to.be.ok;

      expect(tx1).to.be.ok.and.to.eq(1);
      expect(tx2).to.be.ok.and.to.eq(1);
      expect(tx3).to.be.ok.and.to.eq(1);
      expect(tx4).to.be.ok.and.to.eq(1);
      expect(tx5).to.be.ok.and.to.eq(1);

      expect(txA).to.be.ok.and.to.eq(eaOrderId1);
      expect(txB).to.be.ok.and.to.eq(eaOrderId2);
      expect(txC).to.be.ok.and.to.eq(eaOrderId3);
      expect(txD).to.be.ok.and.to.eq(eaOrderId4);
      expect(txE).to.be.ok.and.to.eq(eaOrderId5);

      expect(tx6).to.be.ok.and.to.eq(eaOrderId1);
      expect(tx7).to.be.ok.and.to.eq(eaOrderId2);
      expect(tx8).to.be.ok.and.to.eq(eaOrderId3);
      expect(tx9).to.be.ok.and.to.eq(eaOrderId4);
      expect(tx10).to.be.ok.and.to.eq(eaOrderId5);

      expect(txF).to.be.ok.and.to.eq(1);
      expect(txG).to.be.ok.and.to.eq(1);
      expect(txH).to.be.ok.and.to.eq(1);
      expect(txI).to.be.ok.and.to.eq(1);
      expect(txJ).to.be.ok.and.to.eq(1);

      expect(owner1).to.be.ok.and.to.eq(m721.address);
      expect(owner2).to.be.ok.and.to.eq(m721.address);
      expect(owner3).to.be.ok.and.to.eq(m721.address);
      expect(owner4).to.be.ok.and.to.eq(m721.address);
      expect(owner5).to.be.ok.and.to.eq(m721.address);

      await expect(eaTx1)
        .to.emit(m721, "MakeOrder")
        .withArgs(wlAddr, 1, eaOrderId1, mad.address);
      await expect(eaTx2)
        .to.emit(m721, "MakeOrder")
        .withArgs(wlAddr, 2, eaOrderId2, acc01.address);
      await expect(eaTx3)
        .to.emit(m721, "MakeOrder")
        .withArgs(wlAddr, 3, eaOrderId3, acc02.address);
      await expect(eaTx4)
        .to.emit(m721, "MakeOrder")
        .withArgs(wlAddr, 4, eaOrderId4, owner.address);
      await expect(eaTx5)
        .to.emit(m721, "MakeOrder")
        .withArgs(wlAddr, 5, eaOrderId5, amb.address);
    });
  });
  describe("Bidding", async () => {
    it("Should revert if price is wrong", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc: ContractReceipt = await eaTx.wait();
      const eaBn = eaRc.blockNumber;

      await mine(13);

      const eaOrderId = getOrderId721(
        eaBn,
        min.address,
        1,
        acc02.address,
      );

      await expect(
        m721.connect(acc01).bid(eaOrderId),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.WrongPrice,
      );
      await m721.connect(mad).bid(eaOrderId, {
        value: price.mul(ethers.constants.Two),
      });
      await expect(
        m721.connect(acc01).bid(eaOrderId, {
          value: price.mul(ethers.constants.Two),
        }),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.WrongPrice,
      );
    });
    it("Should revert if not English Auction", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });

      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;
      const daTx = await m721
        .connect(acc02)
        .dutchAuction(
          min.address,
          1,
          price,
          0,
          blockTimestamp + 301,
        );
      const daRc: ContractReceipt = await daTx.wait();
      const daBn = daRc.blockNumber;
      const orderId = getOrderId721(
        daBn,
        min.address,
        1,
        acc02.address,
      );
      await expect(
        m721.connect(acc01).bid(orderId, { value: price }),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.EAOnly,
      );
    });
    it("Should revert if order was canceled", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc: ContractReceipt = await eaTx.wait();
      const eaBn = eaRc.blockNumber;
      const orderId = getOrderId721(
        eaBn,
        min.address,
        1,
        acc02.address,
      );

      await m721.connect(acc02).cancelOrder(orderId);

      await expect(
        m721.connect(acc01).bid(orderId),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.CanceledOrder,
      );
    });
    it("Should revert if order has timed out", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc: ContractReceipt = await eaTx.wait();
      const eaBn = eaRc.blockNumber;
      const orderId = getOrderId721(
        eaBn,
        min.address,
        1,
        acc02.address,
      );

      await setNextBlockTimestamp(blockTimestamp + 303);
      await mineUpTo(30);

      await expect(
        m721.connect(acc01).bid(orderId),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.Timeout,
      );
    });
    it("Should revert if bidder is the seller", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc: ContractReceipt = await eaTx.wait();
      const eaBn = eaRc.blockNumber;
      const orderId = getOrderId721(
        eaBn,
        min.address,
        1,
        acc02.address,
      );

      await expect(
        m721.connect(acc02).bid(orderId),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.InvalidBidder,
      );
    });
    it("Should bid, update storage and emit events", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc: ContractReceipt = await eaTx.wait();
      const eaBn = eaRc.blockNumber;

      await mine(13);

      const eaOrderId = getOrderId721(
        eaBn,
        min.address,
        1,
        acc02.address,
      );

      const bidVal1 = await price.mul(ethers.constants.Two);
      const bidVal2 = await bidVal1.mul(ethers.constants.Two);

      const tx1 = await m721
        .connect(mad)
        .bid(eaOrderId, { value: bidVal1 });

      await mineUpTo(200);

      const tx2 = await m721
        .connect(acc01)
        .bid(eaOrderId, { value: bidVal2 });

      await expect(tx1)
        .to.be.ok.and.to.emit(m721, "Bid")
        .withArgs(
          minAddr,
          1,
          eaOrderId,
          mad.address,
          bidVal1,
        );
      await expect(tx2)
        .to.be.ok.and.to.emit(m721, "Bid")
        .withArgs(
          minAddr,
          1,
          eaOrderId,
          acc01.address,
          bidVal2,
        );

      const orderInfo: OrderDetails721 =
        await m721.callStatic.orderInfo(eaOrderId);

      expect(orderInfo.endTime).to.eq(
        blockTimestamp + 301 + 300,
      ); // two successful bids but second is not 5 minutes before end
      expect(orderInfo.lastBidder).to.eq(acc01.address);
      expect(orderInfo.lastBidPrice).to.eq(bidVal2);
    });
    it("Should bid, update storage and emit events; check user is returned their bid amount (which must be withdrawn)", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc: ContractReceipt = await eaTx.wait();
      const eaBn = eaRc.blockNumber;

      await mine(13);

      const eaOrderId = getOrderId721(
        eaBn,
        min.address,
        1,
        acc02.address,
      );

      const bidVal1 = await price.mul(ethers.constants.Two);
      const bidVal2 = await bidVal1.mul(ethers.constants.Two);

      const tx1 = await m721
        .connect(mad)
        .bid(eaOrderId, { value: bidVal1 });

      await mineUpTo(200);

      const tx2 = await m721
        .connect(acc01)
        .bid(eaOrderId, { value: bidVal2 });

      await expect(tx1)
        .to.be.ok.and.to.emit(m721, "Bid")
        .withArgs(
          minAddr,
          1,
          eaOrderId,
          mad.address,
          bidVal1,
        );
      await expect(tx2)
        .to.be.ok.and.to.emit(m721, "Bid")
        .withArgs(
          minAddr,
          1,
          eaOrderId,
          acc01.address,
          bidVal2,
        );

      const orderInfo: OrderDetails721 =
        await m721.callStatic.orderInfo(eaOrderId);

      expect(orderInfo.endTime).to.eq(
        blockTimestamp + 301 + 300,
      ); // two successful bids but second is not 5 minutes before end
      expect(orderInfo.lastBidder).to.eq(acc01.address);
      expect(orderInfo.lastBidPrice).to.eq(bidVal2);


      const bal = await m721.connect(acc01).getOutbidBalance();
      expect(bal).to.gt(0);

      const currBal = await acc01.getBalance();

      
      let tx_ = await m721.connect(acc01).withdrawOutbidEth();
      const tx_r = await tx_.wait();
      let bal2 = await acc01.getBalance();

      expect(await m721.connect(acc01).getOutbidBalance()).to.eq(0);
      expect(bal2).eq(bal.add(currBal).sub(tx_r.cumulativeGasUsed.mul(tx_r.effectiveGasPrice)));
    });
  });
  describe("Buying", async () => {
    it("Should revert if price is wrong", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const fpTx = await m721
        .connect(acc02)
        .fixedPrice(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
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
        MarketplaceErrors.WrongPrice,
      );
    });
    it("Should revert if order is an English Auction", async () => {
      await m721.updateSettings(20, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc: ContractReceipt = await eaTx.wait();
      const eaBn = eaRc.blockNumber;
      const orderId = getOrderId721(
        eaBn,
        min.address,
        1,
        acc02.address,
      );

      await expect(
        m721.connect(acc01).buy(orderId),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.NotBuyable,
      );
    });
    it("Should revert if order was canceled", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const daTx = await m721
        .connect(acc02)
        .dutchAuction(
          min.address,
          1,
          price,
          0,
          blockTimestamp + 301,
        );
      const daRc: ContractReceipt = await daTx.wait();
      const daBn = daRc.blockNumber;
      const orderId = getOrderId721(
        daBn,
        min.address,
        1,
        acc02.address,
      );

      await m721.connect(acc02).cancelOrder(orderId);

      await expect(
        m721.connect(acc01).buy(orderId),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.CanceledOrder,
      );
    });
    it("Should revert if order has timed out", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const daTx = await m721
        .connect(acc02)
        .dutchAuction(
          min.address,
          1,
          price,
          0,
          blockTimestamp + 301,
        );
      const daRc: ContractReceipt = await daTx.wait();
      const daBn = daRc.blockNumber;
      const orderId = getOrderId721(
        daBn,
        min.address,
        1,
        acc02.address,
      );

      await setNextBlockTimestamp(blockTimestamp + 302);
      await mineUpTo(302);

      await expect(
        m721.connect(acc01).buy(orderId),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.Timeout,
      );
    });
    it("Should revert if token has already been sold", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const fpTx = await m721
        .connect(acc02)
        .fixedPrice(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const fpRc: ContractReceipt = await fpTx.wait();
      const fpBn = fpRc.blockNumber;
      const fpOrderId = getOrderId721(
        fpBn,
        min.address,
        1,
        acc02.address,
      );
      await mine(10);
      await m721
        .connect(acc01)
        .buy(fpOrderId, { value: price });

      await expect(
        m721.connect(amb).buy(fpOrderId),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.SoldToken,
      );
    });
    it("Should buy inhouse minted tokens, update storage and emit events", async () => {
      // fixed price order
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const fpTx = await m721
        .connect(acc02)
        .fixedPrice(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const fpRc: ContractReceipt = await fpTx.wait();
      const fpBn = fpRc.blockNumber;
      const fpOrderId = getOrderId721(
        fpBn,
        min.address,
        1,
        acc02.address,
      );
      await mine(10);
      const fpBuy = await m721
        .connect(acc01)
        .buy(fpOrderId, { value: price });

      // dutch auction order
      const basicAddr = await f721.callStatic.getDeployedAddr(
        "BasicSalt",
      );
      await f721
        .connect(acc02)
        .createCollection(
          1,
          "BasicSalt",
          "721Basic",
          "BASIC",
          price,
          1,
          "ipfs://cid/",
          splAddr,
          750,
        );
      const basic = await ethers.getContractAt(
        "ERC721Basic",
        basicAddr,
      );
      await r721
        .connect(acc02)
        .setMintState(basic.address, true, 0);
      await basic.connect(acc02).mint(1, { value: price.add(ethers.utils.parseEther("0.25")) });
      await basic.connect(acc02).approve(m721.address, 1);
      const daTx = await m721
        .connect(acc02)
        .dutchAuction(
          basic.address,
          1,
          price,
          0,
          blockTimestamp + 301,
        );
      const daRc: ContractReceipt = await daTx.wait();
      const daBn = daRc.blockNumber;
      const daOrderId = getOrderId721(
        daBn,
        basic.address,
        1,
        acc02.address,
      );

      const blockTimestampDA = (
        await m721.provider.getBlock(daBn)
      ).timestamp;

      const orderInfo: OrderDetails721 =
        await m721.callStatic.orderInfo(daOrderId);
      await setNextBlockTimestamp(blockTimestamp + 200);
      await mineUpTo(daBn + 1);
      const blockTimestamp2 = (
        await m721.provider.getBlock(daBn + 1)
      ).timestamp;

      // simulate DA pricing math with ts
      const delta = orderInfo.endTime.sub(
        orderInfo.startTime,
      );
      const tick = price.div(delta);
      const dec = ethers.BigNumber.from(
        blockTimestamp2 - orderInfo.startTime.toNumber() + 1,
      ).mul(tick);
      const daPrice = price.sub(dec);

      const daBuy = await m721
        .connect(acc01)
        .buy(daOrderId, { value: daPrice });

      const zero = ethers.constants.Zero;
      const one = ethers.constants.One;
      const cBal1 = await min.callStatic.balanceOf(
        acc01.address,
      );
      const cBal2 = await basic.callStatic.balanceOf(
        acc01.address,
      );
      const fpOwnerOf = await min.callStatic.ownerOf(1);
      const daOwnerOf = await basic.callStatic.ownerOf(1);

      const fpOD: OrderDetails721 = {
        orderType: 0,
        seller: acc02.address,
        token: minAddr,
        tokenId: one,
        startPrice: price,
        endPrice: zero,
        startTime: ethers.BigNumber.from(blockTimestamp + 1),
        endTime: ethers.BigNumber.from(blockTimestamp + 301),
        lastBidPrice: zero,
        lastBidder: dead,
        isSold: true,
      };
      const daOD: OrderDetails721 = {
        orderType: 1,
        seller: acc02.address,
        token: basicAddr,
        tokenId: one,
        startPrice: price,
        endPrice: zero,
        startTime: ethers.BigNumber.from(blockTimestampDA),
        endTime: ethers.BigNumber.from(blockTimestamp + 301),
        lastBidPrice: zero,
        lastBidder: dead,
        isSold: true,
      };

      const fpOrderInfo: OrderDetails721 =
        await m721.callStatic.orderInfo(fpOrderId);

      const daOrderInfo: OrderDetails721 =
        await m721.callStatic.orderInfo(daOrderId);

      expect(cBal1).to.eq(1);
      expect(cBal2).to.eq(1);
      expect(fpOwnerOf).to.eq(acc01.address);
      expect(daOwnerOf).to.eq(acc01.address);
      expect(
        await m721.callStatic.orderIdBySeller(
          acc02.address,
          0,
        ),
      ).to.eq(fpOrderId);
      expect(
        await m721.callStatic.orderIdBySeller(
          acc02.address,
          1,
        ),
      ).to.eq(daOrderId);
      expect(
        await m721.callStatic.orderIdByToken(
          min.address,
          1,
          0,
        ),
      ).to.eq(fpOrderId);
      expect(
        await m721.callStatic.orderIdByToken(
          basic.address,
          1,
          0,
        ),
      ).to.eq(daOrderId);

      expect(fpOrderInfo.orderType).to.eq(fpOD.orderType);
      expect(fpOrderInfo.seller).to.eq(fpOD.seller);
      expect(fpOrderInfo.token).to.eq(fpOD.token);
      expect(fpOrderInfo.tokenId).to.eq(fpOD.tokenId);
      expect(fpOrderInfo.startPrice).to.eq(fpOD.startPrice);
      expect(fpOrderInfo.endPrice).to.eq(fpOD.endPrice);
      expect(fpOrderInfo.startTime).to.eq(fpOD.startTime);
      expect(fpOrderInfo.endTime).to.eq(fpOD.endTime);
      expect(fpOrderInfo.lastBidPrice).to.eq(
        fpOD.lastBidPrice,
      );
      expect(fpOrderInfo.lastBidder).to.eq(fpOD.lastBidder);
      expect(fpOrderInfo.isSold).to.eq(fpOD.isSold);

      expect(daOrderInfo.orderType).to.eq(daOD.orderType);
      expect(daOrderInfo.seller).to.eq(daOD.seller);
      expect(daOrderInfo.token).to.eq(daOD.token);
      expect(daOrderInfo.tokenId).to.eq(daOD.tokenId);
      expect(daOrderInfo.startPrice).to.eq(daOD.startPrice);
      expect(daOrderInfo.endPrice).to.eq(daOD.endPrice);
      expect(daOrderInfo.startTime).to.eq(daOD.startTime);
      expect(daOrderInfo.endTime).to.eq(daOD.endTime);
      expect(daOrderInfo.lastBidPrice).to.eq(
        daOD.lastBidPrice,
      );
      expect(daOrderInfo.lastBidder).to.eq(daOD.lastBidder);
      expect(daOrderInfo.isSold).to.eq(daOD.isSold);

      await expect(fpBuy)
        .to.be.ok.and.to.emit(m721, "Claim")
        .withArgs(
          minAddr,
          1,
          fpOrderId,
          acc02.address,
          acc01.address,
          price,
        );
      await expect(daBuy)
        .to.be.ok.and.to.emit(m721, "Claim")
        .withArgs(
          basicAddr,
          1,
          daOrderId,
          acc02.address,
          acc01.address,
          daPrice,
        );
    });
    it("Should verify inhouse minted tokens balance changes", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
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
      // const splitter = await ethers.getContractAt(
      //   "SplitterImpl",
      //   splAddr,
      // );
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const fpTx = await m721
        .connect(acc02)
        .fixedPrice(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const fpRc: ContractReceipt = await fpTx.wait();
      const fpBn = fpRc.blockNumber;
      const fpOrderId = getOrderId721(
        fpBn,
        min.address,
        1,
        acc02.address,
      );
      await mine(10);
      const fpRoyalty = await min.royaltyInfo(1, price);

      await expect(() =>
        m721.connect(acc01).buy(fpOrderId, { value: price }),
      ).to.changeEtherBalances(
        [acc01, acc02],
        [
          "-1000000000000000000",
          price
            .sub(price.mul(1000).div(10_000)) // we now have to include the platform fee of 10% for initial sale
            .sub(fpRoyalty[1])
            .add(fpRoyalty[1].mul(8000).div(10_000)), // i should get 80% of the royalties; 20% goes to my friend
        ],
      );

      // dutch auction order
      const basicAddr = await f721.callStatic.getDeployedAddr(
        "BasicSalt",
      );
      await f721
        .connect(acc02)
        .createCollection(
          1,
          "BasicSalt",
          "721Basic",
          "BASIC",
          price,
          1,
          "ipfs://cid/",
          splAddr,
          750,
        );
      const basic = await ethers.getContractAt(
        "ERC721Basic",
        basicAddr,
      );
      await r721
        .connect(acc02)
        .setMintState(basic.address, true, 0);
      await basic.connect(acc02).mint(1, { value: price.add(ethers.utils.parseEther("0.25")) });
      await basic.connect(acc02).approve(m721.address, 1);
      const daTx = await m721
        .connect(acc02)
        .dutchAuction(
          basic.address,
          1,
          price,
          0,
          blockTimestamp + 301,
        );
      const daRc: ContractReceipt = await daTx.wait();
      const daBn = daRc.blockNumber;
      const daOrderId = getOrderId721(
        daBn,
        basic.address,
        1,
        acc02.address,
      );

      const orderInfo: OrderDetails721 =
        await m721.callStatic.orderInfo(daOrderId);

      await setNextBlockTimestamp(blockTimestamp + 200);
      await mineUpTo(daBn + 1);
      const blockTimestamp2 = (
        await m721.provider.getBlock(daBn + 1)
      ).timestamp;

      const delta = orderInfo.endTime.sub(
        orderInfo.startTime,
      );
      const tick = price.div(delta);
      const dec = ethers.BigNumber.from(
        blockTimestamp2 - orderInfo.startTime.toNumber() + 1,
      ).mul(tick);
      const daPrice = price.sub(dec);

      const daRoyalty = await basic.royaltyInfo(1, daPrice);

      await expect(() =>
        m721
          .connect(acc01)
          .buy(daOrderId, { value: daPrice }),
      ).to.changeEtherBalances(
        [acc01, acc02],
        [
          "-352112676056338080",
          daPrice
            .sub(daPrice.mul(1000).div(10_000)) // 10% platform fee
            .sub(daRoyalty[1])
            .add(daRoyalty[1].mul(8000).div(10_000)),
        ],
      );
    });
    it("Should buy third party minted tokens with ERC2981 support", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      const ExtToken = await ethers.getContractFactory(
        "ERC721Basic",
      );
      const extToken = await ExtToken.connect(acc02).deploy(
        "721Basic",
        "BASIC",
        "ipfs://cid/",
        price,
        100,
        acc02.address,
        500,
        acc02.address,
        ethers.constants.AddressZero,
      );

      await extToken.connect(acc02).setPublicMintState(true);
      await extToken
        .connect(acc02)
        .mint(2, { value: price.mul(ethers.constants.Two) });
      await extToken.connect(acc02).approve(m721.address, 1);
      const tx = await extToken
        .connect(acc02)
        .approve(m721.address, 2);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const fpTx = await m721
        .connect(acc02)
        .fixedPrice(
          extToken.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const fpRc: ContractReceipt = await fpTx.wait();
      const fpBn = fpRc.blockNumber;
      const fpOrderId = getOrderId721(
        fpBn,
        extToken.address,
        1,
        acc02.address,
      );
      await mine(10);
      // const fpRoyalty = await extToken.callStatic.royaltyInfo(
      //   1,
      //   price,
      // );
      // const cPrice = price.sub(fpRoyalty[1]);
      const fpFee = price
        .mul(ethers.BigNumber.from(250)) // flat fee of 2.5% for external
        .div(ethers.BigNumber.from(10000));

      await expect(() =>
        m721.connect(acc01).buy(fpOrderId, { value: price }),
      ).to.changeEtherBalances(
        [acc01, acc02, owner],
        ["-1000000000000000000", price.sub(fpFee), fpFee],
      );

      const daTx = await m721
        .connect(acc02)
        .dutchAuction(
          extToken.address,
          2,
          price,
          0,
          blockTimestamp + 301,
        );
      const daRc: ContractReceipt = await daTx.wait();
      const daBn = daRc.blockNumber;
      const daOrderId = getOrderId721(
        daBn,
        extToken.address,
        2,
        acc02.address,
      );

      const orderInfo: OrderDetails721 =
        await m721.callStatic.orderInfo(daOrderId);

      await setNextBlockTimestamp(blockTimestamp + 200);
      await mineUpTo(daBn + 1);
      const blockTimestamp2 = (
        await m721.provider.getBlock(daBn + 1)
      ).timestamp;

      const delta = orderInfo.endTime.sub(
        orderInfo.startTime,
      );
      const tick = price.div(delta);
      const dec = ethers.BigNumber.from(
        blockTimestamp2 - orderInfo.startTime.toNumber() + 1,
      ).mul(tick);
      const daPrice = price.sub(dec);

      // const daRoyalty = await extToken.royaltyInfo(
      //   2,
      //   daPrice,
      // );
      // const cPrice2 = daPrice.sub(daRoyalty[1]);
      const daFee = daPrice
        .mul(ethers.BigNumber.from(250))
        .div(ethers.BigNumber.from(10000));

      await expect(() =>
        m721
          .connect(acc01)
          .buy(daOrderId, { value: daPrice }),
      ).to.changeEtherBalances(
        [acc01, acc02, owner],
        ["-347222222222222264", daPrice.sub(daFee), daFee],
      );
    });
    it("Should buy third party minted tokens without ERC2981 support", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      const ExtToken = await ethers.getContractFactory(
        "MockERC721",
      );
      const extToken = await ExtToken.connect(acc02).deploy(
        "721Mock",
        "MOCK",
      );

      await extToken.mint(acc02.address, 1);
      await extToken.mint(acc02.address, 2);

      await extToken.connect(acc02).approve(m721.address, 1);
      const tx = await extToken
        .connect(acc02)
        .approve(m721.address, 2);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const fpTx = await m721
        .connect(acc02)
        .fixedPrice(
          extToken.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const fpRc: ContractReceipt = await fpTx.wait();
      const fpBn = fpRc.blockNumber;
      const fpOrderId = getOrderId721(
        fpBn,
        extToken.address,
        1,
        acc02.address,
      );
      await mine(10);

      const fpFee = price
        .mul(ethers.BigNumber.from(250))
        .div(ethers.BigNumber.from(10000));

      await expect(() =>
        m721.connect(acc01).buy(fpOrderId, { value: price }),
      ).to.changeEtherBalances(
        [acc01, acc02, owner],
        ["-1000000000000000000", price.sub(fpFee), fpFee],
      );

      const blockTimestamp_ = (
        await m721.provider.getBlock(fpBn + 1)
      ).timestamp;

      const daTx = await m721
        .connect(acc02)
        .dutchAuction(
          extToken.address,
          2,
          price,
          0,
          blockTimestamp_ + 301,
        );
      const daRc: ContractReceipt = await daTx.wait();
      const daBn = daRc.blockNumber;
      const daOrderId = getOrderId721(
        daBn,
        extToken.address,
        2,
        acc02.address,
      );

      const orderInfo: OrderDetails721 =
        await m721.callStatic.orderInfo(daOrderId);
      await setNextBlockTimestamp(blockTimestamp + 200);
      await mineUpTo(daBn + 1);
      const blockTimestamp2 = (
        await m721.provider.getBlock(daBn + 1)
      ).timestamp;

      // simulate DA pricing math with ts
      const delta = orderInfo.endTime.sub(
        orderInfo.startTime,
      );
      const tick = price.div(delta);
      const dec = ethers.BigNumber.from(
        blockTimestamp2 - orderInfo.startTime.toNumber() + 1,
      ).mul(tick);
      const daPrice = price.sub(dec);

      const daFee = daPrice
        .mul(ethers.BigNumber.from(250))
        .div(ethers.BigNumber.from(10000));

      await expect(() =>
        m721
          .connect(acc01)
          .buy(daOrderId, { value: daPrice }),
      ).to.changeEtherBalances(
        [acc01, acc02, owner],
        ["-351724137931034580", daPrice.sub(daFee), daFee],
      );
    });

    it("Should verify inhouse minted tokens balance changes - fee change update", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      await m721.setFees(1.5e3, 5.0e2);
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
      // const splitter = await ethers.getContractAt(
      //   "SplitterImpl",
      //   splAddr,
      // );
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const fpTx = await m721
        .connect(acc02)
        .fixedPrice(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const fpRc: ContractReceipt = await fpTx.wait();
      const fpBn = fpRc.blockNumber;
      const fpOrderId = getOrderId721(
        fpBn,
        min.address,
        1,
        acc02.address,
      );
      await mine(10);
      const fpRoyalty = await min.royaltyInfo(1, price);

      await expect(() =>
        m721.connect(acc01).buy(fpOrderId, { value: price }),
      ).to.changeEtherBalances(
        [acc01, acc02],
        [
          "-1000000000000000000",
          price
            .sub(price.mul(1500).div(10_000)) // we now have to include the platform fee of 10% for initial sale
            .sub(fpRoyalty[1])
            .add(fpRoyalty[1].mul(8000).div(10_000)), // i should get 80% of the royalties; 20% goes to my friend
        ],
      );

      // dutch auction order
      const basicAddr = await f721.callStatic.getDeployedAddr(
        "BasicSalt",
      );
      await f721
        .connect(acc02)
        .createCollection(
          1,
          "BasicSalt",
          "721Basic",
          "BASIC",
          price,
          1,
          "ipfs://cid/",
          splAddr,
          750,
        );
      const basic = await ethers.getContractAt(
        "ERC721Basic",
        basicAddr,
      );
      await r721
        .connect(acc02)
        .setMintState(basic.address, true, 0);
      await basic.connect(acc02).mint(1, { value: price.add(ethers.utils.parseEther("0.25")) });
      await basic.connect(acc02).approve(m721.address, 1);
      const daTx = await m721
        .connect(acc02)
        .dutchAuction(
          basic.address,
          1,
          price,
          0,
          blockTimestamp + 301,
        );
      const daRc: ContractReceipt = await daTx.wait();
      const daBn = daRc.blockNumber;
      const daOrderId = getOrderId721(
        daBn,
        basic.address,
        1,
        acc02.address,
      );

      const orderInfo: OrderDetails721 =
        await m721.callStatic.orderInfo(daOrderId);

      await setNextBlockTimestamp(blockTimestamp + 200);
      await mineUpTo(daBn + 1);
      const blockTimestamp2 = (
        await m721.provider.getBlock(daBn + 1)
      ).timestamp;

      const delta = orderInfo.endTime.sub(
        orderInfo.startTime,
      );
      const tick = price.div(delta);
      const dec = ethers.BigNumber.from(
        blockTimestamp2 - orderInfo.startTime.toNumber() + 1,
      ).mul(tick);
      const daPrice = price.sub(dec);

      const daRoyalty = await basic.royaltyInfo(1, daPrice);

      await expect(() =>
        m721
          .connect(acc01)
          .buy(daOrderId, { value: daPrice }),
      ).to.changeEtherBalances(
        [acc01, acc02],
        [
          "-352112676056338080",
          daPrice
            .sub(daPrice.mul(1500).div(10_000)) // 10% platform fee
            .sub(daRoyalty[1])
            .add(daRoyalty[1].mul(8000).div(10_000)),
        ],
      );
    });
    it("Should buy third party minted tokens with ERC2981 support - fee change update", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      await m721.setFees(1.5e3, 5.0e2);
      const ExtToken = await ethers.getContractFactory(
        "ERC721Basic",
      );
      const extToken = await ExtToken.connect(acc02).deploy(
        "721Basic",
        "BASIC",
        "ipfs://cid/",
        price,
        100,
        acc02.address,
        500,
        acc02.address,
        ethers.constants.AddressZero,
      );

      await extToken.connect(acc02).setPublicMintState(true);
      await extToken
        .connect(acc02)
        .mint(2, { value: price.mul(ethers.constants.Two) });
      await extToken.connect(acc02).approve(m721.address, 1);
      const tx = await extToken
        .connect(acc02)
        .approve(m721.address, 2);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const fpTx = await m721
        .connect(acc02)
        .fixedPrice(
          extToken.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const fpRc: ContractReceipt = await fpTx.wait();
      const fpBn = fpRc.blockNumber;
      const fpOrderId = getOrderId721(
        fpBn,
        extToken.address,
        1,
        acc02.address,
      );
      await mine(10);
      // const fpRoyalty = await extToken.callStatic.royaltyInfo(
      //   1,
      //   price,
      // );
      // const cPrice = price.sub(fpRoyalty[1]);
      const fpFee = price
        .mul(ethers.BigNumber.from(500)) // flat fee of 2.5% for external
        .div(ethers.BigNumber.from(10000));

      await expect(() =>
        m721.connect(acc01).buy(fpOrderId, { value: price }),
      ).to.changeEtherBalances(
        [acc01, acc02, owner],
        ["-1000000000000000000", price.sub(fpFee), fpFee],
      );

      const daTx = await m721
        .connect(acc02)
        .dutchAuction(
          extToken.address,
          2,
          price,
          0,
          blockTimestamp + 301,
        );
      const daRc: ContractReceipt = await daTx.wait();
      const daBn = daRc.blockNumber;
      const daOrderId = getOrderId721(
        daBn,
        extToken.address,
        2,
        acc02.address,
      );

      const orderInfo: OrderDetails721 =
        await m721.callStatic.orderInfo(daOrderId);

      await setNextBlockTimestamp(blockTimestamp + 200);
      await mineUpTo(daBn + 1);
      const blockTimestamp2 = (
        await m721.provider.getBlock(daBn + 1)
      ).timestamp;

      const delta = orderInfo.endTime.sub(
        orderInfo.startTime,
      );
      const tick = price.div(delta);
      const dec = ethers.BigNumber.from(
        blockTimestamp2 - orderInfo.startTime.toNumber() + 1,
      ).mul(tick);
      const daPrice = price.sub(dec);

      // const daRoyalty = await extToken.royaltyInfo(
      //   2,
      //   daPrice,
      // );
      // const cPrice2 = daPrice.sub(daRoyalty[1]);
      const daFee = daPrice
        .mul(ethers.BigNumber.from(500))
        .div(ethers.BigNumber.from(10000));

      await expect(() =>
        m721
          .connect(acc01)
          .buy(daOrderId, { value: daPrice }),
      ).to.changeEtherBalances(
        [acc01, acc02, owner],
        ["-347222222222222264", daPrice.sub(daFee), daFee],
      );
    });
    it("Should buy third party minted tokens without ERC2981 support - fee change update", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      await m721.setFees(1.5e3, 5.0e2);
      const ExtToken = await ethers.getContractFactory(
        "MockERC721",
      );
      const extToken = await ExtToken.connect(acc02).deploy(
        "721Mock",
        "MOCK",
      );

      await extToken.mint(acc02.address, 1);
      await extToken.mint(acc02.address, 2);

      await extToken.connect(acc02).approve(m721.address, 1);
      const tx = await extToken
        .connect(acc02)
        .approve(m721.address, 2);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const fpTx = await m721
        .connect(acc02)
        .fixedPrice(
          extToken.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const fpRc: ContractReceipt = await fpTx.wait();
      const fpBn = fpRc.blockNumber;
      const fpOrderId = getOrderId721(
        fpBn,
        extToken.address,
        1,
        acc02.address,
      );
      await mine(10);

      const fpFee = price
        .mul(ethers.BigNumber.from(500))
        .div(ethers.BigNumber.from(10000));

      await expect(() =>
        m721.connect(acc01).buy(fpOrderId, { value: price }),
      ).to.changeEtherBalances(
        [acc01, acc02, owner],
        ["-1000000000000000000", price.sub(fpFee), fpFee],
      );

      const blockTimestamp_ = (
        await m721.provider.getBlock(fpBn + 1)
      ).timestamp;

      const daTx = await m721
        .connect(acc02)
        .dutchAuction(
          extToken.address,
          2,
          price,
          0,
          blockTimestamp_ + 301,
        );
      const daRc: ContractReceipt = await daTx.wait();
      const daBn = daRc.blockNumber;
      const daOrderId = getOrderId721(
        daBn,
        extToken.address,
        2,
        acc02.address,
      );

      const orderInfo: OrderDetails721 =
        await m721.callStatic.orderInfo(daOrderId);
      await setNextBlockTimestamp(blockTimestamp + 200);
      await mineUpTo(daBn + 1);
      const blockTimestamp2 = (
        await m721.provider.getBlock(daBn + 1)
      ).timestamp;

      // simulate DA pricing math with ts
      const delta = orderInfo.endTime.sub(
        orderInfo.startTime,
      );
      const tick = price.div(delta);
      const dec = ethers.BigNumber.from(
        blockTimestamp2 - orderInfo.startTime.toNumber() + 1,
      ).mul(tick);
      const daPrice = price.sub(dec);

      const daFee = daPrice
        .mul(ethers.BigNumber.from(500))
        .div(ethers.BigNumber.from(10000));

      await expect(() =>
        m721
          .connect(acc01)
          .buy(daOrderId, { value: daPrice }),
      ).to.changeEtherBalances(
        [acc01, acc02, owner],
        ["-351724137931034580", daPrice.sub(daFee), daFee],
      );
    });
  });

  describe("Claim", async () => {
    it("Should revert if caller is seller or bidder", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc: ContractReceipt = await eaTx.wait();
      const eaBn = eaRc.blockNumber;

      await mine(13);

      const eaOrderId = getOrderId721(
        eaBn,
        min.address,
        1,
        acc02.address,
      );

      const bidVal1 = await price.mul(ethers.constants.Two);
      const verArt = await artifacts.readArtifact(
        "FactoryVerifier",
      );
      const ver = new ethers.Contract(
        f721.address,
        verArt.abi,
        ethers.provider,
      );

      await m721
        .connect(mad)
        .bid(eaOrderId, { value: bidVal1 });

      await expect(
        m721.connect(acc01).claim(eaOrderId),
      ).to.be.revertedWithCustomError(
        ver,
        MarketplaceErrors.AccessDenied,
      );
    });
    it("Should revert if token has already been claimed", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc: ContractReceipt = await eaTx.wait();
      const eaBn = eaRc.blockNumber;
      const orderId = getOrderId721(
        eaBn,
        min.address,
        1,
        acc02.address,
      );
      await m721.connect(acc01).bid(orderId, {
        value: price.mul(ethers.constants.Two),
      });
      await setNextBlockTimestamp(blockTimestamp + 600);
      await mineUpTo(600);

      await m721
        .connect(acc02)
        .claim(
          await m721.callStatic.orderIdByToken(minAddr, 1, 0),
        );

      await expect(
        m721.connect(acc02).claim(orderId),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.SoldToken,
      );
    });
    it("Should revert if orderType is not an english auction", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      const ExtToken = await ethers.getContractFactory(
        "ERC721Basic",
      );
      const extToken = await ExtToken.connect(acc02).deploy(
        "721Basic",
        "BASIC",
        "ipfs://cid/",
        price,
        100,
        acc02.address,
        500,
        acc02.address,
        ethers.constants.AddressZero,
      );

      await extToken.connect(acc02).setPublicMintState(true);
      await extToken
        .connect(acc02)
        .mint(2, { value: price.mul(ethers.constants.Two) });
      await extToken.connect(acc02).approve(m721.address, 1);
      const tx = await extToken
        .connect(acc02)
        .approve(m721.address, 2);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const fpTx = await m721
        .connect(acc02)
        .fixedPrice(
          extToken.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const fpRc: ContractReceipt = await fpTx.wait();
      const fpBn = fpRc.blockNumber;
      const fpOrderId = getOrderId721(
        fpBn,
        extToken.address,
        1,
        acc02.address,
      );

      await expect(
        m721.connect(acc02).claim(fpOrderId),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.EAOnly,
      );
    });
    it("Should revert if auction hasn't ended", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc: ContractReceipt = await eaTx.wait();
      const eaBn = eaRc.blockNumber;
      const orderId = getOrderId721(
        eaBn,
        min.address,
        1,
        acc02.address,
      );
      await m721.connect(acc01).bid(orderId, {
        value: price.mul(ethers.constants.Two),
      });

      await expect(
        m721.connect(acc02).claim(orderId),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.NeedMoreTime,
      );
    });
    it("Should claim inhouse minted tokens, update storage and emit events", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx_ = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx_.blockNumber || 0)
      ).timestamp;

      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc: ContractReceipt = await eaTx.wait();
      const eaBn = eaRc.blockNumber;
      const orderId = getOrderId721(
        eaBn,
        min.address,
        1,
        acc02.address,
      );

      const bidVal = price.mul(ethers.constants.Two);

      await m721
        .connect(acc01)
        .bid(orderId, { value: bidVal });

      await setNextBlockTimestamp(blockTimestamp + 600);
      await mineUpTo(600);

      const tx = await m721
        .connect(acc02)
        .claim(
          await m721.callStatic.orderIdByToken(minAddr, 1, 0),
        );
      const eaOrderInfo: OrderDetails721 =
        await m721.callStatic.orderInfo(orderId);

      const zero = ethers.constants.Zero;
      const one = ethers.constants.One;
      const cBal1 = await min.callStatic.balanceOf(
        acc01.address,
      );
      const eaOwnerOf = await min.callStatic.ownerOf(1);
      const eaOD: OrderDetails721 = {
        orderType: 2,
        seller: acc02.address,
        token: minAddr,
        tokenId: one,
        startPrice: price,
        endPrice: zero,
        startTime: ethers.BigNumber.from(blockTimestamp + 1),
        endTime: ethers.BigNumber.from(
          blockTimestamp + 301 + 300,
        ), // added because of bid
        lastBidPrice: bidVal,
        lastBidder: acc01.address,
        isSold: true,
      };

      expect(cBal1).to.eq(1);
      expect(eaOwnerOf).to.eq(acc01.address);
      expect(
        await m721.callStatic.orderIdBySeller(
          acc02.address,
          0,
        ),
      ).to.eq(orderId);
      expect(
        await m721.callStatic.orderIdByToken(
          min.address,
          1,
          0,
        ),
      ).to.eq(orderId);

      expect(eaOrderInfo.orderType).to.eq(eaOD.orderType);
      expect(eaOrderInfo.seller).to.eq(eaOD.seller);
      expect(eaOrderInfo.token).to.eq(eaOD.token);
      expect(eaOrderInfo.tokenId).to.eq(eaOD.tokenId);
      expect(eaOrderInfo.startPrice).to.eq(eaOD.startPrice);
      expect(eaOrderInfo.endPrice).to.eq(eaOD.endPrice);
      expect(eaOrderInfo.startTime).to.eq(eaOD.startTime);
      expect(eaOrderInfo.endTime).to.eq(eaOD.endTime);
      expect(eaOrderInfo.lastBidPrice).to.eq(
        eaOD.lastBidPrice,
      );
      expect(eaOrderInfo.lastBidder).to.eq(eaOD.lastBidder);
      expect(eaOrderInfo.isSold).to.eq(eaOD.isSold);

      await expect(tx)
        .to.be.ok.and.to.emit(m721, "Claim")
        .withArgs(
          minAddr,
          1,
          orderId,
          acc02.address,
          acc01.address,
          bidVal,
        );
    });
    it("Should verify inhouse minted tokens balance changes", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
      const splitter = await ethers.getContractAt(
        "SplitterImpl",
        splAddr,
      );
      await r721
        .connect(acc02)
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc: ContractReceipt = await eaTx.wait();
      const eaBn = eaRc.blockNumber;
      const orderId = getOrderId721(
        eaBn,
        min.address,
        1,
        acc02.address,
      );

      const bidVal = price.mul(ethers.constants.Two);

      await m721
        .connect(acc01)
        .bid(orderId, { value: bidVal });

      await setNextBlockTimestamp(blockTimestamp + 600);
      await mineUpTo(600);

      const eaRoyalty = await min.royaltyInfo(1, bidVal);

      expect(
        await ethers.provider.getBalance(m721.address),
      ).to.eq(bidVal);
      await expect(() =>
        m721.connect(acc01).claim(orderId),
      ).to.changeEtherBalances(
        [acc02],
        [
          bidVal
            .sub(bidVal.mul(1000).div(10_000))
            .sub(eaRoyalty[1])
            .add(eaRoyalty[1].mul(8000).div(10_000)),
        ],
      );
      expect(
        await ethers.provider.getBalance(splitter.address),
      ).to.eq(ethers.constants.Zero);
    });
    it("Should claim third party minted tokens with ERC2981 support", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      const ExtToken = await ethers.getContractFactory(
        "ERC721Basic",
      );
      const extToken = await ExtToken.connect(acc02).deploy(
        "721Basic",
        "BASIC",
        "ipfs://cid/",
        price,
        100,
        acc02.address,
        500,
        acc02.address,
        ethers.constants.AddressZero,
      );

      await extToken.connect(acc02).setPublicMintState(true);
      await extToken.connect(acc02).mint(1, { value: price });
      const tx = await extToken
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          extToken.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc: ContractReceipt = await eaTx.wait();
      const eaBn = eaRc.blockNumber;
      const orderId = getOrderId721(
        eaBn,
        extToken.address,
        1,
        acc02.address,
      );

      const bidVal = price.mul(ethers.constants.Two);

      await m721
        .connect(acc01)
        .bid(orderId, { value: bidVal });

      await setNextBlockTimestamp(blockTimestamp + 600);
      await mineUpTo(600);

      // const eaRoyalty = await extToken.royaltyInfo(1, bidVal);

      const cPrice = bidVal; /* .sub(eaRoyalty[1]) */
      const fee = cPrice
        .mul(ethers.BigNumber.from(250))
        .div(ethers.BigNumber.from(10000));

      expect(
        await ethers.provider.getBalance(m721.address),
      ).to.eq(bidVal);
      await expect(() =>
        m721.connect(acc01).claim(orderId),
      ).to.changeEtherBalances(
        [acc02, owner],
        [bidVal.sub(fee), fee],
      );
    });
    it("Should claim third party minted tokens without ERC2981 support", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      const ExtToken = await ethers.getContractFactory(
        "MockERC721",
      );
      const extToken = await ExtToken.connect(acc02).deploy(
        "721Mock",
        "MOCK",
      );

      await extToken.mint(acc02.address, 1);
      const tx = await extToken
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          extToken.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc: ContractReceipt = await eaTx.wait();
      const eaBn = eaRc.blockNumber;
      const orderId = getOrderId721(
        eaBn,
        extToken.address,
        1,
        acc02.address,
      );

      const bidVal = price.mul(ethers.constants.Two);

      await m721
        .connect(acc01)
        .bid(orderId, { value: bidVal });

      await setNextBlockTimestamp(blockTimestamp + 600);
      await mineUpTo(600);

      const eaPrice = bidVal;
      const fee = eaPrice
        .mul(ethers.BigNumber.from(250))
        .div(ethers.BigNumber.from(10000));

      expect(
        await ethers.provider.getBalance(m721.address),
      ).to.eq(bidVal);
      await expect(() =>
        m721.connect(acc01).claim(orderId),
      ).to.changeEtherBalances(
        [acc02, owner],
        [bidVal.sub(fee), fee],
      );
    });
  });
  describe("Order Cancelling", async () => {
    it("Should revert due to already sold fixed price order", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const fpTx = await m721
        .connect(acc02)
        .fixedPrice(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const fpRc: ContractReceipt = await fpTx.wait();
      const fpBn = fpRc.blockNumber;
      const orderId = getOrderId721(
        fpBn,
        min.address,
        1,
        acc02.address,
      );

      await m721
        .connect(acc01)
        .buy(orderId, { value: price });

      await expect(
        m721.connect(acc02).cancelOrder(orderId),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.SoldToken,
      );
    });
    it("Should revert due to already sold dutch auction order", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const daTx = await m721
        .connect(acc02)
        .dutchAuction(
          min.address,
          1,
          price,
          0,
          blockTimestamp + 301,
        );
      const daRc: ContractReceipt = await daTx.wait();
      const daBn = daRc.blockNumber;
      const orderId = getOrderId721(
        daBn,
        min.address,
        1,
        acc02.address,
      );

      // await mineUpTo(200);
      const orderInfo: OrderDetails721 =
        await m721.callStatic.orderInfo(orderId);
      await setNextBlockTimestamp(blockTimestamp + 200);
      await mineUpTo(daBn + 1);

      const blockTimestamp2 = (
        await m721.provider.getBlock(daBn + 1)
      ).timestamp;
      // simulate DA pricing math with ts
      const delta = orderInfo.endTime.sub(
        orderInfo.startTime,
      );
      const tick = price.div(delta);
      const dec = ethers.BigNumber.from(
        blockTimestamp2 - orderInfo.startTime.toNumber() + 1,
      ).mul(tick);
      const daPrice = price.sub(dec);

      await m721
        .connect(acc01)
        .buy(orderId, { value: daPrice });
      await expect(
        m721.connect(acc02).cancelOrder(orderId),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.SoldToken,
      );
    });
    it("Should revert due to already sold english auction order", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc: ContractReceipt = await eaTx.wait();
      const eaBn = eaRc.blockNumber;
      const orderId = getOrderId721(
        eaBn,
        min.address,
        1,
        acc02.address,
      );
      await m721.connect(acc01).bid(orderId, {
        value: price.mul(ethers.constants.Two),
      });
      await setNextBlockTimestamp(blockTimestamp + 600);
      await mineUpTo(600);
      await expect(
        m721.connect(acc02).cancelOrder(orderId),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.BidExists,
      );

      await m721
        .connect(acc02)
        .claim(
          await m721.callStatic.orderIdByToken(minAddr, 1, 0),
        );

      await expect(
        m721.connect(acc02).cancelOrder(orderId),
      ).to.be.revertedWithCustomError(
        m721,
        MarketplaceErrors.SoldToken,
      );
    });

    // `BidExists` error only valid for english auction listings
    it("Should cancel fixed price order", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx_ = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx_.blockNumber || 0)
      ).timestamp;

      const fpTx = await m721
        .connect(acc02)
        .fixedPrice(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const fpRc: ContractReceipt = await fpTx.wait();
      const fpBn = fpRc.blockNumber;
      const orderId = getOrderId721(
        fpBn,
        min.address,
        1,
        acc02.address,
      );

      const oldOwner = await min.callStatic.ownerOf(1);
      const tx = await m721
        .connect(acc02)
        .cancelOrder(orderId);
      const storage: OrderDetails721 =
        await m721.callStatic.orderInfo(orderId);
      const endTime = storage.endTime;
      const verArt = await artifacts.readArtifact(
        "FactoryVerifier",
      );
      const ver = new ethers.Contract(
        f721.address,
        verArt.abi,
        ethers.provider,
      );

      await expect(
        m721.connect(acc01).cancelOrder(orderId),
      ).to.be.revertedWithCustomError(
        ver,
        MarketplaceErrors.AccessDenied,
      );

      await expect(tx)
        .to.be.ok.and.to.emit(m721, "CancelOrder")
        .withArgs(minAddr, 1, orderId, acc02.address);

      expect(endTime).to.be.eq(ethers.constants.Zero);
      expect(oldOwner).to.eq(m721.address);
      expect(await min.callStatic.ownerOf(1)).to.eq(
        acc02.address,
      );
      await expect(
        m721.connect(acc02).cancelOrder(orderId),
      ).to.be.revertedWith(MarketplaceErrors.WrongFrom);
    });
    it("Should cancel dutch auction order", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx_ = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx_.blockNumber || 0)
      ).timestamp;

      const daTx = await m721
        .connect(acc02)
        .dutchAuction(
          min.address,
          1,
          price,
          0,
          blockTimestamp + 301,
        );
      const daRc: ContractReceipt = await daTx.wait();
      const daBn = daRc.blockNumber;
      const orderId = getOrderId721(
        daBn,
        min.address,
        1,
        acc02.address,
      );

      const oldOwner = await min.callStatic.ownerOf(1);
      const tx = await m721
        .connect(acc02)
        .cancelOrder(orderId);
      const storage: OrderDetails721 =
        await m721.callStatic.orderInfo(orderId);
      const endTime = storage.endTime;
      const verArt = await artifacts.readArtifact(
        "FactoryVerifier",
      );
      const ver = new ethers.Contract(
        f721.address,
        verArt.abi,
        ethers.provider,
      );

      await expect(
        m721.connect(acc01).cancelOrder(orderId),
      ).to.be.revertedWithCustomError(
        ver,
        MarketplaceErrors.AccessDenied,
      );

      await expect(tx)
        .to.be.ok.and.to.emit(m721, "CancelOrder")
        .withArgs(minAddr, 1, orderId, acc02.address);

      expect(endTime).to.be.eq(ethers.constants.Zero);
      expect(oldOwner).to.eq(m721.address);
      expect(await min.callStatic.ownerOf(1)).to.eq(
        acc02.address,
      );
      await expect(
        m721.connect(acc02).cancelOrder(orderId),
      ).to.be.revertedWith(MarketplaceErrors.WrongFrom);
    });
    it("Should cancel english auction order", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
        .minimalSafeMint(min.address, acc02.address, {
          value: ethers.utils.parseEther("0.25"),
        });
      const tx_ = await min
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx_.blockNumber || 0)
      ).timestamp;

      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          min.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const eaRc: ContractReceipt = await eaTx.wait();
      const eaBn = eaRc.blockNumber;
      const orderId = getOrderId721(
        eaBn,
        min.address,
        1,
        acc02.address,
      );

      const oldOwner = await min.callStatic.ownerOf(1);
      const tx = await m721
        .connect(acc02)
        .cancelOrder(orderId);
      const storage: OrderDetails721 =
        await m721.callStatic.orderInfo(orderId);
      const endTime = storage.endTime;
      const verArt = await artifacts.readArtifact(
        "FactoryVerifier",
      );
      const ver = new ethers.Contract(
        f721.address,
        verArt.abi,
        ethers.provider,
      );

      await expect(
        m721.connect(acc01).cancelOrder(orderId),
      ).to.be.revertedWithCustomError(
        ver,
        MarketplaceErrors.AccessDenied,
      );

      await expect(tx)
        .to.be.ok.and.to.emit(m721, "CancelOrder")
        .withArgs(minAddr, 1, orderId, acc02.address);

      expect(endTime).to.be.eq(ethers.constants.Zero);
      expect(oldOwner).to.eq(m721.address);
      expect(await min.callStatic.ownerOf(1)).to.eq(
        acc02.address,
      );
      await expect(
        m721.connect(acc02).cancelOrder(orderId),
      ).to.be.revertedWith(MarketplaceErrors.WrongFrom);
    });
  });
  describe("Public Helpers", async () => {
    it("Should fetch the length of orderIds for a token", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
      await f721
        .connect(acc02)
        .createCollection(
          2,
          "salt",
          "721Whitelist",
          "WHITE",
          price,
          1000,
          "ipfs://cid/",
          splAddr,
          750,
        );

      const wlAddr = await f721.callStatic.getDeployedAddr(
        "salt",
      );

      const whitelist = await ethers.getContractAt(
        "ERC721Whitelist",
        wlAddr,
      );

      const root = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("root"),
      );

      await r721
        .connect(acc02)
        .freeSettings(wlAddr, 1, 10, root);

      await r721
        .connect(acc02)
        .gift(
          wlAddr,
          [mad.address, acc01.address, acc02.address],
          { value: ethers.utils.parseEther("0.25") },
        );
      await whitelist.connect(mad).approve(m721.address, 1);
      await whitelist.connect(acc01).approve(m721.address, 2);
      const tx = await whitelist
        .connect(acc02)
        .approve(m721.address, 3);
      const blockTimestamp = (
        await m721.provider.getBlock(tx.blockNumber || 0)
      ).timestamp;

      const fpTx = await m721
        .connect(mad)
        .fixedPrice(
          whitelist.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const daTx = await m721
        .connect(acc01)
        .dutchAuction(
          whitelist.address,
          2,
          price,
          0,
          blockTimestamp + 301,
        );
      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          whitelist.address,
          3,
          price,
          blockTimestamp + 301,
        );

      const tx1 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        1,
      );
      const tx2 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        2,
      );
      const tx3 = await m721.callStatic.tokenOrderLength(
        whitelist.address,
        3,
      );

      expect(fpTx).to.be.ok;
      expect(eaTx).to.be.ok;
      expect(daTx).to.be.ok;

      expect(tx1).to.be.ok.and.to.eq(1);
      expect(tx2).to.be.ok.and.to.eq(1);
      expect(tx3).to.be.ok.and.to.eq(1);
    });
    it("Should fetch the length of orderIds for a seller", async () => {
      await m721.updateSettings(300, 10, 20, 31536000);
      // await f721.addAmbassador(amb.address);
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
      await f721
        .connect(acc02)
        .createCollection(
          2,
          "salt",
          "721Whitelist",
          "WHITE",
          price,
          1000,
          "ipfs://cid/",
          splAddr,
          750,
        );

      const wlAddr = await f721.callStatic.getDeployedAddr(
        "salt",
      );

      const whitelist = await ethers.getContractAt(
        "ERC721Whitelist",
        wlAddr,
      );

      const root = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("root"),
      );

      await r721
        .connect(acc02)
        .freeSettings(wlAddr, 1, 10, root);

      await r721
        .connect(acc02)
        .creatorMint(wlAddr, 3, {
          value: ethers.utils.parseEther("0.25"),
        });
      await whitelist.connect(acc02).approve(m721.address, 1);
      await whitelist.connect(acc02).approve(m721.address, 2);
      const tx_ = await whitelist
        .connect(acc02)
        .approve(m721.address, 3);
      const blockTimestamp = (
        await m721.provider.getBlock(tx_.blockNumber || 0)
      ).timestamp;

      const fpTx = await m721
        .connect(acc02)
        .fixedPrice(
          whitelist.address,
          1,
          price,
          blockTimestamp + 301,
        );
      const daTx = await m721
        .connect(acc02)
        .dutchAuction(
          whitelist.address,
          2,
          price,
          0,
          blockTimestamp + 301,
        );
      const eaTx = await m721
        .connect(acc02)
        .englishAuction(
          whitelist.address,
          3,
          price,
          blockTimestamp + 301,
        );

      const tx = await m721.callStatic.sellerOrderLength(
        acc02.address,
      );

      expect(fpTx).to.be.ok;
      expect(eaTx).to.be.ok;
      expect(daTx).to.be.ok;

      expect(tx).to.be.ok.and.to.eq(3);
    });
  });
});
