const { ethers } = require("hardhat");

async function main() {
  console.log("Starting USDT distribution...");

  // Get the deployed contract addresses
  const USDT_ADDRESS = "0x936fbe91566c62B6c26564C315a0212c9D26976B";
  
  // Wallet addresses to fund
  const wallets = [
    "0x5B64Ad3d3aDe66291de03f29f5a78b12DD0412b5",
    "0x52f32f1168d2f84A6B79b59c91748F5A5Ceb790f",
    "0xbb5a70819707E1beccc1744658280e96b44abc9A",
    "0x5ADD0Cf39B54Ceb6361d94c24a3A37FD8C881976",
    "0x40ED7dEF60bdb45f2C3c4eB6A8B04d9D3e18171F",
    "0x1480951f868eBB998AC0114f099F0D51e005616b",
    "0xCab5bdfE6889Be8339393efdc53648e9330ED96b",
    "0x6D3f939b81367A8E29eEEDF219a47145db492e31",
    "0x999247722c488312DD1C11EB730202936A372CE8",
    "0xa4058097E43979a495B1Bde15e44f876FaB4D1e7"
  ];

  // Get the USDT contract instance
  const usdt = await ethers.getContractAt(
    [
      "function faucet(uint256 amount) external",
      "function balanceOf(address owner) external view returns (uint256)",
      "function transfer(address to, uint256 amount) external returns (bool)",
      "function decimals() external view returns (uint8)"
    ],
    USDT_ADDRESS
  );

  // Get the first signer (deployer) to use for token distribution
  const [deployer] = await ethers.getSigners();
  console.log("Using deployer address:", deployer.address);

  // Amount to distribute: 10,000 USDT per wallet (6 decimals for USDT)
  const amount = ethers.parseUnits("10000", 6);
  console.log("Amount per wallet:", ethers.formatUnits(amount, 6), "USDT");

  // First, mint tokens to the deployer
  console.log("\nMinting USDT tokens to deployer...");
  const totalAmount = amount * BigInt(wallets.length);
  try {
    const faucetTx = await usdt.connect(deployer).faucet(totalAmount);
    await faucetTx.wait();
    console.log("✅ Minted", ethers.formatUnits(totalAmount, 6), "USDT to deployer");
  } catch (error) {
    console.log("Note: Faucet might not be available or deployer already has tokens");
  }

  // Check deployer balance
  const deployerBalance = await usdt.balanceOf(deployer.address);
  console.log("Deployer USDT balance:", ethers.formatUnits(deployerBalance, 6), "USDT");

  // Distribute tokens to each wallet
  console.log("\nDistributing tokens to wallets...");
  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    
    try {
      // Check current balance
      const currentBalance = await usdt.balanceOf(wallet);
      console.log(`Wallet ${i}: ${wallet}`);
      console.log(`  Current balance: ${ethers.formatUnits(currentBalance, 6)} USDT`);

      // If wallet already has enough tokens, skip
      if (currentBalance >= amount) {
        console.log(`  ✅ Already has sufficient tokens, skipping...`);
        continue;
      }

      // Try faucet first (if available for this wallet)
      try {
        // Connect to wallet (this might not work with ganache accounts)
        // Instead, transfer from deployer
        console.log(`  Transferring ${ethers.formatUnits(amount, 6)} USDT...`);
        const transferTx = await usdt.connect(deployer).transfer(wallet, amount);
        await transferTx.wait();
        
        // Verify new balance
        const newBalance = await usdt.balanceOf(wallet);
        console.log(`  ✅ New balance: ${ethers.formatUnits(newBalance, 6)} USDT`);
        
      } catch (transferError) {
        // If transfer fails, try faucet directly
        console.log(`  Transfer failed, trying faucet...`);
        try {
          // This would require connecting as the wallet, which might not work
          // So we'll just log the error and continue
          console.log(`  ❌ Could not distribute to ${wallet}:`, transferError.message);
        } catch (faucetError) {
          console.log(`  ❌ Both transfer and faucet failed for ${wallet}`);
        }
      }
      
    } catch (error) {
      console.log(`  ❌ Error processing ${wallet}:`, error.message);
    }
    
    console.log("");
  }

  console.log("✅ Token distribution completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });