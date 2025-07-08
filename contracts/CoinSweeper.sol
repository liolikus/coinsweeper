// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./EncryptedERC20.sol";

contract CoinSweeper is Ownable, ReentrancyGuard {
    // Game statistics
    struct GameStats {
        uint256 gamesPlayed;
        uint256 gamesWon;
        uint256 totalCoinsFound;
        uint256 bestTime;
        euint64 totalRewards; // Encrypted rewards
    }
    
    struct LeaderboardEntry {
        address player;
        euint64 score; // Encrypted score
        uint256 timestamp;
    }
    
    // Events
    event GameStarted(address indexed player, uint256 difficulty);
    event GameWon(address indexed player, uint256 difficulty, uint256 time, uint256 reward);
    event GameLost(address indexed player, uint256 difficulty);
    event RewardClaimed(address indexed player, uint256 amount);
    event EncryptedRewardMinted(address indexed player, uint256 amount);
    
    // State variables
    mapping(address => GameStats) public playerStats;
    mapping(uint256 => LeaderboardEntry) public leaderboard;
    uint256 public leaderboardCount;
    
    // Encrypted reward token
    EncryptedERC20 public rewardToken;
    uint256 public rewardPerWin = 100; // Base reward amount
    uint256 public minTimeForBonus = 300; // 5 minutes for bonus
    uint256 public bonusMultiplier = 2; // 2x bonus for fast wins
    
    // Difficulty multipliers
    mapping(uint256 => uint256) public difficultyMultipliers;
    
    constructor(address _rewardToken) Ownable(msg.sender) {
        rewardToken = EncryptedERC20(_rewardToken);
        
        // Set difficulty multipliers (1 = Easy, 2 = Medium, 3 = Hard)
        difficultyMultipliers[1] = 1;   // Easy: 1x
        difficultyMultipliers[2] = 2;   // Medium: 2x
        difficultyMultipliers[3] = 4;   // Hard: 4x
    }
    
    // Start a new game
    function startGame(uint256 difficulty) external {
        require(difficulty >= 1 && difficulty <= 3, "Invalid difficulty");
        
        playerStats[msg.sender].gamesPlayed++;
        emit GameStarted(msg.sender, difficulty);
    }
    
    // Record a game win with encrypted rewards
    function recordWin(uint256 difficulty, uint256 time, uint256 coinsFound) 
        external 
        nonReentrant 
    {
        require(difficulty >= 1 && difficulty <= 3, "Invalid difficulty");
        require(time > 0, "Invalid time");
        
        GameStats storage stats = playerStats[msg.sender];
        stats.gamesWon++;
        stats.totalCoinsFound += coinsFound;
        
        // Update best time if better
        if (stats.bestTime == 0 || time < stats.bestTime) {
            stats.bestTime = time;
        }
        
        // Calculate reward
        uint256 baseReward = rewardPerWin * difficultyMultipliers[difficulty];
        uint256 finalReward = baseReward;
        
        // Bonus for fast completion
        if (time <= minTimeForBonus) {
            finalReward = baseReward * bonusMultiplier;
        }
        
        // Mint rewards to player (the EncryptedERC20 contract handles encryption internally)
        rewardToken.mint(uint64(finalReward));
        
        // Update encrypted total rewards (convert to euint64 for storage)
        euint64 encryptedReward = encrypt(uint64(finalReward));
        stats.totalRewards = add(stats.totalRewards, encryptedReward);
        
        // Update leaderboard with encrypted score
        updateLeaderboard(msg.sender, encryptedReward);
        
        emit GameWon(msg.sender, difficulty, time, finalReward);
        emit EncryptedRewardMinted(msg.sender, finalReward);
    }
    
    // Record a game loss
    function recordLoss(uint256 difficulty) external {
        require(difficulty >= 1 && difficulty <= 3, "Invalid difficulty");
        emit GameLost(msg.sender, difficulty);
    }
    
    // Get player stats with decrypted rewards
    function getPlayerStats(address player) external view returns (
        uint256 gamesPlayed,
        uint256 gamesWon,
        uint256 totalCoinsFound,
        uint256 bestTime,
        uint256 totalRewards
    ) {
        GameStats memory stats = playerStats[player];
        return (
            stats.gamesPlayed,
            stats.gamesWon,
            stats.totalCoinsFound,
            stats.bestTime,
            decrypt(stats.totalRewards)
        );
    }
    
    // Get leaderboard entry with decrypted score
    function getLeaderboardEntry(uint256 index) external view returns (
        address player,
        uint256 score,
        uint256 timestamp
    ) {
        require(index < leaderboardCount, "Index out of bounds");
        LeaderboardEntry memory entry = leaderboard[index];
        return (
            entry.player,
            decrypt(entry.score),
            entry.timestamp
        );
    }
    
    // Get encrypted balance for a player
    function getPlayerEncryptedBalance(address player) external view returns (uint256) {
        return uint256(euint64.unwrap(rewardToken.balanceOf(player)));
    }
    
    // Transfer encrypted tokens (requires approval)
    function transferEncryptedTokens(address to, euint64 amount) external {
        rewardToken.transferFrom(msg.sender, to, amount);
    }
    
    // Update leaderboard with encrypted scores
    function updateLeaderboard(address player, euint64 score) internal {
        // Simple leaderboard implementation - can be enhanced
        if (leaderboardCount < 100) {
            leaderboard[leaderboardCount] = LeaderboardEntry({
                player: player,
                score: score,
                timestamp: block.timestamp
            });
            leaderboardCount++;
        }
    }
    
    // Owner functions
    function setRewardToken(address _rewardToken) external onlyOwner {
        rewardToken = EncryptedERC20(_rewardToken);
    }
    
    function setRewardPerWin(uint256 _rewardPerWin) external onlyOwner {
        rewardPerWin = _rewardPerWin;
    }
    
    function setDifficultyMultiplier(uint256 difficulty, uint256 multiplier) external onlyOwner {
        require(difficulty >= 1 && difficulty <= 3, "Invalid difficulty");
        difficultyMultipliers[difficulty] = multiplier;
    }
    
    function setMinTimeForBonus(uint256 _minTimeForBonus) external onlyOwner {
        minTimeForBonus = _minTimeForBonus;
    }
    
    function setBonusMultiplier(uint256 _bonusMultiplier) external onlyOwner {
        bonusMultiplier = _bonusMultiplier;
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }
    
    // FHE operations (these would be implemented by the Zama runtime)
    function add(euint64 a, euint64 b) internal pure returns (euint64) {
        // This would use FHE.add() in a real implementation
        // For now, return a placeholder
        return a;
    }
    
    function decrypt(euint64 encrypted) internal pure returns (uint256) {
        // This would be implemented by the Zama runtime
        // For now, return a placeholder
        return 0;
    }
    
    function encrypt(uint64 plaintext) internal pure returns (euint64) {
        // This would be implemented by the Zama runtime
        // For now, return a placeholder
        return euint64.wrap(0);
    }
    
    // Receive function to accept ETH
    receive() external payable {}
} 