const { HardhatUserConfig } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    ganache: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: [
        "0xec5430fbb0cc3ed498abd4b0fdd89bf143becb238e6f0fe6a2dad8a1d0a0a251",
        "0xf9857909df6a291a14abaf9859c9dcf7d35067ed3d5d22f2e75de00abfffaf33",
        "0x9d35e74a6f10a6a75c3a30caaf656d8bcbb26320a72de6a8eb7a9d8ad7ac8b66",
        "0x2d8ea0d7abde49b484b107c91146ea625943ed6abee2f61f109a23d8ee727b4d",
        "0x85520099a924301ca4960b55258dbec646b0d96756896042e486403335c80fc1",
        "0xe3e683fb47e368ced0bd042603acc72b899cb9915c6f074dae852cdecf7da4d0",
        "0xe28e80f150536267ca0a3a373fae8e1f8649b01f4e800ac501b3074c82696baa",
        "0x2e5bf9550bb9432806c11a0519b4a8c03b827dd45fa65d3bcef599965c57e05e",
        "0xd34dd9d3df08806098204fec54db1ade2922c00631380683f9cfa00aa8914a05",
        "0x7b368d0306aba601ee938b3da40201be2d1d5a5fc80dcd83f701ff9b3e467c82"
      ],
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    mainnet: {
      url: process.env.MAINNET_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

module.exports = config;