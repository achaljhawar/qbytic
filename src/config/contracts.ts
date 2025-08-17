export const DEPLOYED_CONTRACTS = {
  ganache: {
    chainId: 1337,
    rpcUrl: "http://127.0.0.1:8545",
    contracts: {
      MockWETH: "0xcf85c3921653AeaaC5d171F7Ff329438c180FE74",
      MockUSDC: "0x4E4f2b26a1767AdebC36DC0A504453A291b44B26",
      MockUSDT: "0x3151B6Cb9395D471c0f912A52E548A6bBBa43211",
      ETHPriceFeed: "0xD422A83E1d03A2E7Cb8C43436959733352aF1d7E",
      ETHPriceFeedBackup: "0xe4011b344E2b0D5Cff4dB6d4b8e646eA91bD6265",
      DecentralizedP2PLending: "0x3e71160e2211821cb8d3d32013F101f195C1eD04"
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