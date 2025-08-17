export const DEPLOYED_CONTRACTS = {
  ganache: {
    chainId: 1337,
    rpcUrl: "http://127.0.0.1:8545",
    contracts: {
      MockWETH: "0x0b3d76D2F3e5E60a82416D13c7606F364e062a50",
      MockUSDC: "0x676d20204A074987Bfd3903AEE3E7F0549D2EABa",
      MockUSDT: "0x936fbe91566c62B6c26564C315a0212c9D26976B",
      ETHPriceFeed: "0xF8AFf7C2Aedc537B4AAa90C9D10FEa69B7E6a933",
      ETHPriceFeedBackup: "0x141A20fF3677b6461FC1B11947bF2DD10b6e4438",
      DecentralizedP2PLending: "0xeA1331C49d9A55e8831f14aE4Ee4dfA866BE68e6"
    }
  }
} as const;

export const LENDING_CONTRACT_ADDRESS = DEPLOYED_CONTRACTS.ganache.contracts.DecentralizedP2PLending;
export const USDT_CONTRACT_ADDRESS = DEPLOYED_CONTRACTS.ganache.contracts.MockUSDT;
export const USDC_CONTRACT_ADDRESS = DEPLOYED_CONTRACTS.ganache.contracts.MockUSDC;
export const WETH_CONTRACT_ADDRESS = DEPLOYED_CONTRACTS.ganache.contracts.MockWETH;

export const LENDING_CONTRACT_ABI = [
  "function proposeLoan(uint256 borrowAmount, uint256 duration, address stablecoin, uint256 creditScore) external returns (uint256 loanId)",
  "function acceptLoan(uint256 loanId) external",
  "function activateLoan(uint256 loanId) external payable",
  "function makePayment(uint256 loanId) external",
  "function getActiveLoanRequests() external view returns (uint256[] memory)",
  "function getLoanDetails(uint256 loanId) external view returns (address borrower, address lender, uint256 collateralAmount, uint256 outstandingDebt, uint256 currentLTV, uint256 healthFactor, uint8 status, bool collateralDeposited, uint256 proposalExpiration)",
  "function calculateRequiredCollateral(uint256 borrowAmount, uint256 creditScore) external pure returns (uint256)",
  "function calculateInterestRate(uint256 creditScore) external pure returns (uint256)",
  "function getETHPrice() external view returns (uint256)",
  "function borrowerLoans(address borrower, uint256 index) external view returns (uint256)",
  "function lenderLoans(address lender, uint256 index) external view returns (uint256)",
  "function usdt() external view returns (address)",
  "function usdc() external view returns (address)"
] as const;

export const ERC20_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
  "function faucet(uint256 amount) external"
] as const;

export const LOAN_STATUSES = {
  0: "None",
  1: "Proposed", 
  2: "Active",
  3: "Repaid",
  4: "Defaulted",
  5: "Cancelled"
} as const;

export type LoanStatus = keyof typeof LOAN_STATUSES;