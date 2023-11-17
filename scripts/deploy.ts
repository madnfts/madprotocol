import { config } from "dotenv";
import { ethers } from "hardhat";
import { resolve } from "path";

config({ path: resolve(__dirname, "./.env") });

const {
  UNISWAP_ROUTER,
  ERC20_TOKEN,
  FACTORY,
  ROUTER,
  feeCreateCollection,
  feeCreateCollectionErc20,
  feeCreateSplitter,
  feeCreateSplitterErc20,
  feeMint,
  feeMintErc20,
  feeBurn,
  feeBurnErc20,
  RECIPIENT,
} = process.env;

const _feeCreateCollection = ethers.parseEther(
  feeCreateCollection
);
const _feeCreateSplitter = ethers.parseEther(
  feeCreateSplitter,
);
const _feeCreateCollectionErc20 = ethers.parseEther(
  feeCreateCollectionErc20,
);
const _feeCreateSplitterErc20 = ethers.parseEther(
  feeCreateSplitterErc20,
);

const _feeMint = ethers.parseEther(feeMint);
const _feeBurn = ethers.parseEther(feeBurn);
const _feeMintErc20 = ethers.parseEther(feeMintErc20);
const _feeBurnErc20 = ethers.parseEther(feeBurnErc20);

var deployedFactoryAddress = "";
var deployedRouterAddress = "";
var deployedErc20Address = "";
var deployedMarketplaceAddress = "";

const deployedDisplay = () => {
  console.log(
    `Deployed Factory Address: ${deployedFactoryAddress ? deployedFactoryAddress : FACTORY}`,
  );
  console.log(
    `Deployed Router Address: ${deployedRouterAddress ? deployedRouterAddress : ROUTER}`,
  );
  console.log(
    `Deployed ERC20 Address: ${deployedErc20Address ? deployedErc20Address : ERC20_TOKEN}`,
  );
  console.log(
    `Deployed Marketplace Address: ${deployedMarketplaceAddress}`,
  );
};
// const deployMarketplace = async erc20Address => {
//   const MADMarketplace721 = await ethers.getContractFactory(
//     "MADMarketplace721",
//   );
//   const m721 = await MADMarketplace721.deploy(
//     erc20Address,
//     UNISWAP_ROUTER,
//   );
//   console.log(`ERC721 Marketplace address: ${m721.target}`);

//   const MADMarketplace1155 = await ethers.getContractFactory(
//     "MADMarketplace1155",
//   );
//   const m1155 = await MADMarketplace1155.deploy(
//     erc20Address,
//     UNISWAP_ROUTER,
//   );
//   deployedMarketplaceAddress = m721.target;
//   return { m721, m1155 };
// };

const deployERC20 = async () => {
  const ERC20 = await ethers.getContractFactory("MockERC20");
  const erc20 = await ERC20.deploy(
    "Mad Mock Token",
    "MAD",
    18,
    10
  );
  await erc20.waitForDeployment();
  deployedErc20Address = erc20.target;
  return erc20;
};

const deployFactory = async (erc20Address) => {
  
  const factory = await ethers.deployContract(
    "MADFactory", [RECIPIENT],
         {
              gasLimit: 0x1000000,
              gasPrice: 0x7a120,
              gas:1000000
            }
  );
  await factory.waitForDeployment();
  deployedFactoryAddress = factory.target;
  const factoryErc20 = await factory.erc20();
  console.log(`factory.erc20: ${factoryErc20}`);
  console.log(`factory.erc20 == erc20Address: ${factoryErc20 == erc20Address}`);
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
  await router.waitForDeployment();
  deployedRouterAddress = router.target;
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
  await router["setFees(uint256,uint256)"](
    _feeMint,
    _feeBurn,
  );
  let setFeesMint = await router.feeMint();
  let setFeesBurn = await router.feeBurn();
  if (!setFeesBurn === _feeBurn) {
    console.log(
      `Error setting Router Burn Fee Not Set\nExpected Fee: ${_feeBurn}\nActual Fee:   ${setFeesBurn}`,
    );
  } else {
    console.log(`Router Burn Fee Set`);
  }
  if (!setFeesMint === _feeMint) {
    console.log(
      `Error setting Router Mint Fee Not Set\nExpected Fee: ${_feeMint}\nActual Fee:   ${setFeesMint}`,
    );
  } else {
    console.log(`Router Mint Fee Set`);
  }

  if (erc20Address != ethers.ZeroAddress) {
    await router["setFees(uint256,uint256,address)"](
      _feeMint,
      _feeBurn,
      erc20Address,
    );

    let setFeesMintErc20 = await router.feeMintErc20(
      erc20Address,
    );
    let setFeesBurnErc20 = await router.feeBurnErc20(
      erc20Address,
    );

    if (!setFeesBurnErc20 === _feeBurnErc20) {
      console.log(
        `Error setting Router Burn Fee ERC20 Not Set\nExpected Fee: ${_feeBurnErc20}\nActual Fee:   ${setFeesBurnErc20}`,
      );
    } else {
      console.log(`Router Burn ERC20 Fee Set`);
    }
    if (!setFeesMintErc20 === _feeMintErc20) {
      console.log(
        `Error setting Router Mint Fee ERC20 Not Set\nExpected Fee: ${_feeMintErc20}\nActual Fee:   ${setFeesMintErc20}`,
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

  await factory["setFees(uint256,uint256)"](
    _feeCreateCollection,
    _feeCreateSplitter,
  );

  let setCreateFees = await factory.feeCreateCollection();
  let setCreateSplitterFees =
    await factory.feeCreateSplitter();

  if (!setCreateFees === _feeCreateCollection) {
    console.log(
      `Error setting Factory Fees Not Set\nExpected Fee: ${_feeCreateCollection}\nActual Fee:   ${setCreateFees}`,
    );
  } else {
    console.log(`Factory Fees Set`);
  }

  if (!setCreateSplitterFees === _feeCreateSplitter) {
    console.log(
      `Error setting Factory Splitter Fees Not Set\nExpected Fee: ${_feeCreateSplitter}\nActual Fee:   ${setCreateSplitterFees}`,
    );
  } else {
    console.log(`Factory Splitter Fees Set`);
  }

  if (erc20Address != ethers.ZeroAddress) {
    await factory["setFees(uint256,uint256,address)"](
      _feeCreateCollectionErc20,
      _feeCreateSplitterErc20,
      erc20Address,
    );

    let setCreateFeesErc20 =
      await factory.feeCreateCollectionErc20(erc20Address);
    let setCreateSplitterFeesErc20 =
      await factory.feeCreateSplitterErc20(erc20Address);

    if (!setCreateFeesErc20 === _feeCreateCollectionErc20) {
      console.log(
        `Error setting Factory Fees Not Set\nExpected Fee: ${_feeCreateCollectionErc20}\nActual Fee:   ${setCreateFeesErc20}`,
      );
    } else {
      console.log(`Factory ERC20 Fees Set`);
    }
    if (
      !setCreateSplitterFeesErc20 === _feeCreateSplitterErc20
    ) {
      console.log(
        `Error setting Factory Splitter Fees Not Set\nExpected Fee: ${_feeCreateSplitterErc20}\nActual Fee:   ${setCreateSplitterFeesErc20}`,
      );
    } else {
      console.log(`Factory Splitter ERC20 Fees Set`);
    }
  }
};

const setCollectionType = async (
  factory,
  collectionType,
  bytecode,
  name,
) => {
  console.log(`SETTING COLLECTION TYPE ${name}`);
  await factory.addCollectionType(collectionType, bytecode);
  var isDeployed =
    (await factory.collectionTypes(collectionType)) ===
    bytecode;
  if (!isDeployed) {
    console.log(`Collection Type ${name} Not Added..`);
  } else {
    console.log(`Collection Type ${name} Added..`);
  }
};

const main = async () => {
  let erc20Address = ethers.ZeroAddress;
  const ERC721Basic = await ethers.getContractFactory(
    "ERC721Basic",
  );
  const ERC1155Basic = await ethers.getContractFactory(
    "ERC1155Basic",
  );

  const [deployer] = await ethers.getSigners();

  try {
    // Check token address
    console.log(
      `Deploying contract ERC20 with ${deployer.address}`,
    );
    if (ERC20_TOKEN === "mock") {
      let erc20 = await deployERC20();
      erc20Address = erc20.getAddress();
    } else if (ERC20_TOKEN) {
      erc20Address = ERC20_TOKEN;
      console.log(`ERC20 address: ${erc20Address}`);
    }

    // Deploy Contracts
    // const { m721, m1155 } = await deployMarketplace(erc20Address);

    console.log(
      `Deploying contracts Factory with ${deployer.address}`,
    );
    const factory = await deployFactory(erc20Address)

    console.log(
      `Deploying contracts Router with ${deployer.address}`,
    );
    const router = await deployRouter(
      erc20Address,
      factory.target,
      deployer.address,
    );

    deployedDisplay();

    // Set router address
    await factory.connect(deployer).setRouter(router.getAddress());
    console.log(`Router Address Set..`);

    // Add Collection Types
    await setCollectionType(
      factory,
      1,
      ERC721Basic.bytecode,
      "ERC721",
    );
    await setCollectionType(
      factory,
      2,
      ERC1155Basic.bytecode,
      "ERC1155",
    );

    // Set fees for Factory
    await setFactoryFees(
      factory.connect(deployer),
      erc20Address,
      _feeCreateCollection,
      _feeCreateSplitter,
      _feeCreateCollectionErc20,
      _feeCreateSplitterErc20,
    );

    // Set fees for Router
    await setRouterFees(
      router.connect(deployer),
      erc20Address,
      _feeMint,
      _feeBurn,
      _feeMintErc20,
      _feeBurnErc20,
    );

    console.log("Deployment completed successfully...\n");
    deployedDisplay();
    process.exit(0);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();
