import { ethers } from "ethers";
import { FhevmInstance, createInstance } from "@zama-fhe/relayer-sdk";
import { getCoinSweeperContract, getEncryptedERC20Contract } from "./web3Utils";
import { CONTRACT_ADDRESSES } from "../types/web3";

// FHE instance for relayer operations
let fheInstance: FhevmInstance | null = null;
let fheInitializationFailed = false;

// Frontend relayer configuration for decryption operations
// Note: This is different from smart contract FHE configuration
// Smart contracts use FHE.setCoprocessor(FHEVMConfig.defaultConfig())
// Frontend uses this configuration for relayer communication
const RelayerConfig = {
  // ACL_CONTRACT_ADDRESS (FHEVM Host chain)
  aclContractAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
  // KMS_VERIFIER_CONTRACT_ADDRESS (FHEVM Host chain)
  kmsContractAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
  // INPUT_VERIFIER_CONTRACT_ADDRESS (FHEVM Host chain)
  inputVerifierContractAddress: "0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4",
  // DECRYPTION_ADDRESS (Gateway chain)
  verifyingContractAddressDecryption: "0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1",
  // INPUT_VERIFICATION_ADDRESS (Gateway chain)
  verifyingContractAddressInputVerification: "0x7048C39f048125eDa9d678AEbaDfB22F7900a29F",
  // FHEVM Host chain id
  chainId: 11155111,
  // Gateway chain id
  gatewayChainId: 55815,
  // Optional RPC provider to host chain
  network: "https://eth-sepolia.public.blastapi.io",
  // Relayer URL - using proxy to avoid CORS issues
  // Fallback to CORS proxy if needed: "https://cors-anywhere.herokuapp.com/https://relayer.testnet.zama.cloud"
  relayerUrl: "/api/relayer",
};

// Initialize the FHE instance for relayer operations
export const initializeFHE = async (): Promise<FhevmInstance | null> => {
  if (fheInstance) {
    return fheInstance;
  }
  
  if (fheInitializationFailed) {
    console.warn("⚠️ FHE relayer initialization previously failed, skipping...");
    return null;
  }
  
  try {
    console.log("🔧 Initializing FHE relayer instance...");
    console.log("📋 Relayer Configuration:", {
      chainId: RelayerConfig.chainId,
      gatewayChainId: RelayerConfig.gatewayChainId,
      relayerUrl: RelayerConfig.relayerUrl,
      network: RelayerConfig.network,
    });
    
    // Test relayer connectivity first
    console.log("🌐 Testing relayer connectivity...");
    try {
      const response = await fetch(RelayerConfig.relayerUrl, {
        method: 'HEAD',
        mode: 'cors'
      });
      console.log("📡 Relayer response status:", response.status);
    } catch (relayerError) {
      console.warn("⚠️ Relayer connectivity test failed:", relayerError);
      
      // Check if it's a CORS error
      if (relayerError instanceof TypeError && relayerError.message.includes('CORS')) {
        console.error("🚫 CORS Error detected! This is likely due to browser security restrictions.");
        console.info("💡 Solutions:");
        console.info("   1. Restart your development server (npm start)");
        console.info("   2. Check that the proxy configuration is working");
        console.info("   3. Try using a different browser or incognito mode");
        console.info("   4. Contact Zama support if the issue persists");
      }
    }
    
    // Create FHE instance for relayer operations
    fheInstance = await createInstance(RelayerConfig);
    console.log("✅ FHE relayer instance initialized successfully");
    return fheInstance;
  } catch (error) {
    console.error("❌ Failed to initialize FHE relayer instance:", error);
    console.warn("⚠️ FHE relayer not available - decryption features will be disabled");
    console.info("💡 Core FHE functionality is still available in smart contracts");
    console.info("💡 This might be expected if the Zama relayer is not fully operational on Sepolia");
    fheInitializationFailed = true;
    return null;
  }
};

// Get the encrypted balance ciphertext from the blockchain
export const getEncryptedBalanceCiphertext = async (
  signer: ethers.Signer,
  userAddress: string,
): Promise<string> => {
  try {
    // Get the game contract to find the token address
    const contractAddress = CONTRACT_ADDRESSES["sepolia"];
    const gameContract = getCoinSweeperContract(signer, contractAddress);
    const tokenAddress = await gameContract.rewardToken();
    // Get the encrypted balance from the token contract
    const tokenContract = getEncryptedERC20Contract(signer, tokenAddress);
    const encryptedBalance = await tokenContract.balanceOf(userAddress);
    // The balance is returned as an euint64, we need to get the ciphertext handle
    return encryptedBalance.toString();
  } catch (error) {
    console.error("❌ Failed to get encrypted balance ciphertext:", error);
    throw new Error("Failed to retrieve encrypted balance");
  }
};

// Decrypt the user's balance using user decryption
export const decryptUserBalance = async (
  signer: ethers.Signer,
  userAddress: string,
): Promise<number | null> => {
  try {
    // Initialize FHE instance
    const instance = await initializeFHE();
    if (!instance) {
      console.warn("⚠️ FHE not available - cannot decrypt balance");
      return null;
    }
    
    // Get the encrypted balance ciphertext
    const ciphertextHandle = await getEncryptedBalanceCiphertext(signer, userAddress);
    // Check if the balance is zero (no tokens)
    if (ciphertextHandle === "0" || ciphertextHandle === "0x0") {
      return 0;
    }
    const contractAddress = CONTRACT_ADDRESSES["sepolia"];
    // Generate a keypair for user decryption
    const keypair = instance.generateKeypair();
    // Prepare the handle-contract pairs
    const handleContractPairs = [
      {
        handle: ciphertextHandle,
        contractAddress: contractAddress,
      },
    ];
    // Set up EIP-712 signature for user decryption
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = "10"; // 10 days validity
    const contractAddresses = [contractAddress];
    const eip712 = instance.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimeStamp,
      durationDays
    );
    // Sign the decryption request
    const signature = await signer.signTypedData(
      eip712.domain,
      {
        UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
      },
      eip712.message
    );
    // Perform user decryption
    const result = await instance.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace("0x", ""),
      contractAddresses,
      userAddress,
      startTimeStamp,
      durationDays
    );
    // Extract the decrypted value
    const decryptedValue = result[ciphertextHandle];
    if (decryptedValue !== undefined) {
      return Number(decryptedValue);
    } else {
      console.warn("No decrypted value found for ciphertext handle:", ciphertextHandle);
      return null;
    }
  } catch (error) {
    console.error("❌ Failed to decrypt user balance:", error);
    return null;
  }
};

// Public decryption (for testing or public data)
export const publicDecrypt = async (
  ciphertextHandles: string[]
): Promise<Record<string, any>> => {
  try {
    const instance = await initializeFHE();
    if (!instance) {
      console.warn("⚠️ FHE not available - cannot perform public decryption");
      return {};
    }
    
    // Perform public decryption
    const decryptedValues = instance.publicDecrypt(ciphertextHandles);
    return decryptedValues;
  } catch (error) {
    console.error("❌ Failed to perform public decryption:", error);
    throw new Error("Public decryption failed");
  }
};

// Test FHE configuration and functionality
export const testFHEConfiguration = async (): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> => {
  try {
    console.log("🧪 Testing FHE Configuration...");
    
    // Try to initialize FHE instance
    const instance = await initializeFHE();
    if (!instance) {
      return {
        success: false,
        error: "Failed to initialize FHE instance",
      };
    }
    
    // Test keypair generation
    console.log("🔑 Testing keypair generation...");
    const keypair = instance.generateKeypair();
    if (!keypair || !keypair.publicKey || !keypair.privateKey) {
      return {
        success: false,
        error: "Failed to generate keypair",
      };
    }
    
    console.log("✅ FHE configuration test passed!");
    return {
      success: true,
      details: {
        publicKeyLength: keypair.publicKey.length,
        privateKeyLength: keypair.privateKey.length,
        config: {
          chainId: RelayerConfig.chainId,
          relayerUrl: RelayerConfig.relayerUrl,
        },
      },
    };
  } catch (error) {
    console.error("❌ FHE configuration test failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Check if FHE is supported on the current network
export const isFHESupported = (chainId: number): boolean => {
  // Currently supporting Sepolia for testing
  return chainId === 11155111; // Sepolia
};

// Get FHE status information
export const getFHEStatus = async (chainId: number): Promise<{
  isSupported: boolean;
  isAvailable: boolean;
  error?: string;
}> => {
  try {
    if (!isFHESupported(chainId)) {
      return {
        isSupported: false,
        isAvailable: false,
        error: "FHE not supported on this network",
      };
    }
    // Try to initialize FHE instance
    const instance = await initializeFHE();
    if (!instance) {
      return {
        isSupported: true,
        isAvailable: false,
        error: "FHE relayer not available",
      };
    }
    return {
      isSupported: true,
      isAvailable: true,
    };
  } catch (error) {
    return {
      isSupported: true,
      isAvailable: false,
      error: error instanceof Error ? error.message : "Unknown FHE error",
    };
  }
}; 

// Export the configuration for debugging
export { RelayerConfig };

// Get current FHE configuration
export const getFHEConfiguration = () => {
  return {
    ...RelayerConfig,
    isInitialized: fheInstance !== null,
    hasFailed: fheInitializationFailed,
  };
}; 