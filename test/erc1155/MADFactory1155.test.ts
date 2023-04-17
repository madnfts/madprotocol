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
  MADFactory1155,
  MADMarketplace1155,
  MADRouter1155,
} from "../../src/types";
import { FactoryErrors } from "./../utils/errors";
import {
  Collection,
  SplitterConfig,
  dead,
  madFixture1155A,
} from "./../utils/madFixtures";

describe("MADFactory1155", () => {
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

  let f1155: MADFactory1155;
  let m1155: MADMarketplace1155;
  let r1155: MADRouter1155;

  const price: BigNumber = ethers.utils.parseEther("1");

  before("Set signers and reset network", async () => {
    [owner, amb, mad, acc01, acc02] =
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ethers as any).getSigners();

    await network.provider.send("hardhat_reset");
  });
  beforeEach("Load deployment fixtures", async () => {
    ({ f1155, m1155, r1155 } = await loadFixture(
      madFixture1155A,
    ));
  });

  describe("Init", async () => {
    it("Factory should initialize", async () => {
      await f1155.deployed();
      expect(f1155).to.be.ok;

      // check each global var
      expect(await f1155.callStatic.name()).to.eq("factory");
      expect(await f1155.market()).to.eq(m1155.address);
      expect(await f1155.router()).to.eq(r1155.address);
    });
  });

  describe("Splitter check", async () => {
    it("Should revert if repeated salt is provided", async () => {
      await f1155
        .connect(acc02)
        .splitterCheck("MADSplitter1", dead, dead, 0, 0);
      const tx = f1155
        .connect(acc02)
        .splitterCheck("MADSplitter1", dead, dead, 0, 0);

      await expect(tx).to.be.revertedWith(
        FactoryErrors.DeploymentFailed,
      );
    });
    it("Should deploy splitter without ambassador, update storage and emit events", async () => {
      const tx: ContractTransaction = await f1155
        .connect(acc02)
        .splitterCheck("MADSplitter1", dead, dead, 0, 0);
      const rc: ContractReceipt = await tx.wait();

      const indexed = rc.logs[0].data;
      const data = rc.logs[1].data;

      const addr = await f1155.getDeployedAddr(
        "MADSplitter1",
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
        addr,
      );
      const creatorShares = await instance.callStatic._shares(
        acc02.address,
      );

      const storage: SplitterConfig =
        await f1155.callStatic.splitterInfo(
          acc02.address,
          addr,
        );

      expect(tx).to.be.ok;
      await expect(tx).to.emit(f1155, "SplitterCreated");
      expect(creator.toString()).to.eq(acc02.address);
      expect(shares).to.eq("100");
      expect(payees).to.eq([acc02.address].toString());
      expect(splitter).to.eq(addr);
      expect(ethers.BigNumber.from(creatorShares)).to.eq(100);
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
      const tx: ContractTransaction = await f1155
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

      const addr = await f1155.getDeployedAddr(
        "MADSplitter1",
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
        addr,
      );
      const ambShares = await instance.callStatic._shares(
        amb.address,
      );
      const creatorShares = await instance.callStatic._shares(
        acc02.address,
      );

      const storage: SplitterConfig =
        await f1155.callStatic.splitterInfo(
          acc02.address,
          addr,
        );

      expect(tx).to.be.ok;
      await expect(tx).to.emit(f1155, "SplitterCreated");
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
  });

  describe("Create collection", async () => {
    it("Should deploy ERC1155Basic, update storage and emit events", async () => {
      await f1155
        .connect(acc02)
        .splitterCheck(
          "MADSplitter1",
          amb.address,
          dead,
          20,
          0,
        );
      const splAddr = await f1155.callStatic.getDeployedAddr(
        "MADSplitter1",
      );
      const basicAddr =
        await f1155.callStatic.getDeployedAddr("BasicSalt");
      const tx = await f1155
        .connect(acc02)
        .createCollection(
          1,
          "BasicSalt",
          "1155Basic",
          "BASIC",
          price,
          1000,
          "ipfs://cid/",
          splAddr,
          750,
        );
      const colID = await f1155.callStatic.getColID(
        basicAddr,
      );
      const storage = await f1155.callStatic.userTokens(
        acc02.address,
        0,
      );
      const colInfo: Collection =
        await f1155.callStatic.colInfo(colID);

      const fail1 = f1155
        .connect(acc01)
        .createCollection(
          1,
          "BasicSalt",
          "1155Basic",
          "BASIC",
          price,
          1000,
          "ipfs://cid/",
          splAddr,
          750,
        );

      const fail2 = f1155
        .connect(acc02)
        .createCollection(
          7,
          "BasicSalt",
          "1155Basic",
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
          await f1155.provider.getBlockNumber(),
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
        .to.emit(f1155, "ERC1155BasicCreated")
        .withArgs(
          splAddr,
          basicAddr,
          "1155Basic",
          "BASIC",
          750,
          1000,
          price,
        );
      await expect(fail1).to.be.revertedWithCustomError(
        f1155,
        FactoryErrors.AccessDenied,
      );
      await expect(fail2).to.be.revertedWithCustomError(
        f1155,
        FactoryErrors.AccessDenied,
      );
    });
  });

  // `router` and `signer` setters tested in init.
  describe("Only owner functions", async () => {
    it("Should update contract's owner", async () => {
      const tx = await f1155.setOwner(mad.address);

      expect(tx).to.be.ok;
      await expect(tx)
        .to.emit(f1155, "OwnerUpdated")
        .withArgs(owner.address, mad.address);
      expect(await f1155.callStatic.owner()).to.eq(
        mad.address,
      );
      await expect(
        f1155.connect(acc02).setOwner(acc01.address),
      ).to.be.revertedWith(FactoryErrors.Unauthorized);
    });
    it("Should set new marketplace instance", async () => {
      const curAuth = await f1155.callStatic.market();
      const tx = await f1155
        .connect(owner)
        .setMarket(owner.address);

      expect(curAuth).to.eq(m1155.address);
      await expect(
        f1155.connect(acc01).setMarket(owner.address),
      ).to.be.revertedWith(FactoryErrors.Unauthorized);
      expect(tx).to.be.ok;
      expect(owner.address).to.eq(
        await f1155.callStatic.market(),
      );
      await expect(tx)
        .to.emit(f1155, "MarketplaceUpdated")
        .withArgs(owner.address);
    });
    it("Should update ERC1155Lazy signer", async () => {
      const tx = await f1155.setSigner(acc01.address);
      expect(tx).to.be.ok;
      await expect(tx)
        .to.emit(f1155, "SignerUpdated")
        .withArgs(acc01.address);
      await expect(
        f1155.connect(acc01).setSigner(acc02.address),
      ).to.be.revertedWith(FactoryErrors.Unauthorized);
    });
    it("Should update router's address", async () => {
      const tx = await f1155.setRouter(acc01.address);
      expect(tx).to.be.ok;
      await expect(tx)
        .to.emit(f1155, "RouterUpdated")
        .withArgs(acc01.address);
      expect(await f1155.callStatic.router()).to.eq(
        acc01.address,
      );
      await expect(
        f1155.connect(acc01).setSigner(acc02.address),
      ).to.be.revertedWith(FactoryErrors.Unauthorized);
    });
    it("Should initialize paused and unpaused states", async () => {
      const tx = await f1155.pause();

      expect(tx).to.be.ok;
      await expect(
        f1155.connect(acc01).pause(),
      ).to.be.revertedWith(FactoryErrors.Unauthorized);
      await expect(
        f1155.splitterCheck("", dead, dead, 0, 0),
      ).to.be.revertedWith(FactoryErrors.Paused);
      await expect(
        f1155.createCollection(
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
        f1155.connect(acc02).unpause(),
      ).to.be.revertedWith(FactoryErrors.Unauthorized);
      expect(await f1155.unpause()).to.be.ok;
    });
  });

  // `getDeployedAddr` already tested in `splitterCheck` and `createCollection` unit tests
  describe("Helpers", async () => {
    it("Should retrieve user's colID indexes", async () => {
      await f1155
        .connect(acc02)
        .splitterCheck(
          "MADSplitter1",
          amb.address,
          dead,
          20,
          0,
        );
      const splAddr = await f1155.callStatic.getDeployedAddr(
        "MADSplitter1",
      );

      await f1155
        .connect(acc02)
        .createCollection(
          1,
          "BasicSalt",
          "1155Basic",
          "BASIC",
          price,
          1000,
          "ipfs://cid/",
          splAddr,
          750,
        );

      expect(await f1155.getIDsLength(acc02.address)).to.eq(
        1,
      );
    });
    it("Should get collection ID from address", async () => {
      const addr = await f1155.getDeployedAddr("BasicSalt");
      const colID = addr
        .toLowerCase()
        .concat("000000000000000000000000");
      const tx = await f1155.getColID(addr);

      expect(tx).to.be.ok;
      expect(tx).to.eq(colID);
    });
    it("Should retrieve collection type", async () => {
      await f1155
        .connect(acc02)
        .splitterCheck(
          "MADSplitter1",
          amb.address,
          dead,
          20,
          0,
        );
      const splAddr = await f1155.callStatic.getDeployedAddr(
        "MADSplitter1",
      );
      const basicAddr =
        await f1155.callStatic.getDeployedAddr("BasicSalt");
      await f1155
        .connect(acc02)
        .createCollection(
          1,
          "BasicSalt",
          "1155Basic",
          "BASIC",
          price,
          10,
          "cid/id.json",
          splAddr,
          750,
        );
      const colID = await f1155.callStatic.getColID(
        basicAddr,
      );
      const basic = await ethers.getContractAt(
        "ERC1155Basic",
        basicAddr,
      );
      const setPublic = await r1155
        .connect(acc02)
        .setMintState(basicAddr, true);

      expect(setPublic).to.be.ok;
      expect(await basic.callStatic.publicMintState()).to.eq(
        true,
      );
      await expect(
        f1155.typeChecker(colID),
      ).to.be.revertedWithCustomError(
        f1155,
        FactoryErrors.AccessDenied,
      );
      await expect(
        r1155.setMintState(basicAddr, true),
      ).to.be.revertedWithCustomError(
        f1155,
        FactoryErrors.AccessDenied,
      );
    });
    it("Should enable marketplace no-fee listing", async () => {
      await f1155
        .connect(acc02)
        .splitterCheck(
          "MADSplitter1",
          amb.address,
          dead,
          20,
          0,
        );
      const splAddr = await f1155.callStatic.getDeployedAddr(
        "MADSplitter1",
      );
      const basicAddr =
        await f1155.callStatic.getDeployedAddr("BasicSalt");
      await expect(
        f1155
          .connect(acc02)
          .createCollection(
            0,
            "MinSalt",
            "1155Min",
            "MIN",
            price,
            1,
            "cid/id.json",
            splAddr,
            750,
          ),
      ).to.be.revertedWithCustomError(
        f1155,
        FactoryErrors.AccessDenied,
      );

      await f1155
        .connect(acc02)
        .createCollection(
          1,
          "BasicSalt",
          "1155Basic",
          "BASIC",
          price,
          10,
          "cid/id.json",
          splAddr,
          750,
        );

      const basic = await ethers.getContractAt(
        "ERC1155Basic",
        basicAddr,
      );
      await r1155
        .connect(acc02)
        .setMintState(basicAddr, true);
      await basic.connect(acc02).mint(1, 1, {
        value: price.add(ethers.utils.parseEther("0.25")),
      });
      const blockTimestamp = (
        await m1155.provider.getBlock(
          await m1155.provider.getBlockNumber(),
        )
      ).timestamp;

      await basic
        .connect(acc02)
        .setApprovalForAll(m1155.address, true);
      const daTx = await m1155
        .connect(acc02)
        .fixedPrice(
          basicAddr,
          1,
          1,
          price,
          blockTimestamp + 400,
        );

      const daRc: ContractReceipt = await daTx.wait();
      const daBn = daRc.blockNumber;

      await setNextBlockTimestamp(blockTimestamp + 296);
      await mine(daBn + 1);
      const orderID = await m1155.callStatic.orderIdBySeller(
        acc02.address,
        0,
      );

      const tx = await m1155.buy(orderID, { value: price });

      await f1155.setMarket(owner.address);
      const false1 = await f1155.creatorAuth(
        basicAddr,
        mad.address,
      );
      const true1 = await f1155.creatorAuth(
        basicAddr,
        acc02.address,
      );

      expect(tx).to.be.ok;
      expect(false1).to.be.false;
      expect(true1).to.be.true;
      await expect(
        f1155
          .connect(amb)
          .creatorAuth(basicAddr, acc02.address),
      ).to.be.revertedWithCustomError(
        f1155,
        FactoryErrors.AccessDenied,
      );
    });
    it("Should verify a collection's creator", async () => {
      await f1155
        .connect(acc02)
        .splitterCheck(
          "MADSplitter1",
          amb.address,
          dead,
          20,
          0,
        );
      const splAddr = await f1155.callStatic.getDeployedAddr(
        "MADSplitter1",
      );
      const basicAddr =
        await f1155.callStatic.getDeployedAddr("BasicSalt");
      await f1155
        .connect(acc02)
        .createCollection(
          1,
          "BasicSalt",
          "1155Basic",
          "BASIC",
          price,
          1,
          "cid/id.json",
          splAddr,
          750,
        );
      const colID = await f1155.callStatic.getColID(
        basicAddr,
      );

      await f1155.setRouter(acc02.address);
      const true1 = await f1155
        .connect(acc02)
        .creatorCheck(colID);
      expect(true1.check).to.be.true;
      expect(true1.creator).to.eq(acc02.address);
      await expect(
        f1155.connect(mad).creatorCheck(colID),
      ).to.be.revertedWithCustomError(
        f1155,
        FactoryErrors.AccessDenied,
      );
    });
  });
});
