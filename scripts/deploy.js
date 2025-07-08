const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying CoinSweeper contract...");

  // Get the contract factory
  const CoinSweeper = await ethers.getContractFactory("CoinSweeper");
  
  // Deploy the contract
  const coinSweeper = await CoinSweeper.deploy();
  
  // Wait for deployment to finish
  await coinSweeper.deployed();

  console.log("CoinSweeper deployed to:", coinSweeper.address);
  
  // Log deployment info
  console.log("\nDeployment Information:");
  console.log("========================");
  console.log("Contract Address:", coinSweeper.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Deployer:", (await ethers.getSigners())[0].address);
  
  // Verify contract on Etherscan (if on supported network)
  const network = await ethers.provider.getNetwork();
  if (network.chainId === 1 || network.chainId === 137 || network.chainId === 80001) {
    console.log("\nTo verify on Etherscan, run:");
    console.log(`npx hardhat verify --network ${network.name} ${coinSweeper.address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 