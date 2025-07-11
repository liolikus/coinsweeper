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

  // Generate random coin positions with better randomization
  const availablePositions = Array.from({ length: totalCells }, (_, i) => i);
  
  for (let i = 0; i < numCoins; i++) {
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const position = availablePositions.splice(randomIndex, 1)[0];
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

// Debug function to visualize the board state
export const debugBoardState = (board: Cell[][]): void => {
  console.log("=== BOARD DEBUG ===");
  console.log("Coins positions:");
  const coinPositions: string[] = [];
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (board[row][col].hasCoin) {
        coinPositions.push(`(${row},${col})`);
      }
    }
  }
  console.log("Coins at:", coinPositions.join(", "));
  
  console.log("\nNeighbor counts for revealed cells:");
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (board[row][col].isRevealed && !board[row][col].hasCoin) {
        console.log(`Cell (${row},${col}): ${board[row][col].neighborCoins} neighbors`);
      }
    }
  }
  
  console.log("\nFull board visualization:");
  for (let row = 0; row < board.length; row++) {
    let rowStr = "";
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col];
      if (cell.hasCoin) {
        rowStr += "🪙 ";
      } else if (cell.isRevealed) {
        if (cell.neighborCoins === 0) {
          rowStr += "  ";
        } else {
          rowStr += `${cell.neighborCoins} `;
        }
      } else if (cell.isFlagged) {
        rowStr += "🚩 ";
      } else {
        rowStr += "□ ";
      }
    }
    console.log(`Row ${row}: ${rowStr}`);
  }
  console.log("=== END DEBUG ===");
};

// Test function to verify neighbor counting logic
export const testNeighborCounting = (): void => {
  console.log("=== TESTING NEIGHBOR COUNTING ===");
  
  // Create a simple 3x3 test board
  const testBoard = createEmptyBoard(3, 3);
  
  // Place a coin in the center
  testBoard[1][1].hasCoin = true;
  
  // Calculate neighbor counts
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (!testBoard[row][col].hasCoin) {
        testBoard[row][col].neighborCoins = countNeighborCoins(testBoard, row, col);
        console.log(`Cell (${row},${col}) has ${testBoard[row][col].neighborCoins} neighbor coins`);
      }
    }
  }
  
  // Expected: all cells except center should have 1 neighbor
  console.log("Expected: All cells except (1,1) should have 1 neighbor");
  console.log("=== END TEST ===");
};

// Test specific scenario from user's game state
export const testUserScenario = (): void => {
  console.log("=== TESTING USER SCENARIO ===");
  
  // Create a 9x9 board like the user's game
  const testBoard = createEmptyBoard(9, 9);
  
  // Place a coin in the top-right area (row 0, col 8) based on user's game state
  testBoard[0][8].hasCoin = true;
  
  // Calculate neighbor counts for the rightmost column
  for (let row = 0; row < 9; row++) {
    const col = 7; // Rightmost column (col 8 is the edge)
    testBoard[row][col].neighborCoins = countNeighborCoins(testBoard, row, col);
    console.log(`Cell (${row},${col}) has ${testBoard[row][col].neighborCoins} neighbor coins`);
  }
  
  // Also check the second-to-rightmost column
  for (let row = 0; row < 9; row++) {
    const col = 6; // Second-to-rightmost column
    testBoard[row][col].neighborCoins = countNeighborCoins(testBoard, row, col);
    console.log(`Cell (${row},${col}) has ${testBoard[row][col].neighborCoins} neighbor coins`);
  }
  
  console.log("Expected: Cells near (0,8) should have 1 neighbor");
  console.log("=== END USER SCENARIO TEST ===");
};
