// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

interface IWETH is IERC20 {
    function deposit() external payable;
    function withdraw(uint256) external;
}

/**
 * @title Decentralized P2P Lending Protocol
 * @dev Fully decentralized lending with individual loan vaults and no central custody
 */
contract DecentralizedP2PLending is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;
    using SafeERC20 for IWETH;
    
    // Constants
    uint256 public constant PRECISION = 1e18;
    uint256 public constant PERCENTAGE_PRECISION = 10000;
    uint256 public constant MIN_HEALTH_FACTOR = 115 * PERCENTAGE_PRECISION / 100;
    uint256 public constant LIQUIDATION_THRESHOLD = 110 * PERCENTAGE_PRECISION / 100;
    uint256 public constant TARGET_HEALTH_FACTOR = 125 * PERCENTAGE_PRECISION / 100;
    uint256 public constant MAX_LIQUIDATION_DISCOUNT = 500; // 5%
    uint256 public constant PROPOSAL_EXPIRATION = 7 days;
    uint256 public constant MAX_ORACLE_STALENESS = 1 hours;
    uint256 public constant LIQUIDATION_COOLDOWN = 6 hours;
    
    // Core contracts
    IWETH public immutable weth;
    IERC20 public immutable usdc;
    IERC20 public immutable usdt;
    AggregatorV3Interface public immutable ethPriceFeed;
    AggregatorV3Interface public immutable ethPriceFeedBackup;
    
    // Credit tiers
    uint256 public constant EXCELLENT_CREDIT = 750;
    uint256 public constant GOOD_CREDIT = 650;
    uint256 public constant FAIR_CREDIT = 550;
    
    enum LoanStatus {
        None,
        Proposed,
        Active,
        Repaid,
        Defaulted,
        Cancelled
    }
    
    /**
     * @dev Individual Loan Vault - Each loan is isolated
     */
    struct LoanVault {
        // Core participants
        address borrower;
        address lender;
        
        // Loan terms
        uint256 collateralAmount;
        uint256 principalAmount;
        uint256 outstandingDebt;
        uint256 interestRate;
        uint256 monthlyPayment;
        uint256 duration;
        
        // Timestamps
        uint256 proposalTime;
        uint256 startTime;
        uint256 lastPaymentTime;
        uint256 proposalExpiration;
        
        // Tracking
        uint256 creditScore;
        address stablecoin;
        LoanStatus status;
        uint256 totalRepaid;
        uint256 liquidatedAmount;
        
        // Collateral location tracking
        bool collateralDeposited;
        address collateralHolder; // Track where collateral is held
    }
    
    // Decentralized storage
    mapping(uint256 => LoanVault) public loanVaults;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => uint256[]) public lenderLoans;
    mapping(address => uint256) public creditScores;
    mapping(uint256 => uint256) public lastLiquidationTime;
    
    // Loan matching system
    mapping(uint256 => bool) public openLoanRequests;
    uint256[] public activeLoanRequests;
    
    uint256 public loanCounter;
    
    // Events
    event LoanProposed(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 collateral);
    event LoanAccepted(uint256 indexed loanId, address indexed lender);
    event LoanActivated(uint256 indexed loanId);
    event PaymentMade(uint256 indexed loanId, uint256 amount, uint256 remainingDebt);
    event PartialLiquidation(uint256 indexed loanId, uint256 collateralLiquidated, uint256 debtReduced);
    event LoanCompleted(uint256 indexed loanId);
    event CollateralReleased(uint256 indexed loanId, uint256 amount, address to);
    event LoanCancelled(uint256 indexed loanId);
    event CollateralAdded(uint256 indexed loanId, uint256 amount);
    event ExcessCollateralWithdrawn(uint256 indexed loanId, uint256 amount);
    
    constructor(
        address _weth,
        address _usdc,
        address _usdt,
        address _ethPriceFeed,
        address _ethPriceFeedBackup
    ) Ownable(msg.sender) {
        require(_weth != address(0), "Invalid WETH address");
        require(_usdc != address(0), "Invalid USDC address");
        require(_usdt != address(0), "Invalid USDT address");
        require(_ethPriceFeed != address(0), "Invalid price feed address");
        require(_ethPriceFeedBackup != address(0), "Invalid backup price feed address");
        
        weth = IWETH(_weth);
        usdc = IERC20(_usdc);
        usdt = IERC20(_usdt);
        ethPriceFeed = AggregatorV3Interface(_ethPriceFeed);
        ethPriceFeedBackup = AggregatorV3Interface(_ethPriceFeedBackup);
    }
    
    /**
     * @dev Pause contract in emergency
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract when emergency is resolved
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Helper function to calculate loan parameters
     */
    function _calculateLoanParameters(
        uint256 borrowAmount,
        uint256 duration,
        uint256 creditScore
    ) private view returns (
        uint256 requiredCollateralETH,
        uint256 interestRate,
        uint256 totalDebt,
        uint256 monthlyPayment
    ) {
        // Calculate required collateral
        uint256 requiredCollateralRatio = calculateRequiredCollateral(borrowAmount, creditScore);
        uint256 ethPrice = getETHPrice();
        uint256 requiredCollateralUSD = (borrowAmount * requiredCollateralRatio) / PERCENTAGE_PRECISION;
        requiredCollateralETH = (requiredCollateralUSD * PRECISION) / ethPrice;
        
        // Calculate loan terms
        interestRate = calculateInterestRate(creditScore);
        uint256 totalInterest = (borrowAmount * interestRate * duration) / (365 days * PERCENTAGE_PRECISION);
        totalDebt = borrowAmount + totalInterest;
        monthlyPayment = totalDebt / (duration / 30 days);
    }
    
    /**
     * @dev Borrower creates a loan request (no collateral locked yet)
     */
    function proposeLoan(
        uint256 borrowAmount,
        uint256 duration,
        address stablecoin,
        uint256 creditScore
    ) external whenNotPaused returns (uint256 loanId) {
        require(borrowAmount > 0, "Borrow amount must be greater than 0");
        require(stablecoin == address(usdc) || stablecoin == address(usdt), "Invalid stablecoin");
        require(creditScore >= 300 && creditScore <= 850, "Invalid credit score");
        require(duration >= 30 days && duration <= 365 days, "Invalid duration");
        
        // Calculate loan parameters
        (
            uint256 requiredCollateralETH,
            uint256 interestRate,
            uint256 totalDebt,
            uint256 monthlyPayment
        ) = _calculateLoanParameters(borrowAmount, duration, creditScore);
        
        // Create loan proposal
        loanId = ++loanCounter;
        loanVaults[loanId] = LoanVault({
            borrower: msg.sender,
            lender: address(0),
            collateralAmount: requiredCollateralETH,
            principalAmount: borrowAmount,
            outstandingDebt: totalDebt,
            interestRate: interestRate,
            monthlyPayment: monthlyPayment,
            duration: duration,
            proposalTime: block.timestamp,
            startTime: 0,
            lastPaymentTime: 0,
            proposalExpiration: block.timestamp + PROPOSAL_EXPIRATION,
            creditScore: creditScore,
            stablecoin: stablecoin,
            status: LoanStatus.Proposed,
            totalRepaid: 0,
            liquidatedAmount: 0,
            collateralDeposited: false,
            collateralHolder: address(this)
        });
        
        borrowerLoans[msg.sender].push(loanId);
        openLoanRequests[loanId] = true;
        activeLoanRequests.push(loanId);
        creditScores[msg.sender] = creditScore;
        
        emit LoanProposed(loanId, msg.sender, borrowAmount, requiredCollateralETH);
        return loanId;
    }
    
    /**
     * @dev Lender accepts a loan proposal
     */
    function acceptLoan(uint256 loanId) external nonReentrant whenNotPaused {
        LoanVault storage vault = loanVaults[loanId];
        require(vault.status == LoanStatus.Proposed, "Loan not available");
        require(vault.lender == address(0), "Loan already accepted");
        require(msg.sender != vault.borrower, "Cannot lend to yourself");
        require(block.timestamp <= vault.proposalExpiration, "Loan proposal expired");
        
        // Verify lender has sufficient stablecoins
        IERC20 stablecoin = IERC20(vault.stablecoin);
        require(stablecoin.balanceOf(msg.sender) >= vault.principalAmount, "Insufficient balance");
        require(stablecoin.allowance(msg.sender, address(this)) >= vault.principalAmount, "Insufficient allowance");
        
        // Assign lender
        vault.lender = msg.sender;
        lenderLoans[msg.sender].push(loanId);
        openLoanRequests[loanId] = false;
        
        emit LoanAccepted(loanId, msg.sender);
    }
    
    /**
     * @dev Borrower deposits collateral and activates the loan
     */
    function activateLoan(uint256 loanId) external payable nonReentrant whenNotPaused {
        LoanVault storage vault = loanVaults[loanId];
        require(vault.borrower == msg.sender, "Not borrower");
        require(vault.status == LoanStatus.Proposed, "Invalid status");
        require(vault.lender != address(0), "No lender assigned");
        require(msg.value >= vault.collateralAmount, "Insufficient collateral");
        require(!vault.collateralDeposited, "Collateral already deposited");
        require(block.timestamp <= vault.proposalExpiration, "Loan proposal expired");
        
        // Convert ETH to WETH and hold in contract
        weth.deposit{value: msg.value}();
        vault.collateralDeposited = true;
        vault.collateralAmount = msg.value;
        
        // Transfer stablecoins from lender to borrower
        IERC20(vault.stablecoin).safeTransferFrom(vault.lender, vault.borrower, vault.principalAmount);
        
        // Activate loan
        vault.status = LoanStatus.Active;
        vault.startTime = block.timestamp;
        vault.lastPaymentTime = block.timestamp;
        
        emit LoanActivated(loanId);
    }
    
    /**
     * @dev Cancel a proposed loan before activation
     */
    function cancelLoan(uint256 loanId) external whenNotPaused {
        LoanVault storage vault = loanVaults[loanId];
        require(vault.status == LoanStatus.Proposed, "Cannot cancel active loan");
        require(msg.sender == vault.borrower || msg.sender == vault.lender, "Not authorized");
        require(!vault.collateralDeposited, "Collateral already deposited");
        
        vault.status = LoanStatus.Cancelled;
        openLoanRequests[loanId] = false;
        
        emit LoanCancelled(loanId);
    }
    
    /**
     * @dev Make monthly payment
     */
    function makePayment(uint256 loanId) external nonReentrant whenNotPaused {
        LoanVault storage vault = loanVaults[loanId];
        require(vault.status == LoanStatus.Active, "Loan not active");
        require(vault.outstandingDebt > 0, "Loan already repaid");
        
        uint256 paymentAmount = vault.monthlyPayment;
        if (paymentAmount > vault.outstandingDebt) {
            paymentAmount = vault.outstandingDebt;
        }
        
        // Transfer payment directly from borrower to lender
        IERC20(vault.stablecoin).safeTransferFrom(msg.sender, vault.lender, paymentAmount);
        
        // Update state
        vault.outstandingDebt -= paymentAmount;
        vault.totalRepaid += paymentAmount;
        vault.lastPaymentTime = block.timestamp;
        
        emit PaymentMade(loanId, paymentAmount, vault.outstandingDebt);
        
        if (vault.outstandingDebt == 0) {
            _completeLoan(loanId);
        }
    }
    
    /**
     * @dev Calculate liquidation parameters
     */
    function _calculateLiquidationParams(
        LoanVault storage vault,
        uint256 loanId
    ) private view returns (
        bool needFullLiquidation,
        uint256 collateralToLiquidate,
        uint256 debtToRepay
    ) {
        (, uint256 healthFactor) = calculateLTV(loanId);
        require(healthFactor < LIQUIDATION_THRESHOLD, "Liquidation not required");
        
        uint256 ethPrice = getETHPrice();
        uint256 targetCollateralValue = (vault.outstandingDebt * TARGET_HEALTH_FACTOR) / PERCENTAGE_PRECISION;
        uint256 currentCollateralValue = (vault.collateralAmount * ethPrice) / PRECISION;
        
        if (currentCollateralValue <= targetCollateralValue) {
            return (true, 0, 0);
        }
        
        // Calculate minimum liquidation needed
        uint256 excessValue = currentCollateralValue - targetCollateralValue;
        collateralToLiquidate = (excessValue * PRECISION) / ethPrice;
        
        // Apply small liquidation discount
        debtToRepay = (collateralToLiquidate * ethPrice * (PERCENTAGE_PRECISION - MAX_LIQUIDATION_DISCOUNT)) / 
            (PRECISION * PERCENTAGE_PRECISION);
        
        if (debtToRepay > vault.outstandingDebt) {
            debtToRepay = vault.outstandingDebt;
            collateralToLiquidate = (debtToRepay * PRECISION * PERCENTAGE_PRECISION) / 
                (ethPrice * (PERCENTAGE_PRECISION - MAX_LIQUIDATION_DISCOUNT));
        }
        
        return (false, collateralToLiquidate, debtToRepay);
    }
    
    /**
     * @dev Partial liquidation to protect borrower
     */
    function partialLiquidation(uint256 loanId) external nonReentrant whenNotPaused {
        LoanVault storage vault = loanVaults[loanId];
        require(vault.status == LoanStatus.Active, "Loan not active");
        require(block.timestamp > lastLiquidationTime[loanId] + LIQUIDATION_COOLDOWN, "Liquidation cooldown active");
        
        (
            bool needFullLiquidation,
            uint256 collateralToLiquidate,
            uint256 debtToRepay
        ) = _calculateLiquidationParams(vault, loanId);
        
        if (needFullLiquidation) {
            _fullLiquidation(loanId);
            return;
        }
        
        // Verify liquidator has sufficient stablecoins
        IERC20 stablecoin = IERC20(vault.stablecoin);
        require(stablecoin.balanceOf(msg.sender) >= debtToRepay, "Insufficient balance for liquidation");
        require(stablecoin.allowance(msg.sender, address(this)) >= debtToRepay, "Insufficient allowance for liquidation");
        
        // Update state first
        vault.outstandingDebt -= debtToRepay;
        vault.collateralAmount -= collateralToLiquidate;
        vault.liquidatedAmount += collateralToLiquidate;
        lastLiquidationTime[loanId] = block.timestamp;
        
        // Execute liquidation
        stablecoin.safeTransferFrom(msg.sender, vault.lender, debtToRepay);
        
        // Transfer collateral to liquidator
        weth.safeTransfer(msg.sender, collateralToLiquidate);
        
        emit PartialLiquidation(loanId, collateralToLiquidate, debtToRepay);
        
        if (vault.outstandingDebt == 0) {
            _completeLoan(loanId);
        }
    }
    
    /**
     * @dev Add collateral to improve health
     */
    function addCollateral(uint256 loanId) external payable nonReentrant whenNotPaused {
        LoanVault storage vault = loanVaults[loanId];
        require(vault.status == LoanStatus.Active, "Loan not active");
        require(msg.value > 0, "No collateral provided");
        
        // Convert ETH to WETH
        weth.deposit{value: msg.value}();
        
        // Update state
        vault.collateralAmount += msg.value;
        
        emit CollateralAdded(loanId, msg.value);
    }
    
    /**
     * @dev Complete loan and release collateral
     */
    function _completeLoan(uint256 loanId) private {
        LoanVault storage vault = loanVaults[loanId];
        
        uint256 remainingCollateral = vault.collateralAmount;
        
        // Update state first
        vault.collateralAmount = 0;
        vault.status = LoanStatus.Repaid;
        
        // Then perform external calls
        if (remainingCollateral > 0) {
            weth.safeTransfer(vault.borrower, remainingCollateral);
            emit CollateralReleased(loanId, remainingCollateral, vault.borrower);
        }
        
        emit LoanCompleted(loanId);
    }
    
    /**
     * @dev Full liquidation when partial is insufficient
     */
    function _fullLiquidation(uint256 loanId) private {
        LoanVault storage vault = loanVaults[loanId];
        
        uint256 collateralAmount = vault.collateralAmount;
        
        // Update state first
        vault.collateralAmount = 0;
        vault.outstandingDebt = 0;
        vault.status = LoanStatus.Defaulted;
        vault.liquidatedAmount = collateralAmount;
        
        // Then perform external calls
        weth.safeTransfer(vault.lender, collateralAmount);
        emit CollateralReleased(loanId, collateralAmount, vault.lender);
    }
    
    /**
     * @dev Calculate required collateral ratio based on credit score
     */
    function calculateRequiredCollateral(uint256 borrowAmount, uint256 creditScore) 
        public pure returns (uint256) {
        if (creditScore >= EXCELLENT_CREDIT) {
            return 130 * PERCENTAGE_PRECISION / 100; // 130%
        } else if (creditScore >= GOOD_CREDIT) {
            return 140 * PERCENTAGE_PRECISION / 100; // 140%
        } else if (creditScore >= FAIR_CREDIT) {
            return 150 * PERCENTAGE_PRECISION / 100; // 150%
        } else {
            return 175 * PERCENTAGE_PRECISION / 100; // 175%
        }
    }
    
    /**
     * @dev Calculate interest rate based on credit score
     */
    function calculateInterestRate(uint256 creditScore) public pure returns (uint256) {
        if (creditScore >= EXCELLENT_CREDIT) {
            return 500; // 5% APR
        } else if (creditScore >= GOOD_CREDIT) {
            return 750; // 7.5% APR
        } else if (creditScore >= FAIR_CREDIT) {
            return 1000; // 10% APR
        } else {
            return 1500; // 15% APR
        }
    }
    
    /**
     * @dev Calculate current LTV and health factor
     */
    function calculateLTV(uint256 loanId) public view returns (uint256 ltv, uint256 healthFactor) {
        LoanVault memory vault = loanVaults[loanId];
        if (vault.status != LoanStatus.Active) return (0, 0);
        
        uint256 ethPrice = getETHPrice();
        uint256 currentCollateralValue = (vault.collateralAmount * ethPrice) / PRECISION;
        
        if (vault.outstandingDebt == 0) return (0, type(uint256).max);
        if (currentCollateralValue == 0) return (type(uint256).max, 0);
        
        ltv = (vault.outstandingDebt * PERCENTAGE_PRECISION) / currentCollateralValue;
        healthFactor = (currentCollateralValue * PERCENTAGE_PRECISION) / vault.outstandingDebt;
    }
    
    /**
     * @dev Get ETH price from Chainlink with fallback
     */
    function getETHPrice() public view returns (uint256) {
        try ethPriceFeed.latestRoundData() returns (uint80, int256 price, uint256, uint256 updatedAt, uint80) {
            require(price > 0, "Invalid price");
            require(block.timestamp - updatedAt < MAX_ORACLE_STALENESS, "Stale price");
            return uint256(price) * 1e10; // Convert to 18 decimals
        } catch {
            // Fallback to secondary oracle
            (, int256 backupPrice, , uint256 updatedAt, ) = ethPriceFeedBackup.latestRoundData();
            require(backupPrice > 0, "Invalid backup price");
            require(block.timestamp - updatedAt < MAX_ORACLE_STALENESS, "Stale backup price");
            return uint256(backupPrice) * 1e10;
        }
    }
    
    /**
     * @dev Get active loan requests for lenders to browse
     */
    function getActiveLoanRequests() external view returns (uint256[] memory) {
        uint256[] memory tempRequests = new uint256[](activeLoanRequests.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < activeLoanRequests.length; i++) {
            uint256 loanId = activeLoanRequests[i];
            if (openLoanRequests[loanId] && block.timestamp <= loanVaults[loanId].proposalExpiration) {
                tempRequests[count++] = loanId;
            }
        }
        
        uint256[] memory activeRequests = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            activeRequests[i] = tempRequests[i];
        }
        
        return activeRequests;
    }
    
    /**
     * @dev Get detailed loan information
     */
    function getLoanDetails(uint256 loanId) external view returns (
        address borrower,
        address lender,
        uint256 collateralAmount,
        uint256 outstandingDebt,
        uint256 currentLTV,
        uint256 healthFactor,
        LoanStatus status,
        bool collateralDeposited,
        uint256 proposalExpiration
    ) {
        LoanVault memory vault = loanVaults[loanId];
        (currentLTV, healthFactor) = calculateLTV(loanId);
        
        return (
            vault.borrower,
            vault.lender,
            vault.collateralAmount,
            vault.outstandingDebt,
            currentLTV,
            healthFactor,
            vault.status,
            vault.collateralDeposited,
            vault.proposalExpiration
        );
    }
    
    /**
     * @dev Calculate excess collateral
     */
    function _calculateExcessCollateral(
        LoanVault storage vault
    ) private view returns (uint256) {
        uint256 ethPrice = getETHPrice();
        uint256 requiredCollateralRatio = calculateRequiredCollateral(vault.principalAmount, vault.creditScore);
        uint256 requiredCollateralUSD = (vault.outstandingDebt * requiredCollateralRatio) / PERCENTAGE_PRECISION;
        uint256 requiredCollateralETH = (requiredCollateralUSD * PRECISION) / ethPrice;
        
        // Add a safety buffer of 5%
        requiredCollateralETH = (requiredCollateralETH * 105) / 100;
        
        return vault.collateralAmount > requiredCollateralETH ? 
            vault.collateralAmount - requiredCollateralETH : 0;
    }
    
    /**
     * @dev Emergency function to withdraw excess collateral
     */
    function withdrawExcessCollateral(uint256 loanId, uint256 amount) external nonReentrant whenNotPaused {
        LoanVault storage vault = loanVaults[loanId];
        require(vault.status == LoanStatus.Active, "Loan not active");
        require(msg.sender == vault.borrower, "Not borrower");
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 excessCollateral = _calculateExcessCollateral(vault);
        require(amount <= excessCollateral, "Exceeds withdrawable amount");
        
        // Update state first
        vault.collateralAmount -= amount;
        
        // Then perform external call
        weth.safeTransfer(msg.sender, amount);
        
        emit ExcessCollateralWithdrawn(loanId, amount);
    }
    
    /**
     * @dev Check if a loan is eligible for liquidation
     */
    function isEligibleForLiquidation(uint256 loanId) external view returns (bool eligible, uint256 healthFactor) {
        LoanVault memory vault = loanVaults[loanId];
        if (vault.status != LoanStatus.Active) {
            return (false, 0);
        }
        
        (, healthFactor) = calculateLTV(loanId);
        eligible = healthFactor < LIQUIDATION_THRESHOLD && 
                  block.timestamp > lastLiquidationTime[loanId] + LIQUIDATION_COOLDOWN;
        
        return (eligible, healthFactor);
    }
    
    /**
     * @dev Reject direct ETH transfers
     */
    receive() external payable {
        revert("Direct ETH not accepted");
    }
}