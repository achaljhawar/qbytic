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
        "0x2e4e28c6d1594163d0825524da737633bab43e29bf5c11c7dd6cd224101d4fc8",
        "0xdd3b42acff0e30ef000c88580ae9bafa2720558ebae41239407a4d6bbf9e46be",
        "0x47f319313b6b5bcbc3effba1ed158481d65abafe890de987e697a0adb282e336",
        "0x5e262deb66e7ae0922aa69690f598207ee5744590d897b0c32ef8ff3e2d9b9bb",
        "0x954506556a5f01e56f4f19ee443428f5e82b35e3594a5a12a9defacbc428fdab",
        "0x5da98977a2314ad9599fa122c0e9d9ebac64f18aa39e46685dfde6e6ab254480",
        "0x426a33cd3bb3a9c75d30affdba5b2327dab51f5b2f1eeb8319d85ff3dfafebde",
        "0x603748dcc1e1b905b8c442322dea1f823d5d9b0258e674ab5ca903afc2709976",
        "0xa04722b6a6013823f4b9d06ed612e90065106391a44124f6dc7331b9b9ca368e",
        "0xe18887deb31b52ad7dd6f44148d40a9d9698592c795676a3a1c9f561947e2ecb"
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