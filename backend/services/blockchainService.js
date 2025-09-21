const { ethers } = require('ethers');

class BlockchainService {
  constructor() {
    // Initialize provider and contract
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', this.provider);
    
    // Contract ABI and address
    this.contractABI = [
      "function createAuction(string calldata _ipfsCID, uint256 _reservePrice, uint256 _biddingTime) external returns (uint256)",
      "function placeBid(uint256 _auctionId) external payable",
      "function withdraw() external",
      "function cancelAuction(uint256 _auctionId) external",
      "function settleAuction(uint256 _auctionId) external",
      "function getAuction(uint256 _auctionId) external view returns (address seller, string memory ipfsCID, uint256 reservePrice, uint256 highestBid, address highestBidder, uint256 startTime, uint256 endTime, bool settled, bool canceled)",
      "function pendingReturns(address) external view returns (uint256)",
      "function nextAuctionId() external view returns (uint256)",
      "event AuctionCreated(uint256 indexed auctionId, address indexed seller, string ipfsCID, uint256 reservePrice, uint256 startTime, uint256 endTime)",
      "event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount)",
      "event AuctionCanceled(uint256 indexed auctionId)",
      "event AuctionSettled(uint256 indexed auctionId, address indexed winner, uint256 amount)",
      "event Withdrawn(address indexed user, uint256 amount)"
    ];
    
    this.contractAddress = process.env.CONTRACT_ADDRESS || '';
    this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.wallet);
  }

  /**
   * Create a new auction on the blockchain
   * @param {string} ipfsCID - IPFS CID of auction metadata
   * @param {number} reservePrice - Reserve price in ETH
   * @param {number} biddingTime - Bidding time in seconds
   * @returns {Promise<Object>} Transaction result with auction ID
   */
  async createAuction(ipfsCID, reservePrice, biddingTime) {
    try {
      const reservePriceWei = ethers.parseEther(reservePrice.toString());
      const tx = await this.contract.createAuction(ipfsCID, reservePriceWei, biddingTime);
      const receipt = await tx.wait();
      
      // Extract auction ID from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed.name === 'AuctionCreated';
        } catch (e) {
          return false;
        }
      });
      
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        const auctionId = parsed.args.auctionId.toString();
        
        return {
          success: true,
          auctionId,
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        };
      }
      
      throw new Error('AuctionCreated event not found in transaction');
    } catch (error) {
      console.error('Error creating auction on blockchain:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Place a bid on an auction
   * @param {number} auctionId - Auction ID
   * @param {number} bidAmount - Bid amount in ETH
   * @param {string} bidderAddress - Bidder's wallet address
   * @returns {Promise<Object>} Transaction result
   */
  async placeBid(auctionId, bidAmount, bidderAddress) {
    try {
      const bidAmountWei = ethers.parseEther(bidAmount.toString());
      
      // Create a new contract instance with the bidder's wallet
      const bidderWallet = new ethers.Wallet(process.env.BIDDER_PRIVATE_KEY || '', this.provider);
      const bidderContract = new ethers.Contract(this.contractAddress, this.contractABI, bidderWallet);
      
      const tx = await bidderContract.placeBid(auctionId, { value: bidAmountWei });
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error placing bid on blockchain:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get auction details from blockchain
   * @param {number} auctionId - Auction ID
   * @returns {Promise<Object>} Auction details
   */
  async getAuction(auctionId) {
    try {
      const auction = await this.contract.getAuction(auctionId);
      
      return {
        seller: auction.seller,
        ipfsCID: auction.ipfsCID,
        reservePrice: ethers.formatEther(auction.reservePrice),
        highestBid: ethers.formatEther(auction.highestBid),
        highestBidder: auction.highestBidder,
        startTime: new Date(parseInt(auction.startTime) * 1000),
        endTime: new Date(parseInt(auction.endTime) * 1000),
        settled: auction.settled,
        canceled: auction.canceled
      };
    } catch (error) {
      console.error('Error getting auction from blockchain:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get pending returns for a user
   * @param {string} userAddress - User's wallet address
   * @returns {Promise<string>} Pending returns in ETH
   */
  async getPendingReturns(userAddress) {
    try {
      const pendingWei = await this.contract.pendingReturns(userAddress);
      return ethers.formatEther(pendingWei);
    } catch (error) {
      console.error('Error getting pending returns:', error);
      return '0';
    }
  }

  /**
   * Listen for blockchain events
   * @param {string} eventName - Event name to listen for
   * @param {Function} callback - Callback function
   */
  listenForEvents(eventName, callback) {
    this.contract.on(eventName, callback);
  }

  /**
   * Get all auction events from a specific block
   * @param {number} fromBlock - Starting block number
   * @param {number} toBlock - Ending block number
   * @returns {Promise<Array>} Array of events
   */
  async getAuctionEvents(fromBlock = 0, toBlock = 'latest') {
    try {
      const filter = {
        address: this.contractAddress,
        fromBlock,
        toBlock
      };

      const events = await this.provider.getLogs(filter);
      return events.map(event => {
        try {
          return this.contract.interface.parseLog(event);
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
    } catch (error) {
      console.error('Error getting auction events:', error);
      return [];
    }
  }

  /**
   * Get the next auction ID
   * @returns {Promise<number>} Next auction ID
   */
  async getNextAuctionId() {
    try {
      const nextId = await this.contract.nextAuctionId();
      return parseInt(nextId.toString());
    } catch (error) {
      console.error('Error getting next auction ID:', error);
      return 0;
    }
  }

  /**
   * Check if wallet is connected and has sufficient balance
   * @param {string} address - Wallet address
   * @returns {Promise<Object>} Wallet status
   */
  async checkWalletStatus(address) {
    try {
      const balance = await this.provider.getBalance(address);
      const network = await this.provider.getNetwork();
      
      return {
        connected: true,
        balance: ethers.formatEther(balance),
        network: network.name,
        chainId: network.chainId.toString()
      };
    } catch (error) {
      console.error('Error checking wallet status:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }
}

module.exports = BlockchainService;
