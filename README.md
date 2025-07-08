# 🔐 CoinSweeper - Zama FHE-Enabled Blockchain Game

Coinsweeper is play-to-earn game with **Fully Homomorphic Encryption (FHE)** integration using the [Zama protocol](https://docs.zama.ai/protocol). Players find coins, with encrypted token rewards and confidential blockchain interactions powered by Zama's relayer network.

## 🌟 Features

### 🎮 Core Game
- **Three difficulty levels**: Easy (8x8), Medium (16x16), Hard (16x30)
- **Real-time timer** and **flag placement**
- **Responsive design** for all devices

### 🔐 Zama FHE & Privacy Features
- **Encrypted ERC20 tokens** for rewards using Zama's FHE protocol
- **Confidential leaderboard** with encrypted scores
- **Private token transfers** via Zama relayer network
- **Secure reward distribution** with encrypted balances
- **Homomorphic operations** on encrypted data
- **Cross-network FHE support** (works on all EVM networks)

### ⛓️ Web3 Integration
- **MetaMask wallet connection**
- **Sepolia testnet deployment** for development and testing
- **Blockchain game recording** (starts, wins, losses)
- **Encrypted token management**
- **Real-time blockchain stats**

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd coinsweeper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Zama FHE Setup & Deployment

### 1. Environment Configuration

Create a `.env` file in the root directory:
```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=your_sepolia_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 2. Deploy to Sepolia Testnet

```bash
# Deploy Zama FHE contracts to Sepolia testnet
npm run deploy
```

**Note**: Full FHE features require the Fhenix network. Sepolia deployment is for development and testing purposes.

### 4. Deployed Contract Addresses

The contracts have been deployed to Sepolia testnet:

**EncryptedERC20 Token (CSR)**
- **Address**: `0x27eB7fC7F852e83c53D897F938443d722ab3b54E`
- **Name**: CoinSweeper Rewards
- **Symbol**: CSR
- **Decimals**: 6
- **Purpose**: Encrypted ERC20 token for game rewards using Zama FHE

**CoinSweeper Game Contract**
- **Address**: `0xB45D181c2F51700a489754993D9E2A0F6032504F`
- **Purpose**: Main game contract that manages gameplay, rewards, and leaderboard
- **Features**: 
  - Game statistics tracking
  - Encrypted reward distribution
  - Difficulty multipliers
  - Leaderboard management

**Contract Links:**
- [EncryptedERC20 on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x27eB7fC7F852e83c53D897F938443d722ab3b54E)
- [CoinSweeper on Sepolia Etherscan](https://sepolia.etherscan.io/address/0xB45D181c2F51700a489754993D9E2A0F6032504F)

**Update Frontend Configuration:**
After deployment, update the contract addresses in `src/types/web3.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  sepolia: '0xB45D181c2F51700a489754993D9E2A0F6032504F'
};
```

## 🔐 Zama FHE Features Explained

### Encrypted ERC20 Token
- **Privacy-preserving token** with encrypted balances
- **Confidential transfers** via Zama relayer network
- **Secure minting** for game rewards
- **Homomorphic operations** on encrypted data

### Confidential Leaderboard
- **Encrypted scores** stored on-chain
- **Private rankings** without revealing exact values
- **Secure comparisons** using Zama FHE operations

### Private Game Statistics
- **Encrypted reward tracking**
- **Confidential win/loss records**
- **Secure difficulty multipliers**

### Zama Relayer Network
- **Decentralized FHE processing**
- **Cross-network compatibility**
- **Privacy-preserving computations**
- **Scalable encrypted operations**

## 🎯 How to Play

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Choose Difficulty**: Select Easy, Medium, or Hard
3. **Start Playing**: 
   - Left-click to reveal cells
   - Right-click to place/remove flags
   - Find all coins without clicking on them
4. **Earn Rewards**: Win games to earn encrypted tokens
5. **View Stats**: Check your encrypted balance and leaderboard position

## 🌐 Supported Networks

| Network | Chain ID | Zama FHE Support | Status |
|---------|----------|------------------|---------|
| Sepolia Testnet | 11155111 | ⚠️ Limited | Development |
| Localhost | 31337 | ⚠️ Limited | Development |


## 🏗️ Architecture

### Smart Contracts
- **`EncryptedERC20.sol`**: Zama FHE-enabled ERC20 token
- **`CoinSweeper.sol`**: Main game contract with Zama FHE integration

### Frontend Components
- **`CoinsweeperGame.tsx`**: Main game component
- **`FHETokenInfo.tsx`**: Zama FHE token information display
- **`WalletConnect.tsx`**: MetaMask integration
- **`BlockchainStats.tsx`**: Blockchain statistics

### Zama FHE Integration
- **`zamaFHE.ts`**: Zama relayer SDK integration
- **`Web3Context.tsx`**: React context for Web3 state
- **`web3Utils.ts`**: Zama FHE and blockchain utilities
- **`web3.ts`**: TypeScript types and ABIs

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Compile contracts
npx hardhat compile

# Run contract tests
npx hardhat test

# Deploy contracts
npm run deploy

# Verify contracts
npm run verify <contract_address> <constructor_args>
```

### Project Structure
```
coinsweeper/
├── host-contracts/           # Smart contracts
│   ├── CoinSweeper.sol  # Main game contract
│   └── EncryptedERC20.sol # Zama FHE token contract
├── src/
│   ├── components/      # React components
│   ├── contexts/        # React contexts
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   │   └── zamaFHE.ts  # Zama FHE integration
│   └── ...
├── scripts/            # Deployment scripts
├── test/              # Contract tests
└── public/            # Static assets
```

## 🔒 Security Features

- **Zama FHE encryption** for all sensitive data
- **Reentrancy protection** in smart contracts
- **Access control** with Ownable pattern
- **Input validation** and error handling
- **Secure random number generation**
- **Privacy-preserving computations**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Zama AI** for the FHE protocol and [relayer SDK](https://docs.zama.ai/protocol/relayer-sdk-guides/development-guide/webapp)
- **OpenZeppelin** for secure smart contract libraries
- **Hardhat** for development framework
- **React** and **TypeScript** for the frontend

## 📞 Support

- **Zama Documentation**: [docs.zama.ai/protocol](https://docs.zama.ai/protocol)
- **Relayer SDK Guide**: [docs.zama.ai/protocol/relayer-sdk-guides/development-guide/webapp](https://docs.zama.ai/protocol/relayer-sdk-guides/development-guide/webapp)
- **Community**: [Zama Discord](https://discord.gg/zama)

---

**🎉 Ready to experience the future of privacy-preserving gaming with Zama FHE!**
