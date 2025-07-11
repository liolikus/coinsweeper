const { ethers } = require("hardhat");

async function main() {
  console.log("Testing recordWin function...");

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
    
    // Check player stats before
    console.log("\nChecking player stats before...");
    const statsBefore = await coinSweeper.getPlayerStats(deployer.address);
    console.log("Games played:", statsBefore[0].toString());
    console.log("Games won:", statsBefore[1].toString());
    console.log("Total coins found:", statsBefore[2].toString());
    console.log("Best time:", statsBefore[3].toString());
    console.log("Total rewards:", statsBefore[4].toString());
    
    // Check token balance before
    console.log("\nChecking token balance before...");
    try {
      const balanceBefore = await encryptedToken.balanceOf(deployer.address);
      console.log("Token balance before:", balanceBefore.toString());
    } catch (error) {
      console.log("Error getting token balance:", error.message);
    }
    
    // Try to call recordWin
    console.log("\nCalling recordWin...");
    try {
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
          console.log("Event:", parsedLog.name, parsedLog.args);
        } catch (e) {
          // Not a CoinSweeper event
        }
      }
      
    } catch (error) {
      console.log("❌ Error calling recordWin:", error.message);
      console.log("Error details:", error);
    }
    
    // Check player stats after
    console.log("\nChecking player stats after...");
    const statsAfter = await coinSweeper.getPlayerStats(deployer.address);
    console.log("Games played:", statsAfter[0].toString());
    console.log("Games won:", statsAfter[1].toString());
    console.log("Total coins found:", statsAfter[2].toString());
    console.log("Best time:", statsAfter[3].toString());
    console.log("Total rewards:", statsAfter[4].toString());
    
    // Check token balance after
    console.log("\nChecking token balance after...");
    try {
      const balanceAfter = await encryptedToken.balanceOf(deployer.address);
      console.log("Token balance after:", balanceAfter.toString());
    } catch (error) {
      console.log("Error getting token balance:", error.message);
    }
    
    // Check leaderboard
    console.log("\nChecking leaderboard...");
    const leaderboardCount = await coinSweeper.leaderboardCount();
    console.log("Leaderboard entries:", leaderboardCount.toString());
    
    if (leaderboardCount > 0) {
      const entry = await coinSweeper.getLeaderboardEntry(0);
      console.log("First entry:", {
        player: entry[0],
        score: entry[1].toString(),
        timestamp: entry[2].toString()
      });
    }
    
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