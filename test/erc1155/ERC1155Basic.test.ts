import "@nomicfoundation/hardhat-chai-matchers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import {
  BigNumber,
  ContractTransaction,
  Wallet,
} from "ethers";
import { ethers, network } from "hardhat";

import {
  ERC1155Basic,
  MockERC20,
  SplitterImpl,
} from "../../src/types";
import { BasicErrors } from "../utils/errors";
import {
  basicFixture1155,
  maxSupply, // erc20Fixture,
} from "../utils/fixtures";
import {
  ERC165Interface,
  ERC1155Interface,
  ERC1155MetadataInterface,
  ERC2981Interface,
  getInterfaceID,
} from "../utils/interfaces";
import { dead } from "../utils/madFixtures";

type WalletWithAddress = Wallet & SignerWithAddress;

const feePrice = "0.25";

async function mintToken(
  basic: ERC1155Basic,
  acc: SignerWithAddress,
  tokenId: number,
  amountToMint: number,
  price: BigNumber,
): Promise<ContractTransaction> {
  await basic.setPublicMintState(true);
  const mintPrice = price.mul(amountToMint);
  const val = ethers.utils
    .parseEther(feePrice)
    .add(mintPrice);

  return basic.connect(acc).mint(amountToMint, tokenId, {
    value: mintPrice,
    gasLimit: ethers.utils.parseUnits("30000000", "wei"),
  });
}

async function mintAndCheck(
  basic: ERC1155Basic,
  user: WalletWithAddress,
  ids: number[],
  amounts: number[],
  price: BigNumber,
): Promise<void> {
  await basic.setPublicMintState(true);
  const dead = ethers.constants.AddressZero;
  const one = ethers.constants.One;
  const zero = ethers.constants.Zero;

  const amount = amounts.length;
  const totalPrice = amount * _sumAmounts(amounts);

  // Minting operation
  const tx = await basic
    .connect(user)
    .mintBatch(ids, amounts, {
      value: price.mul(ethers.BigNumber.from(totalPrice)),
    });

  expect(tx).to.be.ok;

  await expect(tx)
    .to.emit(basic, "TransferBatch")
    .withArgs(user.address, dead, user.address, ids, amounts);

  // Balances checking
  const balNull = await basic.callStatic.balanceOf(
    user.address,
    0,
  );
  expect(zero).to.eq(balNull);

  for (let i = 0; i < ids.length; i++) {
    const bal = await basic.callStatic.balanceOf(
      user.address,
      ids[i],
    );
    expect(amounts[i]).to.eq(bal);
  }

  await expect(tx)
    .to.emit(basic, "TransferBatch")
    .withArgs(user.address, dead, user.address, ids, amounts);
}

function _sumAmounts(amounts: number[]): number {
  return amounts.reduce((a, b) => a + b, 0);
}

describe("ERC1155Basic", () => {
  /* 
  For the sake of solely testing the nft functionalities, we consider 
  the user as the contract's owner, and the marketplace just as the 
  recipient for the royalties distribution; even though these tx 
  would've been proxied through the marketplace address when the 
  other core contracts are taken into account.
  */

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

  const fundAmount: BigNumber =
    ethers.utils.parseEther("10000");
  const price: BigNumber = ethers.utils.parseEther("1");
  const change = "https://etherscan.io/address/";

  before("Set signers and reset network", async () => {
    [owner, amb, mad, acc01, acc02] =
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ethers as any).getSigners();

    await network.provider.send("hardhat_reset");
  });

  beforeEach("Load deployment fixtures", async () => {
    ({ basic, splitter } = await loadFixture(
      basicFixture1155,
    ));
  });

  describe("Init", async () => {
    it("Splitter and ERC1155 should initialize", async () => {
      await basic.deployed();
      await splitter.deployed();

      expect(basic).to.be.ok;
      expect(splitter).to.be.ok;
      expect(await basic.callStatic.getOwner()).to.eq(
        owner.address,
      );
      expect(await basic.callStatic.getRouter()).to.eq(
        mad.address,
      );

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
      expect(await splitter.callStatic._payees(0)).to.eq(
        mad.address,
      );
      expect(await splitter.callStatic._payees(1)).to.eq(
        amb.address,
      );
      expect(await splitter.callStatic._payees(2)).to.eq(
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
      const set = await basic
        .connect(owner)
        .setBaseURI(change);
      const check = await basic.callStatic.baseURI();
      const setFail = basic.connect(acc01).setBaseURI("fail");

      expect(set).to.be.ok;
      expect(check).to.eq(change);

      await expect(set)
        .to.emit(basic, "BaseURISet")
        .withArgs(change);
      await expect(setFail).to.be.revertedWithCustomError(
        basic,
        BasicErrors.NotAuthorised,
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
      await expect(setFail).to.be.revertedWithCustomError(
        basic,
        BasicErrors.NotAuthorised,
      );
    });
  });
  describe("Mint", async () => {
    it("Should revert if public mint is turned off", async () => {
      const tx = basic.connect(acc01).mint(1, 1);

      await expect(tx).to.be.revertedWithCustomError(
        basic,
        BasicErrors.PublicMintClosed,
      );
    });

    it("Should revert if max supply has reached max", async () => {
      await mintToken(basic, acc01, 1, 500, price);
      await mintToken(basic, acc01, 1, 500, price);

      const tx = mintToken(basic, acc02, 1, 1, price);

      await expect(tx).to.be.revertedWithCustomError(
        basic,
        BasicErrors.MaxSupplyReached,
      );
    });

    it("Should revert if price is wrong", async () => {
      const tx = mintToken(
        basic,
        acc02,
        1,
        1,
        ethers.utils.parseEther("0"),
      );

      await expect(tx).to.be.revertedWithCustomError(
        basic,
        BasicErrors.WrongPrice,
      );
    });

    it("Should mint, update storage and emit events", async () => {
      const tx = await mintToken(basic, acc02, 1, 1, price);

      const from = ethers.constants.AddressZero;
      // const ownerOf = await basic.callStatic.ownerOf(1);
      const bal = await basic.callStatic.balanceOf(
        acc02.address,
        1,
      );

      expect(tx).to.be.ok;
      expect(1).to.eq(bal);
      // expect(acc02.address).to.eq(ownerOf);
      await expect(tx)
        .to.emit(basic, "TransferSingle")
        .withArgs(acc02.address, from, acc02.address, 1, 1);
    });

    it("Should handle multiple mints", async () => {
      await basic.setPublicMintState(true);
      let numberOfMints = 10;
      for (let i = 0; i < numberOfMints; i++) {
        const randomAmount =
          Math.floor(Math.random() * 91) + 10; // generates a random number between 10-100

        const tx = await mintToken(
          basic,
          acc02,
          1,
          randomAmount,
          price,
        );
        expect(tx).to.be.ok;
        const balA = await basic.callStatic.balanceOf(
          acc02.address,
          1,
        );
        expect(balA).to.eq(1);
      }
    });
  });
  describe("Batch mint", async () => {
    it("Should revert if supply has reached max", async () => {
      await basic.setPublicMintState(true);

      const ids = [24, 34, 567, 765];
      await mintToken(basic, acc01, 1, 500, price);
      await mintToken(basic, acc01, 1, 500, price);

      const tx = basic
        .connect(mad)
        .mintBatch(ids, [1, 1, 1, 1], { value: price });

      await expect(tx).to.be.revertedWithCustomError(
        basic,
        BasicErrors.MaxSupplyReached,
      );
    });
    it("Should revert if public mint is turned off", async () => {
      const id = [25];
      const tx = basic
        .connect(acc01)
        .mint(id, [1], { value: price });

      await expect(tx).to.be.revertedWithCustomError(
        basic,
        BasicErrors.PublicMintClosed,
      );
    });
    it("Should revert if price is wrong", async () => {
      await basic.setPublicMintState(true);
      const amount = ethers.BigNumber.from(4);
      const ids = [23, 13, 400];
      const tx = basic.mintBatch(ids, [1, 1, 1], {
        value: price.mul(amount),
      });

      await expect(tx).to.be.revertedWithCustomError(
        basic,
        BasicErrors.WrongPrice,
      );
    });

    it("Should batch mint, update storage and emit events", async () => {
      const ids = [123, 14, 500];
      const amounts = [12, 8, 10];
      await mintAndCheck(basic, acc02, ids, amounts, price);
    });
    it("Should handle multiple batch mints", async () => {
      const ids1 = [123, 14, 500];
      const ids2 = [566, 145, 1000];

      const ids3 = [1, 33, 7];
      const amounts = [42, 24, 4];

      await mintAndCheck(basic, acc02, ids1, amounts, price);
      await mintAndCheck(basic, acc02, ids2, amounts, price);
      await mintAndCheck(basic, acc02, ids3, amounts, price);
    });
  });

  describe("Burn", async () => {
    it("Should revert if not owner", async () => {
      const ids = [1];
      const tx = basic
        .connect(acc02)
        .burn([acc01.address], ids, [1], acc02.address);

      await expect(tx).to.be.revertedWithCustomError(
        basic,
        BasicErrors.NotAuthorised,
      );
    });

    it("Should revert if id is already burnt/hasn't been minted", async () => {
      const amount = ethers.BigNumber.from(4);
      const ids = [1, 2, 5];
      await basic.setPublicMintState(true);
      await basic
        .connect(acc02)
        .mint(4, 1, { value: price.mul(amount) });
      const tx = basic
        .connect(owner)
        .burn(
          [acc02.address, acc02.address, acc02.address],
          ids,
          [1, 1, 1],
          owner.address,
        );

      await expect(tx).to.be.revertedWith(
        BasicErrors.InvalidAmount,
      );
    });
    it("Should revert if ids length is less than 2", async () => {
      const counters = await ethers.getContractFactory(
        "Counters",
      );
      await expect(
        basic.burn([acc02.address], [1], [1], owner.address),
      ).to.be.revertedWithCustomError(
        counters,
        BasicErrors.DecrementOverflow,
      );
    });

    it("Should mint, burn then mint again, update storage and emit event", async () => {
      //ID 1,2 will be minted in first mint call
      //ID 3,4 will be minted in second mint call
      //ID 1,2 will be burn in burn call
      //ID 5,6 will be minted in third mint call. so mintCounter will be 6 in last
      const amount = ethers.BigNumber.from(2);
      await basic.setPublicMintState(true);
      await basic
        .connect(acc02)
        .mint(2, 1, { value: price.mul(amount) }); // mintCount = 2

      await basic
        .connect(acc01)
        .mint(2, 1, { value: price.mul(amount) }); // mintCount = 4

      // this will not effect mintCount as we are not decrementing the counter, only the liveSupply is decrementing
      const tx = await basic.burn(
        [acc02.address, acc02.address],
        [1, 2],
        [1, 1],
        owner.address,
      );
      const dead = ethers.constants.AddressZero;
      await basic
        .connect(acc02)
        .mint(2, 2, { value: price.mul(amount) }); // mintCount = 6

      const bal1 = await basic.callStatic.balanceOf(
        acc01.address,
        4,
      );
      const mintCounter = await basic.callStatic.mintCount();

      expect(tx).to.be.ok;
      expect(bal1).to.eq(1);
      expect(mintCounter).to.eq(6);
      await expect(tx)
        .to.emit(basic, "TransferSingle")
        .withArgs(owner.address, acc02.address, dead, 1, 1);
      await expect(tx)
        .to.emit(basic, "TransferSingle")
        .withArgs(owner.address, acc02.address, dead, 2, 1);

      const tx2 = await basic.burn(
        [acc01.address, acc01.address],
        [3, 4],
        [1, 1],
        owner.address,
      );

      const bal2 = await basic.callStatic.balanceOf(
        acc02.address,
        3,
      );

      expect(tx2).to.be.ok;
      expect(bal2).to.eq(0);

      await expect(tx2)
        .to.emit(basic, "TransferSingle")
        .withArgs(owner.address, acc01.address, dead, 3, 1);
      await expect(tx2)
        .to.emit(basic, "TransferSingle")
        .withArgs(owner.address, acc01.address, dead, 4, 1);
    });
  });
  describe("Batch burn", async () => {
    it("Should revert if caller is not the owner", async () => {
      const amount = ethers.BigNumber.from(3);
      const ids = [1, 2, 3];
      await basic.setPublicMintState(true);
      await basic.mint(3, 1, { value: price.mul(amount) });
      const tx = basic
        .connect(acc02)
        .burnBatch(
          owner.address,
          ids,
          [1, 1, 1],
          acc02.address,
        );

      await expect(tx).to.be.revertedWithCustomError(
        basic,
        BasicErrors.NotAuthorised,
      );
    });
    it("Should revert if id is already burnt/hasn't been minted", async () => {
      const amount = ethers.BigNumber.from(4);
      const ids = [1, 2, 5];
      await basic.setPublicMintState(true);
      await basic
        .connect(acc02)
        .mint(4, 1, { value: price.mul(amount) });
      const tx = basic
        .connect(owner)
        .burnBatch(
          acc02.address,
          ids,
          [1, 1, 1],
          owner.address,
        );

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
        .mint(2, 1, { value: price.mul(amount) });
      await basic
        .connect(acc01)
        .mint(2, 1, { value: price.mul(amount) });
      const ids1 = [1, 2];
      const ids2 = [3, 4];
      const tx1 = await basic.burnBatch(
        acc02.address,
        ids1,
        [1, 1],
        acc02.address,
      );
      const tx2 = await basic.burnBatch(
        acc01.address,
        ids2,
        [1, 1],
        acc01.address,
      );
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
        .mint(20, 1, { value: price.mul(amount) });
      const ids1 = [1, 2, 3, 4, 5];
      const ids2 = [6, 7, 8, 9, 10];
      const ids3 = [11, 12, 13, 14, 15];
      const ids4 = [16, 17, 18, 19, 20];
      const tx1 = await basic.burnBatch(
        acc02.address,
        ids1,
        [1, 1, 1, 1, 1],
        owner.address,
      );
      const tx2 = await basic.burnBatch(
        acc02.address,
        ids2,
        [1, 1, 1, 1, 1],
        owner.address,
      );
      const tx3 = await basic.burnBatch(
        acc02.address,
        ids3,
        [1, 1, 1, 1, 1],
        owner.address,
      );
      const tx4 = await basic.burnBatch(
        acc02.address,
        ids4,
        [1, 1, 1, 1, 1],
        owner.address,
      );

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
      await basic.setPublicMintState(true);
      await basic.connect(acc02).mint(1, 1, { value: price });

      const addrs = [
        mad.address,
        amb.address,
        owner.address,
        basic.address,
      ];
      const shares = [
        ethers.BigNumber.from(1000),
        ethers.BigNumber.from(2000),
        ethers.BigNumber.from(7000),
      ];
      const vals = [
        shares[0].mul(price).div(10_000),
        shares[1].mul(price).div(10_000),
        shares[2].mul(price).div(10_000),
        "-1000000000000000000",
      ];

      await expect(() =>
        basic.withdraw(dead),
      ).to.changeEtherBalances(addrs, vals);

      expect(
        await ethers.provider.getBalance(basic.address),
      ).to.eq(ethers.constants.Zero);

      await expect(
        basic.connect(acc01).withdraw(dead),
      ).to.be.revertedWithCustomError(
        basic,
        BasicErrors.NotAuthorised,
      );
    });
    it("Should withdraw contract's ERC20s", async () => {
      const prevBal = BigNumber.from(2).pow(255);
      const payees = [
        mad.address,
        amb.address,
        owner.address,
      ];
      const shares = [
        ethers.BigNumber.from(1000),
        ethers.BigNumber.from(2000),
        ethers.BigNumber.from(7000),
      ];
      const vals = [
        shares[0].mul(price).div(10_000),
        shares[1].mul(price).div(10_000),
        shares[2].mul(price).div(10_000).add(prevBal),
      ];
      const ERC20 = await ethers.getContractFactory(
        "MockERC20",
      );
      const erc20 = (await ERC20.deploy(
        prevBal,
      )) as MockERC20;

      await erc20.mint(basic.address, price);

      const tx = await basic.withdrawERC20(
        erc20.address,
        dead,
      );
      expect(tx).to.be.ok;
      expect(
        await erc20.callStatic.balanceOf(payees[0]),
      ).to.eq(vals[0]);
      expect(
        await erc20.callStatic.balanceOf(payees[1]),
      ).to.eq(vals[1]);
      expect(
        await erc20.callStatic.balanceOf(payees[2]),
      ).to.eq(vals[2]);
      expect(
        await erc20.callStatic.balanceOf(basic.address),
      ).to.eq(ethers.constants.Zero);
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
      await basic.connect(acc01).mint(1, 1, { value: price });
      const tx = await basic.callStatic.uri(1);

      expect(tx).to.be.ok;
      expect(tx).to.eq("ipfs://cid/1.json");

      await expect(
        basic.uri(2),
      ).to.be.revertedWithCustomError(
        basic,
        BasicErrors.NotMintedYet,
      );
    });

    it("Should query total supply", async () => {
      const tx = await basic.callStatic.totalSupply();

      expect(tx).to.be.ok;
      expect(tx).to.eq(0);
    });

    it("Should query mint count", async () => {
      const tx = await basic.callStatic.mintCount();
      expect(tx).to.be.ok;
      expect(tx).to.eq(0);
    });

    it("Should query base uri", async () => {
      const base = "ipfs://cid/";
      const tx = await basic.callStatic.baseURI();

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
