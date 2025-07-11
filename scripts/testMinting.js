const { ethers } = require("hardhat");

async function main() {
  console.log("Testing minting functionality...");

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Contract addresses from deployment
  const COIN_SWEEPER_ADDRESS = "0x73816AdE6d7567f1252b4d1A84FD4690472D5cbE";
  const ENCRYPTED_TOKEN_ADDRESS = "0xabD72c2a7321cF010A484EcEe7464444e9D59aF8";
  
  try {
    // Get contract instances
    const CoinSweeper = await ethers.getContractFactory("CoinSweeper");
    const coinSweeper = CoinSweeper.attach(COIN_SWEEPER_ADDRESS);
    
    const EncryptedERC20 = await ethers.getContractFactory("contracts/EncryptedERC20.sol:EncryptedERC20");
    const encryptedToken = EncryptedERC20.attach(ENCRYPTED_TOKEN_ADDRESS);
    
    console.log("Contract addresses:");
    console.log("CoinSweeper:", COIN_SWEEPER_ADDRESS);
    console.log("EncryptedERC20:", ENCRYPTED_TOKEN_ADDRESS);
    
    // Check token ownership
    console.log("\nChecking token ownership...");
    const tokenOwner = await encryptedToken.owner();
    console.log("Token owner:", tokenOwner);
    console.log("CoinSweeper address:", COIN_SWEEPER_ADDRESS);
    console.log("Ownership correct:", tokenOwner.toLowerCase() === COIN_SWEEPER_ADDRESS.toLowerCase());
    
    // Check total supply before
    console.log("\nChecking total supply before...");
    const totalSupplyBefore = await encryptedToken.totalSupply();
    console.log("Total supply before:", totalSupplyBefore.toString());
    
    // Check balance before
    console.log("\nChecking balance before...");
    const balanceBefore = await encryptedToken.balanceOf(deployer.address);
    console.log("Balance before (raw):", balanceBefore);
    console.log("Balance before (string):", balanceBefore.toString());
    
    // Try direct minting from CoinSweeper contract
    console.log("\nTesting direct minting...");
    try {
      // Call recordWin to trigger minting
      const tx = await coinSweeper.recordWin(1, 60, 10); // difficulty=1, time=60s, coins=10
      console.log("Transaction hash:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transaction successful!");
      console.log("Gas used:", receipt.gasUsed.toString());
      
      // Check for events
      console.log("\nChecking events...");
      for (const log of receipt.logs) {
        try {
          const parsedLog = coinSweeper.interface.parseLog(log);
          console.log("CoinSweeper Event:", parsedLog.name, parsedLog.args);
        } catch (e) {
          try {
            const parsedLog = encryptedToken.interface.parseLog(log);
            console.log("Token Event:", parsedLog.name, parsedLog.args);
          } catch (e2) {
            // Not a known event
          }
        }
      }
      
    } catch (error) {
      console.log("❌ Error calling recordWin:", error.message);
      console.log("Error details:", error);
    }
    
    // Check total supply after
    console.log("\nChecking total supply after...");
    const totalSupplyAfter = await encryptedToken.totalSupply();
    console.log("Total supply after:", totalSupplyAfter.toString());
    console.log("Supply increase:", totalSupplyAfter - totalSupplyBefore);
    
    // Check balance after
    console.log("\nChecking balance after...");
    const balanceAfter = await encryptedToken.balanceOf(deployer.address);
    console.log("Balance after (raw):", balanceAfter);
    console.log("Balance after (string):", balanceAfter.toString());
    
    // Try to decrypt the balance (this might not work on Sepolia)
    console.log("\nTrying to decrypt balance...");
    try {
      // The balance is an euint64, we need to see if we can access it
      console.log("Balance type:", typeof balanceAfter);
      console.log("Balance properties:", Object.keys(balanceAfter));
      
      // Try to access the underlying value
      if (balanceAfter && balanceAfter.unwrap) {
        console.log("Balance unwrapped:", balanceAfter.unwrap());
      }
    } catch (error) {
      console.log("Cannot decrypt balance:", error.message);
    }
    
    // Check if the balance changed
    console.log("\nBalance comparison:");
    console.log("Before:", balanceBefore.toString());
    console.log("After:", balanceAfter.toString());
    console.log("Changed:", balanceBefore.toString() !== balanceAfter.toString());
    
  } catch (error) {
    console.error("Error in test:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 