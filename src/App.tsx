import React from "react";
import { Web3Provider } from "./contexts/Web3Context";
import CoinsweeperGame from "./components/CoinsweeperGame";
import WalletConnect from "./components/WalletConnect";
import FHETokenInfo from "./components/FHETokenInfo";
import BlockchainStats from "./components/BlockchainStats";
import "./App.css";

function App() {
  return (
    <Web3Provider>
      <div className="App">
        <div className="container">
          <div className="header">
            <h1>🔐 CoinSweeper</h1>
            <p>Privacy-Preserving CoinSweeper Game with Zama FHE</p>
          </div>
          
          <div className="main-content">
            <div className="sidebar">
              <FHETokenInfo />
            </div>
            
            <div className="game-area">
              <CoinsweeperGame />
            </div>
            
            <div className="sidebar">
              <WalletConnect />
              <BlockchainStats />
            </div>
          </div>
        </div>
      </div>
    </Web3Provider>
  );
}

export default App;
