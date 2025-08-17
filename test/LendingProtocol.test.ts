import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("DecentralizedP2PLending", function () {
  async function deployLendingFixture() {
    const [owner, borrower, lender] = await ethers.getSigners();

    // Deploy mock contracts
    const MockWETH = await ethers.getContractFactory("MockWETH");
    const mockWETH = await MockWETH.deploy();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();

    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy();

    const MockChainlinkPriceFeed = await ethers.getContractFactory("MockChainlinkPriceFeed");
    const ethPriceFeed = await MockChainlinkPriceFeed.deploy(
      8, // decimals
      "ETH / USD",
      1, // version
      300000000000 // $3000 in 8 decimals
    );

    const ethPriceFeedBackup = await MockChainlinkPriceFeed.deploy(
      8, // decimals
      "ETH / USD Backup",
      1, // version
      300000000000 // $3000 in 8 decimals
    );

    // Deploy lending protocol
    const DecentralizedP2PLending = await ethers.getContractFactory("DecentralizedP2PLending");
    const lending = await DecentralizedP2PLending.deploy(
      await mockWETH.getAddress(),
      await mockUSDC.getAddress(),
      await mockUSDT.getAddress(),
      await ethPriceFeed.getAddress(),
      await ethPriceFeedBackup.getAddress()
    );

    // Setup tokens for testing
    await mockUSDC.mint(lender.address, ethers.parseUnits("10000", 6)); // 10k USDC
    await mockUSDT.mint(lender.address, ethers.parseUnits("10000", 6)); // 10k USDT

    return {
      lending,
      mockWETH,
      mockUSDC,
      mockUSDT,
      ethPriceFeed,
      ethPriceFeedBackup,
      owner,
      borrower,
      lender,
    };
  }

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const { lending, mockWETH, mockUSDC } = await loadFixture(deployLendingFixture);
      
      expect(await lending.weth()).to.equal(await mockWETH.getAddress());
      expect(await lending.usdc()).to.equal(await mockUSDC.getAddress());
    });

    it("Should get ETH price from oracle", async function () {
      const { lending } = await loadFixture(deployLendingFixture);
      
      const price = await lending.getETHPrice();
      expect(price).to.equal(ethers.parseEther("3000")); // $3000 converted to 18 decimals
    });
  });

  describe("Loan Proposal", function () {
    it("Should allow borrower to propose a loan", async function () {
      const { lending, mockUSDC, borrower } = await loadFixture(deployLendingFixture);
      
      const borrowAmount = ethers.parseUnits("1000", 6); // 1000 USDC
      const duration = 30 * 24 * 60 * 60; // 30 days
      const creditScore = 750;

      await expect(
        lending.connect(borrower).proposeLoan(
          borrowAmount,
          duration,
          await mockUSDC.getAddress(),
          creditScore
        )
      ).to.emit(lending, "LoanProposed");

      const loanDetails = await lending.getLoanDetails(1);
      expect(loanDetails.borrower).to.equal(borrower.address);
      expect(loanDetails.status).to.equal(1); // LoanStatus.Proposed
    });

    it("Should calculate correct collateral requirements", async function () {
      const { lending } = await loadFixture(deployLendingFixture);
      
      const borrowAmount = ethers.parseUnits("1000", 6);
      const creditScore = 750; // Excellent credit
      
      const requiredCollateral = await lending.calculateRequiredCollateral(borrowAmount, creditScore);
      expect(requiredCollateral).to.equal(13000); // 130% for excellent credit
    });
  });

  describe("Loan Acceptance and Activation", function () {
    it("Should allow lender to accept and borrower to activate loan", async function () {
      const { lending, mockUSDC, borrower, lender } = await loadFixture(deployLendingFixture);
      
      // Propose loan
      const borrowAmount = ethers.parseUnits("1000", 6);
      const duration = 30 * 24 * 60 * 60;
      const creditScore = 750;

      await lending.connect(borrower).proposeLoan(
        borrowAmount,
        duration,
        await mockUSDC.getAddress(),
        creditScore
      );

      // Approve USDC for lending contract
      await mockUSDC.connect(lender).approve(await lending.getAddress(), borrowAmount);

      // Accept loan
      await expect(
        lending.connect(lender).acceptLoan(1)
      ).to.emit(lending, "LoanAccepted");

      // Activate loan with collateral
      const collateralAmount = ethers.parseEther("0.5"); // 0.5 ETH
      await expect(
        lending.connect(borrower).activateLoan(1, { value: collateralAmount })
      ).to.emit(lending, "LoanActivated");

      const loanDetails = await lending.getLoanDetails(1);
      expect(loanDetails.status).to.equal(2); // LoanStatus.Active
      expect(loanDetails.lender).to.equal(lender.address);
    });
  });
});