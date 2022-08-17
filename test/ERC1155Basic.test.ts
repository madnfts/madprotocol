import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import {
  BigNumber, // ContractReceipt,
  // ContractTransaction,
  Wallet,
} from "ethers";
import { ethers, network, waffle } from "hardhat";

import {
  ERC1155Basic,
  MockERC20,
  SplitterImpl,
} from "../src/types";
import { BasicErrors } from "./utils/errors";
import {
  sbFixture1155,
  tokenFixture,
} from "./utils/fixtures";
import {
  ERC165Interface,
  ERC1155Interface,
  ERC1155MetadataInterface,
  ERC2981Interface,
  getInterfaceID,
} from "./utils/interfaces";

const createFixtureLoader = waffle.createFixtureLoader;

describe("ERC1155Basic", () => {
  /* 
  For the sake of solely testing the nft functionalities, we consider 
  the user as the contract's owner, and the marketplace just as the 
  recipient for the royalties distribution; even though these tx 
  would've been proxied through the marketplace address when the 
  other core contracts are taken into account.
  */

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let res: any;

  let splitter: SplitterImpl;
  let basic: ERC1155Basic;
  let erc20: MockERC20;

  // let tx:ContractTransaction;
  // let rc:ContractReceipt;

  const fundAmount: BigNumber =
    ethers.utils.parseEther("10000");
  const price: BigNumber = ethers.utils.parseEther("1");
  const change =
    "VmlydHVhbGx5IGV2ZXJ5dGhpbmcgaXMgcGx1bmRlcmVkLCBidXQgYWJzb2x1dGVseSBldmVyeXRoaW5nIGlzIGZyZWUu";

  let loadFixture: ReturnType<typeof createFixtureLoader>;

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
    ({ basic, splitter } = await loadFixture(sbFixture1155));
  });

  describe("Init", async () => {
    it("Splitter and ERC1155 should initialize", async () => {
      await basic.deployed();
      await splitter.deployed();
      expect(basic).to.be.ok;
      expect(splitter).to.be.ok;
      expect(await basic.callStatic.price()).to.eq(price);
      expect(await basic.callStatic.maxSupply()).to.eq(1000);
      expect(await basic.callStatic.publicMintState()).to.eq(
        false,
      );
      expect(await basic.callStatic.splitter()).to.eq(
        splitter.address,
      );
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
      await expect(await basic.deployTransaction)
        .to.emit(basic, "RoyaltyFeeSet")
        .withArgs(750)
        .and.to.emit(basic, "RoyaltyRecipientSet")
        .withArgs(splitter.address);
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
  // each describe tests a set of functionalities of the contract's behavior
  describe("Only owner setters", async () => {
    it("Should set base URI, emit event and revert if not owner", async () => {
      const set = await basic.connect(owner).setURI(change);
      const check = await basic.callStatic.getURI();
      const setFail = basic.connect(acc01).setURI("fail");

      expect(set).to.be.ok;
      expect(check).to.eq(change);

      await expect(set)
        .to.emit(basic, "BaseURISet")
        .withArgs(change);
      await expect(setFail).to.be.revertedWith(
        BasicErrors.Unauthorized,
      );
    });

    it("Should set public mint state, emit event & revert if not owner", async () => {
      const set = await basic
        .connect(owner)
        .setPublicMintState(true);
      const check = await basic.callStatic.publicMintState();
      const setFail = basic
        .connect(acc02)
        .setPublicMintState(false);

      expect(set).to.be.ok;
      expect(check).to.eq(true);

      await expect(set)
        .to.emit(basic, "PublicMintStateSet")
        .withArgs(true);
      await expect(setFail).to.be.revertedWith(
        BasicErrors.Unauthorized,
      );
    });
  });
  describe("Mint", async () => {
    it("Should revert if public mint is turned off", async () => {
      const tx = basic.connect(acc01).mint(1);

      await expect(tx).to.be.revertedWith(
        BasicErrors.PublicMintClosed,
      );
    });

    it("Should revert if max supply has reached max", async () => {
      await basic.setPublicMintState(true);
      const amount = BigNumber.from(1000);
      await basic
        .connect(acc01)
        .mint(1000, { value: price.mul(amount) });
      const tx = basic
        .connect(acc02)
        .mint(1, { value: price });

      await expect(tx).to.be.revertedWith(
        BasicErrors.MaxSupplyReached,
      );
    });

    it("Should revert if price is wrong", async () => {
      await basic.setPublicMintState(true);
      const tx = basic.connect(acc02).mint(1, { value: 0 });

      await expect(tx).to.be.revertedWith(
        BasicErrors.WrongPrice,
      );
    });

    it("Should mint, update storage and emit events", async () => {
      await basic.setPublicMintState(true);
      const tx = await basic
        .connect(acc02)
        .mint(1, { value: price });
      const from = ethers.constants.AddressZero;
      const ownerOf = await basic.callStatic.ownerOf(1);
      const bal = await basic.callStatic.balanceOf(
        acc02.address,
        1,
      );

      expect(tx).to.be.ok;
      expect(1).to.eq(bal);
      expect(acc02.address).to.eq(ownerOf);
      await expect(tx)
        .to.emit(basic, "TransferSingle")
        .withArgs(acc02.address, from, acc02.address, 1, 1);
    });

    it("Should handle multiple mints", async () => {
      await basic.setPublicMintState(true);

      const txamount = BigNumber.from(10);
      const tx2amount = BigNumber.from(68);
      const tx3amount = BigNumber.from(100);
      const tx4amount = BigNumber.from(500);
      const tx5amount = BigNumber.from(322);

      const tx1 = await basic
        .connect(acc01)
        .mint(10, { value: price.mul(txamount) });
      const tx2 = await basic
        .connect(acc02)
        .mint(68, { value: price.mul(tx2amount) });
      const tx3 = await basic
        .connect(acc02)
        .mint(100, { value: price.mul(tx3amount) });
      const tx4 = await basic
        .connect(acc02)
        .mint(500, { value: price.mul(tx4amount) });
      const tx5 = await basic
        .connect(acc02)
        .mint(322, { value: price.mul(tx5amount) });

      expect(tx1).to.be.ok;
      expect(tx2).to.be.ok;
      expect(tx3).to.be.ok;
      expect(tx4).to.be.ok;
      expect(tx5).to.be.ok;
    });
  });
  describe("Batch mint", async () => {
    it("Should revert if supply has reached max", async () => {
      await basic.setPublicMintState(true);
      const id = [24];
      const amount = ethers.BigNumber.from(1000);
      await basic.mint(1000, { value: price.mul(amount) });
      const tx = basic
        .connect(mad)
        .mintBatch(id, { value: price });

      await expect(tx).to.be.revertedWith(
        BasicErrors.MaxSupplyReached,
      );
    });
    it("Should revert if public mint is turned off", async () => {
      // await basic.setPublicMintState(true);
      const id = [25];
      const tx = basic
        .connect(acc01)
        .mint(id, { value: price });

      await expect(tx).to.be.revertedWith(
        BasicErrors.PublicMintClosed,
      );
    });
    it("Should revert if price is wrong", async () => {
      await basic.setPublicMintState(true);
      const amount = ethers.BigNumber.from(4);
      const ids = [23, 13, 400];
      const tx = basic.mintBatch(ids, {
        value: price.mul(amount),
      });

      await expect(tx).to.be.revertedWith(
        BasicErrors.WrongPrice,
      );
    });
    it("Should batch mint, update storage and emit events", async () => {
      await basic.setPublicMintState(true);
      const dead = ethers.constants.AddressZero;
      const amount = ethers.BigNumber.from(3);
      const one = ethers.constants.One;
      const zero = ethers.constants.Zero;
      const ids = [123, 14, 500];
      const amounts = [one, one, one];
      const tx = await basic
        .connect(acc02)
        .mintBatch(ids, { value: price.mul(amount) });
      const ownerOfNull = await basic.callStatic.ownerOf(1);
      const ownerOfA = await basic.callStatic.ownerOf(123);
      const ownerOfB = await basic.callStatic.ownerOf(14);
      const ownerOfC = await basic.callStatic.ownerOf(500);
      const balNull = await basic.callStatic.balanceOf(
        acc02.address,
        1,
      );
      const balA = await basic.callStatic.balanceOf(
        acc02.address,
        123,
      );
      const balB = await basic.callStatic.balanceOf(
        acc02.address,
        14,
      );
      const balC = await basic.callStatic.balanceOf(
        acc02.address,
        500,
      );

      expect(tx).to.be.ok;
      expect(zero).to.eq(balNull);
      expect(one).to.eq(balA);
      expect(one).to.eq(balB);
      expect(one).to.eq(balC);
      expect(dead).to.eq(ownerOfNull);
      expect(acc02.address).to.eq(ownerOfA);
      expect(acc02.address).to.eq(ownerOfB);
      expect(acc02.address).to.eq(ownerOfC);
      await expect(tx)
        .to.emit(basic, "TransferBatch")
        .withArgs(
          acc02.address,
          dead,
          acc02.address,
          ids,
          amounts,
        );
    });
    it("Should handle multiple batch mints", async () => {
      await basic.setPublicMintState(true);
      const dead = ethers.constants.AddressZero;
      const amount = ethers.BigNumber.from(3);
      const one = ethers.constants.One;
      const zero = ethers.constants.Zero;
      const ids1 = [123, 14, 500];
      const ids2 = [566, 145, 1000];
      const ids3 = [1, 33, 7];
      const amounts = [one, one, one];
      const tx1 = await basic
        .connect(acc02)
        .mintBatch(ids1, { value: price.mul(amount) });
      const tx2 = await basic
        .connect(owner)
        .mintBatch(ids2, { value: price.mul(amount) });
      const tx3 = await basic
        .connect(amb)
        .mintBatch(ids3, { value: price.mul(amount) });
      const ownerOfNull = await basic.callStatic.ownerOf(0);
      const ownerOfA = await basic.callStatic.ownerOf(
        ids1[0],
      );
      const ownerOfB = await basic.callStatic.ownerOf(
        ids2[1],
      );
      const ownerOfC = await basic.callStatic.ownerOf(
        ids3[2],
      );
      const balNull = await basic.callStatic.balanceOf(
        acc02.address,
        0,
      );
      const balA = await basic.callStatic.balanceOf(
        acc02.address,
        ids1[2],
      );
      const balB = await basic.callStatic.balanceOf(
        owner.address,
        ids2[2],
      );
      const balC = await basic.callStatic.balanceOf(
        amb.address,
        ids3[0],
      );

      expect(tx1).to.be.ok;
      expect(tx2).to.be.ok;
      expect(tx3).to.be.ok;
      expect(zero).to.eq(balNull);
      expect(one).to.eq(balA);
      expect(one).to.eq(balB);
      expect(one).to.eq(balC);
      expect(dead).to.eq(ownerOfNull);
      expect(acc02.address).to.eq(ownerOfA);
      expect(owner.address).to.eq(ownerOfB);
      expect(amb.address).to.eq(ownerOfC);
      await expect(tx1)
        .to.emit(basic, "TransferBatch")
        .withArgs(
          acc02.address,
          dead,
          acc02.address,
          ids1,
          amounts,
        );
      await expect(tx2)
        .to.emit(basic, "TransferBatch")
        .withArgs(
          owner.address,
          dead,
          owner.address,
          ids2,
          amounts,
        );
      await expect(tx3)
        .to.emit(basic, "TransferBatch")
        .withArgs(
          amb.address,
          dead,
          amb.address,
          ids3,
          amounts,
        );
    });
  });

  describe("Burn", async () => {
    it("Should revert if not owner", async () => {
      const ids = [1];
      const tx = basic.connect(acc02).burn(ids);

      await expect(tx).to.be.revertedWith(
        BasicErrors.Unauthorized,
      );
    });

    it("Should revert if id is already burnt/hasn't been minted", async () => {
      const amount = ethers.BigNumber.from(4);
      const ids = [1, 2, 5];
      await basic.setPublicMintState(true);
      await basic
        .connect(acc02)
        .mint(4, { value: price.mul(amount) });
      const tx = basic.connect(owner).burn(ids);

      await expect(tx).to.be.revertedWith(
        BasicErrors.NotMinted,
      );
    });
    it("Should revert if ids length is less than 2", async () => {
      await expect(basic.burn([1])).to.be.revertedWith(
        BasicErrors.DecrementOverflow,
      );
    });

    it("Should burn tokens, update storage and emit event", async () => {
      const amount = ethers.BigNumber.from(2);
      await basic.setPublicMintState(true);
      await basic
        .connect(acc02)
        .mint(2, { value: price.mul(amount) });
      await basic
        .connect(acc01)
        .mint(2, { value: price.mul(amount) });
      const ids = [1, 2, 3, 4];
      const tx = await basic.burn(ids);
      const dead = ethers.constants.AddressZero;
      const bal1 = await basic.callStatic.balanceOf(
        acc01.address,
        1,
      );
      const bal2 = await basic.callStatic.balanceOf(
        acc02.address,
        3,
      );

      expect(tx).to.be.ok;
      expect(bal1).to.eq(0);
      expect(bal2).to.eq(0);

      await expect(tx)
        .to.emit(basic, "TransferSingle")
        .withArgs(owner.address, acc02.address, dead, 1, 1);
      await expect(tx)
        .to.emit(basic, "TransferSingle")
        .withArgs(owner.address, acc02.address, dead, 2, 1);
      await expect(tx)
        .to.emit(basic, "TransferSingle")
        .withArgs(owner.address, acc01.address, dead, 3, 1);
      await expect(tx)
        .to.emit(basic, "TransferSingle")
        .withArgs(owner.address, acc01.address, dead, 4, 1);
    });
  });
  describe("Batch burn", async () => {
    it("Should revert if caller is not the owner", async () => {
      const amount = ethers.BigNumber.from(3);
      const ids = [1, 2, 3];
      await basic.setPublicMintState(true);
      await basic.mint(3, { value: price.mul(amount) });
      const tx = basic
        .connect(acc02)
        .burnBatch(owner.address, ids);

      await expect(tx).to.be.revertedWith(
        BasicErrors.Unauthorized,
      );
    });
    it("Should revert if id is already burnt/hasn't been minted", async () => {
      const amount = ethers.BigNumber.from(4);
      const ids = [1, 2, 5];
      await basic.setPublicMintState(true);
      await basic
        .connect(acc02)
        .mint(4, { value: price.mul(amount) });
      const tx = basic
        .connect(owner)
        .burnBatch(acc02.address, ids);

      await expect(tx).to.be.revertedWith(
        BasicErrors.WrongFrom,
      );
    });
    it("Should batch burn tokens, update storage and emit event", async () => {
      const dead = ethers.constants.AddressZero;
      const one = ethers.constants.One;
      const amounts = [one, one];
      const amount = ethers.BigNumber.from(2);
      await basic.setPublicMintState(true);
      await basic
        .connect(acc02)
        .mint(2, { value: price.mul(amount) });
      await basic
        .connect(acc01)
        .mint(2, { value: price.mul(amount) });
      const ids1 = [1, 2];
      const ids2 = [3, 4];
      const tx1 = await basic.burnBatch(acc02.address, ids1);
      const tx2 = await basic.burnBatch(acc01.address, ids2);
      const bal1 = await basic.callStatic.balanceOf(
        acc02.address,
        1,
      );
      const bal2 = await basic.callStatic.balanceOf(
        acc02.address,
        2,
      );
      const bal3 = await basic.callStatic.balanceOf(
        acc01.address,
        3,
      );
      const bal4 = await basic.callStatic.balanceOf(
        acc01.address,
        4,
      );

      expect(tx1).to.be.ok;
      expect(tx2).to.be.ok;
      expect(bal1).to.eq(0);
      expect(bal2).to.eq(0);
      expect(bal3).to.eq(0);
      expect(bal4).to.eq(0);

      await expect(tx1)
        .to.emit(basic, "TransferBatch")
        .withArgs(
          owner.address,
          acc02.address,
          dead,
          ids1,
          amounts,
        );
      await expect(tx2)
        .to.emit(basic, "TransferBatch")
        .withArgs(
          owner.address,
          acc01.address,
          dead,
          ids2,
          amounts,
        );
    });
    it("Should handle multiple batch burns", async () => {
      const dead = ethers.constants.AddressZero;
      const one = ethers.constants.One;
      const amounts = [one, one, one, one, one];
      const amount = ethers.BigNumber.from(20);
      await basic.setPublicMintState(true);
      await basic
        .connect(acc02)
        .mint(20, { value: price.mul(amount) });
      const ids1 = [1, 2, 3, 4, 5];
      const ids2 = [6, 7, 8, 9, 10];
      const ids3 = [11, 12, 13, 14, 15];
      const ids4 = [16, 17, 18, 19, 20];
      const tx1 = await basic.burnBatch(acc02.address, ids1);
      const tx2 = await basic.burnBatch(acc02.address, ids2);
      const tx3 = await basic.burnBatch(acc02.address, ids3);
      const tx4 = await basic.burnBatch(acc02.address, ids4);

      expect(tx1).to.be.ok;
      expect(tx2).to.be.ok;
      expect(tx3).to.be.ok;
      expect(tx4).to.be.ok;
      await expect(tx1)
        .to.emit(basic, "TransferBatch")
        .withArgs(
          owner.address,
          acc02.address,
          dead,
          ids1,
          amounts,
        );
      await expect(tx2)
        .to.emit(basic, "TransferBatch")
        .withArgs(
          owner.address,
          acc02.address,
          dead,
          ids2,
          amounts,
        );
      await expect(tx3)
        .to.emit(basic, "TransferBatch")
        .withArgs(
          owner.address,
          acc02.address,
          dead,
          ids3,
          amounts,
        );
      await expect(tx4)
        .to.emit(basic, "TransferBatch")
        .withArgs(
          owner.address,
          acc02.address,
          dead,
          ids4,
          amounts,
        );
    });
  });

  describe("Withdraw", async () => {
    it("Should withdraw contract's funds", async () => {
      const amount = ethers.BigNumber.from(999);
      await basic.setPublicMintState(true);
      await basic
        .connect(acc02)
        .mint(999, { value: price.mul(amount) });
      const oldOwnerBal = await ethers.provider.getBalance(
        basic.address,
      );
      const oldContractBal = await ethers.provider.getBalance(
        owner.address,
      );
      const tx = await basic.withdraw();

      expect(tx).to.be.ok;
      expect(oldOwnerBal).to.be.below(
        await ethers.provider.getBalance(owner.address),
      );
      expect(oldContractBal).to.be.above(
        await ethers.provider.getBalance(basic.address),
      );

      await expect(
        basic.connect(acc01).withdraw(),
      ).to.be.revertedWith(BasicErrors.Unauthorized);
    });

    it("Should withdraw contract's ERC20s", async () => {
      ({ erc20 } = await loadFixture(tokenFixture));
      await erc20.mint(basic.address, price);
      const bal = await erc20.callStatic.balanceOf(
        basic.address,
      );
      const balOwner = await erc20.callStatic.balanceOf(
        owner.address,
      );
      const tx = await basic.withdrawERC20(erc20.address);

      expect(tx).to.be.ok;
      expect(await erc20.balanceOf(basic.address)).to.eq(
        bal.sub(price),
      );
      expect(await erc20.balanceOf(owner.address)).to.eq(
        balOwner.add(price),
      );
    });
  });
  describe("Public getters", async () => {
    it("Should query royalty info", async () => {
      const share = BigNumber.from(750);
      const base = BigNumber.from(10000);
      const amount = price.mul(share).div(base);
      const tx = await basic.royaltyInfo(1, price);

      expect(tx[0]).to.eq(splitter.address);
      expect(tx[1]).to.eq(amount);
    });

    it("Should query token uri and revert if not yet minted", async () => {
      await basic.setPublicMintState(true);
      await basic.connect(acc01).mint(1, { value: price });
      const tx = await basic.callStatic.uri(1);
      const fail = basic.callStatic.uri(2);

      expect(tx).to.be.ok;
      expect(tx).to.eq("ipfs://cid/1.json");

      await expect(fail).to.be.revertedWith(
        BasicErrors.NotMintedYet,
      );
    });

    it("Should query total supply", async () => {
      const tx = await basic.callStatic.totalSupply();

      expect(tx).to.be.ok;
      expect(tx).to.eq(0);
    });

    it("Should query base uri", async () => {
      const base = "ipfs://cid/";
      const tx = await basic.callStatic.getURI();

      expect(tx).to.be.ok;
      expect(tx).to.eq(base);
    });
  });
  describe("Interface IDs", async () => {
    it("Should support interfaces", async () => {
      const erc165 =
        getInterfaceID(ERC165Interface).interfaceID._hex;
      const erc2981 = getInterfaceID(ERC2981Interface)
        .interfaceID._hex;
      const erc1155 = getInterfaceID(ERC1155Interface)
        .interfaceID._hex;
      const erc1155meta = getInterfaceID(
        ERC1155MetadataInterface,
      ).interfaceID._hex;

      const instrospec =
        await basic.callStatic.supportsInterface(erc165);
      const royalty =
        await basic.callStatic.supportsInterface(erc2981);
      const nft = await basic.callStatic.supportsInterface(
        erc1155,
      );
      const metadata =
        await basic.callStatic.supportsInterface(erc1155meta);

      await expect(instrospec).to.eq(true);
      await expect(royalty).to.eq(true);
      await expect(nft).to.eq(true);
      await expect(metadata).to.eq(true);
    });
  });
});
