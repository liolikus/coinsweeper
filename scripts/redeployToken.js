const { ethers } = require("hardhat");

async function main() {
  console.log("Redeploying EncryptedERC20 token with Ownable...");

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Current CoinSweeper address
  const COIN_SWEEPER_ADDRESS = "0xB45D181c2F51700a489754993D9E2A0F6032504F";
  
  try {
    // Deploy new EncryptedERC20 token with Ownable
    console.log("Deploying new EncryptedERC20 token...");
    const EncryptedERC20 = await ethers.getContractFactory("contracts/EncryptedERC20.sol:EncryptedERC20");
    const encryptedToken = await EncryptedERC20.deploy(
      "CoinSweeper Rewards", // name
      "CSR"                  // symbol
    );
    
    await encryptedToken.waitForDeployment();
    const encryptedTokenAddress = await encryptedToken.getAddress();
    console.log("✅ New EncryptedERC20 deployed to:", encryptedTokenAddress);
    
    // Transfer ownership to CoinSweeper contract
    console.log("Transferring ownership to CoinSweeper contract...");
    const tx = await encryptedToken.transferOwnership(COIN_SWEEPER_ADDRESS);
    await tx.wait();
    console.log("✅ Token ownership transferred to CoinSweeper contract!");
    
    // Verify ownership
    const newOwner = await encryptedToken.owner();
    console.log("New token owner:", newOwner);
    
    // Update the CoinSweeper contract to use the new token
    console.log("Updating CoinSweeper contract to use new token...");
    const CoinSweeper = await ethers.getContractFactory("CoinSweeper");
    const coinSweeper = CoinSweeper.attach(COIN_SWEEPER_ADDRESS);
    
    const updateTx = await coinSweeper.setRewardToken(encryptedTokenAddress);
    await updateTx.wait();
    console.log("✅ CoinSweeper contract updated with new token!");
    
    // Test if CoinSweeper can now mint tokens
    console.log("Testing if CoinSweeper can mint tokens...");
    try {
      const testTx = await coinSweeper.recordWin(1, 60, 10); // difficulty=1, time=60s, coins=10
      console.log("✅ CoinSweeper can successfully call recordWin!");
    } catch (error) {
      console.log("❌ CoinSweeper still cannot mint tokens. Error:", error.message);
    }
    
    console.log("\n📋 Deployment Summary:");
    console.log("========================");
    console.log("New EncryptedERC20:", encryptedTokenAddress);
    console.log("CoinSweeper:", COIN_SWEEPER_ADDRESS);
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
        coinSweeper: COIN_SWEEPER_ADDRESS
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
        setupMethod: "Redeployed with Ownable inheritance fix"
      },
      timestamp: new Date().toISOString(),
      frontendConfig: {
        contractAddress: COIN_SWEEPER_ADDRESS,
        configFile: "src/types/web3.ts"
      }
    };
    
    fs.writeFileSync(
      'deployment-sepolia.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\n✅ Deployment info saved to: deployment-sepolia.json");
    console.log("\n🎉 Token redeployment completed successfully!");
    
  } catch (error) {
    console.error("Error redeploying token:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 