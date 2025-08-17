import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MockContractsModule = buildModule("MockContractsModule", (m) => {
  // Deploy mock tokens
  const mockWETH = m.contract("MockWETH");
  const mockUSDC = m.contract("MockUSDC");
  const mockUSDT = m.contract("MockUSDT");

  // Deploy mock price feeds
  const ethPriceFeed = m.contract("MockChainlinkPriceFeed", [
    8, // decimals
    "ETH / USD", // description
    1, // version
    300000000000, // $3000 in 8 decimals (3000 * 10^8)
  ]);

  const ethPriceFeedBackup = m.contract("MockChainlinkPriceFeed", [
    8, // decimals
    "ETH / USD Backup", // description
    1, // version
    300000000000, // $3000 in 8 decimals (3000 * 10^8)
  ]);

  return {
    mockWETH,
    mockUSDC,
    mockUSDT,
    ethPriceFeed,
    ethPriceFeedBackup,
  };
});

export default MockContractsModule;