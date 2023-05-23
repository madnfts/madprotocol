import "@nomicfoundation/hardhat-chai-matchers";
import {
  loadFixture,
  mine,
} from "@nomicfoundation/hardhat-network-helpers";
import { setNextBlockTimestamp } from "@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time";
import { expect } from "chai";
import { BigNumber, ContractReceipt } from "ethers";
import { ethers, network } from "hardhat";

import {
  MADFactory721,
  MADMarketplace721,
  MADRouter721,
} from "../../src/types";
import {
  WalletWithAddress,
  _basicSalt,
  _splitterSalt,
  createCollection,
  createCollections,
  feePrice,
  price,
  splitterDeployment,
  testColID,
  validateCreation,
} from "../utils/factoryHelpers";
import { FactoryErrors } from "./../utils/errors";
import {
  dead,
  madFixtureFactory721,
} from "./../utils/madFixtures";

const createdEvent = "ERC721BasicCreated";
describe.only("MADFactory721", () => {
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

  before("Set signers and reset network", async () => {
    [owner, amb, mad, acc01, acc02] =
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ethers as any).getSigners();

    await network.provider.send("hardhat_reset");
  });

  beforeEach("Load deployment fixtures", async () => {
    ({ f721, m721, r721 } = await loadFixture(
      madFixtureFactory721,
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
        .splitterCheck(_splitterSalt, dead, dead, 0, 0);
      const tx = f721
        .connect(acc02)
        .splitterCheck(_splitterSalt, dead, dead, 0, 0);

      await expect(tx).to.be.revertedWith(
        FactoryErrors.DeploymentFailed,
      );
    });
    it("Should deploy splitter without ambassador, update storage and emit events", async () => {
      await splitterDeployment(
        f721,
        acc02,
        _splitterSalt,
        dead,
        dead,
        0,
        0,
        [acc02.address],
        0,
        1,
      );
    });

    it("Should deploy splitter with ambassador, update storage and emit events", async () => {
      await splitterDeployment(
        f721,
        acc02,
        _splitterSalt,
        amb.address,
        dead,
        20,
        0,
        [amb.address, acc02.address],
        1,
        2,
      );
    });

    it("Should deploy splitter with ambassador and project, update storage and emit events", async () => {
      await splitterDeployment(
        f721,
        acc02,
        _splitterSalt,
        amb.address,
        acc01.address,
        20,
        10,
        [amb.address, acc01.address, acc02.address],
        2,
        3,
      );
    });
  });
  describe("Create collection", async () => {
    it("Should deploy ERC721Basic, update storage and emit events", async () => {
      const splitterAddress = await splitterDeployment(
        f721,
        acc02,
        _splitterSalt,
        amb.address,
        dead,
        20,
        0,
        [amb.address, acc02.address],
        1,
        2,
      );
      const tx = createCollection(
        f721,
        acc02,
        _basicSalt,
        splitterAddress,
      );

      await validateCreation(
        f721,
        createdEvent,
        acc02,
        splitterAddress,
        _basicSalt,
        tx,
      );

      // const fail1 = await createCollection(f721,acc02, _basicSalt, splitterAddress);

      // const fail1 = await f721
      //   .connect(acc02)
      //   .createCollection(
      //     1,
      //     _basicSalt,
      //     "721Basic",
      //     "BASIC",
      //     price,
      //     1000,
      //     "ipfs://cid/",
      //     splitterAddress,
      //     750,
      //     [],
      //   );

      // const fail2 = await createCollection(f721,acc02, _basicSalt, splitterAddress);
      // const fail2 = await f721
      //   .connect(acc02)
      //   .createCollection(
      //     7,
      //     _basicSalt,
      //     "721Basic",
      //     "BASIC",
      //     price,
      //     1000,
      //     "ipfs://cid/",
      //     splitterAddress,
      //     750,
      //     [],
      //   );

      // await expect(fail1).to.be.reverted;
      // await expect(fail2).to.be.reverted;

      //       await expect(fail2).to.be.revertedWith(
      //   "DEPLOYMENT_FAILED",
      // );
      // await expect(fail1).to.be.revertedWith(
      //   FactoryErrors.DeploymentFailed,
      // );
      // await expect(fail2).to.be.revertedWith(
      //   FactoryErrors.DeploymentFailed,
      // );

      //       await expect(fail1).to.be.revertedWithCustomError(
      //   f721,
      //   FactoryErrors.AccessDenied,
      // );
      // await expect(fail2).to.be.revertedWithCustomError(
      //   f721,
      //   FactoryErrors.AccessDenied,
      // );
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
        f721,
        FactoryErrors.InvalidAddress,
      );
      expect(tx).to.be.ok;
      expect(owner.address).to.eq(
        await f721.callStatic.market(),
      );
      await expect(tx)
        .to.emit(f721, "MarketplaceUpdated")
        .withArgs(owner.address);
    });
    it("Should update ERC721Basic signer", async () => {
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
        f721,
        FactoryErrors.InvalidAddress,
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
        f721,
        FactoryErrors.InvalidAddress,
      );
    });
  });

  // `getDeployedAddr` already tested in `splitterCheck` and `createCollection` unit tests
  describe("Helpers", async () => {
    it("Should retrieve user's colID indexes", async () => {
      await createCollections(
        f721,
        acc02,
        _splitterSalt,
        amb,
        dead,
        _basicSalt,
        10,
        createdEvent,
      );
    });

    it("Should get collection ID from address", async () => {
      await testColID(f721, acc02);
    });
    it("Should retrieve collection type", async () => {
      const splitterAddress = await splitterDeployment(
        f721,
        acc02,
        _splitterSalt,
        amb.address,
        dead,
        20,
        0,
        [amb.address, acc02.address],
        1,
        2,
      );

      const basicAddr = await f721.callStatic.getDeployedAddr(
        _basicSalt,
        acc02.address,
      );
      await f721
        .connect(acc02)
        .createCollection(
          1,
          _basicSalt,
          "721Basic",
          "BASIC",
          price,
          1,
          "cid/id.json",
          splitterAddress,
          750,
          [],
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
      const splitterAddress = await splitterDeployment(
        f721,
        acc02,
        _splitterSalt,
        amb.address,
        dead,
        20,
        0,
        [amb.address, acc02.address],
        1,
        2,
      );

      const basicAddr = await f721.callStatic.getDeployedAddr(
        _basicSalt,
        acc02.address,
      );

      await expect(
        f721
          .connect(acc02)
          .createCollection(
            0,
            _basicSalt,
            "721Basic",
            "BASIC",
            price,
            1,
            "cid/id.json",
            splitterAddress,
            750,
            [],
          ),
      ).to.be.revertedWithCustomError(
        f721,
        FactoryErrors.AccessDenied,
      );

      await createCollection(
        f721,
        acc02,
        _basicSalt,
        splitterAddress,
      );

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

      const amountToMint = 10;
      const mintPrice = price.mul(amountToMint);
      const val = ethers.utils
        .parseEther(feePrice)
        .add(mintPrice);
      await basic.connect(acc02).mint(amountToMint, {
        value: val,
      });

      expect(await basic.callStatic.mintCount()).to.eq(
        amountToMint,
      );

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

      console.log(val);
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

      const colID = await f721.callStatic.getColID(basicAddr);

      await f721.setRouter(acc02.address);

      const true1cc = await f721
        .connect(acc02)
        .creatorCheck(colID);
      expect(true1cc.check).to.be.true;
      expect(true1cc.creator).to.eq(acc02.address);

      await expect(
        f721.connect(mad).creatorCheck(colID),
      ).to.be.revertedWithCustomError(
        f721,
        FactoryErrors.AccessDenied,
      );
    });
    it("Should verify a collection's creator", async () => {
      const splitterAddress = await splitterDeployment(
        f721,
        acc02,
        _splitterSalt,
        amb.address,
        dead,
        20,
        0,
        [amb.address, acc02.address],
        1,
        2,
      );

      const basicAddr = await f721.callStatic.getDeployedAddr(
        _basicSalt,
        acc02.address,
      );
      await createCollection(
        f721,
        acc02,
        _basicSalt,
        splitterAddress,
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
