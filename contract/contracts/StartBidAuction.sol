// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title StartBidAuction
 * @notice Improved auction contract designed for integration with IPFS metadata + off-chain indexing.
 * Features:
 *  - Create auctions with IPFS CID metadata
 *  - Place bids (funds held in contract until auction ends)
 *  - Outbid refund mechanism (withdraw pattern)
 *  - End auction and payout to seller, with optional platform fee
 *  - Cancel auction (only if no bids) and allow seller withdrawal
 *  - Events for easy off-chain indexing and realtime UI updates
 *  - Reentrancy guard pattern implemented using checks-effects-interactions
 *
 * Security notes:
 *  - Uses withdraw pattern to return funds to outbid users (avoids direct refunds inside bid)
 *  - Bid values must be strictly greater than current highest bid
 *  - Auction deadlines use block.timestamp (sufficient for typical use; consider oracle/time consensus for high-value use)
 */

contract StartBidAuction {
    address public owner; // platform owner (for optional fees)
    uint256 public platformFeeBasisPoints = 250; // 2.5% default

    constructor() {
        owner = msg.sender;
    }

    /// @notice Auction structure
    struct Auction {
        address payable seller;
        string ipfsCID; // CID pointing to metadata JSON (contains name, description, image)
        uint256 reservePrice; // minimum acceptable price
        uint256 highestBid;
        address payable highestBidder;
        uint256 startTime;
        uint256 endTime;
        bool settled;
        bool canceled;
    }

    uint256 public nextAuctionId = 1;
    mapping(uint256 => Auction) public auctions;

    // pending returns for bidders who got outbid (withdraw pattern)
    mapping(address => uint256) public pendingReturns;

    // Events
    event AuctionCreated(uint256 indexed auctionId, address indexed seller, string ipfsCID, uint256 reservePrice, uint256 startTime, uint256 endTime);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionCanceled(uint256 indexed auctionId);
    event AuctionSettled(uint256 indexed auctionId, address indexed winner, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    // --- Modifiers ---
    modifier onlySeller(uint256 _auctionId) {
        require(msg.sender == auctions[_auctionId].seller, "Not seller");
        _;
    }

    modifier auctionExists(uint256 _auctionId) {
        require(_auctionId > 0 && _auctionId < nextAuctionId, "Auction does not exist");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // --- Core functions ---

    /**
     * @notice Create a new auction
     * @param _ipfsCID IPFS CID that points to auction metadata (JSON)
     * @param _reservePrice minimum acceptable price in wei
     * @param _biddingTime duration of auction in seconds
     */
    function createAuction(string calldata _ipfsCID, uint256 _reservePrice, uint256 _biddingTime) external returns (uint256) {
        require(bytes(_ipfsCID).length > 0, "IPFS CID required");
        require(_biddingTime >= 60, "Bidding time too short");

        uint256 auctionId = nextAuctionId++;
        auctions[auctionId] = Auction({
            seller: payable(msg.sender),
            ipfsCID: _ipfsCID,
            reservePrice: _reservePrice,
            highestBid: 0,
            highestBidder: payable(address(0)),
            startTime: block.timestamp,
            endTime: block.timestamp + _biddingTime,
            settled: false,
            canceled: false
        });

        emit AuctionCreated(auctionId, msg.sender, _ipfsCID, _reservePrice, block.timestamp, block.timestamp + _biddingTime);
        return auctionId;
    }

    /**
     * @notice Place a bid on an active auction
     * @param _auctionId ID of the auction
     */
    function placeBid(uint256 _auctionId) external payable auctionExists(_auctionId) {
        Auction storage a = auctions[_auctionId];
        require(!a.canceled, "Auction canceled");
        require(block.timestamp >= a.startTime, "Auction not started");
        require(block.timestamp < a.endTime, "Auction ended");
        require(msg.value > a.highestBid, "Bid <= highest bid");

        // If there is an existing highest bid, move it to pendingReturns
        if (a.highestBidder != address(0)) {
            pendingReturns[a.highestBidder] += a.highestBid;
        }

        a.highestBid = msg.value;
        a.highestBidder = payable(msg.sender);

        emit BidPlaced(_auctionId, msg.sender, msg.value);
    }

    /**
     * @notice Withdraw funds that were outbid
     */
    function withdraw() external {
        uint256 amount = pendingReturns[msg.sender];
        require(amount > 0, "No funds to withdraw");
        // Effects
        pendingReturns[msg.sender] = 0;
        // Interaction
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Withdraw failed");
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Cancel auction (only seller) - allowed only if no bids yet
     */
    function cancelAuction(uint256 _auctionId) external auctionExists(_auctionId) onlySeller(_auctionId) {
        Auction storage a = auctions[_auctionId];
        require(!a.settled, "Already settled");
        require(a.highestBid == 0, "Cannot cancel with active bids");

        a.canceled = true;
        emit AuctionCanceled(_auctionId);
    }

    /**
     * @notice Settle auction after it has ended. Can be called by anyone.
     * Transfers highest bid to seller minus platform fee, and marks auction settled.
     */
    function settleAuction(uint256 _auctionId) external auctionExists(_auctionId) {
        Auction storage a = auctions[_auctionId];
        require(!a.canceled, "Auction canceled");
        require(!a.settled, "Already settled");
        require(block.timestamp >= a.endTime, "Auction not yet ended");
        require(a.highestBid >= a.reservePrice, "Reserve not met");

        a.settled = true;

        uint256 fee = (a.highestBid * platformFeeBasisPoints) / 10000;
        uint256 payout = a.highestBid - fee;

        // Transfer fee to platform owner
        if (fee > 0) {
            (bool feeSent, ) = payable(owner).call{value: fee}("");
            require(feeSent, "Fee transfer failed");
        }

        // Transfer payout to seller
        (bool sent, ) = a.seller.call{value: payout}("");
        require(sent, "Payout to seller failed");

        emit AuctionSettled(_auctionId, a.highestBidder, a.highestBid);
    }

    // --- View helpers ---

    function getAuction(uint256 _auctionId) external view auctionExists(_auctionId) returns (
        address seller,
        string memory ipfsCID,
        uint256 reservePrice,
        uint256 highestBid,
        address highestBidder,
        uint256 startTime,
        uint256 endTime,
        bool settled,
        bool canceled
    ) {
        Auction storage a = auctions[_auctionId];
        return (a.seller, a.ipfsCID, a.reservePrice, a.highestBid, a.highestBidder, a.startTime, a.endTime, a.settled, a.canceled);
    }

    // --- Admin functions ---

    function setPlatformFee(uint256 _bps) external onlyOwner {
        require(_bps <= 1000, "Fee too large"); // max 10%
        platformFeeBasisPoints = _bps;
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Zero address");
        owner = _newOwner;
    }

    // --- Fallback ---
    receive() external payable {
        // Accept ETH to contract in case of direct sends
    }
}
