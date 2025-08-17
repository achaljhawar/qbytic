import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import MockContractsModule from "./MockContracts";

const LendingProtocolModule = buildModule("LendingProtocolModule", (m) => {
  // Use mock contracts
  const { mockWETH, mockUSDC, mockUSDT, ethPriceFeed, ethPriceFeedBackup } = m.useModule(MockContractsModule);

  // Deploy the lending protocol
  const lendingProtocol = m.contract("DecentralizedP2PLending", [
    mockWETH,
    mockUSDC,
    mockUSDT,
    ethPriceFeed,
    ethPriceFeedBackup,
  ]);

  return {
    lendingProtocol,
    mockWETH,
    mockUSDC,
    mockUSDT,
    ethPriceFeed,
    ethPriceFeedBackup,
  };
});

export default LendingProtocolModule;