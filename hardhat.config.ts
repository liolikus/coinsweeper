require("@nomicfoundation/hardhat-toolbox");
require("dotenv/config");

const config = {
  solidity: {
    version: "0.8.24", // Updated to match Zama FHE requirements
    settings: {
      optimizer: {
        enabled: true,
        runs: 800, // Increased for better optimization
      },
      metadata: {
        // Not including the metadata hash for better compatibility
        bytecodeHash: 'none',
      },
      evmVersion: 'cancun', // Required for FHE operations
      viaIR: false,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true, // Required for FHE contracts
      blockGasLimit: 1099511627775, // Large gas limit for FHE operations
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      allowUnlimitedContractSize: true,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  paths: {
    sources: "./contracts", // This will include both your contracts and host-contracts
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  // FHE-specific configurations
  warnings: {
    '*': {
      'transient-storage': false, // Disable transient storage warnings
    },
  },
  mocha: {
    timeout: 500000, // Increased timeout for FHE operations
  },
  gasReporter: {
    currency: 'USD',
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: './contracts',
  },
};

module.exports = config;
