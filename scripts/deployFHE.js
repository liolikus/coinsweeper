const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Zama FHE-enabled CoinSweeper contracts...");

  // Get the contract factories
  const EncryptedERC20 = await ethers.getContractFactory("contracts/EncryptedERC20.sol:EncryptedERC20");
  const CoinSweeper = await ethers.getContractFactory("CoinSweeper");
  
  // Deploy the EncryptedERC20 token first
  console.log("Deploying EncryptedERC20 token...");
  const [deployer] = await ethers.getSigners();
  
  const encryptedToken = await EncryptedERC20.deploy(
    "CoinSweeper Rewards", // name
    "CSR"                  // symbol
  );
  
  await encryptedToken.waitForDeployment();
  const encryptedTokenAddress = await encryptedToken.getAddress();
  console.log("EncryptedERC20 deployed to:", encryptedTokenAddress);
  
  // Deploy the CoinSweeper game contract with the token address
  console.log("Deploying CoinSweeper game contract...");
  const coinSweeper = await CoinSweeper.deploy(encryptedTokenAddress);
  
  await coinSweeper.waitForDeployment();
  const coinSweeperAddress = await coinSweeper.getAddress();
  console.log("CoinSweeper deployed to:", coinSweeperAddress);
  
  // Transfer ownership of the token to the game contract for minting
  console.log("Transferring token ownership to game contract...");
  await encryptedToken.transferOwnership(coinSweeperAddress);
  
  // Log deployment info
  console.log("\nDeployment Information:");
  console.log("========================");
  console.log("EncryptedERC20 Token:", encryptedTokenAddress);
  console.log("CoinSweeper Game:", coinSweeperAddress);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Deployer:", deployer.address);
  
  // Verify contracts on Sepolia Etherscan
  const network = await ethers.provider.getNetwork();
  if (network.chainId === 11155111) { // Sepolia testnet
    console.log("\nTo verify on Sepolia Etherscan, run:");
    console.log(`npx hardhat verify --network sepolia --contract contracts/EncryptedERC20.sol:EncryptedERC20 ${encryptedTokenAddress} "CoinSweeper Rewards" "CSR"`);
    console.log(`npx hardhat verify --network sepolia ${coinSweeperAddress} ${encryptedTokenAddress}`);
  }
  
  // Save deployment addresses to a file
  const fs = require('fs');
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
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
      fheSupport: "Limited - requires Fhenix network for full FHE features"
    },
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    `deployment-${network.chainId}.json`, 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`\nDeployment info saved to: deployment-${network.chainId}.json`);
  console.log("\n🎉 Zama FHE integration deployed successfully!");
  console.log("📚 For more information, visit: https://docs.zama.ai/protocol");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 