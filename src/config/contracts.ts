export const DEPLOYED_CONTRACTS = {
  ganache: {
    chainId: 1337,
    rpcUrl: "http://127.0.0.1:8545",
    contracts: {
      MockWETH: "0xbc264Bb4581b243e7240e70716f14C053390c034",
      MockUSDC: "0x32A918c09BD5c2d2877c557cf98474426ccAB51C",
      MockUSDT: "0x8Ad5d61cc953e0e6dcB29950AEc8A16910341917",
      ETHPriceFeed: "0x9C364Cdc5785e7163547514AB22Dd1DeE024785c",
      ETHPriceFeedBackup: "0xf3dCb470aDe8d7F0cFA01E949968BD725803FC50",
      DecentralizedP2PLending: "0xA4B81d375328e6887F48472fBF1F8df2935004b9"
    }
  }
} as const;

export const LENDING_CONTRACT_ADDRESS = DEPLOYED_CONTRACTS.ganache.contracts.DecentralizedP2PLending;
export const USDT_CONTRACT_ADDRESS = DEPLOYED_CONTRACTS.ganache.contracts.MockUSDT;
export const USDC_CONTRACT_ADDRESS = DEPLOYED_CONTRACTS.ganache.contracts.MockUSDC;
export const WETH_CONTRACT_ADDRESS = DEPLOYED_CONTRACTS.ganache.contracts.MockWETH;

export const LENDING_CONTRACT_ABI = [
  {
    type: "function",
    name: "proposeLoan",
    inputs: [
      { name: "borrowAmount", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "stablecoin", type: "address" },
      { name: "creditScore", type: "uint256" }
    ],
    outputs: [{ name: "loanId", type: "uint256" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "acceptLoan",
    inputs: [{ name: "loanId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "activateLoan",
    inputs: [{ name: "loanId", type: "uint256" }],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "makePayment",
    inputs: [{ name: "loanId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getActiveLoanRequests",
    inputs: [],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getLoanDetails",
    inputs: [{ name: "loanId", type: "uint256" }],
    outputs: [
      { name: "borrower", type: "address" },
      { name: "lender", type: "address" },
      { name: "collateralAmount", type: "uint256" },
      { name: "outstandingDebt", type: "uint256" },
      { name: "currentLTV", type: "uint256" },
      { name: "healthFactor", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "collateralDeposited", type: "bool" },
      { name: "proposalExpiration", type: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "calculateRequiredCollateral",
    inputs: [
      { name: "borrowAmount", type: "uint256" },
      { name: "creditScore", type: "uint256" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "pure"
  },
  {
    type: "function",
    name: "calculateInterestRate",
    inputs: [{ name: "creditScore", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "pure"
  },
  {
    type: "function",
    name: "getETHPrice",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "borrowerLoans",
    inputs: [
      { name: "borrower", type: "address" },
      { name: "index", type: "uint256" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "lenderLoans",
    inputs: [
      { name: "lender", type: "address" },
      { name: "index", type: "uint256" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "usdt",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "usdc",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view"
  }
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