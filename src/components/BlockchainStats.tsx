import React from "react";
import { useWeb3 } from "../contexts/Web3Context";
import { formatAddress, formatTimestamp } from "../utils/web3Utils";
import "./BlockchainStats.css";

const BlockchainStats: React.FC = () => {
  const { wallet, gameStats, leaderboard, isLoading, claimRewards } = useWeb3();

  const handleClaimRewards = async () => {
    try {
      await claimRewards();
    } catch (error) {
      console.error("Failed to claim rewards:", error);
    }
  };

  if (!wallet.isConnected) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="blockchain-stats">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Loading blockchain data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="blockchain-stats">
      <div className="stats-section">
        <h3>🏆 Your Game Statistics</h3>
        {gameStats ? (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Games Played</span>
              <span className="stat-value">{gameStats.gamesPlayed}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Games Won</span>
              <span className="stat-value">{gameStats.gamesWon}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Win Rate</span>
              <span className="stat-value">
                {gameStats.gamesPlayed > 0
                  ? `${((gameStats.gamesWon / gameStats.gamesPlayed) * 100).toFixed(1)}%`
                  : "0%"}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Coins Found</span>
              <span className="stat-value">{gameStats.totalCoinsFound}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Best Time</span>
              <span className="stat-value">
                {gameStats.bestTime > 0
                  ? `${Math.floor(gameStats.bestTime / 60)}:${(gameStats.bestTime % 60).toString().padStart(2, "0")}`
                  : "N/A"}
              </span>
            </div>
            <div className="stat-card rewards">
              <span className="stat-label">Available Rewards</span>
              <span className="stat-value">
                {parseFloat(gameStats.totalRewards).toFixed(2)} ETH
              </span>
              {parseFloat(gameStats.totalRewards) > 0 && (
                <button onClick={handleClaimRewards} className="claim-btn">
                  🎁 Claim Rewards
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="no-stats">
            No game statistics found. Play your first game to see your stats!
          </p>
        )}
      </div>

      <div className="leaderboard-section">
        <h3>🏅 Global Leaderboard</h3>
        {leaderboard.length > 0 ? (
          <div className="leaderboard">
            <div className="leaderboard-header">
              <span>Rank</span>
              <span>Player</span>
              <span>Score</span>
              <span>Date</span>
            </div>
            {leaderboard.map((entry, index) => (
              <div
                key={index}
                className={`leaderboard-entry ${entry.player.toLowerCase() === wallet.address?.toLowerCase() ? "current-player" : ""}`}
              >
                <span className="rank">#{index + 1}</span>
                <span className="player">
                  {entry.player.toLowerCase() === wallet.address?.toLowerCase()
                    ? "You"
                    : formatAddress(entry.player)}
                </span>
                <span className="score">
                  {parseFloat(entry.score).toFixed(2)} ETH
                </span>
                <span className="date">{formatTimestamp(entry.timestamp)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-leaderboard">
            No leaderboard entries yet. Be the first to win a game!
          </p>
        )}
      </div>

      <div className="rewards-info">
        <h3>💰 Reward System</h3>
        <div className="rewards-grid">
          <div className="reward-item">
            <span className="reward-icon">🥇</span>
            <div className="reward-details">
              <h4>Easy Win</h4>
              <p>100 tokens</p>
            </div>
          </div>
          <div className="reward-item">
            <span className="reward-icon">🥈</span>
            <div className="reward-details">
              <h4>Medium Win</h4>
              <p>200 tokens</p>
            </div>
          </div>
          <div className="reward-item">
            <span className="reward-icon">🥉</span>
            <div className="reward-details">
              <h4>Hard Win</h4>
              <p>400 tokens</p>
            </div>
          </div>
          <div className="reward-item">
            <span className="reward-icon">⚡</span>
            <div className="reward-details">
              <h4>Speed Bonus</h4>
              <p>2x for &lt; 5min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainStats;
