const { ethers } = require("hardhat");

async function main() {
  console.log("Setting up reward token for CoinSweeper contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Contract addresses (update these with your actual deployed addresses)
  const COIN_SWEEPER_ADDRESS = "0x1ff7711C760849Eded6af3320156B0924E1692B0"; // Update this
  
  // Get the CoinSweeper contract
  const CoinSweeper = await ethers.getContractFactory("CoinSweeper");
  const coinSweeper = CoinSweeper.attach(COIN_SWEEPER_ADDRESS);
  
  // Check current reward token
  console.log("Checking current reward token...");
  try {
    const currentToken = await coinSweeper.rewardToken();
    console.log("Current reward token:", currentToken);
    
    if (currentToken === "0x0000000000000000000000000000000000000000") {
      console.log("No reward token set. Deploying new EncryptedERC20 token...");
      
      // Deploy new EncryptedERC20 token
      const EncryptedERC20 = await ethers.getContractFactory("contracts/EncryptedERC20.sol:EncryptedERC20");
      const encryptedToken = await EncryptedERC20.deploy(
        "CoinSweeper Rewards", // name
        "CSR"                  // symbol
      );
      
      await encryptedToken.waitForDeployment();
      const encryptedTokenAddress = await encryptedToken.getAddress();
      console.log("EncryptedERC20 deployed to:", encryptedTokenAddress);
      
      // Set the reward token in the CoinSweeper contract
      console.log("Setting reward token in CoinSweeper contract...");
      const tx = await coinSweeper.setRewardToken(encryptedTokenAddress);
      await tx.wait();
      console.log("Reward token set successfully!");
      
      // Transfer ownership of the token to the game contract for minting
      console.log("Transferring token ownership to game contract...");
      await encryptedToken.transferOwnership(COIN_SWEEPER_ADDRESS);
      console.log("Token ownership transferred!");
      
    } else {
      console.log("Reward token already set. No action needed.");
    }
    
  } catch (error) {
    console.error("Error checking/setting reward token:", error);
    
    // If the contract doesn't exist or there's an error, deploy both contracts
    console.log("Deploying new contracts...");
    
    const EncryptedERC20 = await ethers.getContractFactory("contracts/EncryptedERC20.sol:EncryptedERC20");
    const encryptedToken = await EncryptedERC20.deploy(
      "CoinSweeper Rewards", // name
      "CSR"                  // symbol
    );
    
    await encryptedToken.waitForDeployment();
    const encryptedTokenAddress = await encryptedToken.getAddress();
    console.log("EncryptedERC20 deployed to:", encryptedTokenAddress);
    
    const newCoinSweeper = await CoinSweeper.deploy(encryptedTokenAddress);
    await newCoinSweeper.waitForDeployment();
    const newCoinSweeperAddress = await newCoinSweeper.getAddress();
    console.log("New CoinSweeper deployed to:", newCoinSweeperAddress);
    
    // Transfer ownership of the token to the game contract for minting
    await encryptedToken.transferOwnership(newCoinSweeperAddress);
    console.log("Token ownership transferred!");
    
    console.log("\nNew deployment addresses:");
    console.log("EncryptedERC20:", encryptedTokenAddress);
    console.log("CoinSweeper:", newCoinSweeperAddress);
  }
  
  console.log("\n✅ Reward token setup completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 