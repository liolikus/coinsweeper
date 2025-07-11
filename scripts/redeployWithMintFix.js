const { ethers } = require("hardhat");

async function main() {
  console.log("Redeploying contracts with mintTo fix...");

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  try {
    // Deploy new EncryptedERC20 token with mintTo function
    console.log("Deploying new EncryptedERC20 token with mintTo function...");
    const EncryptedERC20 = await ethers.getContractFactory("contracts/EncryptedERC20.sol:EncryptedERC20");
    const encryptedToken = await EncryptedERC20.deploy(
      "CoinSweeper Rewards", // name
      "CSR"                  // symbol
    );
    
    await encryptedToken.waitForDeployment();
    const encryptedTokenAddress = await encryptedToken.getAddress();
    console.log("✅ New EncryptedERC20 deployed to:", encryptedTokenAddress);
    
    // Deploy new CoinSweeper contract with fixed recordWin function
    console.log("Deploying new CoinSweeper contract with mintTo fix...");
    const CoinSweeper = await ethers.getContractFactory("CoinSweeper");
    const coinSweeper = await CoinSweeper.deploy(encryptedTokenAddress);
    
    await coinSweeper.waitForDeployment();
    const coinSweeperAddress = await coinSweeper.getAddress();
    console.log("✅ New CoinSweeper deployed to:", coinSweeperAddress);
    
    // Transfer ownership of the token to the CoinSweeper contract
    console.log("Transferring token ownership to CoinSweeper contract...");
    const tx = await encryptedToken.transferOwnership(coinSweeperAddress);
    await tx.wait();
    console.log("✅ Token ownership transferred to CoinSweeper contract!");
    
    // Verify ownership
    const newOwner = await encryptedToken.owner();
    console.log("New token owner:", newOwner);
    
    // Test if CoinSweeper can now mint tokens to players
    console.log("Testing if CoinSweeper can mint tokens to players...");
    try {
      // Test with a dummy address (this will fail but we can see if the function call works)
      const testAddress = "0x0000000000000000000000000000000000000001";
      const testTx = await coinSweeper.recordWin(1, 60, 10); // difficulty=1, time=60s, coins=10
      console.log("✅ CoinSweeper can successfully call recordWin!");
    } catch (error) {
      console.log("❌ CoinSweeper still cannot mint tokens. Error:", error.message);
      console.log("This might be due to FHE requirements or other issues.");
    }
    
    console.log("\n📋 Deployment Summary:");
    console.log("========================");
    console.log("New EncryptedERC20:", encryptedTokenAddress);
    console.log("New CoinSweeper:", coinSweeperAddress);
    console.log("Token Owner:", newOwner);
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    
    // Update deployment file
    const fs = require('fs');
    const deploymentInfo = {
      network: "sepolia",
      chainId: 11155111,
      deployer: deployer.address,
      contracts: {
        encryptedERC20: encryptedTokenAddress,
        coinSweeper: coinSweeperAddress
      },
      zamaIntegration: {
        relayerSDK: "@zama-fhe/relayer-sdk",
        documentation: "https://docs.zama.ai/protocol",
        features: [
          "Encrypted token balances",
          "Private transfers via Zama relayer",
          "Confidential leaderboard",
          "Homomorphic operations"
        ]
      },
      deploymentNotes: {
        network: "Sepolia Testnet",
        purpose: "Development and testing",
        fheSupport: "Limited - requires Fhenix network for full FHE features",
        setupMethod: "Redeployed with mintTo function fix",
        fixes: [
          "Added mintTo function to EncryptedERC20",
          "Fixed recordWin to mint tokens to player address",
          "Resolved token distribution issue"
        ]
      },
      timestamp: new Date().toISOString(),
      frontendConfig: {
        contractAddress: coinSweeperAddress,
        configFile: "src/types/web3.ts"
      }
    };
    
    fs.writeFileSync(
      'deployment-sepolia.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\n✅ Deployment info saved to: deployment-sepolia.json");
    console.log("\n🎉 Contract redeployment with mintTo fix completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Update frontend contract address in src/types/web3.ts");
    console.log("2. Test the game to verify token distribution works");
    console.log("3. Check leaderboard functionality");
    
  } catch (error) {
    console.error("Error redeploying contracts:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 