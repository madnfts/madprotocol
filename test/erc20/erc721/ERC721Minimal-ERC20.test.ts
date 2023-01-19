import "@nomicfoundation/hardhat-chai-matchers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
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
  ERC721Minimal,
  MockERC20,
  SplitterImpl,
} from "../../../src/types";
import { MinimalErrors } from "./../../utils/errors";
import { minimalFixture721ERC20 } from "./../../utils/fixtures";
import {
  ERC165Interface,
  ERC721Interface,
  ERC721MetadataInterface,
  ERC2981Interface,
  getInterfaceID,
} from "./../../utils/interfaces";

// hint:
// import { BinaryLike, BinaryToTextEncoding, Encoding } from "crypto";

describe("ERC721Minimal - ERC20", () => {
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
  let minimal: ERC721Minimal;
  let erc20: MockERC20;

  const fundAmount: BigNumber =
    ethers.utils.parseEther("10000");
  const price: BigNumber = ethers.utils.parseEther("1");
  const erc20Balance: BigNumber =
    ethers.utils.parseEther("500");

  before("Set signers and reset network", async () => {
    [owner, amb, mad, acc01, acc02] =
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ethers as any).getSigners();

    await network.provider.send("hardhat_reset");
  });
  beforeEach("Load deployment fixtures", async () => {
    ({ minimal, splitter, erc20 } = await loadFixture(
      minimalFixture721ERC20,
    ));
    await erc20.transfer(acc01.address, erc20Balance);
    await erc20.transfer(acc02.address, erc20Balance);
  });

  describe("Init", async () => {
    it("Splitter and ERC721 should initialize with ERC20", async () => {
      // const { minimal, splitter } = await minimalFixture();
      // const { splitter } = await splitterFixture();
      await minimal.deployed();
      await splitter.deployed();
      expect(minimal).to.be.ok;
      expect(splitter).to.be.ok;
      expect(await minimal.callStatic.name()).to.eq(
        "721Minimal",
      );
      expect(await minimal.callStatic.symbol()).to.eq("MIN");
      expect(await minimal.callStatic.price()).to.eq(price);
      expect(await minimal.callStatic.splitter()).to.eq(
        splitter.address,
      );
      expect(await minimal.callStatic.erc20()).to.eq(
        erc20.address,
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
      await expect(await minimal.deployTransaction)
        .to.emit(minimal, "RoyaltyFeeSet")
        .withArgs(750)
        .and.to.emit(minimal, "RoyaltyRecipientSet")
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
  describe("Safe Minting", async () => {
    it("Should revert if not the owner", async () => {
      const tx = minimal
        .connect(acc01)
        .safeMint(acc01.address, acc01.address);

      await expect(tx).to.be.revertedWith(
        MinimalErrors.Unauthorized,
      );
    });

    it("Should mint, update storage and emit events", async () => {
      const tx: ContractTransaction = await minimal
        .connect(owner)
        .safeMint(acc02.address, acc02.address);
      const rc: ContractReceipt = await tx.wait();
      const event = rc.events?.find(
        event => event.event === "Transfer",
      );
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      const from = event?.args!["from"];
      const to = event?.args!["to"];
      const id = event?.args!["id"];
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
      const bal = await minimal.callStatic.balanceOf(
        acc02.address,
      );
      const ownerOf = await minimal.callStatic.ownerOf(1);

      expect(tx).to.be.ok;
      await expect(tx).to.emit(minimal, "Transfer");

      expect(1).to.eq(bal);
      expect(acc02.address).to.eq(ownerOf);
      expect(ethers.constants.AddressZero).to.eq(from);
      expect(acc02.address).to.eq(to);
      expect(1).to.eq(id);
    });

    it("Should revert if already minted", async () => {
      await minimal
        .connect(owner)
        .safeMint(acc01.address, acc01.address);
      const tx = minimal
        .connect(owner)
        .safeMint(acc02.address, acc02.address);

      await expect(tx).to.be.revertedWithCustomError(
        minimal,
        MinimalErrors.AlreadyMinted,
      );
    });
  });

  describe("Burning", async () => {
    it("Should revert if has not been minted", async () => {
      const tx = minimal.connect(owner).burn(owner.address);

      await expect(tx).to.be.revertedWith(
        MinimalErrors.NotMinted,
      );
    });

    it("Should revert if not the owner", async () => {
      await minimal
        .connect(owner)
        .safeMint(acc02.address, acc02.address);
      const tx = minimal.connect(acc01).burn(owner.address);

      await expect(tx).to.be.revertedWith(
        MinimalErrors.Unauthorized,
      );
    });

    it("Should burn, update storage and emit events", async () => {
      await minimal
        .connect(owner)
        .safeMint(acc02.address, acc02.address);
      const tx: ContractTransaction = await minimal
        .connect(owner)
        .burn(owner.address);
      const rc: ContractReceipt = await tx.wait();
      const event = rc.events?.find(
        event => event.event === "Transfer",
      );
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      const from = event?.args!["from"];
      const to = event?.args!["to"];
      const id = event?.args!["id"];
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
      const bal = await minimal.callStatic.balanceOf(
        acc02.address,
      );
      const getApproved =
        await minimal.callStatic.getApproved(1);

      await expect(minimal.ownerOf(1)).to.be.revertedWith(
        MinimalErrors.NotMinted,
      );
      await expect(tx).to.emit(minimal, "Transfer");

      expect(getApproved).to.eq(ethers.constants.AddressZero);
      expect(tx).to.be.ok;
      expect(0).to.eq(bal);
      expect(acc02.address).to.eq(from);
      expect(ethers.constants.AddressZero).to.eq(to);
      expect(1).to.eq(id);
    });

    it("Should revert if already burned", async () => {
      await minimal
        .connect(owner)
        .safeMint(acc02.address, acc02.address);
      await minimal.connect(owner).burn(owner.address);

      await expect(
        minimal.burn(owner.address),
      ).to.be.revertedWith(MinimalErrors.NotMinted);
    });
  });

  describe("Public Minting", async () => {
    it("Should update public mint state", async () => {
      const tx = minimal
        .connect(owner)
        .setPublicMintState(true);

      await expect(
        minimal.connect(acc02).setPublicMintState(true),
      ).to.be.revertedWith(MinimalErrors.Unauthorized);
      await expect(
        await minimal.callStatic.publicMintState(),
      ).to.eq(true);
      await expect(tx).to.be.ok;
      await expect(tx).to.emit(minimal, "PublicMintStateSet");
    });

    it("Should revert if public mint is off", async () => {
      await expect(
        minimal.connect(acc01).publicMint(),
      ).to.be.revertedWithCustomError(
        minimal,
        MinimalErrors.PublicMintOff,
      );
    });

    it("Should revert if ERC20 price is wrong", async () => {
      await minimal.connect(owner).setPublicMintState(true);

      const erc20MintTx = await erc20
        .connect(acc02)
        .approve(
          minimal.address,
          ethers.utils.parseEther("0.25"),
        );
      expect(erc20MintTx).to.be.ok;

      await expect(
        minimal.connect(acc02).publicMint(),
      ).to.be.revertedWithCustomError(
        minimal,
        MinimalErrors.WrongPrice,
      );
    });

    it("Should mint with ERC20, then revert if already minted", async () => {
      await minimal.connect(owner).setPublicMintState(true);

      const erc20MintTx = await erc20
        .connect(acc02)
        .approve(minimal.address, price);
      expect(erc20MintTx).to.be.ok;

      await minimal.connect(acc02).publicMint();

      const erc20MintTx2 = await erc20
        .connect(acc01)
        .approve(minimal.address, price);
      expect(erc20MintTx2).to.be.ok;

      await expect(
        minimal.connect(acc01).publicMint(),
      ).to.be.revertedWithCustomError(
        minimal,
        MinimalErrors.AlreadyMinted,
      );
    });

    it("Should mint with ERC20, update storage and emit events", async () => {
      await minimal.connect(owner).setPublicMintState(true);

      const erc20MintTx = await erc20
        .connect(acc02)
        .approve(minimal.address, price);
      expect(erc20MintTx).to.be.ok;

      const tx: ContractTransaction = await minimal
        .connect(acc02)
        .publicMint();
      const rc: ContractReceipt = await tx.wait();
      const event = rc.events?.find(
        event => event.event === "Transfer",
      );
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      const from = event?.args!["from"];
      const to = event?.args!["to"];
      const id = event?.args!["id"];
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
      const bal = await minimal.callStatic.balanceOf(
        acc02.address,
      );
      const ownerOf = await minimal.callStatic.ownerOf(1);
      const cBal = await erc20
        .connect(minimal.address)
        .balanceOf(minimal.address);

      expect(tx).to.be.ok;
      await expect(tx).to.emit(minimal, "Transfer");
      expect(cBal).to.eq(price);
      expect(from).to.eq(ethers.constants.AddressZero);
      expect(to).to.eq(acc02.address);
      expect(id).to.eq(1);
      expect(bal).to.eq(1);
      expect(ownerOf).to.eq(acc02.address);
    });
  });

  describe("Withdrawing", async () => {
    it("Should revert if not the owner", async () => {
      await minimal.connect(owner).setPublicMintState(true);

      const erc20MintTx = await erc20
        .connect(acc02)
        .approve(minimal.address, price);
      expect(erc20MintTx).to.be.ok;

      await minimal.connect(acc02).publicMint();

      await expect(
        minimal.connect(acc01).withdraw(),
      ).to.be.revertedWith(MinimalErrors.Unauthorized);
    });

    it("Should update ERC20 balances of contract and owner", async () => {
      await minimal.connect(owner).setPublicMintState(true);

      const erc20MintTx = await erc20
        .connect(acc02)
        .approve(minimal.address, price);
      expect(erc20MintTx).to.be.ok;

      await minimal.connect(acc02).publicMint();

      const addrs = [
        mad.address,
        amb.address,
        owner.address,
        minimal.address,
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
        minimal.withdrawERC20(erc20.address),
      ).to.changeTokenBalances(erc20, addrs, vals);

      expect(
        await ethers.provider.getBalance(minimal.address),
      ).to.eq(ethers.constants.Zero);
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

      await erc20.mint(minimal.address, price);

      const tx = await minimal.withdrawERC20(erc20.address);
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
        await erc20.callStatic.balanceOf(minimal.address),
      ).to.eq(ethers.constants.Zero);
    });
  });

  describe("Royalties", async () => {
    it("Should retrive royalty info", async () => {
      // const { splitter } = await splitterFixture();
      const share = BigNumber.from(750);
      const base = BigNumber.from(10000);
      const amount = price.mul(share).div(base);
      const tx = await minimal.royaltyInfo(1, price);
      expect(tx[0]).to.eq(splitter.address);
      expect(tx[1]).to.eq(amount);
    });
  });

  describe("Token URI", async () => {
    it("Should revert if ID is not 1", async () => {
      await expect(
        minimal.tokenURI(2),
      ).to.be.revertedWithCustomError(
        minimal,
        MinimalErrors.InvalidId,
      );
    });

    it("Should revert if token was not minted", async () => {
      await expect(
        minimal.tokenURI(1),
      ).to.be.revertedWithCustomError(
        minimal,
        MinimalErrors.NotMintedBytes4,
      );
    });

    it("Should retrieve tokenURI", async () => {
      const erc20MintTx = await erc20
        .connect(acc01)
        .approve(minimal.address, price);
      expect(erc20MintTx).to.be.ok;
      await minimal
        .connect(owner)
        .safeMint(acc01.address, acc01.address);
      const tx = await minimal.callStatic.tokenURI(1);
      const uri: string = "ipfs://cid/id.json";

      expect(tx).to.be.ok;
      expect(uri).to.eq(tx);
    });
  });

  describe("Interface IDs", async () => {
    it("Should support interfaces", async () => {
      const erc165 =
        getInterfaceID(ERC165Interface).interfaceID._hex;
      const erc2981 = getInterfaceID(ERC2981Interface)
        .interfaceID._hex;
      const erc721 =
        getInterfaceID(ERC721Interface).interfaceID._hex;
      const erc721meta = getInterfaceID(
        ERC721MetadataInterface,
      ).interfaceID._hex;

      const instrospec =
        await minimal.callStatic.supportsInterface(erc165);
      const royalty =
        await minimal.callStatic.supportsInterface(erc2981);
      const nft = await minimal.callStatic.supportsInterface(
        erc721,
      );
      const metadata =
        await minimal.callStatic.supportsInterface(
          erc721meta,
        );

      await expect(instrospec).to.eq(true);
      await expect(royalty).to.eq(true);
      await expect(nft).to.eq(true);
      await expect(metadata).to.eq(true);
    });
  });
});
