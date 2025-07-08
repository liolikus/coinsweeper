import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import {
  WalletState,
  Web3GameState,
  GameStats,
  LeaderboardEntry,
  TransactionState,
} from "../types/web3";
import {
  connectWallet,
  disconnectWallet,
  getPlayerStats,
  getLeaderboard,
  getContractConfig,
  setupWalletListeners,
} from "../utils/web3Utils";

// Action types
type Web3Action =
  | { type: "SET_WALLET"; payload: WalletState }
  | { type: "SET_GAME_STATS"; payload: GameStats | null }
  | { type: "SET_LEADERBOARD"; payload: LeaderboardEntry[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_TRANSACTION"; payload: TransactionState }
  | { type: "CLEAR_ERROR" };

// Initial state
const initialState: Web3GameState = {
  wallet: {
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    provider: null,
    signer: null,
  },
  gameStats: null,
  leaderboard: [],
  isLoading: false,
  error: null,
};

// Reducer
const web3Reducer = (
  state: Web3GameState,
  action: Web3Action,
): Web3GameState => {
  switch (action.type) {
    case "SET_WALLET":
      return { ...state, wallet: action.payload };
    case "SET_GAME_STATS":
      return { ...state, gameStats: action.payload };
    case "SET_LEADERBOARD":
      return { ...state, leaderboard: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

// Context
interface Web3ContextType extends Web3GameState {
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshStats: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  startGameOnChain: (difficulty: number) => Promise<void>;
  recordWinOnChain: (
    difficulty: number,
    time: number,
    coinsFound: number,
  ) => Promise<void>;
  recordLossOnChain: (difficulty: number) => Promise<void>;
  claimRewards: () => Promise<void>;
  clearError: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Provider component
interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(web3Reducer, initialState);

  // Connect wallet
  const connect = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      const walletState = await connectWallet();
      dispatch({ type: "SET_WALLET", payload: walletState });

      // Load initial data
      await refreshStats();
      await refreshLeaderboard();

      // TODO: Re-enable wallet listeners once ethers v6 compatibility is resolved
      // For now, we'll skip the event listeners to avoid the "unknown ProviderEvent" error
      // Users will need to manually refresh the page if they switch accounts or networks
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    const disconnectedWallet = disconnectWallet();
    dispatch({ type: "SET_WALLET", payload: disconnectedWallet });
    dispatch({ type: "SET_GAME_STATS", payload: null });
    dispatch({ type: "SET_LEADERBOARD", payload: [] });
  };

  // Refresh player stats
  const refreshStats = async () => {
    if (
      !state.wallet.isConnected ||
      !state.wallet.signer ||
      !state.wallet.address
    ) {
      return;
    }

    try {
      const contractConfig = getContractConfig(state.wallet.chainId!);
      const stats = await getPlayerStats(
        state.wallet.signer,
        contractConfig.address,
        state.wallet.address,
      );
      dispatch({ type: "SET_GAME_STATS", payload: stats });
    } catch (error: any) {
      console.error("Error loading stats:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load game stats" });
    }
  };

  // Refresh leaderboard
  const refreshLeaderboard = async () => {
    if (!state.wallet.isConnected || !state.wallet.signer) {
      return;
    }

    try {
      const contractConfig = getContractConfig(state.wallet.chainId!);
      const leaderboard = await getLeaderboard(
        state.wallet.signer,
        contractConfig.address,
      );
      dispatch({ type: "SET_LEADERBOARD", payload: leaderboard });
    } catch (error: any) {
      console.error("Error loading leaderboard:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load leaderboard" });
    }
  };

  // Start game on blockchain
  const startGameOnChain = async (difficulty: number) => {
    if (!state.wallet.isConnected || !state.wallet.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const contractConfig = getContractConfig(state.wallet.chainId!);

      const { startGameOnChain } = await import("../utils/web3Utils");
      await startGameOnChain(
        state.wallet.signer,
        contractConfig.address,
        difficulty,
      );

      await refreshStats();
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Record win on blockchain
  const recordWinOnChain = async (
    difficulty: number,
    time: number,
    coinsFound: number,
  ) => {
    if (!state.wallet.isConnected || !state.wallet.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const contractConfig = getContractConfig(state.wallet.chainId!);

      const { recordWinOnChain } = await import("../utils/web3Utils");
      await recordWinOnChain(
        state.wallet.signer,
        contractConfig.address,
        difficulty,
        time,
        coinsFound,
      );

      await refreshStats();
      await refreshLeaderboard();
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Record loss on blockchain
  const recordLossOnChain = async (difficulty: number) => {
    if (!state.wallet.isConnected || !state.wallet.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const contractConfig = getContractConfig(state.wallet.chainId!);

      const { recordLossOnChain } = await import("../utils/web3Utils");
      await recordLossOnChain(
        state.wallet.signer,
        contractConfig.address,
        difficulty,
      );

      await refreshStats();
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Claim rewards
  const claimRewards = async () => {
    if (!state.wallet.isConnected || !state.wallet.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const contractConfig = getContractConfig(state.wallet.chainId!);

      const { claimRewards } = await import("../utils/web3Utils");
      await claimRewards(state.wallet.signer, contractConfig.address);

      await refreshStats();
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const detectProvider = (await import("@metamask/detect-provider"))
          .default;
        const provider = await detectProvider();
        if (provider && (provider as any).selectedAddress) {
          await connect();
        }
      } catch (error) {
        console.log("No previous connection found");
      }
    };

    checkConnection();
  }, []);

  const contextValue: Web3ContextType = {
    ...state,
    connect,
    disconnect,
    refreshStats,
    refreshLeaderboard,
    startGameOnChain,
    recordWinOnChain,
    recordLossOnChain,
    claimRewards,
    clearError,
  };

  return (
    <Web3Context.Provider value={contextValue}>{children}</Web3Context.Provider>
  );
};

// Hook to use Web3 context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
