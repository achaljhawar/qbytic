# Qbytic Lending System

A decentralized P2P lending platform where users can borrow USDT against ETH collateral.

## 🚀 Features

### For Borrowers
- **Propose Loans**: Create loan requests with custom amounts and durations
- **Credit Score Integration**: Automatic credit score fetching affects interest rates and collateral requirements
- **ETH Collateral**: Use ETH as collateral for USDT loans
- **Flexible Terms**: Choose loan duration from 30 days to 1 year
- **Loan Management**: Track and manage active loans

### For Lenders
- **Browse Loan Requests**: View all available loan proposals
- **Credit Score Visibility**: See borrower credit scores before lending
- **Risk Assessment**: View collateral ratios and health factors
- **Automated Payments**: Receive loan payments directly
- **Portfolio Management**: Track lending portfolio performance

## 📋 Smart Contract Architecture

### Deployed Contracts (Ganache)
- **DecentralizedP2PLending**: `0xeA1331C49d9A55e8831f14aE4Ee4dfA866BE68e6`
- **MockUSDT**: `0x936fbe91566c62B6c26564C315a0212c9D26976B`
- **MockUSDC**: `0x676d20204A074987Bfd3903AEE3E7F0549D2EABa`
- **MockWETH**: `0x0b3d76D2F3e5E60a82416D13c7606F364e062a50`
- **ETH Price Feed**: `0xF8AFf7C2Aedc537B4AAa90C9D10FEa69B7E6a933`

### Key Features
- **Individual Loan Vaults**: Each loan is isolated with its own collateral
- **Credit-Based Terms**: Interest rates and collateral requirements based on credit scores
- **Partial Liquidation**: Protective liquidation to maintain borrower equity
- **Chainlink Price Feeds**: Real-time ETH price data with backup oracles

## 🏗️ System Flow

### Borrowing Process
1. **Connect Wallet**: User connects their Web3 wallet
2. **Credit Score Fetch**: System automatically fetches credit score from API
3. **Loan Proposal**: User specifies loan amount, duration, and stablecoin
4. **Wait for Lender**: Loan proposal becomes available to lenders
5. **Add Collateral**: Once accepted, borrower adds ETH collateral
6. **Loan Activation**: Loan becomes active, USDT transferred to borrower

### Lending Process
1. **Browse Loans**: Lenders view available loan requests
2. **Credit Assessment**: Review borrower credit scores and loan terms
3. **Accept Loan**: Approve USDT spending and accept loan
4. **Receive Payments**: Get monthly payments directly from borrower

## 🔧 Credit Score Integration

### API Integration
- **Endpoint**: `http://localhost:8001/api/credit-score`
- **Method**: POST with borrower address
- **Response**: Credit score data used for loan terms

### Credit Score Tiers
- **Excellent (750+)**: 5% APR, 130% collateral ratio
- **Good (650-749)**: 7.5% APR, 140% collateral ratio  
- **Fair (550-649)**: 10% APR, 150% collateral ratio
- **Poor (<550)**: 15% APR, 175% collateral ratio

## 💻 Frontend Components

### Main Pages
- `/lending` - Main lending interface with tabs for borrowing, lending, and loan management
- `/credit-score` - Credit score checking page
- `/dashboard` - User dashboard

### Key Components
- `BorrowForm` - Loan proposal interface
- `LenderDashboard` - Loan browsing and acceptance interface
- `MyLoans` - Loan management for borrowers and lenders

### Hooks
- `useLendingContract` - Smart contract interactions
- `useTokenContract` - ERC20 token operations (USDT, USDC approval)

## 🔒 Security Features

- **Collateral Protection**: Over-collateralized loans with liquidation protection
- **Credit Verification**: API-based credit score verification
- **Isolated Vaults**: Each loan has separate collateral storage
- **Health Factor Monitoring**: Real-time loan health tracking
- **Partial Liquidation**: Gradual liquidation to protect borrower equity

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Bun package manager
- Ganache running on localhost:8545
- Credit score API running on localhost:8001

### Setup
1. **Install Dependencies**:
   ```bash
   bun install
   ```

2. **Deploy Contracts**:
   ```bash
   bun run hardhat:deploy:ganache
   ```

3. **Start Frontend**:
   ```bash
   bun run dev
   ```

4. **Access the App**: Navigate to `http://localhost:3000/lending`

### Usage
1. Connect your wallet (use one of the provided Ganache private keys)
2. Get test USDT from the faucet in the lender dashboard
3. Create a loan proposal as a borrower
4. Switch to lender tab to accept loans
5. Add collateral to activate the loan
6. Manage loans in the "My Loans" tab

## 🔧 Available Scripts

- `bun run hardhat:compile` - Compile smart contracts
- `bun run hardhat:deploy:ganache` - Deploy to Ganache
- `bun run hardhat:test` - Run contract tests
- `bun run dev` - Start development server
- `bun run build` - Build for production

## 📊 Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Web3**: Wagmi, RainbowKit, Viem
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Styling**: Tailwind CSS
- **Testing**: Hardhat, Mocha, Chai

## 🚨 Important Notes

- This is a development/demo system using Ganache
- Mock contracts are used for tokens and price feeds  
- Credit score API integration requires external service
- All transactions use test ETH and mock tokens
- Smart contracts are not audited - for development only

## 🔮 Future Enhancements

- Multi-collateral support (other cryptocurrencies)
- Automatic loan renewals
- Interest rate markets
- NFT collateral support
- Cross-chain lending
- Governance token integration
- Advanced risk assessment models