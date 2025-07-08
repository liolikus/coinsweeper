import { Cell, GameState, Difficulty } from "../types/game";

export const createEmptyBoard = (rows: number, cols: number): Cell[][] => {
  const board: Cell[][] = [];

  for (let row = 0; row < rows; row++) {
    board[row] = [];
    for (let col = 0; col < cols; col++) {
      board[row][col] = {
        id: `${row}-${col}`,
        row,
        col,
        isRevealed: false,
        isFlagged: false,
        hasCoin: false,
        neighborCoins: 0,
      };
    }
  }

  return board;
};

export const placeCoins = (board: Cell[][], numCoins: number): Cell[][] => {
  const rows = board.length;
  const cols = board[0].length;
  const totalCells = rows * cols;
  const coinPositions = new Set<number>();

  // Generate random coin positions
  while (coinPositions.size < numCoins) {
    const position = Math.floor(Math.random() * totalCells);
    coinPositions.add(position);
  }

  // Place coins on the board
  const newBoard = board.map((row) => [...row]);
  coinPositions.forEach((position) => {
    const row = Math.floor(position / cols);
    const col = position % cols;
    newBoard[row][col].hasCoin = true;
  });

  // Calculate neighbor coins for each cell
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!newBoard[row][col].hasCoin) {
        newBoard[row][col].neighborCoins = countNeighborCoins(
          newBoard,
          row,
          col,
        );
      }
    }
  }

  return newBoard;
};

export const countNeighborCoins = (
  board: Cell[][],
  row: number,
  col: number,
): number => {
  let count = 0;

  for (
    let r = Math.max(0, row - 1);
    r <= Math.min(board.length - 1, row + 1);
    r++
  ) {
    for (
      let c = Math.max(0, col - 1);
      c <= Math.min(board[0].length - 1, col + 1);
      c++
    ) {
      if (r === row && c === col) continue;
      if (board[r][c].hasCoin) {
        count++;
      }
    }
  }

  return count;
};

export const revealCell = (
  board: Cell[][],
  row: number,
  col: number,
): Cell[][] => {
  let newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

  if (newBoard[row][col].isRevealed || newBoard[row][col].isFlagged) {
    return newBoard;
  }

  newBoard[row][col].isRevealed = true;

  // If cell has no neighbor coins, reveal neighbors recursively
  if (newBoard[row][col].neighborCoins === 0 && !newBoard[row][col].hasCoin) {
    for (
      let r = Math.max(0, row - 1);
      r <= Math.min(board.length - 1, row + 1);
      r++
    ) {
      for (
        let c = Math.max(0, col - 1);
        c <= Math.min(board[0].length - 1, col + 1);
        c++
      ) {
        if (r === row && c === col) continue;
        if (!newBoard[r][c].isRevealed && !newBoard[r][c].isFlagged) {
          // Reveal the neighbor cell
          newBoard[r][c].isRevealed = true;

          // If this neighbor also has 0 neighbor coins, recursively reveal its neighbors
          if (newBoard[r][c].neighborCoins === 0) {
            newBoard = revealCell(newBoard, r, c);
          }
        }
      }
    }
  }

  return newBoard;
};

export const toggleFlag = (
  board: Cell[][],
  row: number,
  col: number,
): Cell[][] => {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

  if (!newBoard[row][col].isRevealed) {
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
  }

  return newBoard;
};

export const checkGameWon = (board: Cell[][]): boolean => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col];
      if (cell.hasCoin && cell.isRevealed) {
        return false; // Found a coin, game not won
      }
      if (!cell.hasCoin && !cell.isRevealed) {
        return false; // Empty cell not revealed, game not won
      }
    }
  }
  return true;
};

export const countCoinsFound = (board: Cell[][]): number => {
  let count = 0;
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (board[row][col].hasCoin && board[row][col].isRevealed) {
        count++;
      }
    }
  }
  return count;
};

export const countFlagsPlaced = (board: Cell[][]): number => {
  let count = 0;
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (board[row][col].isFlagged) {
        count++;
      }
    }
  }
  return count;
};

export const initializeGame = (difficulty: Difficulty): GameState => {
  const board = createEmptyBoard(difficulty.rows, difficulty.cols);
  const boardWithCoins = placeCoins(board, difficulty.coins);

  return {
    board: boardWithCoins,
    gameOver: false,
    gameWon: false,
    coinsFound: 0,
    totalCoins: difficulty.coins,
    flagsPlaced: 0,
    startTime: null,
    endTime: null,
  };
};
