import "@nomicfoundation/hardhat-chai-matchers";
import {
  loadFixture,
  mine,
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
import { ethers, network } from "hardhat";

import {
  MADFactory721,
  MADMarketplace721,
  MADRouter721,
} from "../../src/types";
import { FactoryErrors } from "./../utils/errors";
import {
  Collection,
  SplitterConfig,
  dead,
  madFixture721A,
} from "./../utils/madFixtures";

describe.only("MADFactory721", () => {
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
      const indexed = rc.logs[0].data;
      const data = rc.logs[1].data;

      const addr = await f721.getDeployedAddr("MADSplitter1", acc02.address);
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
      expect(shares).to.eq("100"); // no longer have owner as part of the royalties
      expect(payees).to.eq([acc02.address].toString());
      expect(splitter).to.eq(addr);
      expect(ethers.BigNumber.from(creatorShares)).to.eq(100);
      expect(storage.splitter).to.eq(addr);
      expect(storage.splitterSalt).to.eq(
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("MADSplitter1", acc02.address),
        ),
      );
      expect(storage.ambassador).to.eq(dead);
      expect(storage.ambShare).to.eq(ethers.constants.Zero);
      expect(storage.valid).to.eq(true);
    });
    it("Should deploy splitter with ambassador, update storage and emit events", async () => {
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

      const indexed = rc.logs[1].data;
      const data = rc.logs[2].data;

      const addr = await f721.getDeployedAddr("MADSplitter1", acc02.address);
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
      expect(shares).to.eq("20,80");
      expect(payees).to.eq(
        [amb.address, acc02.address].toString(),
      );
      expect(splitter).to.eq(addr);
      expect(ethers.BigNumber.from(ambShares)).to.eq(20);
      expect(ethers.BigNumber.from(creatorShares)).to.eq(80);
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
    it("Should deploy splitter with ambassador and project, update storage and emit events", async () => {
      const tx: ContractTransaction = await f721
        .connect(acc02)
        .splitterCheck(
          "MADSplitter1",
          amb.address,
          acc01.address,
          20,
          10,
        );
      const rc: ContractReceipt = await tx.wait();

      const indexed = rc.logs[2].data;
      const data = rc.logs[3].data;

      const addr = await f721.getDeployedAddr("MADSplitter1", acc02.address);
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
      const ambShares = await instance.callStatic._shares(
        amb.address,
      );
      const creatorShares = await instance.callStatic._shares(
        acc02.address,
      );
      const projShares = await instance.callStatic._shares(
        acc01.address,
      );

      const storage: SplitterConfig =
        await f721.callStatic.splitterInfo(
          acc02.address,
          addr,
        );

      expect(tx).to.be.ok;
      await expect(tx).to.emit(f721, "SplitterCreated");
      expect(creator.toString()).to.eq(acc02.address);
      expect(shares).to.eq("20,10,70");
      expect(payees).to.eq(
        [
          amb.address,
          acc01.address,
          acc02.address,
        ].toString(),
      );
      expect(splitter).to.eq(addr);
      expect(ethers.BigNumber.from(ambShares)).to.eq(20);
      expect(ethers.BigNumber.from(projShares)).to.eq(10);
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
    it("Should deploy ERC721Basic, update storage and emit events", async () => {
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
        acc02.address
      );
      const basicAddr = await f721.callStatic.getDeployedAddr(
        "BasicSalt",
        acc02.address
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
          []
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
          []
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
          []
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
        .to.emit(f721, "ERC721Created")
        .withArgs(
          splAddr,
          basicAddr,
          ethers.constants.One,
          "721Basic",
          "BASIC",
          750,
          1000,
          price,
        );
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
      await expect(
        f721.setMarket(ethers.constants.AddressZero),
      ).to.be.revertedWithCustomError(
        f721, FactoryErrors.InvalidAddress,
      );
      expect(tx).to.be.ok;
      expect(owner.address).to.eq(
        await f721.callStatic.market(),
      );
      await expect(tx)
        .to.emit(f721, "MarketplaceUpdated")
        .withArgs(owner.address);
    });
    it("Should update ERC721Lazy signer", async () => {
      const tx = await f721.setSigner(acc01.address);
      expect(tx).to.be.ok;
      await expect(tx)
        .to.emit(f721, "SignerUpdated")
        .withArgs(acc01.address);
      await expect(
        f721.connect(acc01).setSigner(acc02.address),
      ).to.be.revertedWith(FactoryErrors.Unauthorized);
      await expect(
        f721.setSigner(ethers.constants.AddressZero),
      ).to.be.revertedWithCustomError(
        f721, FactoryErrors.InvalidAddress,
      );
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
        f721.connect(acc01).setRouter(acc02.address),
      ).to.be.revertedWith(FactoryErrors.Unauthorized);
      await expect(
        f721.setRouter(ethers.constants.AddressZero),
      ).to.be.revertedWithCustomError(
        f721, FactoryErrors.InvalidAddress,
      );
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
          75,
          []
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
        acc02.address
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
          []
        );
      await f721
        .connect(acc02)
        .createCollection(
          1,
          "BasicSalt2",
          "721Basic2",
          "BASIC2",
          price,
          1000,
          "ipfs://cid/",
          splAddr,
          750,
          []
        );

      expect(await f721.getIDsLength(acc02.address)).to.eq(2);
    });
    it("Should get collection ID from address", async () => {
      const addr = await f721.getDeployedAddr("BasicSalt", acc02.address);
      const colID = addr
        .toLowerCase()
        .concat("000000000000000000000000");
      const tx = await f721.getColID(addr);

      expect(tx).to.be.ok;
      expect(tx).to.eq(colID);
    });
    it("Should retrieve collection type", async () => {
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
        acc02.address
      );
      const basicAddr = await f721.callStatic.getDeployedAddr(
        "BasicSalt",
        acc02.address
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
          "cid/id.json",
          splAddr,
          750,
          []
        );
      const colID = await f721.callStatic.getColID(basicAddr);
      const basic = await ethers.getContractAt(
        "ERC721Basic",
        basicAddr,
      );
      const setPublic = await r721
        .connect(acc02)
        .setMintState(basicAddr, true);

      expect(setPublic).to.be.ok;
      expect(await basic.callStatic.publicMintState()).to.eq(
        true,
      );
      await expect(
        f721.typeChecker(colID),
      ).to.be.revertedWithCustomError(
        f721,
        FactoryErrors.AccessDenied,
      );
      await expect(
        r721.setMintState(basicAddr, true),
      ).to.be.revertedWithCustomError(
        f721,
        FactoryErrors.AccessDenied,
      );
    });
    it("Should enable marketplace no-fee listing", async () => {
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
        acc02.address
        );
      const basicAddr = await f721.callStatic.getDeployedAddr(
        "BasicSalt",
        acc02.address
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
          "cid/id.json",
          splAddr,
          750,
          []
        );
      const basic = await ethers.getContractAt(
        "ERC721Basic",
        basicAddr,
      );
      await r721.connect(acc02).setMintState(basicAddr, true);
      await basic.connect(acc02).mint(1, {
        value: price.add(ethers.utils.parseEther("0.25")),
      });
      const tx_ = await basic
        .connect(acc02)
        .approve(m721.address, 1);
      const blockTimestamp = (
        await m721.provider.getBlock(tx_.blockNumber || 0)
      ).timestamp;
      const daTx = await m721
        .connect(acc02)
        .fixedPrice(
          basicAddr,
          1,
          price,
          blockTimestamp + 400,
        );
      const daRc: ContractReceipt = await daTx.wait();
      const daBn = daRc.blockNumber;

      await setNextBlockTimestamp(blockTimestamp + 296);
      await mine(daBn + 1);
      const orderID = await m721.callStatic.orderIdBySeller(
        acc02.address,
        0,
      );

      const tx = await m721.buy(orderID, { value: price });

      await f721.setMarket(owner.address);
      const false1 = await f721.creatorAuth(
        basicAddr,
        mad.address,
      );
      const true1 = await f721.creatorAuth(
        basicAddr,
        acc02.address,
      );

      expect(tx).to.be.ok;
      expect(false1).to.be.false;
      expect(true1).to.be.true;
      await expect(
        f721
          .connect(amb)
          .creatorAuth(basicAddr, acc02.address),
      ).to.be.revertedWithCustomError(
        f721,
        FactoryErrors.AccessDenied,
      );
      await expect(
        f721
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
            []
          ),
      ).to.be.revertedWithCustomError(
        f721,
        FactoryErrors.AccessDenied,
      );
    });
    it("Should verify a collection's creator", async () => {
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
        acc02.address
        );
      const basicAddr = await f721.callStatic.getDeployedAddr(
        "BasicSalt",
        acc02.address
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
          "cid/id.json",
          splAddr,
          750,
          []
        );
      const colID = await f721.callStatic.getColID(basicAddr);

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
