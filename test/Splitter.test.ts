import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract, Wallet } from "ethers";
import { ethers, network, waffle } from "hardhat";

import {
  MockERC20,
  MockERC20__factory, // SplitterBase,
  SplitterImpl,
  SplitterImpl__factory,
} from "../src/types";
import { SplitterErrors } from "./utils/errors";
import { spFixture, tokenFixture } from "./utils/fixtures";

const createFixtureLoader = waffle.createFixtureLoader;

describe("Splitter", () => {
  type WalletWithAddress = Wallet & SignerWithAddress;
  // type SplitterType = SplitterImpl & SplitterBase;
  let splitter: SplitterImpl;
  let erc20: MockERC20 & Contract;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let res: any;

  // contract deployer/admin
  let owner: WalletWithAddress;

  // ambassador
  let amb: WalletWithAddress;

  // marketplace address
  let mad: WalletWithAddress;

  // extra EOAs
  let acc01: WalletWithAddress;
  let acc02: WalletWithAddress;

  let loadFixture: ReturnType<typeof createFixtureLoader>;

  const fundAmount: BigNumber =
    ethers.utils.parseEther("10000");
  const price: BigNumber = ethers.utils.parseEther("1");
  const dead = ethers.constants.AddressZero;

  before("Set signers and reset network", async () => {
    [owner, amb, mad, acc01, acc02] =
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ethers as any).getSigners();
    loadFixture = createFixtureLoader([
      owner,
      amb,
      mad,
      acc01,
      acc02,
    ]);
    await network.provider.send("hardhat_reset");
  });
  beforeEach("Load deployment fixtures", async () => {
    ({ splitter } = await loadFixture(spFixture));
  });

  describe("Init", async () => {
    it("Splitter should initialize", async () => {
      await splitter.deployed();
      expect(splitter).to.be.ok;
      expect(await splitter.callStatic.totalShares()).to.eq(
        100,
      );
      expect(await splitter.callStatic.payee(0)).to.eq(
        mad.address,
      );
      expect(await splitter.callStatic.payee(1)).to.eq(
        amb.address,
      );
      expect(await splitter.callStatic.payee(2)).to.eq(
        owner.address,
      );
      expect(
        await splitter.callStatic.shares(mad.address),
      ).to.eq(10);
      expect(
        await splitter.callStatic.shares(amb.address),
      ).to.eq(20);
      expect(
        await splitter.callStatic.shares(owner.address),
      ).to.eq(70);
    });
    it("accounts have been funded", async () => {
      // can't be eq to ethAmount due to contract deployment cost
      res = await ethers.provider.getBalance(owner.address);
      expect(res.toString()).to.have.lengthOf(22);
      // console.log(res); // lengthOf = 22
      // console.log(ethAmount); // lengthOf = 23

      // those should eq to hardhat prefunded account's value
      expect(
        await ethers.provider.getBalance(amb.address),
      ).to.eq(fundAmount);
      expect(
        await ethers.provider.getBalance(mad.address),
      ).to.eq(fundAmount);
      expect(
        await ethers.provider.getBalance(acc01.address),
      ).to.eq(fundAmount);
      expect(
        await ethers.provider.getBalance(acc02.address),
      ).to.eq(fundAmount);
    });
  });

  describe("Reverts", async () => {
    it("should revert if no payees are provided", async () => {
      const Splitter = (await ethers.getContractFactory(
        "SplitterImpl",
      )) as SplitterImpl__factory;
      const tx = Splitter.deploy([], []);

      await expect(tx).to.be.revertedWith(
        SplitterErrors.NoPayees,
      );
    });
    it("should revert if more payees than shares are provided", async () => {
      const Splitter = (await ethers.getContractFactory(
        "SplitterImpl",
      )) as SplitterImpl__factory;
      const tx = Splitter.deploy(
        [owner.address, mad.address, acc01.address],
        [20, 30],
      );

      await expect(tx).to.be.revertedWith(
        SplitterErrors.LengthMismatch,
      );
    });
    it("should revert if more shares than payees are provided", async () => {
      const Splitter = (await ethers.getContractFactory(
        "SplitterImpl",
      )) as SplitterImpl__factory;
      const tx = Splitter.deploy(
        [owner.address, acc01.address],
        [20, 30, 40],
      );
      await expect(tx).to.be.revertedWith(
        SplitterErrors.LengthMismatch,
      );
    });
    it("should revert if dead address is provided as payee", async () => {
      const Splitter = (await ethers.getContractFactory(
        "SplitterImpl",
      )) as SplitterImpl__factory;
      const tx = Splitter.deploy(
        [mad.address, dead],
        [20, 30],
      );
      await expect(tx).to.be.revertedWith(
        SplitterErrors.DeadAddress,
      );
    });
    it("should revert if a share is set to zero", async () => {
      const Splitter = (await ethers.getContractFactory(
        "SplitterImpl",
      )) as SplitterImpl__factory;
      const tx = Splitter.deploy(
        [mad.address, acc01.address],
        [20, 0],
      );
      await expect(tx).to.be.revertedWith(
        SplitterErrors.InvalidShare,
      );
    });
    it("should revert if a provided payees are duplicated", async () => {
      const Splitter = (await ethers.getContractFactory(
        "SplitterImpl",
      )) as SplitterImpl__factory;
      const tx = Splitter.deploy(
        [mad.address, mad.address],
        [20, 30],
      );
      await expect(tx).to.be.revertedWith(
        SplitterErrors.AlreadyPayee,
      );
    });
    it("should revert if a provided payees are duplicated", async () => {
      const Splitter = (await ethers.getContractFactory(
        "SplitterImpl",
      )) as SplitterImpl__factory;
      const tx = Splitter.deploy(
        [mad.address, mad.address],
        [20, 30],
      );
      await expect(tx).to.be.revertedWith(
        SplitterErrors.AlreadyPayee,
      );
    });
    it("should revert if account has no shares to claim", async () => {
      await expect(
        splitter["release(address)"](acc02.address),
      ).to.be.revertedWith(SplitterErrors.NoShares);
    });
    it("should revert if there are no funds to claim", async () => {
      await expect(
        splitter["release(address)"](amb.address),
      ).to.be.revertedWith(SplitterErrors.DeniedAccount);
    });
    it("should revert if account has no ERC20 shares to claim", async () => {
      ({ erc20 } = await loadFixture(tokenFixture));

      await expect(
        splitter["release(address,address)"](
          erc20.address,
          acc01.address,
        ),
      ).to.be.revertedWith(SplitterErrors.NoShares);
    });
    it("should revert if there is no ERC20 to claim", async () => {
      const ERC20 = (await ethers.getContractFactory(
        "MockERC20",
      )) as MockERC20__factory;
      const erc20 = await ERC20.deploy(fundAmount);

      await expect(
        splitter["release(address,address)"](
          erc20.address,
          owner.address,
        ),
      ).to.be.revertedWith(SplitterErrors.DeniedAccount);
    });
  });
  describe("Receive Payments", async () => {
    it("should accept value", async () => {
      await owner.sendTransaction({
        to: splitter.address,
        value: price,
      });
      expect(
        await ethers.provider.getBalance(splitter.address),
      ).to.eq(price);
    });
    it("should accept ERC20", async () => {
      const ERC20 = (await ethers.getContractFactory(
        "MockERC20",
      )) as MockERC20__factory;
      const erc20 = await ERC20.deploy(fundAmount);
      await erc20
        .connect(owner)
        .transfer(splitter.address, price);

      expect(
        await erc20.callStatic.balanceOf(splitter.address),
      ).to.eq(price);
    });
  });
  describe("Release Payments", async () => {
    it("should release value to payee", async () => {
      await owner.sendTransaction({
        to: splitter.address,
        value: price,
      });
      const bal1 = await ethers.provider.getBalance(
        mad.address,
      );
      await splitter["release(address)"](mad.address);
      const share1 = BigNumber.from(1000);
      const base = BigNumber.from(10000);
      const amount = price.mul(share1).div(base);

      expect(
        await ethers.provider.getBalance(mad.address),
      ).to.be.eq(bal1.add(amount));
      expect(
        await splitter.callStatic["releasable(address)"](
          mad.address,
        ),
      ).to.be.eq(0x00);
      expect(
        await splitter.callStatic["released(address)"](
          mad.address,
        ),
      ).to.be.eq(amount);
      expect(
        await splitter.callStatic["totalReleased()"](),
      ).to.be.eq(amount);
    });
    it("should release ERC20 to payee", async () => {
      const ERC20 = (await ethers.getContractFactory(
        "MockERC20",
      )) as MockERC20__factory;
      const erc20 = await ERC20.deploy(price);
      await erc20
        .connect(owner)
        .transfer(splitter.address, price);
      const share1 = BigNumber.from(2000);
      const base = BigNumber.from(10000);
      const amount = price.mul(share1).div(base);

      await splitter["release(address,address)"](
        erc20.address,
        amb.address,
      );

      expect(
        await erc20.callStatic.balanceOf(amb.address),
      ).to.eq(amount);
      expect(
        await splitter.callStatic[
          "releasable(address,address)"
        ](erc20.address, amb.address),
      ).to.be.eq(0x00);
      expect(
        await splitter.callStatic[
          "released(address,address)"
        ](erc20.address, amb.address),
      ).to.be.eq(amount);
      expect(
        await splitter.callStatic["totalReleased(address)"](
          erc20.address,
        ),
      ).to.be.eq(amount);
    });
  });
});
