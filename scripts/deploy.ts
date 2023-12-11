import { config } from "dotenv";
import { ethers } from "hardhat";
import { resolve } from "path";
import fs from 'fs';

const logStream = fs.createWriteStream('scripts/deploy.log', { flags: 'a' });

console.log = function(message: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}`;
  logStream.write(logMessage + '\n');
  process.stdout.write(logMessage + '\n');
};

config({ path: resolve(__dirname, "./.env") });

const {
  // UNISWAP_ROUTER,
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

var deployerAddress = '';
var deployedFactoryAddress = "";
var deployedRouterAddress = "";
var deployedErc20Address = ethers.ZeroAddress;
var deployedMarketplaceAddress = "";

const gasArgs = {
  gasLimit: 0x1000000,
  gasPrice: 0x7a120,
  gas: 1000000
}

const deployedDisplay = () => {
  console.log(
    `\nDeployed Factory Address: ${deployedFactoryAddress ? deployedFactoryAddress : FACTORY}`,
  );
  console.log(
    `Deployed Router Address: ${deployedRouterAddress ? deployedRouterAddress : ROUTER}`,
  );
  console.log(
    `Deployed ERC20 Address: ${deployedErc20Address ? deployedErc20Address : ERC20_TOKEN}`,
  );
  console.log(
    `Deployed Marketplace Address: ${deployedMarketplaceAddress}\n`,
  );
};

const deployERC20 = async () => {
  console.log(
    `Deploying contract ERC20 with ${deployerAddress}`,
  );
  const erc20 = await ethers.deployContract("MockERC20", [
    "Mad Mock Token",
    "MAD",
    18,
    10
  ],
    gasArgs
  );
  await erc20.waitForDeployment();
  deployedErc20Address = erc20.target;
  return erc20;
};

const deployFactory = async () => {
  console.log(
    `Deploying contracts Factory with ${deployerAddress}`,
  );
  const factory = await ethers.deployContract(
    "MADFactory", [RECIPIENT],
    gasArgs
  );
  await factory.waitForDeployment();
  deployedFactoryAddress = factory.target;
  return factory;
};

const deployRouter = async (
  factoryAddress
) => {
  console.log(
    `Deploying contracts Router with ${deployerAddress}`,
  );
  const router = await ethers.deployContract(
    "MADRouter", [factoryAddress,
    RECIPIENT],
    gasArgs
  );
  await router.waitForDeployment();
  deployedRouterAddress = router.target;
  return router;
};

const setRouterAddress = async (factory) => {
  // Set router address
  const tx = await factory.setRouter(deployedRouterAddress);
  await tx.wait();
  console.log(`[OK] Router Address Set..`);

  // Check router address
  let calledRouterAddress = await factory.router();
  if (calledRouterAddress != deployedRouterAddress) {
    console.log(`\n***[ ERROR ]*** setting Router Address..\nExpected Address: ${deployedRouterAddress}\nActual Address:   ${calledRouterAddress}`);
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
  console.log(`\nSETTING FACTORY FEES`);

  let tx = await factory["setFees(uint256,uint256)"](
    _feeCreateCollection,
    _feeCreateSplitter,
  );
  await tx.wait();

  let setCreateFees = await factory.feeCreateCollection();
  let setCreateSplitterFees =
    await factory.feeCreateSplitter();

  if (setCreateFees != _feeCreateCollection) {
    console.log(
      `\n***[ ERROR ]*** setting Factory Create Collection Fees NOT Set\nExpected Fee: ${_feeCreateCollection}\nActual Fee:   ${setCreateFees}`,
    );
  } else {
    console.log(`[OK] Factory Create Collection Fees Set\nExpected Fee: ${_feeCreateCollection}\nActual Fee:   ${setCreateFees}`,
    );
  }

  if (setCreateSplitterFees != _feeCreateSplitter) {
    console.log(
      `\n***[ ERROR ]*** setting Factory Splitter Fees NOT Set\nExpected Fee: ${_feeCreateSplitter}\nActual Fee:   ${setCreateSplitterFees}`,
    );
  } else {
    console.log(`[OK] Factory Splitter Fees Set\nExpected Fee: ${_feeCreateSplitter}\nActual Fee:   ${setCreateSplitterFees}`,
    );
  }

  if (erc20Address != ethers.ZeroAddress) {
    let tx = await factory["setFees(uint256,uint256,address)"](
      _feeCreateCollectionErc20,
      _feeCreateSplitterErc20,
      erc20Address,
    );

    await tx.wait();

    let setCreateFeesErc20 =
      await factory.feeCreateCollectionErc20(erc20Address);
    let setCreateSplitterFeesErc20 =
      await factory.feeCreateSplitterErc20(erc20Address);

    if (setCreateFeesErc20[0] != _feeCreateCollectionErc20) {
      console.log(
        `\n***[ ERROR ]*** setting Factory CreateCollection ERC20 Fees NOT Set\nExpected Fee: ${_feeCreateCollectionErc20}\nActual Fee:   ${setCreateFeesErc20[0]}`,
      );
    } else {
      console.log(`[OK] Factory CreateCollection ERC20 Fees Set\nExpected Fee: ${_feeCreateCollectionErc20}\nActual Fee:   ${setCreateFeesErc20[0]}`,
      );
    }
    if (
      setCreateSplitterFeesErc20[0] != _feeCreateSplitterErc20
    ) {
      console.log(
        `\n***[ ERROR ]*** setting Factory Splitter Fees NOT Set\nExpected Fee: ${_feeCreateSplitterErc20}\nActual Fee:   ${setCreateSplitterFeesErc20[0]}`,
      );
    } else {
      console.log(`[OK] Factory Splitter ERC20 Fees Set\nExpected Fee: ${_feeCreateSplitterErc20}\nActual Fee:   ${setCreateSplitterFeesErc20[0]}`,
      );
    }
  }
};

const setRouterFees = async (
  router,
  erc20Address,
  _feeMint,
  _feeBurn,
  _feeMintErc20,
  _feeBurnErc20,
) => {
  console.log(`\nSETTING ROUTER FEES`);
  let tx = await router["setFees(uint256,uint256)"](
    _feeMint,
    _feeBurn,
  );
  await tx.wait();

  let setFeesMint = await router.feeMint();
  let setFeesBurn = await router.feeBurn();

  if (setFeesBurn != _feeBurn) {
    console.log(
      `\n***[ ERROR ]*** setting Router Burn Fee NOT Set\nExpected Fee: ${_feeBurn}\nActual Fee:   ${setFeesBurn}`,
    );
  } else {
    console.log(`[OK] Router Burn Fee Set\nExpected Fee: ${_feeBurn}\nActual Fee:   ${setFeesBurn}`,
    );
  }
  if (setFeesMint != _feeMint) {
    console.log(
      `\n***[ ERROR ]*** setting Router Mint Fee NOT Set\nExpected Fee: ${_feeMint}\nActual Fee:   ${setFeesMint}`,
    );
  } else {
    console.log(`[OK] Router Mint Fee Set\nExpected Fee: ${_feeMint}\nActual Fee:   ${setFeesMint}`,
    );
  }

  if (erc20Address != ethers.ZeroAddress) {
    let tx = await router["setFees(uint256,uint256,address)"](
      _feeMintErc20,
      _feeBurnErc20,
      erc20Address,
    );
    await tx.wait();

    let setFeesMintErc20 = await router.feeMintErc20(
      erc20Address,
    );
    let setFeesBurnErc20 = await router.feeBurnErc20(
      erc20Address,
    );

    if (setFeesBurnErc20[0] != _feeBurnErc20) {
      console.log(
        `\n***[ ERROR ]*** setting Router Burn Fee ERC20 NOT Set\nExpected Fee: ${_feeBurnErc20}\nActual Fee:   ${setFeesBurnErc20[0]}`,
      );
    } else {
      console.log(`[OK] Router Burn ERC20 Fee Set\nExpected Fee: ${_feeBurnErc20}\nActual Fee:   ${setFeesBurnErc20[0]}`,
      );
    }
    if (setFeesMintErc20[0] != _feeMintErc20) {
      console.log(
        `\n***[ ERROR ]*** setting Router Mint Fee ERC20 NOT Set\nExpected Fee: ${_feeMintErc20}\nActual Fee:   ${setFeesMintErc20[0]}`,
      );
    } else {
      console.log(`[OK] Router Mint ERC20 Fee Set\nExpected Fee: ${_feeMintErc20}\nActual Fee:   ${setFeesMintErc20[0]}`,
      );
    }
  }
};
const setCollectionType = async (
  factory,
  collectionType,
  bytecode,
  name,
) => {
  console.log(`\nSETTING COLLECTION TYPE ${name}`);
  const tx = await factory.addCollectionType(collectionType, bytecode);
  await tx.wait();
  var isDeployed =
    (await factory.collectionTypes(collectionType)) ===
    bytecode;
  if (!isDeployed) {
    console.log(`\n***[ ERROR ]*** Collection Type ${name} NOT Added..`);
  } else {
    console.log(`[OK] Collection Type ${name} Added..`);
  }
};

const main = async () => {
  const ERC721Basic = await ethers.getContractFactory(
    "ERC721Basic",
  );
  const ERC1155Basic = await ethers.getContractFactory(
    "ERC1155Basic",
  );

  const [deployer] = await ethers.getSigners();

  deployerAddress = deployer.address;

  try {
    // Check token address
    if (ERC20_TOKEN === "mock") {
      let erc20 = await deployERC20();
      deployedErc20Address = await erc20.getAddress();
    } else if (ERC20_TOKEN) {
      deployedErc20Address = ERC20_TOKEN;
      console.log(`ERC20 address: ${deployedErc20Address}`);
    }

    // Deploy Contracts
    const factory = await deployFactory()
    const router = await deployRouter(
      factory.target
    );

    deployedDisplay();

    // Set router address
    await setRouterAddress(factory);

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
      deployedErc20Address,
      _feeCreateCollection,
      _feeCreateSplitter,
      _feeCreateCollectionErc20,
      _feeCreateSplitterErc20,
    );

    // Set fees for Router
    await setRouterFees(
      router.connect(deployer),
      deployedErc20Address,
      _feeMint,
      _feeBurn,
      _feeMintErc20,
      _feeBurnErc20,
    );

    deployedDisplay();
    console.log("Deployment completed successfully...\n");
    logStream.end()
    process.exit(0);

  } catch (error) {
    console.error(error);
    logStream.end()
    process.exit(1);
  }
};

main();
