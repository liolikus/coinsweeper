import React, { useState, useEffect, useCallback } from "react";
import { GameState, Difficulty, DIFFICULTIES } from "../types/game";
import { useWeb3 } from "../contexts/Web3Context";
import {
  initializeGame,
  revealCell,
  toggleFlag,
  checkGameWon,
  countCoinsFound,
  countFlagsPlaced,
} from "../utils/gameLogic";
import GameBoard from "./GameBoard";
import GameInfo from "./GameInfo";
import WalletConnect from "./WalletConnect";
import BlockchainStats from "./BlockchainStats";
import FHETokenInfo from "./FHETokenInfo";
import "./CoinsweeperGame.css";

const CoinsweeperGame: React.FC = () => {
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>(
    DIFFICULTIES[0],
  );
  const [gameState, setGameState] = useState<GameState>(() =>
    initializeGame(DIFFICULTIES[0]),
  );
  const {
    wallet,
    startGameOnChain,
    recordWinOnChain,
    recordLossOnChain,
    error: web3Error,
  } = useWeb3();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (gameState.startTime && !gameState.gameOver && !gameState.gameWon) {
      interval = setInterval(() => {
        setGameState((prev) => ({ ...prev }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.startTime, gameState.gameOver, gameState.gameWon]);

  const startNewGame = useCallback(async () => {
    const newGameState = initializeGame(currentDifficulty);
    setGameState(newGameState);

    // Record game start on blockchain if wallet is connected
    if (wallet.isConnected) {
      try {
        const difficultyNumber =
          DIFFICULTIES.findIndex((d) => d.name === currentDifficulty.name) + 1;
        await startGameOnChain(difficultyNumber);
      } catch (error) {
        console.error("Failed to record game start on blockchain:", error);
      }
    }
  }, [currentDifficulty, wallet.isConnected, startGameOnChain]);

  const handleDifficultyChange = useCallback((difficulty: Difficulty) => {
    setCurrentDifficulty(difficulty);
    const newGameState = initializeGame(difficulty);
    setGameState(newGameState);
  }, []);

  const handleCellLeftClick = useCallback(
    async (row: number, col: number) => {
      if (gameState.gameOver || gameState.gameWon) return;

      const cell = gameState.board[row][col];
      if (cell.isFlagged || cell.isRevealed) return;

      // Start timer on first click
      const startTime = gameState.startTime || Date.now();

      let newBoard = revealCell(gameState.board, row, col);

      // Check if game is over (found a coin)
      const isGameOver = cell.hasCoin;

      // Check if game is won
      const isGameWon = !isGameOver && checkGameWon(newBoard);

      const newGameState: GameState = {
        ...gameState,
        board: newBoard,
        gameOver: isGameOver,
        gameWon: isGameWon,
        coinsFound: countCoinsFound(newBoard),
        flagsPlaced: countFlagsPlaced(newBoard),
        startTime,
        endTime: isGameOver || isGameWon ? Date.now() : null,
      };

      setGameState(newGameState);

      // Record game result on blockchain if wallet is connected
      if (wallet.isConnected && (isGameOver || isGameWon)) {
        try {
          const difficultyNumber =
            DIFFICULTIES.findIndex((d) => d.name === currentDifficulty.name) +
            1;
          const gameTime = Math.floor(
            (newGameState.endTime! - startTime) / 1000,
          );

          if (isGameWon) {
            await recordWinOnChain(
              difficultyNumber,
              gameTime,
              newGameState.coinsFound,
            );
          } else {
            await recordLossOnChain(difficultyNumber);
          }
        } catch (error) {
          console.error("Failed to record game result on blockchain:", error);
        }
      }
    },
    [
      gameState,
      currentDifficulty,
      wallet.isConnected,
      recordWinOnChain,
      recordLossOnChain,
    ],
  );

  const handleCellRightClick = useCallback(
    (row: number, col: number) => {
      if (gameState.gameOver || gameState.gameWon) return;

      const cell = gameState.board[row][col];
      if (cell.isRevealed) return;

      const newBoard = toggleFlag(gameState.board, row, col);

      const newGameState: GameState = {
        ...gameState,
        board: newBoard,
        flagsPlaced: countFlagsPlaced(newBoard),
      };

      setGameState(newGameState);
    },
    [gameState],
  );

  return (
    <div className="coinsweeper-game">

      {web3Error && (
        <div className="web3-error">
          <span>⚠️ {web3Error}</span>
        </div>
      )}

      <GameBoard
        gameState={gameState}
        onCellLeftClick={handleCellLeftClick}
        onCellRightClick={handleCellRightClick}
        onNewGame={startNewGame}
      />

      <GameInfo
        gameState={gameState}
        currentDifficulty={currentDifficulty}
        onNewGame={startNewGame}
        onDifficultyChange={handleDifficultyChange}
        difficulties={DIFFICULTIES}
      />

    </div>
  );
};

export default CoinsweeperGame;
