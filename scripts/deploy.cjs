const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Deploy mock contracts
  const MockWETH = await hre.ethers.getContractFactory("MockWETH");
  const mockWETH = await MockWETH.deploy();
  console.log("MockWETH deployed to:", await mockWETH.getAddress());

  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  console.log("MockUSDC deployed to:", await mockUSDC.getAddress());

  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy();
  console.log("MockUSDT deployed to:", await mockUSDT.getAddress());

  const MockChainlinkPriceFeed = await hre.ethers.getContractFactory("MockChainlinkPriceFeed");
  const ethPriceFeed = await MockChainlinkPriceFeed.deploy(
    8, // decimals
    "ETH / USD",
    1, // version
    300000000000 // $3000 in 8 decimals
  );
  console.log("ETH Price Feed deployed to:", await ethPriceFeed.getAddress());

  const ethPriceFeedBackup = await MockChainlinkPriceFeed.deploy(
    8, // decimals
    "ETH / USD Backup",
    1, // version
    300000000000 // $3000 in 8 decimals
  );
  console.log("ETH Price Feed Backup deployed to:", await ethPriceFeedBackup.getAddress());

  // Deploy lending protocol
  const DecentralizedP2PLending = await hre.ethers.getContractFactory("DecentralizedP2PLending");
  const lending = await DecentralizedP2PLending.deploy(
    await mockWETH.getAddress(),
    await mockUSDC.getAddress(),
    await mockUSDT.getAddress(),
    await ethPriceFeed.getAddress(),
    await ethPriceFeedBackup.getAddress()
  );

  console.log("DecentralizedP2PLending deployed to:", await lending.getAddress());

  // Test basic functionality
  console.log("\nTesting basic functionality...");
  const ethPrice = await lending.getETHPrice();
  console.log("ETH Price from oracle:", ethPrice.toString());

  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });