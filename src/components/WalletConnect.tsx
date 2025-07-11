import React from "react";
import { useWeb3 } from "../contexts/Web3Context";
import { formatAddress } from "../utils/web3Utils";
import { NETWORKS } from "../types/web3";
import "./WalletConnect.css";

const WalletConnect: React.FC = () => {
  const { wallet, isLoading, error, connect, disconnect, clearError } =
    useWeb3();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const getNetworkName = (chainId: number | null) => {
    if (!chainId) return "Unknown";
    const network = Object.values(NETWORKS).find((n) => n.chainId === chainId);
    return network ? network.name : `Chain ID: ${chainId}`;
  };

  if (isLoading) {
    return (
      <div className="wallet-connect">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Connecting...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={clearError} className="error-close">
            ×
          </button>
        </div>
      )}

      {!wallet.isConnected ? (
        <div className="connect-section">
          <h3>🔗 Connect Your Wallet</h3>
          <p>Connect MetaMask to play CoinSweeper and earn rewards!</p>
          <button onClick={handleConnect} className="connect-btn">
            🦊 Connect MetaMask
          </button>
          <div className="wallet-info">
            <p>✨ Play games and earn tokens</p>
            <p>🏆 Compete on the leaderboard</p>
            <p>🎁 Claim rewards for winning</p>
          </div>
        </div>
      ) : (
        <div className="wallet-info-section">
          <div className="wallet-header">
            <h3>✅ Wallet Connected</h3>
            <button onClick={handleDisconnect} className="disconnect-btn">
              Disconnect
            </button>
          </div>

          <div className="wallet-details">
            <div className="detail-item">
              <span className="label">Address:</span>
              <span className="value">{formatAddress(wallet.address!)}</span>
            </div>

            <div className="detail-item">
              <span className="label">Balance:</span>
              <span className="value">
                {parseFloat(wallet.balance!).toFixed(4)} ETH
              </span>
            </div>

            <div className="detail-item">
              <span className="label">Network:</span>
              <span className="value">{getNetworkName(wallet.chainId)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
