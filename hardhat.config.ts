import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const {
  ALCHEMY_KEY,
  ETHERSCAN_API_KEY,
  PRIVATE_KEY_TESTNET
} = process.env;

const accountsTestnet = [PRIVATE_KEY_TESTNET];

const config = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      },
    },
    localhost: {
      url: 'http://127.0.0.1:8545'
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      // accounts: accountsMainnet,
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      accounts: accountsTestnet,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY
  },
  mocha: {
    timeout: 50000
  }
};

export default config;
