const fs = require('fs');

function updateFrontendConfig() {
  console.log("🔄 Updating frontend configuration...");
  
  try {
    // Read the deployment file
    const deploymentData = JSON.parse(fs.readFileSync('deployment-sepolia.json', 'utf8'));
    const newContractAddress = deploymentData.contracts.coinSweeper;
    
    console.log("📋 New contract address:", newContractAddress);
    
    // Read the current web3.ts file
    const web3Path = 'src/types/web3.ts';
    let web3Content = fs.readFileSync(web3Path, 'utf8');
    
    // Update the contract address
    const addressRegex = /export const CONTRACT_ADDRESSES = \{[^}]*\}/;
    const newAddressConfig = `export const CONTRACT_ADDRESSES = {
  sepolia: "${newContractAddress}", // CoinSweeper contract on Sepolia
}`;
    
    if (addressRegex.test(web3Content)) {
      web3Content = web3Content.replace(addressRegex, newAddressConfig);
      fs.writeFileSync(web3Path, web3Content);
      console.log("✅ Updated src/types/web3.ts with new contract address");
    } else {
      console.log("❌ Could not find CONTRACT_ADDRESSES in web3.ts");
    }
    
    console.log("\n🎉 Frontend configuration updated successfully!");
    console.log("📝 You can now restart your frontend to use the new contracts");
    
  } catch (error) {
    console.error("❌ Error updating frontend config:", error);
  }
}

updateFrontendConfig(); 