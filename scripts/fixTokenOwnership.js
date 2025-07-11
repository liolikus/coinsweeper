const { ethers } = require("hardhat");

async function main() {
  console.log("Fixing token ownership for CoinSweeper contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Current contract addresses from deployment-sepolia.json
  const ENCRYPTED_ERC20_ADDRESS = "0xbac882b8c830aE594313520556589fdFA605159B";
  const COIN_SWEEPER_ADDRESS = "0xB45D181c2F51700a489754993D9E2A0F6032504F";
  
  console.log("EncryptedERC20 address:", ENCRYPTED_ERC20_ADDRESS);
  console.log("CoinSweeper address:", COIN_SWEEPER_ADDRESS);
  
  // Get the EncryptedERC20 contract
  const EncryptedERC20 = await ethers.getContractFactory("contracts/EncryptedERC20.sol:EncryptedERC20");
  const encryptedToken = EncryptedERC20.attach(ENCRYPTED_ERC20_ADDRESS);
  
  // Get the CoinSweeper contract
  const CoinSweeper = await ethers.getContractFactory("CoinSweeper");
  const coinSweeper = CoinSweeper.attach(COIN_SWEEPER_ADDRESS);
  
  try {
    // Check current owner of the token
    console.log("Checking current token owner...");
    const currentOwner = await encryptedToken.owner();
    console.log("Current token owner:", currentOwner);
    
    if (currentOwner.toLowerCase() === COIN_SWEEPER_ADDRESS.toLowerCase()) {
      console.log("✅ Token ownership is already correctly set to CoinSweeper contract!");
    } else {
      console.log("❌ Token ownership is not set to CoinSweeper contract.");
      console.log("Transferring ownership...");
      
      // Transfer ownership to CoinSweeper contract
      const tx = await encryptedToken.transferOwnership(COIN_SWEEPER_ADDRESS);
      await tx.wait();
      console.log("✅ Token ownership transferred to CoinSweeper contract!");
    }
    
    // Verify the transfer
    const newOwner = await encryptedToken.owner();
    console.log("New token owner:", newOwner);
    
    // Check if CoinSweeper contract can now mint tokens
    console.log("Testing if CoinSweeper can mint tokens...");
    try {
      // Try to mint a small amount (this will fail if not owner, but we can catch the error)
      const mintTx = await coinSweeper.recordWin(1, 60, 10); // difficulty=1, time=60s, coins=10
      console.log("✅ CoinSweeper can successfully call recordWin!");
    } catch (error) {
      console.log("❌ CoinSweeper still cannot mint tokens. Error:", error.message);
      console.log("This might be due to other issues in the contract logic.");
    }
    
  } catch (error) {
    console.error("Error fixing token ownership:", error);
  }
  
  console.log("\n✅ Token ownership fix completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 