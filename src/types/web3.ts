import { ethers } from "ethers";

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  totalCoinsFound: number;
  bestTime: number;
  totalRewards: string; // Decrypted rewards
  encryptedBalance: string; // Encrypted token balance
}

export interface LeaderboardEntry {
  player: string;
  score: string; // Decrypted score
  timestamp: number;
}

export interface ContractConfig {
  address: string;
  abi: any[];
}

export interface Web3GameState {
  wallet: WalletState;
  gameStats: GameStats | null;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
}

export interface TransactionState {
  isPending: boolean;
  hash: string | null;
  error: string | null;
}

// FHE-specific interfaces
export interface FHEConfig {
  isSupported: boolean;
  encryptionKey: string | null;
}

export interface EncryptedTokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  encryptedBalance: string;
}

// Contract ABI for CoinSweeper with FHE
export const COINSWEEPER_ABI = [
  "function startGame(uint256 difficulty) external",
  "function recordWin(uint256 difficulty, uint256 time, uint256 coinsFound) external",
  "function recordLoss(uint256 difficulty) external",
  "function getPlayerStats(address player) external view returns (uint256 gamesPlayed, uint256 gamesWon, uint256 totalCoinsFound, uint256 bestTime, uint256 totalRewards)",
  "function getLeaderboardEntry(uint256 index) external view returns (address player, uint256 score, uint256 timestamp)",
  "function getPlayerEncryptedBalance(address player) external view returns (uint256)",
  "function transferEncryptedTokens(address to, bytes calldata encryptedAmount) external",
  "function leaderboardCount() external view returns (uint256)",
  "function rewardPerWin() external view returns (uint256)",
  "function difficultyMultipliers(uint256) external view returns (uint256)",
  "function minTimeForBonus() external view returns (uint256)",
  "function bonusMultiplier() external view returns (uint256)",
  "function rewardToken() external view returns (address)",
  "event GameStarted(address indexed player, uint256 difficulty)",
  "event GameWon(address indexed player, uint256 difficulty, uint256 time, uint256 reward)",
  "event GameLost(address indexed player, uint256 difficulty)",
  "event EncryptedRewardMinted(address indexed player, uint256 amount)",
];

// Contract ABI for EncryptedERC20
export const ENCRYPTED_ERC20_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function getTotalSupply() external view returns (uint32)",
  "function getBalance(address account) external view returns (uint32)",
  "function getAllowance(address owner, address spender) external view returns (uint32)",
  "function transfer(address to, bytes calldata encryptedAmount) external",
  "function transferFrom(address from, address to, bytes calldata encryptedAmount) external",
  "function approve(address spender, bytes calldata encryptedAmount) external",
  "function mint(address to, bytes calldata encryptedAmount) external",
  "function burn(address from, bytes calldata encryptedAmount) external",
  "function encryptAmount(uint32 amount) external pure returns (bytes)",
  "event Transfer(address indexed from, address indexed to, uint256 amount)",
  "event Approval(address indexed owner, address indexed spender, uint256 amount)",
  "event Mint(address indexed to, uint256 amount)",
  "event Burn(address indexed from, uint256 amount)",
];

// Network configurations - Sepolia only
export const NETWORKS = {
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
    explorer: "https://sepolia.etherscan.io",
  },
};

// Contract addresses - Sepolia only
export const CONTRACT_ADDRESSES = {
  sepolia: "0xB45D181c2F51700a489754993D9E2A0F6032504F", // CoinSweeper contract on Sepolia
};

// FHE Configuration
export const FHE_CONFIG = {
  isSupported: true,
  encryptionKey: null, // Will be set by FHE library
  defaultPrecision: 18,
  maxAmount: 1000000, // Maximum encrypted amount
  supportedNetworks: [11155111], // Sepolia testnet only
};
