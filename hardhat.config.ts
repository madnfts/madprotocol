import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-etherscan";
import "@primitivefi/hardhat-dodoc";
import "@typechain/hardhat";
import { config as dotenvConfig } from "dotenv";
import "hardhat-gas-reporter";
import "hardhat-tracer";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import { resolve } from "path";
import "solidity-coverage";

import "./tasks/accounts";

// import "./tasks/deploy";

dotenvConfig({ path: resolve(__dirname, "./.env") });

// Ensure that we have all the environment variables we need.
const mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file");
}

const infuraApiKey: string | undefined =
  process.env.INFURA_API_KEY;
if (!infuraApiKey) {
  throw new Error(
    "Please set your INFURA_API_KEY in a .env file",
  );
}

const chainIds = {
  "harmony-mainnet": 1666600000,
  "harmony-devnet": 1666900000,
  hardhat: 31337,
  mainnet: 1,
  rinkeby: 4,
  ganache: 1337,
  // "arbitrum-mainnet": 42161,
  // avalanche: 43114,
  // bsc: 56,
  // "optimism-mainnet": 10,
  // "polygon-mainnet": 137,
  // "polygon-mumbai": 80001,
};

function getChainConfig(
  chain: keyof typeof chainIds,
): NetworkUserConfig {
  let jsonRpcUrl: string;
  switch (chain) {
    case "harmony-mainnet":
      jsonRpcUrl = "https://api.s0.t.hmny.io";
      break;
    case "harmony-devnet":
      jsonRpcUrl = "https://api.s0.ps.hmny.io/";
      break;
    case "ganache":
      jsonRpcUrl = "http://localhost:8545/";
      break;
    default:
      jsonRpcUrl =
        "https://" + chain + ".infura.io/v3/" + infuraApiKey;
    // case "avalanche":
    //   jsonRpcUrl = "https://api.avax.network/ext/bc/C/rpc";
    //   break;
    // case "bsc":
    //   jsonRpcUrl = "https://bsc-dataseed1.binance.org";
    //   break;
  }
  return {
    // @todo updated for harmony deploy, this script needs refactoring
    accounts: [`0x${mnemonic}`],
    chainId: chainIds[chain],
    url: jsonRpcUrl,
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: {
      harmonyDevnet: "your API key",
      harmony: "your API key",
      // harmonyDev: process.env.DEVNET_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      rinkeby: process.env.ETHERSCAN_API_KEY || "",
      // arbitrumOne: process.env.ARBISCAN_API_KEY || "",
      // avalanche: process.env.SNOWTRACE_API_KEY || "",
      // bsc: process.env.BSCSCAN_API_KEY || "",
      // optimisticEthereum: process.env.OPTIMISM_API_KEY || "",
      // polygon: process.env.POLYGONSCAN_API_KEY || "",
      // polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "harmonyDevnet",
        chainId: 1666900000,
        urls: {
          apiURL:
            "https://ctrver.b.hmny.io/verify?network=devnet",
          browserURL: "https://api.s0.ps.hmny.io",
        },
      },
    ],
  },
  gasReporter: {
    enabled: !!(
      process.env.REPORT_GAS &&
      process.env.REPORT_GAS != "false"
    ),
    showTimeSpent: true,
    showMethodSig: true,
    token: "ONE",
    currency: "USD",
    // gasPriceApi: process.env.GASPRICE_API_ENDPOINT,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
      chainId: chainIds.hardhat,
    },
    harmony: getChainConfig("harmony-mainnet"),
    harmonyDev: getChainConfig("harmony-devnet"),
    mainnet: getChainConfig("mainnet"),
    rinkeby: getChainConfig("rinkeby"),
    ganache: getChainConfig("ganache"),
    // arbitrum: getChainConfig("arbitrum-mainnet"),
    // avalanche: getChainConfig("avalanche"),
    // bsc: getChainConfig("bsc"),
    // optimism: getChainConfig("optimism-mainnet"),
    // "polygon-mainnet": getChainConfig("polygon-mainnet"),
    // "polygon-mumbai": getChainConfig("polygon-mumbai"),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.4",
    settings: {
      metadata: {
        bytecodeHash: "none",
      },
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  typechain: {
    outDir: "src/types",
    target: "ethers-v5",
  },
  dodoc: {
    runOnCompile: !!(
      process.env.GEN_DOCS && process.env.GEN_DOCS != "false"
    ),
    // debugMode: false,
  },
};

export default config;
