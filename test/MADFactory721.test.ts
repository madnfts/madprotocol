import "@nomicfoundation/hardhat-chai-matchers";
import {
  loadFixture,
  mine,
} from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import {
  BigNumber,
  ContractReceipt,
  ContractTransaction,
  Wallet,
} from "ethers";
import { ethers, network } from "hardhat";

import {
  MADFactory721,
  MADMarketplace721,
  MADRouter721,
} from "../src/types";
import { FactoryErrors } from "./utils/errors";
import {
  Collection,
  SplitterConfig,
  dead,
  madFixture721A,
} from "./utils/madFixtures";

describe("MADFactory721", () => {
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

  const price: BigNumber = ethers.utils.parseEther("1");

  before("Set signers and reset network", async () => {
    [owner, amb, mad, acc01, acc02] =
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ethers as any).getSigners();

    await network.provider.send("hardhat_reset");
  });
  beforeEach("Load deployment fixtures", async () => {
    ({ f721, m721, r721 } = await loadFixture(
      madFixture721A,
    ));
    await f721.deployed();
    await m721.deployed();
    await f721.deployed();
  });

  describe("Init", async () => {
    it("Factory should initialize", async () => {
      expect(f721).to.be.ok;
      expect(f721).to.be.ok;
      expect(f721).to.be.ok;

      // check each global var
      expect(await f721.callStatic.name()).to.eq("factory");
      expect(await f721.callStatic.market()).to.eq(
        m721.address,
      );
      expect(await f721.callStatic.router()).to.eq(
        r721.address,
      );
    });
  });

  describe("Splitter check", async () => {
    // it("Should revert if wrong ambassador or ambShare is provided", async () => {
    //   await f721.addAmbassador(amb.address);
    //   const tx = f721
    //     .connect(acc02)
    //     .splitterCheck("MADSplitter1", acc01.address, 20);
    //   const tx2 = f721
    //     .connect(acc02)
    //     .splitterCheck("MADSplitter1", amb.address, 21);

    //   await expect(tx).to.be.revertedWithCustomError(
    //     f721,
    //     FactoryErrors.SplitterFail,
    //   );
    //   await expect(tx2).to.be.revertedWithCustomError(
    //     f721,
    //     FactoryErrors.SplitterFail,
    //   );
    // });
    it("Should revert if creator and owner are the same", async () => {
      const tx = f721
        .connect(owner)
        .splitterCheck("MADSplitter1", dead, dead, 0, 0);

      await expect(tx).to.be.revertedWith(
        FactoryErrors.InitFailed,
      );
    });
    it("Should revert if repeated salt is provided", async () => {
      await f721
        .connect(acc02)
        .splitterCheck("MADSplitter1", dead, dead, 0, 0);
      const tx = f721
        .connect(acc02)
        .splitterCheck("MADSplitter1", dead, dead, 0, 0);

      await expect(tx).to.be.revertedWith(
        FactoryErrors.DeploymentFailed,
      );
    });
    it("Should deploy splitter without ambassador, update storage and emit events", async () => {
      const tx: ContractTransaction = await f721
        .connect(acc02)
        .splitterCheck("MADSplitter1", dead, dead, 0, 0);
      const rc: ContractReceipt = await tx.wait();

      const indexed = rc.logs[1].data;
      const data = rc.logs[2].data;

      const addr = await f721.getDeployedAddr("MADSplitter1");
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
        addr,
      );
      const ownerShares = await instance.callStatic._shares(
        owner.address,
      );
      const creatorShares = await instance.callStatic._shares(
        acc02.address,
      );

      const storage: SplitterConfig =
        await f721.callStatic.splitterInfo(
          acc02.address,
          addr,
        );

      expect(tx).to.be.ok;
      await expect(tx).to.emit(f721, "SplitterCreated");
      expect(creator.toString()).to.eq(acc02.address);
      expect(shares).to.eq("10,90");
      expect(payees).to.eq(
        [owner.address, acc02.address].toString(),
      );
      expect(splitter).to.eq(addr);
      expect(ethers.BigNumber.from(ownerShares)).to.eq(10);
      expect(ethers.BigNumber.from(creatorShares)).to.eq(90);
      expect(storage.splitter).to.eq(addr);
      expect(storage.splitterSalt).to.eq(
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("MADSplitter1"),
        ),
      );
      expect(storage.ambassador).to.eq(dead);
      expect(storage.ambShare).to.eq(ethers.constants.Zero);
      expect(storage.valid).to.eq(true);
    });
    it("Should deploy splitter with ambassador, update storage and emit events", async () => {
      // await f721.addAmbassador(amb.address);
      const tx: ContractTransaction = await f721
        .connect(acc02)
        .splitterCheck(
          "MADSplitter1",
          amb.address,
          dead,
          20,
          0,
        );
      const rc: ContractReceipt = await tx.wait();

      const indexed = rc.logs[2].data;
      const data = rc.logs[3].data;

      const addr = await f721.getDeployedAddr("MADSplitter1");
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
        addr,
      );
      const ownerShares = await instance.callStatic._shares(
        owner.address,
      );
      const ambShares = await instance.callStatic._shares(
        amb.address,
      );
      const creatorShares = await instance.callStatic._shares(
        acc02.address,
      );

      const storage: SplitterConfig =
        await f721.callStatic.splitterInfo(
          acc02.address,
          addr,
        );

      expect(tx).to.be.ok;
      await expect(tx).to.emit(f721, "SplitterCreated");
      expect(creator.toString()).to.eq(acc02.address);
      expect(shares).to.eq("10,20,70");
      expect(payees).to.eq(
        [
          owner.address,
          amb.address,
          acc02.address,
        ].toString(),
      );
      expect(splitter).to.eq(addr);
      expect(ethers.BigNumber.from(ownerShares)).to.eq(10);
      expect(ethers.BigNumber.from(ambShares)).to.eq(20);
      expect(ethers.BigNumber.from(creatorShares)).to.eq(70);
      expect(storage.splitter).to.eq(addr);
      expect(storage.splitterSalt).to.eq(
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("MADSplitter1"),
        ),
      );
      expect(storage.ambassador).to.eq(amb.address);
      expect(storage.ambShare).to.eq(
        ethers.BigNumber.from(20),
      );
      expect(storage.valid).to.eq(true);
    });
  });
  describe("Create collection", async () => {
    it("Should deploy ERC721Minimal, update storage and emit events", async () => {
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
      const colID = await f721.callStatic.getColID(minAddr);
      const storage = await f721.callStatic.userTokens(
        acc02.address,
        0,
      );
      const colInfo: Collection =
        await f721.callStatic.colInfo(colID);

      const fail1 = f721
        .connect(acc01)
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

      const fail2 = f721
        .connect(acc02)
        .createCollection(
          4,
          "MinSalt",
          "721Minimal",
          "MIN",
          price,
          1,
          "cid/id.json",
          splAddr,
          750,
        );

      expect(tx).to.be.ok;
      expect(storage).to.eq(colID);
      expect(colInfo.blocknumber).to.eq(
        ethers.BigNumber.from(
          await f721.provider.getBlockNumber(),
        ),
      );
      expect(colInfo.colType).to.eq(0);
      expect(colInfo.creator).to.eq(acc02.address);
      expect(colInfo.splitter).to.eq(splAddr);
      expect(colInfo.colSalt).to.eq(
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("MinSalt"),
        ),
      );
      await expect(tx)
        .to.emit(f721, "ERC721MinimalCreated")
        .withArgs(splAddr, minAddr, '721Minimal', 'MIN');
      await expect(fail1).to.be.revertedWithCustomError(
        m721,
        FactoryErrors.AccessDenied,
      );
      await expect(fail2).to.be.revertedWithCustomError(
        m721,
        FactoryErrors.AccessDenied,
      );
    });

    it("Should deploy ERC721Basic, update storage and emit events", async () => {
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
      const basicAddr = await f721.callStatic.getDeployedAddr(
        "BasicSalt",
      );
      const tx = await f721
        .connect(acc02)
        .createCollection(
          1,
          "BasicSalt",
          "721Basic",
          "BASIC",
          price,
          1000,
          "ipfs://cid/",
          splAddr,
          750,
        );
      const colID = await f721.callStatic.getColID(basicAddr);
      const storage = await f721.callStatic.userTokens(
        acc02.address,
        0,
      );
      const colInfo: Collection =
        await f721.callStatic.colInfo(colID);

      const fail1 = f721
        .connect(acc01)
        .createCollection(
          1,
          "BasicSalt",
          "721Basic",
          "BASIC",
          price,
          1000,
          "ipfs://cid/",
          splAddr,
          750,
        );

      const fail2 = f721
        .connect(acc02)
        .createCollection(
          7,
          "BasicSalt",
          "721Basic",
          "BASIC",
          price,
          1000,
          "ipfs://cid/",
          splAddr,
          750,
        );

      expect(tx).to.be.ok;
      expect(storage).to.eq(colID);
      expect(colInfo.blocknumber).to.eq(
        ethers.BigNumber.from(
          await f721.provider.getBlockNumber(),
        ),
      );
      expect(colInfo.colType).to.eq(1);
      expect(colInfo.creator).to.eq(acc02.address);
      expect(colInfo.splitter).to.eq(splAddr);
      expect(colInfo.colSalt).to.eq(
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("BasicSalt"),
        ),
      );
      await expect(tx)
        .to.emit(f721, "ERC721BasicCreated")
        .withArgs(splAddr, basicAddr, '721Basic', 'BASIC');
      await expect(fail1).to.be.revertedWithCustomError(
        f721,
        FactoryErrors.AccessDenied,
      );
      await expect(fail2).to.be.revertedWithCustomError(
        f721,
        FactoryErrors.AccessDenied,
      );
    });
    it("Should deploy ERC721Whitelist, update storage and emit events", async () => {
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
      const wlAddr = await f721.callStatic.getDeployedAddr(
        "WhiteSalt",
      );
      const tx = await f721
        .connect(acc02)
        .createCollection(
          2,
          "WhiteSalt",
          "721Whitelist",
          "WL",
          price,
          1000,
          "ipfs://cid/",
          splAddr,
          750,
        );
      const colID = await f721.callStatic.getColID(wlAddr);
      const storage = await f721.callStatic.userTokens(
        acc02.address,
        0,
      );
      const colInfo: Collection =
        await f721.callStatic.colInfo(colID);

      const fail1 = f721
        .connect(acc01)
        .createCollection(
          2,
          "WhiteSalt",
          "721Whitelist",
          "WL",
          price,
          1000,
          "ipfs://cid/",
          splAddr,
          750,
        );

      const fail2 = f721
        .connect(acc02)
        .createCollection(
          30,
          "WhiteSalt",
          "721Whitelist",
          "WL",
          price,
          1000,
          "ipfs://cid/",
          splAddr,
          750,
        );

      expect(tx).to.be.ok;
      expect(storage).to.eq(colID);
      expect(colInfo.blocknumber).to.eq(
        ethers.BigNumber.from(
          await f721.provider.getBlockNumber(),
        ),
      );
      expect(colInfo.colType).to.eq(2);
      expect(colInfo.creator).to.eq(acc02.address);
      expect(colInfo.splitter).to.eq(splAddr);
      expect(colInfo.colSalt).to.eq(
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("WhiteSalt"),
        ),
      );
      await expect(tx)
        .to.emit(f721, "ERC721WhitelistCreated")
        .withArgs(splAddr, wlAddr, '721Whitelist', 'WL');
      await expect(fail1).to.be.revertedWithCustomError(
        f721,
        FactoryErrors.AccessDenied,
      );
      await expect(fail2).to.be.revertedWithCustomError(
        f721,
        FactoryErrors.AccessDenied,
      );
    });
    it("Should deploy ERC721Lazy, update storage and emit events", async () => {
      // await f721.addAmbassador(amb.address);
      await f721
        .connect(acc01)
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
      const tx = await f721
        .connect(acc01)
        .createCollection(
          3,
          "LazySalt",
          "721Lazy",
          "LAZY",
          ethers.constants.Zero,
          ethers.constants.Zero,
          "ipfs://cid/",
          splAddr,
          750,
        );
      const lazyAddr = await f721.callStatic.getDeployedAddr(
        "LazySalt",
      );

      const colID = await f721.callStatic.getColID(lazyAddr);
      const storage = await f721.callStatic.userTokens(
        acc01.address,
        0,
      );
      const colInfo: Collection =
        await f721.callStatic.colInfo(colID);

      const fail1 = f721
        .connect(acc02)
        .createCollection(
          3,
          "LazySalt",
          "721Lazy",
          "LAZY",
          0,
          0,
          "ipfs://cid/",
          splAddr,
          750,
        );

      const fail2 = f721
        .connect(acc02)
        .createCollection(
          4,
          "LazySalt",
          "721Lazy",
          "LAZY",
          0,
          0,
          "ipfs://cid/",
          splAddr,
          750,
        );

      expect(tx).to.be.ok;
      expect(storage).to.eq(colID);
      expect(colInfo.blocknumber).to.eq(
        ethers.BigNumber.from(
          await f721.provider.getBlockNumber(),
        ),
      );
      expect(colInfo.colType).to.eq(3);
      expect(colInfo.creator).to.eq(acc01.address);
      expect(colInfo.splitter).to.eq(splAddr);
      expect(colInfo.colSalt).to.eq(
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("LazySalt"),
        ),
      );
      await expect(tx)
        .to.emit(f721, "ERC721LazyCreated")
        .withArgs(splAddr, lazyAddr, '721Lazy', 'LAZY');
      await expect(fail1).to.be.revertedWithCustomError(
        f721,
        FactoryErrors.AccessDenied,
      );
      await expect(fail2).to.be.revertedWithCustomError(
        f721,
        FactoryErrors.AccessDenied,
      );
    });
  });
  // `router` and `signer` setters tested in init.
  describe("Only owner functions", async () => {
    it("Should update contract's owner", async () => {
      const tx = await f721.setOwner(mad.address);

      expect(tx).to.be.ok;
      await expect(tx)
        .to.emit(f721, "OwnerUpdated")
        .withArgs(owner.address, mad.address);
      expect(await f721.callStatic.owner()).to.eq(
        mad.address,
      );
      await expect(
        f721.connect(acc02).setOwner(acc01.address),
      ).to.be.revertedWith(FactoryErrors.Unauthorized);
    });
    it("Should set new marketplace instance", async () => {
      const curAuth = await f721.callStatic.market();
      const tx = await f721
        .connect(owner)
        .setMarket(owner.address);

      expect(curAuth).to.eq(m721.address);
      await expect(
        f721.connect(acc01).setMarket(owner.address),
      ).to.be.revertedWith(FactoryErrors.Unauthorized);
      expect(tx).to.be.ok;
      expect(owner.address).to.eq(
        await f721.callStatic.market(),
      );
      await expect(tx)
        .to.emit(f721, "MarketplaceUpdated")
        .withArgs(owner.address);
    });
    // it("Should add address to ambassador whitelist", async () => {
    //   const tx = await f721.addAmbassador(amb.address);
    //   const check = f721.callStatic.ambWhitelist(amb.address);

    //   expect(tx).to.be.ok;
    //   expect(await check).to.be.true;
    //   await expect(tx)
    //     .to.emit(f721, "AmbassadorAdded")
    //     .withArgs(amb.address);
    //   await expect(
    //     f721.connect(acc02).addAmbassador(acc01.address),
    //   ).to.be.revertedWith(FactoryErrors.Unauthorized);
    // });
    // it("Should delete address from ambassador whitelist", async () => {
    //   await f721.addAmbassador(amb.address);
    //   await f721.addAmbassador(mad.address);

    //   const tx = await f721.delAmbassador(amb.address);
    //   const check = f721.callStatic.ambWhitelist(amb.address);

    //   expect(tx).to.be.ok;
    //   expect(await check).to.be.false;
    //   await expect(tx)
    //     .to.emit(f721, "AmbassadorDeleted")
    //     .withArgs(amb.address);
    //   await expect(
    //     f721.connect(acc02).delAmbassador(mad.address),
    //   ).to.be.revertedWith(FactoryErrors.Unauthorized);
    // });
    it("Should update ERC721Lazy signer", async () => {
      const tx = await f721.setSigner(acc01.address);
      expect(tx).to.be.ok;
      await expect(tx)
        .to.emit(f721, "SignerUpdated")
        .withArgs(acc01.address);
      await expect(
        f721.connect(acc01).setSigner(acc02.address),
      ).to.be.revertedWith(FactoryErrors.Unauthorized);
    });
    it("Should update router's address", async () => {
      const tx = await f721.setRouter(acc01.address);
      expect(tx).to.be.ok;
      await expect(tx)
        .to.emit(f721, "RouterUpdated")
        .withArgs(acc01.address);
      expect(await f721.callStatic.router()).to.eq(
        acc01.address,
      );
      await expect(
        f721.connect(acc01).setSigner(acc02.address),
      ).to.be.revertedWith(FactoryErrors.Unauthorized);
    });
    it("Should initialize paused and unpaused states", async () => {
      const tx = await f721.pause();

      expect(tx).to.be.ok;
      await expect(
        f721.connect(acc01).pause(),
      ).to.be.revertedWith(FactoryErrors.Unauthorized);
      await expect(
        f721.splitterCheck("", dead, dead, 0, 0),
      ).to.be.revertedWith(FactoryErrors.Paused);
      await expect(
        f721.createCollection(
          1,
          "",
          "",
          "",
          0,
          1,
          "",
          dead,
          750,
        ),
      ).to.be.revertedWith(FactoryErrors.Paused);
      await expect(
        f721.connect(acc02).unpause(),
      ).to.be.revertedWith(FactoryErrors.Unauthorized);
      expect(await f721.unpause()).to.be.ok;
    });
  });

  // `getDeployedAddr` already tested in `splitterCheck` and `createCollection` unit tests
  describe("Helpers", async () => {
    it("Should retrieve user's colID indexes", async () => {
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
          "WhiteSalt",
          "721Whitelist",
          "WL",
          price,
          1000,
          "ipfs://cid/",
          splAddr,
          750,
        );
      await f721
        .connect(acc02)
        .createCollection(
          1,
          "BasicSalt",
          "721Basic",
          "BASIC",
          price,
          1000,
          "ipfs://cid/",
          splAddr,
          750,
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
          "ipfs://cid/",
          splAddr,
          750,
        );

      expect(await f721.getIDsLength(acc02.address)).to.eq(3);
    });
    it("Should get collection ID from address", async () => {
      const addr = await f721.getDeployedAddr("BasicSalt");
      const colID = addr
        .toLowerCase()
        .concat("000000000000000000000000");
      const tx = await f721.getColID(addr);

      expect(tx).to.be.ok;
      expect(tx).to.eq(colID);
    });
    it("Should retrieve collection type", async () => {
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
      const colID = await f721.callStatic.getColID(minAddr);
      const min = await ethers.getContractAt(
        "ERC721Minimal",
        minAddr,
      );
      const setPublic = await r721
        .connect(acc02)
        .setMintState(minAddr, true, 0);

      expect(setPublic).to.be.ok;
      expect(await min.callStatic.publicMintState()).to.eq(
        true,
      );
      await expect(
        f721.typeChecker(colID),
      ).to.be.revertedWithCustomError(
        f721,
        FactoryErrors.AccessDenied,
      );
      await expect(
        r721.setMintState(minAddr, true, 0),
      ).to.be.revertedWithCustomError(
        f721,
        FactoryErrors.AccessDenied,
      );
    });
    it("Should enable marketplace no-fee listing", async () => {
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
        .setMintState(minAddr, true, 0);
      await min.connect(acc02).publicMint({ value: price });
      const blocknum = await m721.provider.getBlockNumber();
      await min.connect(acc02).approve(m721.address, 1);
      await m721
        .connect(acc02)
        .fixedPrice(minAddr, 1, price, blocknum + 400);
      await mine(296);
      const orderID = await m721.callStatic.orderIdBySeller(
        acc02.address,
        0,
      );

      const tx = await m721.buy(orderID, { value: price });

      await f721.setMarket(owner.address);
      const false1 = await f721.creatorAuth(
        minAddr,
        mad.address,
      );
      const true1 = await f721.creatorAuth(
        minAddr,
        acc02.address,
      );

      expect(tx).to.be.ok;
      expect(false1).to.be.false;
      expect(true1).to.be.true;
      await expect(
        f721.connect(amb).creatorAuth(minAddr, acc02.address),
      ).to.be.revertedWithCustomError(
        f721,
        FactoryErrors.AccessDenied,
      );
    });
    it("Should verify a collection's creator", async () => {
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
      const colID = await f721.callStatic.getColID(minAddr);

      await f721.setRouter(acc02.address);
      const true1 = await f721
        .connect(acc02)
        .creatorCheck(colID);
      expect(true1.check).to.be.true;
      expect(true1.creator).to.eq(acc02.address);
      await expect(
        f721.connect(mad).creatorCheck(colID),
      ).to.be.revertedWithCustomError(
        f721,
        FactoryErrors.AccessDenied,
      );
    });
  });
});
