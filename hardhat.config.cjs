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
        "0xe6cd506eda6f39292e9dafdf3842c444f83e6a6c3ed4554d0d7c3638c6380c08",
        "0xb4c39a241cbe745a396bc5cc5cfaf4f65d2be7c5dcd8dc3ed49a59964bed0721",
        "0xb9b07057f609c705c4312e1881a0df40fc8cd4cf1344476578a91e49aef33a6c",
        "0x8e5056442fdca8e0dd568d8c09464e493bdbb44d7c72bc66b5502f42ae75d8d0",
        "0x940b90ccc117952ea0ee2f134f2fafb5f56cc90994e586faaa54f56fd5bd470f",
        "0x9010923242ff73c27a0ad3c3497a5ece157e5cd987aa248c5e93ea0f37b59414",
        "0xf8328e199b6feafe02437ea37cb55368feacda514f3fc66a6c76deb6905518de",
        "0xca56a704c7470f49dc9dacc53a55198c93527aff0442a36a1f7b7a92ae4c64df",
        "0x3a2fc59cce0a186ecb2cdb8b85363c9238562a46ea9b99721b05a62f4c4b6b99",
        "0x17f932dc60ce35c433c26b027eaddf9a4a7b3237fc54acf29962a2cddad7f9c3"
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