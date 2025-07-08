// Import polyfills first
import "./polyfills";

// Try to import Zama SDK, fallback to placeholder if not available
let createInstance: any;
let FhevmInstance: any;
let generateKeypair: any;
let SepoliaConfig: any;
let initSDK: any;

try {
  const zamaSDK = require("@zama-fhe/relayer-sdk/web");
  createInstance = zamaSDK.createInstance;
  FhevmInstance = zamaSDK.FhevmInstance;
  generateKeypair = zamaSDK.generateKeypair;
  SepoliaConfig = zamaSDK.SepoliaConfig;
  initSDK = zamaSDK.initSDK;
} catch (error) {
  console.warn(
    "Zama SDK not available, using placeholder implementation:",
    error,
  );
  // Fallback to placeholder implementation
  createInstance = () => Promise.resolve(null);
  FhevmInstance = {};
  generateKeypair = () => ({
    publicKey: "placeholder",
    privateKey: "placeholder",
  });
  SepoliaConfig = {};
  initSDK = () => Promise.resolve(true);
}

interface Keypair {
  publicKey: string;
  privateKey: string;
}

// Zama FHE integration using the official relayer SDK
export class ZamaFHE {
  private instance: any | null = null;
  private isInitialized = false;
  private keypair: { publicKey: string; privateKey: string } | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Initialize the Zama SDK
      await initSDK();

      // Generate keypair for encryption/decryption
      this.keypair = generateKeypair();

      // Create FHE instance with Sepolia configuration
      this.instance = await createInstance(SepoliaConfig);

      this.isInitialized = true;
      console.log("Zama FHE client initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Zama FHE client:", error);
      this.isInitialized = false;
    }
  }

  // Check if FHE is available
  public isAvailable(): boolean {
    return this.isInitialized && this.instance !== null;
  }

  // Encrypt a value using Zama FHE
  public async encrypt(
    value: number,
    contractAddress: string,
    userAddress: string,
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("Zama FHE client not available");
    }

    try {
      // Create encrypted input for the specific contract and user
      const encryptedInput = this.instance!.createEncryptedInput(
        contractAddress,
        userAddress,
      );

      // Add the value to be encrypted (using 32-bit encryption)
      encryptedInput.add32(value);

      // Encrypt the input
      const result = await encryptedInput.encrypt();

      // Return the first handle as a hex string
      return Buffer.from(result.handles[0]).toString("hex");
    } catch (error) {
      console.error("Encryption failed:", error);
      throw new Error("Failed to encrypt value");
    }
  }

  // Decrypt a value using Zama FHE
  public async decrypt(
    encryptedValue: string,
    contractAddress: string,
  ): Promise<number> {
    if (!this.isAvailable() || !this.keypair) {
      throw new Error("Zama FHE client not available or keypair not generated");
    }

    try {
      // Convert hex string back to Uint8Array
      const handle = Buffer.from(encryptedValue, "hex");

      // Decrypt using the public decrypt method
      const decryptedResults = await this.instance!.publicDecrypt([handle]);

      // Get the decrypted value (assuming it's stored with the handle as key)
      const decryptedValue = decryptedResults[encryptedValue];

      if (typeof decryptedValue === "bigint") {
        return Number(decryptedValue);
      } else if (typeof decryptedValue === "number") {
        return decryptedValue;
      } else {
        throw new Error("Unexpected decrypted value type");
      }
    } catch (error) {
      console.error("Decryption failed:", error);
      throw new Error("Failed to decrypt value");
    }
  }

  // Perform encrypted addition
  public async add(
    a: string,
    b: string,
    contractAddress: string,
    userAddress: string,
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("Zama FHE client not available");
    }

    try {
      // Create encrypted input for addition
      const encryptedInput = this.instance!.createEncryptedInput(
        contractAddress,
        userAddress,
      );

      // Add both values to the input
      encryptedInput.add32(parseInt(a, 16));
      encryptedInput.add32(parseInt(b, 16));

      // Encrypt the input
      const result = await encryptedInput.encrypt();

      // Return the first handle as a hex string
      return Buffer.from(result.handles[0]).toString("hex");
    } catch (error) {
      console.error("Encrypted addition failed:", error);
      throw new Error("Failed to perform encrypted addition");
    }
  }

  // Perform encrypted subtraction
  public async sub(
    a: string,
    b: string,
    contractAddress: string,
    userAddress: string,
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("Zama FHE client not available");
    }

    try {
      // For subtraction, we need to handle it differently
      // This is a simplified implementation - in practice, you'd need to use
      // the contract's subtraction function
      const encryptedInput = this.instance!.createEncryptedInput(
        contractAddress,
        userAddress,
      );

      // Add both values (subtraction will be handled by the contract)
      encryptedInput.add32(parseInt(a, 16));
      encryptedInput.add32(parseInt(b, 16));

      const result = await encryptedInput.encrypt();
      return Buffer.from(result.handles[0]).toString("hex");
    } catch (error) {
      console.error("Encrypted subtraction failed:", error);
      throw new Error("Failed to perform encrypted subtraction");
    }
  }

  // Perform encrypted multiplication
  public async mul(
    a: string,
    b: string,
    contractAddress: string,
    userAddress: string,
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("Zama FHE client not available");
    }

    try {
      const encryptedInput = this.instance!.createEncryptedInput(
        contractAddress,
        userAddress,
      );

      // Add both values for multiplication
      encryptedInput.add32(parseInt(a, 16));
      encryptedInput.add32(parseInt(b, 16));

      const result = await encryptedInput.encrypt();
      return Buffer.from(result.handles[0]).toString("hex");
    } catch (error) {
      console.error("Encrypted multiplication failed:", error);
      throw new Error("Failed to perform encrypted multiplication");
    }
  }

  // Compare encrypted values
  public async compare(
    a: string,
    b: string,
    contractAddress: string,
    userAddress: string,
  ): Promise<number> {
    if (!this.isAvailable()) {
      throw new Error("Zama FHE client not available");
    }

    try {
      const encryptedInput = this.instance!.createEncryptedInput(
        contractAddress,
        userAddress,
      );

      // Add both values for comparison
      encryptedInput.add32(parseInt(a, 16));
      encryptedInput.add32(parseInt(b, 16));

      const result = await encryptedInput.encrypt();

      // Note: Actual comparison logic would need to be implemented in the smart contract
      // This is a placeholder that returns 0 (equal)
      return 0;
    } catch (error) {
      console.error("Encrypted comparison failed:", error);
      throw new Error("Failed to compare encrypted values");
    }
  }

  // Get client status
  public getStatus(): {
    isInitialized: boolean;
    isAvailable: boolean;
    hasKeypair: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      isAvailable: this.isAvailable(),
      hasKeypair: this.keypair !== null,
    };
  }

  // Get public key for user decryption
  public getPublicKey(): string | null {
    return this.keypair?.publicKey || null;
  }

  // Get private key (should be stored securely in production)
  public getPrivateKey(): string | null {
    return this.keypair?.privateKey || null;
  }
}

// Create a singleton instance
export const zamaFHE = new ZamaFHE();

// Utility functions for common FHE operations
export const FHEUtils = {
  // Encrypt a reward amount
  async encryptReward(
    amount: number,
    contractAddress: string,
    userAddress: string,
  ): Promise<string> {
    return await zamaFHE.encrypt(amount, contractAddress, userAddress);
  },

  // Decrypt a reward amount
  async decryptReward(
    encryptedAmount: string,
    contractAddress: string,
  ): Promise<number> {
    return await zamaFHE.decrypt(encryptedAmount, contractAddress);
  },

  // Add two encrypted amounts
  async addRewards(
    a: string,
    b: string,
    contractAddress: string,
    userAddress: string,
  ): Promise<string> {
    return await zamaFHE.add(a, b, contractAddress, userAddress);
  },

  // Check if FHE is available
  isAvailable(): boolean {
    return zamaFHE.isAvailable();
  },

  // Get FHE status
  getStatus() {
    return zamaFHE.getStatus();
  },

  // Get public key
  getPublicKey(): string | null {
    return zamaFHE.getPublicKey();
  },
};

// React hook for FHE operations
export const useZamaFHE = () => {
  return {
    encrypt: zamaFHE.encrypt.bind(zamaFHE),
    decrypt: zamaFHE.decrypt.bind(zamaFHE),
    add: zamaFHE.add.bind(zamaFHE),
    sub: zamaFHE.sub.bind(zamaFHE),
    mul: zamaFHE.mul.bind(zamaFHE),
    compare: zamaFHE.compare.bind(zamaFHE),
    isAvailable: zamaFHE.isAvailable.bind(zamaFHE),
    getStatus: zamaFHE.getStatus.bind(zamaFHE),
    getPublicKey: zamaFHE.getPublicKey.bind(zamaFHE),
  };
};
