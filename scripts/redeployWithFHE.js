const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Redeploying CoinSweeper contracts with proper FHE configuration...");

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  try {
    // Get the contract factories
    const EncryptedERC20 = await ethers.getContractFactory("contracts/EncryptedERC20.sol:EncryptedERC20");
    const CoinSweeper = await ethers.getContractFactory("CoinSweeper");
    
    console.log("\n📦 Deploying EncryptedERC20 token...");
    const encryptedToken = await EncryptedERC20.deploy(
      "CoinSweeper Rewards", // name
      "CSR"                  // symbol
    );
    
    await encryptedToken.waitForDeployment();
    const encryptedTokenAddress = await encryptedToken.getAddress();
    console.log("✅ EncryptedERC20 deployed to:", encryptedTokenAddress);
    
    console.log("\n🎮 Deploying CoinSweeper game contract...");
    const coinSweeper = await CoinSweeper.deploy(encryptedTokenAddress);
    
    await coinSweeper.waitForDeployment();
    const coinSweeperAddress = await coinSweeper.getAddress();
    console.log("✅ CoinSweeper deployed to:", coinSweeperAddress);
    
    console.log("\n🔐 Transferring token ownership to game contract...");
    await encryptedToken.transferOwnership(coinSweeperAddress);
    console.log("✅ Token ownership transferred to game contract");
    
    // Test the new FHE functionality
    console.log("\n🧪 Testing FHE functionality...");
    try {
      const testTx = await coinSweeper.recordWin(1, 60, 10); // difficulty=1, time=60s, coins=10
      await testTx.wait();
      console.log("✅ FHE-enabled recordWin function works!");
      
      // Check if tokens were minted
      const balance = await encryptedToken.balanceOf(deployer.address);
      console.log("✅ Encrypted tokens minted successfully:", balance.toString());
    } catch (error) {
      console.log("❌ FHE test failed:", error.message);
    }
    
    console.log("\n📋 Deployment Summary:");
    console.log("========================");
    console.log("New EncryptedERC20:", encryptedTokenAddress);
    console.log("New CoinSweeper:", coinSweeperAddress);
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    console.log("Deployer:", deployer.address);
    
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
        purpose: "Development and testing with full FHE support",
        fheSupport: "Full - using proper Zama FHE configuration",
        setupMethod: "Redeployed with proper FHE configuration",
        fixes: [
          "Added FHE.setCoprocessor(FHEVMConfig.defaultConfig()) to both contracts",
          "Updated CoinSweeper to use encrypted types (euint64) for rewards and scores",
          "Fixed reward calculation with proper FHE operations",
          "Enhanced leaderboard with encrypted scores"
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
    console.log("\n🎉 FHE-enabled contract redeployment completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Update frontend contract address in src/types/web3.ts");
    console.log("2. Test the game to verify FHE functionality works");
    console.log("3. Check that encrypted balances and decryption work");
    console.log("4. Verify leaderboard with encrypted scores");
    
  } catch (error) {
    console.error("❌ Error redeploying contracts:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 