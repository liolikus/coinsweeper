import React from "react";
import { GameState, Difficulty } from "../types/game";
import "./GameInfo.css";

interface GameInfoProps {
  gameState: GameState;
  currentDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  difficulties: Difficulty[];
}

const GameInfo: React.FC<GameInfoProps> = ({
  gameState,
  currentDifficulty,
  onDifficultyChange,
  difficulties,
}) => {
  const {
    coinsFound,
    totalCoins,
    flagsPlaced,
    gameOver,
    gameWon,
    startTime,
    endTime,
  } = gameState;

  const getElapsedTime = () => {
    if (!startTime) return 0;
    const end = endTime || Date.now();
    return Math.floor((end - startTime) / 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getGameStatus = () => {
    if (gameWon) return "🎉 You Won! 🎉";
    if (gameOver) return "💥 Game Over! 💥";
    return "🎮 Playing...";
  };

  return (
    <div className="game-info">
      <div className="info-header">
        {/* <h1>🪙 CoinSweeper 🪙</h1> */}
        <p className="game-status">{getGameStatus()}</p>
      </div>

      <div className="info-stats">
        <div className="stat-item">
          <span className="stat-label">🪙 Coins Found:</span>
          <span className="stat-value">
            {coinsFound}/{totalCoins}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">❌ Loooted:</span>
          <span className="stat-value">{flagsPlaced}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">⏱️ Time:</span>
          <span className="stat-value">{formatTime(getElapsedTime())}</span>
        </div>
      </div>

      <div className="info-controls">
        <div className="difficulty-selector">
          <label htmlFor="difficulty">Difficulty:</label>
          <select
            id="difficulty"
            value={currentDifficulty.name}
            onChange={(e) => {
              const selected = difficulties.find(
                (d) => d.name === e.target.value,
              );
              if (selected) onDifficultyChange(selected);
            }}
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty.name} value={difficulty.name}>
                {difficulty.name} ({difficulty.rows}x{difficulty.cols},{" "}
                {difficulty.coins} coins)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="game-instructions">
        <h3>How to Play:</h3>
        <ul>
          <li>🖱️ Left click to reveal a cell</li>
          <li>🖱️ Right click to place/remove a flag</li>
          <li>🪙 Find all the coins to win!</li>
          <li>⚠️ Numbers show how many coins are nearby</li>
        </ul>
      </div>
    </div>
  );
};

export default GameInfo;
