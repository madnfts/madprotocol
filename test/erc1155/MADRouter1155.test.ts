import "@nomicfoundation/hardhat-chai-matchers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Wallet } from "ethers";
import { artifacts, ethers, network } from "hardhat";

import {
  MADFactory1155,
  MADMarketplace1155,
  MADRouter1155,
  MockERC20,
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
import { BasicErrors, RouterErrors } from "./../utils/errors";
import { getSignerAddrs } from "./../utils/fixtures";
import {
  dead,
  madFixture1155B,
} from "./../utils/madFixtures";

const createdEvent = "ERC1155BasicCreated";

describe("MADRouter1155", () => {
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
  const zero = ethers.constants.Zero;

  before("Set signers and reset network", async () => {
    [owner, amb, mad, acc01, acc02] =
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ethers as any).getSigners();

    await network.provider.send("hardhat_reset");
  });
  beforeEach("Load deployment fixtures", async () => {
    ({ f1155, m1155, r1155 } = await loadFixture(
      madFixture1155B,
    ));
    await r1155.deployed();
    await m1155.deployed();
    await f1155.deployed();
  });

  describe("Init", async () => {
    it("Router should initialize", async () => {
      expect(r1155).to.be.ok;

      // check each global var
      expect(await r1155.callStatic.name()).to.eq("router");
      expect(await r1155.madFactory()).to.eq(f1155.address);
    });
  });
  describe("Set URI", async () => {
    it("Should revert for locked base URI", async () => {
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
          "BasicSalt",
          "1155Basic",
          "BASIC",
          price,
          1,
          "cid/id.json",
          splitterAddress,
          750,
          [],
        );
      const basic = await ethers.getContractAt(
        "ERC1155Basic",
        basicAddr,
      );
      const tx1 = r1155
        .connect(acc02)
        .setBaseURI(basic.address, "null");
      const tx2 = r1155
        .connect(acc02)
        .setURILock(basic.address);
      expect(await tx1).to.be.ok;
      expect(await tx2).to.be.ok;
      await expect(
        r1155
          .connect(acc02)
          .setBaseURI(basic.address, "null"),
      ).to.be.revertedWithCustomError(
        basic,
        RouterErrors.URILocked,
      );
    });

    it("Should set URI for 1155Basic collection type", async () => {
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
          "BasicSalt",
          "1155Basic",
          "BASIC",
          price,
          1,
          "cid/id.json",
          splitterAddress,
          750,
          [],
        );
      const basic = await ethers.getContractAt(
        "ERC1155Basic",
        basicAddr,
      );
      const colID = await f1155.callStatic.getColID(
        basicAddr,
      );

      const tx = await r1155
        .connect(acc02)
        .setBaseURI(basicAddr, "null");

      expect(tx).to.be.ok;
      await expect(tx)
        .to.emit(r1155, "BaseURISet")
        .withArgs(colID, "null");
      expect(await basic.callStatic.baseURI()).to.eq("null");
      const verArt = await artifacts.readArtifact(
        "FactoryVerifier",
      );
      const ver = new ethers.Contract(
        f1155.address,
        verArt.abi,
        ethers.provider,
      );
      await expect(
        r1155.connect(acc01).setBaseURI(basicAddr, "void"),
      ).to.be.revertedWithCustomError(
        ver,
        RouterErrors.AccessDenied,
      );
    });
  });
  describe("Burn", async () => {
    it("Should burn tokens for 1155Basic collection type", async () => {
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
          "BasicSalt",
          "1155Basic",
          "BASIC",
          price,
          1,
          "cid/id.json",
          splitterAddress,
          750,
          [],
        );
      const basic = await ethers.getContractAt(
        "ERC1155Basic",
        basicAddr,
      );
      await r1155
        .connect(acc02)
        .setMintState(basicAddr, true);
      await basic.connect(acc01).mint(1, 1, {
        value: price.add(ethers.utils.parseEther("0.25")),
      });
      const tx = await r1155
        .connect(acc02)
        .burn(basicAddr, [1], [acc01.address], [1]);

      expect(tx).to.be.ok;
      expect(
        await basic.callStatic.balanceOf(acc01.address, 1),
      ).to.eq(0);
      const verArt = await artifacts.readArtifact(
        "FactoryVerifier",
      );
      const ver = new ethers.Contract(
        f1155.address,
        verArt.abi,
        ethers.provider,
      );
      await expect(
        r1155.burn(basicAddr, [1], [acc01.address], [1]),
      ).to.be.revertedWithCustomError(
        ver,
        RouterErrors.AccessDenied,
      );
    });
  });
  describe("Batch Burn", async () => {
    it("Should batch burn token for 1155Basic collection type", async () => {
      const pmul = await ethers.BigNumber.from(4);
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

      const basicAddr =
        await f1155.callStatic.getDeployedAddr(
          `BasicSaltNumber10`,
          acc02.address,
        );

      console.log("\nbasicAddr", basicAddr);

      const basic = await ethers.getContractAt(
        "ERC1155Basic",
        basicAddr,
      );

      // console.log("\nbasic", basic);

      await r1155
        .connect(acc02)
        .setMintState(basicAddr, true);

      for (let i = 1; i < 4; i++) {
        await r1155
          .connect(acc02)
          .basicMintTo(basicAddr, acc01.address, i, [2], {
            value: ethers.utils.parseEther("0.25"),
          });
      }

      const tx = await r1155
        .connect(acc02)
        .batchBurn(
          basicAddr,
          acc01.address,
          [1, 2, 3, 4],
          [1, 1, 1, 1],
        );

      expect(tx).to.be.ok;
      expect(
        await basic.callStatic.balanceOf(acc01.address, 1),
      ).to.eq(1);
      expect(
        await basic.callStatic.balanceOf(acc01.address, 2),
      ).to.eq(1);
      expect(
        await basic.callStatic.balanceOf(acc01.address, 3),
      ).to.eq(1);
      expect(
        await basic.callStatic.balanceOf(acc01.address, 4),
      ).to.eq(1);
      const verArt = await artifacts.readArtifact(
        "FactoryVerifier",
      );
      const ver = new ethers.Contract(
        f1155.address,
        verArt.abi,
        ethers.provider,
      );
      await expect(
        r1155.batchBurn(basicAddr, acc01.address, [1], [1]),
      ).to.be.revertedWithCustomError(
        ver,
        RouterErrors.AccessDenied,
      );
    });
  });
  describe("Set MintState", async () => {
    it("Should revert for invalid stateType", async () => {
      const addr = await f1155.getDeployedAddr(
        "salt",
        acc02.address,
      );
      const tx = r1155.setMintState(addr, true);

      await expect(tx).to.be.revertedWithCustomError(
        f1155,
        RouterErrors.AccessDenied,
      );
    });

    await f1155
      .connect(acc02)
      .splitterCheck(
        "MADSplitter1",
        amb.address,
        dead,
        20,
        0,
      );
    const splitterAddress =
      await f1155.callStatic.getDeployedAddr(
        "MADSplitter1",
        acc02.address,
      );
    const basic = await f1155.callStatic.getDeployedAddr(
      "BasicSalt",
      acc02.address,
    );
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
        splitterAddress,
        750,
        [],
      );
    const tx = r1155.connect(acc02).setMintState(basic, true);

    await expect(tx).to.be.revertedWith(
      RouterErrors.InvalidType,
    );
    // });
    it("Should set publicMintState for minimal, basic and whitelist colTypes", async () => {
      await f1155
        .connect(acc02)
        .splitterCheck(
          "MADSplitter1",
          amb.address,
          dead,
          20,
          0,
        );
      const splitterAddress =
        await f1155.callStatic.getDeployedAddr(
          "MADSplitter1",
          acc02.address,
        );
      const basicAddr =
        await f1155.callStatic.getDeployedAddr(
          "BasicSalt",
          acc02.address,
        );
      const basicAddr2 =
        await f1155.callStatic.getDeployedAddr(
          "BasicSalt2",
          acc02.address,
        );
      const basic3Addr =
        await f1155.callStatic.getDeployedAddr(
          "WhiteSalt",
          acc02.address,
        );
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
          splitterAddress,
          750,
          [],
        );
      const basic = await ethers.getContractAt(
        "ERC1155Basic",
        basicAddr,
      );
      await f1155
        .connect(acc02)
        .createCollection(
          1,
          "BasicSalt2",
          "1155Basic",
          "BASIC",
          price,
          1,
          "cid/id.json",
          splitterAddress,
          750,
          [],
        );
      const basic2 = await ethers.getContractAt(
        "ERC1155Basic",
        basicAddr2,
      );
      await f1155
        .connect(acc02)
        .createCollection(
          1,
          "BasicSalt3",
          "1155Basic",
          "BASIC",
          price,
          1,
          "cid/id.json",
          splitterAddress,
          750,
          [],
        );
      const basic3 = await ethers.getContractAt(
        "ERC1155Basic",
        basic3Addr,
      );

      const tx1 = await r1155
        .connect(acc02)
        .setMintState(basicAddr, true);
      const tx2 = await r1155
        .connect(acc02)
        .setMintState(basicAddr, true);
      const tx3 = await r1155
        .connect(acc02)
        .setMintState(basic3Addr, true);

      expect(tx1).to.be.ok;
      expect(tx2).to.be.ok;
      expect(tx3).to.be.ok;
      expect(await basic.callStatic.publicMintState()).to.eq(
        true,
      );
      expect(await basic2.callStatic.publicMintState()).to.eq(
        true,
      );
      expect(await basic3.callStatic.publicMintState()).to.eq(
        true,
      );
      const verArt = await artifacts.readArtifact(
        "FactoryVerifier",
      );
      const ver = new ethers.Contract(
        f1155.address,
        verArt.abi,
        ethers.provider,
      );
      await expect(
        r1155.connect(acc01).setMintState(basicAddr, true),
      ).to.be.revertedWithCustomError(
        ver,
        RouterErrors.AccessDenied,
      );
      await expect(
        r1155.connect(acc01).setMintState(basicAddr2, true),
      ).to.be.revertedWithCustomError(
        ver,
        RouterErrors.AccessDenied,
      );
      await expect(
        r1155.connect(acc01).setMintState(basic3Addr, true),
      ).to.be.revertedWithCustomError(
        ver,
        RouterErrors.AccessDenied,
      );
    });
  });
  describe("Creator Withdraw", async () => {
    it("Should withdraw balance and ERC20 for all colTypes", async () => {
      const prevBal = BigNumber.from(2).pow(255);
      const ERC20 = await ethers.getContractFactory(
        "MockERC20",
      );
      const erc20 = (await ERC20.deploy(
        prevBal,
      )) as MockERC20;

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
      const basic = await ethers.getContractAt(
        "ERC1155Basic",
        basicAddr,
      );
      await erc20.mint(basic.address, price);
      await r1155
        .connect(acc02)
        .setMintState(basic.address, true);

      await basic.connect(acc01).mint(1, 1, {
        value: price.add(ethers.utils.parseEther("0.25")),
      });
      const bal1 = await ethers.provider.getBalance(
        acc02.address,
      );
      const bal2 = await erc20.balanceOf(acc02.address);
      const tx1 = await r1155
        .connect(acc02)
        .withdraw(basic.address, dead);
      const tx2 = await r1155
        .connect(acc02)
        .withdraw(basic.address, erc20.address);
      const newBal1 = await ethers.provider.getBalance(
        acc02.address,
      );
      const newBal2 = await erc20.balanceOf(acc02.address);

      const madSpl = await splitterDeployment(
        f1155,
        mad,
        "_splitterSalt2",
        amb.address,
        dead,
        20,
        0,
        [amb.address, mad.address],
        1,
        2,
      );

      await createCollection(f1155, mad, "salt", madSpl);

      const basicAddr2 =
        await f1155.callStatic.getDeployedAddr(
          "salt",
          mad.address,
        );
      const basic2 = await ethers.getContractAt(
        "ERC1155Basic",
        basicAddr2,
      );
      await erc20.mint(basic2.address, price);
      await r1155
        .connect(mad)
        .setMintState(basic2.address, true);
      await basic2.connect(acc01).mint(1, 1, {
        value: price.add(ethers.utils.parseEther("0.25")),
      });
      const bala = await ethers.provider.getBalance(
        mad.address,
      );
      const balb = await erc20.balanceOf(mad.address);
      const txa = await r1155
        .connect(mad)
        .withdraw(basic2.address, dead);
      const txb = await r1155
        .connect(mad)
        .withdraw(basic2.address, erc20.address);
      const newBala = await ethers.provider.getBalance(
        mad.address,
      );
      const newBalb = await erc20.balanceOf(mad.address);

      const ambSpl = await splitterDeployment(
        f1155,
        acc02,
        "_splitterSalt3",
        amb.address,
        dead,
        20,
        0,
        [amb.address, acc02.address],
        1,
        2,
      );

      const basic3Addr =
        await f1155.callStatic.getDeployedAddr(
          "WhiteSalt",
          acc02.address,
        );

      await createCollection(
        f1155,
        acc02,
        "WhiteSalt",
        ambSpl,
      );
      const basic3 = await ethers.getContractAt(
        "ERC1155Basic",
        basic3Addr,
      );

      await erc20.mint(basic3.address, price);
      await r1155
        .connect(acc02)
        .setMintState(basic3.address, true);
      await basic3.connect(acc01).mint(1, 1, {
        value: price.add(ethers.utils.parseEther("0.25")),
      });
      const balc = await ethers.provider.getBalance(
        acc02.address,
      );
      const bald = await erc20.balanceOf(acc02.address);
      const txc = await r1155
        .connect(acc02)
        .withdraw(basic3.address, dead);
      const txd = await r1155
        .connect(acc02)
        .withdraw(basic3.address, erc20.address);
      const newBalc = await ethers.provider.getBalance(
        acc02.address,
      );
      const newBald = await erc20.balanceOf(acc02.address);

      const verArt = await artifacts.readArtifact(
        "FactoryVerifier",
      );
      const ver = new ethers.Contract(
        f1155.address,
        verArt.abi,
        ethers.provider,
      );

      expect(tx1).to.be.ok;
      expect(tx2).to.be.ok;
      expect(bal1).to.be.lt(newBal1);
      expect(price.mul(8000).div(10_000)).to.be.eq(
        newBal2.sub(bal2),
      );

      await expect(
        r1155
          .connect(acc01)
          .withdraw(basic.address, erc20.address),
      ).to.be.revertedWithCustomError(
        ver,
        RouterErrors.AccessDenied,
      );

      await expect(
        r1155
          .connect(acc02)
          .withdraw(basic.address, erc20.address),
      ).to.be.revertedWithCustomError(
        r1155,
        RouterErrors.NoFunds,
      );

      await expect(
        r1155.connect(acc02).withdraw(basic.address, dead),
      ).to.be.revertedWithCustomError(
        r1155,
        RouterErrors.NoFunds,
      );

      expect(txa).to.be.ok;
      expect(txb).to.be.ok;
      expect(bala).to.be.below(newBala);
      expect(balb).to.be.below(newBalb);

      await expect(
        r1155
          .connect(acc01)
          .withdraw(basic2.address, erc20.address),
      ).to.be.revertedWithCustomError(
        ver,
        RouterErrors.AccessDenied,
      );
      await expect(
        r1155
          .connect(mad)
          .withdraw(basic2.address, erc20.address),
      ).to.be.revertedWithCustomError(
        r1155,
        RouterErrors.NoFunds,
      );

      await expect(
        r1155.connect(mad).withdraw(basic2.address, dead),
      ).to.be.revertedWithCustomError(
        r1155,
        RouterErrors.NoFunds,
      );

      expect(txc).to.be.ok;
      expect(txd).to.be.ok;
      expect(balc).to.be.lt(newBalc);
      expect(bald).to.be.lt(newBald);

      await expect(
        r1155
          .connect(acc01)
          .withdraw(basic3.address, erc20.address),
      ).to.be.revertedWithCustomError(
        ver,
        RouterErrors.AccessDenied,
      );
    });
  });
  describe("Only Owner", async () => {
    it("Should update contract's owner", async () => {
      const tx = await r1155.setOwner(mad.address);

      expect(tx).to.be.ok;
      await expect(tx)
        .to.emit(r1155, "OwnerUpdated")
        .withArgs(owner.address, mad.address);
      expect(await r1155.callStatic.owner()).to.eq(
        mad.address,
      );
      await expect(
        r1155.connect(acc02).setOwner(acc01.address),
      ).to.be.revertedWith(RouterErrors.Unauthorized);
    });

    describe("Basic MintTo", async () => {
      it("Should call basicMintTo for 1155Basic collection type", async () => {
        await f1155
          .connect(acc02)
          .splitterCheck(
            "MADSplitter1",
            amb.address,
            dead,
            20,
            0,
          );
        const splitterAddress =
          await f1155.callStatic.getDeployedAddr(
            "MADSplitter1",
            acc02.address,
          );
        const basic = await f1155.callStatic.getDeployedAddr(
          "MinSalt",
          acc02.address,
        );
        await createCollection(
          f1155,
          acc02,
          "MinSalt",
          splitterAddress,
        );
        const min = await ethers.getContractAt(
          "ERC1155Basic",
          basic,
        );
        await r1155.setFees(
          ethers.utils.parseEther("2.5"),
          ethers.utils.parseEther("0.5"),
        );
        await expect(
          r1155
            .connect(acc02)
            .basicMintTo(basic, acc01.address, 1, [1], {
              value: ethers.utils.parseEther("0.25"),
            }),
        ).to.be.revertedWithCustomError(
          min,
          BasicErrors.WrongPrice,
        );

        const tx = await r1155
          .connect(acc02)
          .basicMintTo(basic, acc01.address, 1, [1], {
            value: ethers.utils.parseEther("2.5"),
          });

        expect(tx).to.be.ok;
        const verArt = await artifacts.readArtifact(
          "FactoryVerifier",
        );
        const ver = new ethers.Contract(
          f1155.address,
          verArt.abi,
          ethers.provider,
        );
        await expect(
          r1155
            .connect(mad)
            .basicMintTo(basic, acc02.address, 1, [1], {
              value: ethers.utils.parseEther("2.5"),
            }),
        ).to.be.revertedWithCustomError(
          ver,
          RouterErrors.AccessDenied,
        );
      });
    });
    describe("Basic BatchMintTo", async () => {
      it("Should call basicMintTo for 1155Basic collection type", async () => {
        await f1155
          .connect(acc02)
          .splitterCheck(
            "MADSplitter1",
            amb.address,
            dead,
            20,
            0,
          );
        const splitterAddress =
          await f1155.callStatic.getDeployedAddr(
            "MADSplitter1",
            acc02.address,
          );
        const basic = await f1155.callStatic.getDeployedAddr(
          "MinSalt",
          acc02.address,
        );
        await createCollection(
          f1155,
          acc02,
          "MinSalt",
          splitterAddress,
        );
        const min = await ethers.getContractAt(
          "ERC1155Basic",
          basic,
        );
        await r1155.setFees(
          ethers.utils.parseEther("2.5"),
          ethers.utils.parseEther("0.5"),
        );
        await expect(
          r1155
            .connect(acc02)
            .basicMintBatchTo(
              basic,
              acc01.address,
              [1, 2],
              [1, 1],
              { value: ethers.utils.parseEther("0.25") },
            ),
        ).to.be.revertedWithCustomError(
          min,
          BasicErrors.WrongPrice,
        );

        const tx = await r1155
          .connect(acc02)
          .basicMintBatchTo(
            basic,
            acc01.address,
            [1, 2],
            [1, 1],
            { value: ethers.utils.parseEther("2.5") },
          );

        expect(tx).to.be.ok;
        const verArt = await artifacts.readArtifact(
          "FactoryVerifier",
        );
        const ver = new ethers.Contract(
          f1155.address,
          verArt.abi,
          ethers.provider,
        );
        await expect(
          r1155
            .connect(mad)
            .basicMintBatchTo(
              basic,
              acc02.address,
              [1, 2],
              [1, 1],
              { value: ethers.utils.parseEther("2.5") },
            ),
        ).to.be.revertedWithCustomError(
          ver,
          RouterErrors.AccessDenied,
        );
      });
    });
    describe("Set Fee Set Max Tests", async () => {
      it("Should allow setting fees below and at the limit (2.5 eth and 0.5 eth for our fixtures)", async () => {
        await expect(
          r1155.setFees(
            ethers.utils.parseEther("2.4"),
            ethers.utils.parseEther("0.4"),
          ),
        ).to.be.ok;

        await expect(
          r1155.setFees(
            ethers.utils.parseEther("2.5"),
            ethers.utils.parseEther("0.5"),
          ),
        ).to.be.ok;

        await expect(
          r1155.setFees(
            ethers.utils.parseEther("2.6"),
            ethers.utils.parseEther("0.6"),
          ),
        ).to.be.reverted;
      });
    }),
      describe("Burn-setfees", async () => {
        it("Should burn tokens for 1155Basic collection type", async () => {
          await f1155
            .connect(acc02)
            .splitterCheck(
              "MADSplitter1",
              amb.address,
              dead,
              20,
              0,
            );
          const splitterAddress =
            await f1155.callStatic.getDeployedAddr(
              "MADSplitter1",
              acc02.address,
            );
          const basicAddr =
            await f1155.callStatic.getDeployedAddr(
              "BasicSalt",
              acc02.address,
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

          await r1155.setFees(
            ethers.utils.parseEther("2.5"),
            ethers.utils.parseEther("0.5"),
          );

          await basic.connect(acc01).mint(1, 1, {
            value: price.add(ethers.utils.parseEther("2.5")),
          });

          // await expect(
          //   r1155
          //     .connect(acc02)
          //     .burn(basicAddr, [1], [acc01.address], [1]),
          // ).to.be.revertedWithCustomError(
          //   basic,
          //   BasicErrors.WrongPrice,
          // );

          const tx = await r1155
            .connect(acc02)
            .burn(basicAddr, [1], [acc01.address], [1], {
              value: ethers.utils.parseEther("0.5"),
            });

          expect(tx).to.be.ok;
          expect(
            await basic.callStatic.balanceOf(
              acc01.address,
              1,
            ),
          ).to.eq(0);
          const verArt = await artifacts.readArtifact(
            "FactoryVerifier",
          );
          const ver = new ethers.Contract(
            f1155.address,
            verArt.abi,
            ethers.provider,
          );
          await expect(
            r1155.burn(basicAddr, [1], [acc01.address], [1], {
              value: ethers.utils.parseEther("0.5"),
            }),
          ).to.be.revertedWithCustomError(
            ver,
            RouterErrors.AccessDenied,
          );
        });
      });
    describe("Batch Burn", async () => {
      it("Should batch burn token for 1155Basic collection type", async () => {
        await f1155
          .connect(acc02)
          .splitterCheck(
            "MADSplitter1",
            amb.address,
            dead,
            20,
            0,
          );
        const splitterAddress =
          await f1155.callStatic.getDeployedAddr(
            "MADSplitter1",
            acc02.address,
          );
        const basicAddr =
          await f1155.callStatic.getDeployedAddr(
            "BasicSalt",
            acc02.address,
          );
        await createCollection(
          f1155,
          acc02,
          _basicSalt,
          splitterAddress,
        );
        const pmul = await ethers.BigNumber.from(4);
        const basic = await ethers.getContractAt(
          "ERC1155Basic",
          basicAddr,
        );
        await r1155
          .connect(acc02)
          .setMintState(basicAddr, true);
        await basic.connect(acc01).mint(4, 1, {
          value: price
            .mul(pmul)
            .add(ethers.utils.parseEther("0.25")),
        });

        await r1155.setFees(
          ethers.utils.parseEther("2.5"),
          ethers.utils.parseEther("0.5"),
        );

        // await expect(
        //   r1155
        //     .connect(acc02)
        //     .batchBurn(
        //       basicAddr,
        //       acc01.address,
        //       [1, 2, 3, 4],
        //       [1, 1, 1, 1],
        //     ),
        // ).to.be.revertedWithCustomError(
        //   basic,
        //   BasicErrors.WrongPrice,
        // );

        const tx = await r1155
          .connect(acc02)
          .batchBurn(
            basicAddr,
            acc01.address,
            [1, 2, 3, 4],
            [1, 1, 1, 1],
            { value: ethers.utils.parseEther("0.5") },
          );

        expect(tx).to.be.ok;
        expect(
          await basic.callStatic.balanceOf(acc01.address, 1),
        ).to.eq(0);
        expect(
          await basic.callStatic.balanceOf(acc01.address, 2),
        ).to.eq(0);
        expect(
          await basic.callStatic.balanceOf(acc01.address, 3),
        ).to.eq(0);
        expect(
          await basic.callStatic.balanceOf(acc01.address, 4),
        ).to.eq(0);
        const verArt = await artifacts.readArtifact(
          "FactoryVerifier",
        );
        const ver = new ethers.Contract(
          f1155.address,
          verArt.abi,
          ethers.provider,
        );
        await expect(
          r1155.batchBurn(
            basicAddr,
            acc01.address,
            [1],
            [1],
            {
              value: ethers.utils.parseEther("0.5"),
            },
          ),
        ).to.be.revertedWithCustomError(
          ver,
          RouterErrors.AccessDenied,
        );
      });
    });
  });
});
