import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import { getEncryptedTokenInfo } from "../utils/web3Utils";
import { getContractConfig } from "../utils/web3Utils";
import { getCoinSweeperContract } from "../utils/web3Utils";
import { decryptUserBalance, getFHEStatus } from "../utils/zamaRelayer";
import "./FHETokenInfo.css";

const FHETokenInfo: React.FC = () => {
  const { wallet, gameStats } = useWeb3();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [decryptedBalance, setDecryptedBalance] = useState<number | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [fheStatus, setFheStatus] = useState({
    isAvailable: false,
    error: null as string | null,
  });

  // Check FHE status
  const checkFHEStatus = () => {
    if (wallet.chainId) {
      getFHEStatus(wallet.chainId).then((status) => {
        setFheStatus({
          isAvailable: status.isAvailable,
          error: status.error || null,
        });
      });
    }
  };

  // Load token information
  const loadTokenInfo = async () => {
    if (!wallet.isConnected || !wallet.signer || !wallet.address) {
      setTokenInfo(null);
      return;
    }

    try {
      setIsLoading(true);
      // Get token address from game contract
      const contractConfig = getContractConfig(wallet.chainId!);
      const gameContract = getCoinSweeperContract(
        wallet.signer,
        contractConfig.address,
      );
      const tokenAddress = await gameContract.rewardToken();

      // Check if token address is valid (not zero address)
      if (
        !tokenAddress ||
        tokenAddress === "0x0000000000000000000000000000000000000000"
      ) {
        throw new Error(
          "No reward token configured. Please contact the contract owner to set up the reward token.",
        );
      }

      const info = await getEncryptedTokenInfo(
        wallet.signer,
        tokenAddress,
        wallet.address,
      );

      // Get encrypted balance from the game contract
      const encryptedBalance = await gameContract.getPlayerEncryptedBalance(wallet.address);
      
      // Update the token info with the actual encrypted balance
      const updatedInfo = {
        ...info,
        encryptedBalance: encryptedBalance.toString(),
      };

      setTokenInfo(updatedInfo);
    } catch (error: any) {
      console.error("Error loading token info:", error);
      setFheStatus((prev) => ({
        ...prev,
        error: error.message || "Failed to load token information",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Decrypt balance using Zama relayer
  const handleDecryptBalance = async () => {
    if (!wallet.isConnected || !wallet.signer || !wallet.address) {
      return;
    }

    try {
      setIsDecrypting(true);
      const balance = await decryptUserBalance(
        wallet.signer,
        wallet.address
      );
      setDecryptedBalance(balance);
    } catch (error: any) {
      console.error("Error decrypting balance:", error);
      setFheStatus((prev) => ({
        ...prev,
        error: error.message || "Failed to decrypt balance",
      }));
    } finally {
      setIsDecrypting(false);
    }
  };

  // Load token info and check FHE status when wallet changes
  useEffect(() => {
    loadTokenInfo();
    checkFHEStatus();
  }, [wallet.isConnected, wallet.signer, wallet.address, wallet.chainId]);

  if (!wallet.isConnected) {
    return (
      <div className="fhe-token-info">
        <div className="fhe-header">
          <h3>🔐 Zama FHE Token Info</h3>
        </div>
        <div className="fhe-warning">
          <h3>🔗 Connect Your Wallet</h3>
          <p>Connect your wallet to view encrypted token information and FHE features.</p>
          <p>This component will display your encrypted token balances and Zama FHE status once connected.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fhe-token-info">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Loading encrypted token info...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fhe-token-info">
      <div className="fhe-header">
        <h3>🔐 Zama FHE Token Info</h3>
        <div
          className={`fhe-status ${fheStatus.isAvailable ? "available" : "unavailable"}`}
        >
          {fheStatus.isAvailable
            ? "✅ Zama FHE Available"
            : "❌ Zama FHE Unavailable"}
        </div>
      </div>

      {fheStatus.error && (
        <div className="fhe-error">
          <span>⚠️ {fheStatus.error}</span>
          {fheStatus.error.includes("relayer") && (
            <div className="relayer-error-info">
              <p>
                <strong>Note:</strong> There was an issue connecting to the Zama FHE relayer. 
                This might be a temporary network issue or configuration problem.
              </p>
              <p>
                Your encrypted balances and rewards are still working correctly. 
                Try refreshing the page or check your network connection.
              </p>
            </div>
          )}
        </div>
      )}

      {tokenInfo && (
        <div className="token-details">
          <div className="token-basic">
            <div className="token-name">
              <span className="label">Token:</span>
              <span className="value">
                {tokenInfo.name} ({tokenInfo.symbol})
              </span>
            </div>
            <div className="token-decimals">
              <span className="label">Decimals:</span>
              <span className="value">{tokenInfo.decimals}</span>
            </div>
          </div>

          <div className="token-balances">
            <div className="balance-item">
              <span className="label">🔒 Your Token Balance:</span>
              <div className="balance-value-container">
                {decryptedBalance !== null ? (
                  <span className="value decrypted">
                    {decryptedBalance.toLocaleString()} {tokenInfo.symbol}
                  </span>
                ) : (
                  <span className="value encrypted">
                    🔐 Encrypted
                  </span>
                )}
                {decryptedBalance === null && fheStatus.isAvailable && (
                  <button 
                    onClick={handleDecryptBalance} 
                    disabled={isDecrypting}
                    className="decrypt-btn"
                  >
                    {isDecrypting ? "Decrypting..." : "🔓 Decrypt Balance"}
                  </button>
                )}
              </div>
            </div>

            {gameStats && (
              <div className="balance-item">
                <span className="label">💰 Total Rewards Earned:</span>
                <span className="value">
                  {parseFloat(gameStats.totalRewards).toFixed(2)}{" "}
                  {tokenInfo.symbol}
                </span>
              </div>
            )}

            <div className="balance-item">
              <span className="label">🌐 Total Supply:</span>
              <span className="value">
                {parseInt(tokenInfo.totalSupply).toLocaleString()}{" "}
                {tokenInfo.symbol}
              </span>
            </div>
          </div>

          <div className="fhe-features">
            <h4>🔐 Zama FHE Features</h4>
            <ul>
              <li>✅ Encrypted token balances</li>
              <li>✅ Private transfers via Zama relayer</li>
              <li>✅ Confidential leaderboard</li>
              <li>✅ Secure reward distribution</li>
              <li>✅ Homomorphic operations on encrypted data</li>
            </ul>
          </div>

          <div className="fhe-info">
            <h4>ℹ️ About Zama FHE</h4>
            <p>
              Zama's Fully Homomorphic Encryption (FHE) allows computations on
              encrypted data without revealing the underlying values. Your token
              balances and game scores are encrypted and processed through
              Zama's relayer network, providing enhanced privacy and security
              across all supported networks.
            </p>
            <div className="relayer-info">
              <h5>🔓 Decrypting Your Balance</h5>
              <p>
                Your token balance is encrypted for privacy. Click the "Decrypt Balance" 
                button to use the Zama relayer to decrypt and view your actual balance.
                This process uses your wallet signature to securely decrypt only your data.
              </p>
              <p>
                <strong>Your rewards are working!</strong> The "Total Rewards Earned" 
                shows your decrypted rewards from winning games.
              </p>
            </div>
          </div>

          <div className="zama-info">
            <h4>🚀 Zama Protocol</h4>
            <p>
              This integration uses the official Zama relayer SDK to handle
              encrypted operations. The Zama protocol provides a decentralized
              network of relayers that process FHE operations, ensuring your
              data remains private while enabling complex computations.
            </p>
            <div className="zama-links">
              <a
                href="https://docs.zama.ai/protocol"
                target="_blank"
                rel="noopener noreferrer"
              >
                📚 Zama Documentation
              </a>
              <a
                href="https://github.com/zama-ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                🔗 Zama GitHub
              </a>
            </div>
          </div>
        </div>
      )}

      {!tokenInfo && !fheStatus.error && (
        <div className="no-token-info">
          <p>No encrypted token information available.</p>
          <p>Play a game to start earning encrypted rewards!</p>
        </div>
      )}

      {fheStatus.error && (
        <div className="fhe-error">
          <h4>⚠️ Token Configuration Issue</h4>
          <p>{fheStatus.error}</p>
          <div className="error-help">
            <p>
              <strong>To fix this issue:</strong>
            </p>
            <ol>
              <li>
                Deploy the contracts using: <code>npm run deploy</code>
              </li>
              <li>
                Or run the setup script:{" "}
                <code>
                  npx hardhat run scripts/setupRewardToken.js --network sepolia
                </code>
              </li>
              <li>
                Update the contract addresses in <code>src/types/web3.ts</code>
              </li>
            </ol>
            <p>
              <em>
                Note: The reward token must be properly configured for FHE
                features to work.
              </em>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FHETokenInfo;
