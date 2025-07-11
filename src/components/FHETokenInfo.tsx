import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import {
  getEncryptedTokenInfo,
  getContractConfig,
  getCoinSweeperContract,
} from "../utils/web3Utils";
import { FHEUtils } from "../utils/zamaFHE";
import { EncryptedTokenInfo } from "../types/web3";
import "./FHETokenInfo.css";

const FHETokenInfo: React.FC = () => {
  const { wallet, gameStats } = useWeb3();
  const [tokenInfo, setTokenInfo] = useState<EncryptedTokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fheStatus, setFheStatus] = useState({
    isSupported: false,
    isAvailable: false,
    error: null as string | null,
  });

  useEffect(() => {
    const checkFHEStatus = async () => {
      // Wait a bit for initialization to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const isAvailable = FHEUtils.isAvailable();
      const status = FHEUtils.getStatus();

      console.log("FHE Status:", status);
      console.log("FHE Available:", isAvailable);

      setFheStatus({
        isSupported: true, // Zama FHE is supported on all networks
        isAvailable,
        error: null,
      });
    };

    checkFHEStatus();
  }, []);

  useEffect(() => {
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
          wallet.chainId!,
        );

        setTokenInfo(info);
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

    loadTokenInfo();
  }, [wallet.isConnected, wallet.signer, wallet.address, wallet.chainId]);

  if (!wallet.isConnected) {
    return (
      <div className="fhe-token-info">
        <div className="fhe-header">
          <h3>🔐 Zama FHE Token Info</h3>
        </div>
        <div className="fhe-warning">
          <h3>🔗 Connect Your Wallet</h3>
          <p>
            Connect your wallet to view encrypted token information and FHE
            features.
          </p>
          <p>
            This component will display your encrypted token balances and Zama
            FHE status once connected.
          </p>
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
          className={`fhe-status ${tokenInfo ? "available" : "unavailable"}`}
        >
          {tokenInfo
            ? "✅ Zama FHE Active (Contract Level)"
            : "❌ Zama FHE Unavailable"}
        </div>
      </div>

      {fheStatus.error && (
        <div className="fhe-error">
          <span>⚠️ {fheStatus.error}</span>
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
              <span className="label">🔒 Your Encrypted Balance:</span>
              <span className="value encrypted">
                {parseInt(tokenInfo.encryptedBalance).toLocaleString()}{" "}
                {tokenInfo.symbol}
              </span>
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

          <div className="zama-info">
            <h4>🚀 Zama Protocol on Sepolia</h4>
            <p>
              This integration uses the official Zama relayer SDK to handle
              encrypted operations on Sepolia testnet. The Zama protocol
              provides a decentralized network of relayers that process FHE
              operations, ensuring your data remains private while enabling
              complex computations for development and testing purposes.
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
