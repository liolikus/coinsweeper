export interface Cell {
  id: string;
  row: number;
  col: number;
  isRevealed: boolean;
  isFlagged: boolean;
  hasCoin: boolean;
  neighborCoins: number;
}

export interface GameState {
  board: Cell[][];
  gameOver: boolean;
  gameWon: boolean;
  coinsFound: number;
  totalCoins: number;
  flagsPlaced: number;
  startTime: number | null;
  endTime: number | null;
}

export interface Difficulty {
  name: string;
  rows: number;
  cols: number;
  coins: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { name: "Easy", rows: 9, cols: 9, coins: 10 },
  { name: "Medium", rows: 16, cols: 16, coins: 40 },
  { name: "Hard", rows: 16, cols: 30, coins: 99 },
];
