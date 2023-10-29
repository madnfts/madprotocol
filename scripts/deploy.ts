import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import { config } from "dotenv";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { resolve } from "path";

import { MockERC20 } from "../contracts/lib/test";

config({ path: resolve(__dirname, "./.env") });

const {
  UNISWAP_ROUTER,
  ERC20_TOKEN,
  feeCreateCollection,
  feeCreateCollectionErc20,
  feeCreateSplitter,
  feeCreateSplitterErc20,
  feeMint,
  feeMintErc20,
  feeBurn,
  feeBurnErc20,
} = process.env;

const _feeCreateCollection = ethers.utils.parseEther(
  feeCreateCollection,
);
const _feeCreateSplitter = ethers.utils.parseEther(
  feeCreateSplitter,
);
const _feeCreateCollectionErc20 = ethers.utils.parseEther(
  feeCreateCollectionErc20,
);
const _feeCreateSplitterErc20 = ethers.utils.parseEther(
  feeCreateSplitterErc20,
);

const _feeMint = ethers.utils.parseEther(feeMint);
const _feeBurn = ethers.utils.parseEther(feeBurn);
const _feeMintErc20 = ethers.utils.parseEther(feeMintErc20);
const _feeBurnErc20 = ethers.utils.parseEther(feeBurnErc20);

var deployedFactoryAddress = "";
var deployedRouterAddress = "";
var deployedErc20Address = "";
var deployedMarketplaceAddress = "";

const deployedDisplay = () => {
  console.log(`\n\n`);
  console.log(`Deployed Factory Address: ${deployedFactoryAddress}`);
  console.log(`Deployed Router Address: ${deployedRouterAddress}`);
  console.log(`Deployed ERC20 Address: ${deployedErc20Address}`);
  console.log(
    `Deployed Marketplace Address: ${deployedMarketplaceAddress}`,
  );
  console.log(`\n\n`);
}

const deployERC20 = async () => {
  const ERC20 = await ethers.getContractFactory("MockERC20");
  const erc20 = (await ERC20.deploy(
    "Mad Mock Eth",
    "mmEth",
    18,
    10,
  )) as MockERC20;
  deployedErc20Address = erc20.address;
  return erc20;
};

const deployMarketplace = async erc20Address => {
  const MADMarketplace721 = await ethers.getContractFactory(
    "MADMarketplace721",
  );
  const m721 = await MADMarketplace721.deploy(
    erc20Address,
    UNISWAP_ROUTER,
  );
  console.log(`ERC721 Marketplace address: ${m721.address}`);

  const MADMarketplace1155 = await ethers.getContractFactory(
    "MADMarketplace1155",
  );
  const m1155 = await MADMarketplace1155.deploy(
    erc20Address,
    UNISWAP_ROUTER,
  );
  deployedMarketplaceAddress = m721.address;
  return { m721, m1155 };
};

const deployFactory = async erc20Address => {
  const MADFactory = await ethers.getContractFactory(
    "MADFactory",
  );
  const factory = await MADFactory.deploy(erc20Address);
  deployedFactoryAddress = factory.address;
  return factory;
};

const deployRouter = async (
  erc20Address,
  factoryAddress,
  deployerAddress,
) => {
  const MADRouter = await ethers.getContractFactory(
    "MADRouter",
  );
  const router = await MADRouter.deploy(
    factoryAddress,
    erc20Address,
    deployerAddress,
  );
  deployedRouterAddress = router.address;
  return router;
};

const setRouterFees = async (
  router,
  erc20Address,
  _feeMint,
  _feeBurn,
  _feeMintErc20,
  _feeBurnErc20,
) => {
  console.log(`SETTING ROUTER FEES`);
  await router.setFees(_feeMint, _feeBurn);
  let setFeesMint = (await router.feeMint()) === _feeMint;
  let setFeesBurn = (await router.feeBurn()) === _feeBurn;
  if (!setFeesBurn) {
    console.log(
      `Error setting Router Burn Fee Not Set\nExpected Fee: ${_feeBurn}\nActual Fee: ${router.feeBurn()}`,
    );
  } else {
    console.log(`Router Burn Fee Set`);
  }
  if (!setFeesMint) {
    console.log(
      `Error setting Router Mint Fee Not Set\nExpected Fee: ${_feeMint}\nActual Fee: ${router.feeMint()}`,
    );
  } else {
    console.log(`Router Mint Fee Set`);
  }

  if (erc20Address != ethers.constants.AddressZero) {
    await router.setFeesErc20(_feeMintErc20, _feeBurnErc20);
    let setFeesMintErc20 =
      (await router.feeMintErc20()) === _feeMintErc20;
    let setFeesBurnErc20 =
      (await router.feeBurnErc20()) === _feeBurnErc20;
    if (!setFeesBurnErc20) {
      console.log(
        `Error setting Router Burn Fee ERC20 Not Set\nExpected Fee: ${_feeBurnErc20}\nActual Fee: ${router.feeBurnErc20()}`,
      );
    } else {
      console.log(`Router Burn ERC20 Fee Set`);
    }
    if (!setFeesMintErc20) {
      console.log(
        `Error setting Router Mint Fee ERC20 Not Set\nExpected Fee: ${_feeMintErc20}\nActual Fee: ${router.feeMintErc20()}`,
      );
    } else {
      console.log(`Router Mint ERC20 Fee Set`);
    }
  }
};

const setFactoryFees = async (
  factory,
  erc20Address,
  _feeCreateCollection,
  _feeCreateSplitter,
  _feeCreateCollectionErc20,
  _feeCreateSplitterErc20,
) => {
  console.log(`SETTING FACTORY FEES`);
  await factory.setFees(
    _feeCreateCollection,
    _feeCreateSplitter,
  );
  let setCreateFees =
    (await factory.feeCreateCollection()) ===
    _feeCreateCollection;

  if (!setCreateFees) {
    console.log(
      `Error setting Factory Fees Not Set\nExpected Fee: ${_feeCreateCollection}\nActual Fee: ${factory.feeCreateCollection()}`,
    );
  } else {
    console.log(`Factory Fees Set`);
  }

  if (erc20Address != ethers.constants.AddressZero) {
    await factory.setFeesErc20(
      _feeCreateCollectionErc20,
      _feeCreateSplitterErc20,
    );
    let setCreateFees =
      (await factory.feeCreateCollectionErc20()) ===
      _feeCreateCollectionErc20;
    if (!setCreateFees) {
      console.log(
        `Error setting Factory Fees Not Set\nExpected Fee: ${_feeCreateCollectionErc20}\nActual Fee: ${factory.feeCreateCollectionErc20()}`,
      );
    } else {
      console.log(`Factory ERC20 Fees Set`);
    }
  }
};

const setCollectionType = async (factory, collectionType, bytecode, name) => {
  console.log(`SETTING COLLECTION TYPE ${name}`);
  await factory.addCollectionType(collectionType, bytecode);
  var isDeployed =
    (await factory.collectionTypes(collectionType)) ===
    bytecode;
  if (!isDeployed) {
    console.log(`Collection Type ${name} Not Added..`);
  }
  else {
    console.log(`Collection Type ${name} Added..`);
  }

}

const main = async () => {
  let erc20Address = ethers.constants.AddressZero;
  const ERC721Basic = await ethers.getContractFactory(
    "ERC721Basic",
  );
  const ERC1155Basic = await ethers.getContractFactory(
    "ERC1155Basic",
  );

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with ${deployer.address}`);

  try {
    // Check token address
    if (ERC20_TOKEN === "mock") {
      let erc20 = await deployERC20();
      erc20Address = erc20.address;
    } else if (ERC20_TOKEN) {
      erc20Address = ERC20_TOKEN;
      console.log(`ERC20 address: ${erc20Address}`);
    }

    // Deploy Contracts
    // const { m721, m1155 } = await deployMarketplace(erc20Address);
    const factory = await deployFactory(erc20Address);
    const router = await deployRouter(
      erc20Address,
      factory.address,
      deployer.address,
    );

    // Set fees for Router
    await setRouterFees(
      router,
      erc20Address,
      _feeMint,
      _feeBurn,
      _feeMintErc20,
      _feeBurnErc20,
    );

    // Set fees for Factory
    await setFactoryFees(
      factory,
      erc20Address,
      _feeCreateCollection,
      _feeCreateSplitter,
      _feeCreateCollectionErc20,
      _feeCreateSplitterErc20,
    );

    // Set router address
    await factory.connect(deployer).setRouter(router.address);
    console.log(`Router Address Set..`);

    // Add Collection Types
    await setCollectionType(factory, 1, ERC721Basic.bytecode, "ERC721");
    await setCollectionType(factory, 2, ERC1155Basic.bytecode, "ERC1155");

    console.log("Deployment completed successfully...");
    process.exit(0);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();
