import React from "react";
import { Cell as CellType, GameState } from "../types/game";
import CellComponent from "./Cell";
import "./GameBoard.css";

interface GameBoardProps {
  gameState: GameState;
  onCellLeftClick: (row: number, col: number) => void;
  onCellRightClick: (row: number, col: number) => void;
  onNewGame: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  onCellLeftClick,
  onCellRightClick,
  onNewGame,
}) => {
  const { board, gameOver } = gameState;

  return (
    <div className="game-board">
      <button className="new-game-btn" onClick={onNewGame}>
        🆕 New Game
      </button>
      <div
        className="board-grid"
        style={{
          gridTemplateColumns: `repeat(${board[0].length}, 1fr)`,
          gridTemplateRows: `repeat(${board.length}, 1fr)`,
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <CellComponent
              key={cell.id}
              cell={cell}
              gameOver={gameOver}
              onLeftClick={onCellLeftClick}
              onRightClick={onCellRightClick}
            />
          )),
        )}
      </div>
    </div>
  );
};

export default GameBoard;
