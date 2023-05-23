import "@nomicfoundation/hardhat-chai-matchers";
import {
  loadFixture,
  mine,
} from "@nomicfoundation/hardhat-network-helpers";
import { setNextBlockTimestamp } from "@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time";
import { expect } from "chai";
import { ContractReceipt } from "ethers";
import { ethers, network } from "hardhat";

import {
  MADFactory1155,
  MADMarketplace1155,
  MADRouter1155,
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
  Collection,
  dead,
  madFixture1155A,
} from "./../utils/madFixtures";

const createdEvent = "ERC1155BasicCreated";

describe("MADFactory1155", () => {
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
        .splitterCheck(_splitterSalt, dead, dead, 0, 0);
      const tx = f1155
        .connect(acc02)
        .splitterCheck(_splitterSalt, dead, dead, 0, 0);

      await expect(tx).to.be.revertedWith(
        FactoryErrors.DeploymentFailed,
      );
    });
    it("Should deploy splitter without ambassador, update storage and emit events", async () => {
      await splitterDeployment(
        f1155,
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
        f1155,
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
        f1155,
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
    it("Should deploy ERC1155Basic, update storage and emit events", async () => {
      const splitterAddress = await splitterDeployment(
        f1155,
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
        f1155,
        acc02,
        _basicSalt,
        splitterAddress,
      );

      await validateCreation(
        f1155,
        createdEvent,
        acc02,
        splitterAddress,
        _basicSalt,
        tx,
      );

      // const fail1 = await createCollection(f1155,acc02, _basicSalt, splitterAddress);

      // const fail1 = await f1155
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

      // const fail2 = await createCollection(f1155,acc02, _basicSalt, splitterAddress);
      // const fail2 = await f1155
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
      //   f1155,
      //   FactoryErrors.AccessDenied,
      // );
      // await expect(fail2).to.be.revertedWithCustomError(
      //   f1155,
      //   FactoryErrors.AccessDenied,
      // );
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
      await expect(
        f1155.setMarket(ethers.constants.AddressZero),
      ).to.be.revertedWithCustomError(
        f1155,
        FactoryErrors.InvalidAddress,
      );
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
      await expect(
        f1155.setSigner(ethers.constants.AddressZero),
      ).to.be.revertedWithCustomError(
        f1155,
        FactoryErrors.InvalidAddress,
      );
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
        f1155.connect(acc01).setRouter(acc02.address),
      ).to.be.revertedWith(FactoryErrors.Unauthorized);
      await expect(
        f1155.setRouter(ethers.constants.AddressZero),
      ).to.be.revertedWithCustomError(
        f1155,
        FactoryErrors.InvalidAddress,
      );
    });
  });

  // `getDeployedAddr` already tested in `splitterCheck` and `createCollection` unit tests
  describe("Helpers", async () => {
    it("Should retrieve user's colID indexes", async () => {
      await createCollections(
        f1155,
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
      await testColID(f1155, acc02);
    });
    it("Should retrieve collection type", async () => {
      const splitterAddress = await splitterDeployment(
        f1155,
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

      const basicAddr =
        await f1155.callStatic.getDeployedAddr(
          _basicSalt,
          acc02.address,
        );

      await f1155
        .connect(acc02)
        .createCollection(
          1,
          _basicSalt,
          "1155Basic",
          "BASIC",
          price,
          10,
          "cid/id.json",
          splitterAddress,
          750,
          [],
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
      const splitterAddress = await splitterDeployment(
        f1155,
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

      const basicAddr =
        await f1155.callStatic.getDeployedAddr(
          _basicSalt,
          acc02.address,
        );

      await expect(
        f1155
          .connect(acc02)
          .createCollection(
            0,
            _basicSalt,
            "1155Basic",
            "BASIC",
            price,
            1,
            "cid/id.json",
            splitterAddress,
            750,
            [],
          ),
      ).to.be.revertedWithCustomError(
        f1155,
        FactoryErrors.AccessDenied,
      );

      await createCollection(
        f1155,
        acc02,
        _basicSalt,
        splitterAddress,
      );

      const basic = await ethers.getContractAt(
        "ERC1155Basic",
        basicAddr,
      );
      await r1155
        .connect(acc02)
        .setMintState(basicAddr, true);

      const tx_ = await basic.connect(acc02).mint(1, 1, {
        value: price.add(ethers.utils.parseEther("0.25")),
      });

      const blockTimestamp = (
        await m1155.provider.getBlock(tx_.blockNumber || 0)
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
      const splitterAddress = await splitterDeployment(
        f1155,
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

      const basicAddr =
        await f1155.callStatic.getDeployedAddr(
          _basicSalt,
          acc02.address,
        );
      await createCollection(
        f1155,
        acc02,
        _basicSalt,
        splitterAddress,
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
