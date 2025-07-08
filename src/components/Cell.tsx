import React from "react";
import { Cell as CellType } from "../types/game";
import "./Cell.css";

interface CellProps {
  cell: CellType;
  gameOver: boolean;
  onLeftClick: (row: number, col: number) => void;
  onRightClick: (row: number, col: number) => void;
}

const CellComponent: React.FC<CellProps> = ({
  cell,
  gameOver,
  onLeftClick,
  onRightClick,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onLeftClick(cell.row, cell.col);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onRightClick(cell.row, cell.col);
  };

  const getCellContent = () => {
    if (cell.isFlagged) {
      return "🚩";
    }

    if (!cell.isRevealed) {
      return "";
    }

    if (cell.hasCoin) {
      return "🪙";
    }

    if (cell.neighborCoins === 0) {
      return "";
    }

    return cell.neighborCoins.toString();
  };

  const getCellClassName = () => {
    let className = "cell";

    if (cell.isRevealed) {
      className += " revealed";
      if (cell.hasCoin) {
        className += " coin";
      } else if (cell.neighborCoins > 0) {
        className += ` neighbor-${cell.neighborCoins}`;
      }
    } else {
      className += " hidden";
      if (cell.isFlagged) {
        className += " flagged";
      }
    }

    if (gameOver && cell.hasCoin && !cell.isRevealed) {
      className += " game-over-coin";
    }

    return className;
  };

  return (
    <div
      className={getCellClassName()}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      data-row={cell.row}
      data-col={cell.col}
    >
      {getCellContent()}
    </div>
  );
};

export default CellComponent;
