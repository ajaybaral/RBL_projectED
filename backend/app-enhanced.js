require('dotenv').config();
const express = require("express");
const bodyparser = require("body-parser");
const cors = require('cors');
const multer = require('multer');
const { MongoClient } = require('mongodb');
// const IPFSService = require('./services/ipfsService');
const BlockchainService = require('./services/blockchainService');

const app = express();
app.use(cors());
app.use(bodyparser.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const http = require("http");
const server = http.createServer(app);
const sha256 = require("sha256");

// Initialize services
// const ipfsService = new IPFSService();
const blockchainService = new BlockchainService();

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb+srv://Suriyaa:mthaniga@cluster0.rsh4e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB successfully");
    } catch (error) {
        console.log("❌ MongoDB connection failed:", error.message);
        console.log("⚠️  Application will continue but database features may not work");
    }
}
connectToMongoDB();

// Socket.io setup
const io = require('socket.io')(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Enhanced auction creation endpoint (simplified without IPFS)
app.post("/create-auction", upload.single('image'), async (req, res) => {
    try {
        const { title, description, category, startingPrice, duration } = req.body;
        
        if (!title || !description || !startingPrice || !duration) {
            return res.status(400).json({ 
                success: false, 
                error: "Missing required fields" 
            });
        }

        // Create mock metadata CID for development
        const metadataCID = `mock_metadata_${Date.now()}`;
        const imageCID = req.file ? `mock_image_${Date.now()}` : null;
        
        // Create auction on blockchain
        const blockchainResult = await blockchainService.createAuction(
            metadataCID,
            parseFloat(startingPrice),
            parseInt(duration) * 3600 // Convert hours to seconds
        );

        if (!blockchainResult.success) {
            return res.status(500).json({
                success: false,
                error: `Blockchain error: ${blockchainResult.error}`
            });
        }

        // Store in MongoDB for caching and quick access
        const auctionDoc = {
            _id: parseInt(blockchainResult.auctionId),
            title,
            description,
            category,
            startingPrice: parseFloat(startingPrice),
            duration: parseInt(duration),
            imageCID,
            metadataCID,
            blockchainTxHash: blockchainResult.transactionHash,
            blockNumber: blockchainResult.blockNumber,
            createdAt: new Date(),
            status: 'active',
            bidCount: 0,
            winnerAddress: '',
            currentPrice: parseFloat(startingPrice)
        };

        await client.db(process.env.DATABASE_NAME || "Auction_Platform")
            .collection("auctions")
            .insertOne(auctionDoc);

        // Emit real-time update
        io.emit('auction-created', auctionDoc);

        res.json({
            success: true,
            auctionId: blockchainResult.auctionId,
            imageCID,
            metadataCID,
            transactionHash: blockchainResult.transactionHash,
            ipfsGatewayUrl: imageCID ? `https://via.placeholder.com/300x200?text=Mock+Image` : null
        });

    } catch (error) {
        console.error('Error creating auction:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Enhanced bidding endpoint
app.post("/place-bid", async (req, res) => {
    try {
        const { auctionId, bidAmount, bidderAddress } = req.body;
        
        if (!auctionId || !bidAmount || !bidderAddress) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields"
            });
        }

        // Get current auction from blockchain
        const blockchainAuction = await blockchainService.getAuction(auctionId);
        
        if (!blockchainAuction.success) {
            return res.status(400).json({
                success: false,
                error: `Auction not found: ${blockchainAuction.error}`
            });
        }

        // Check if auction is still active
        if (blockchainAuction.settled || blockchainAuction.canceled) {
            return res.status(400).json({
                success: false,
                error: "Auction is no longer active"
            });
        }

        // Check if bid is higher than current highest bid
        if (parseFloat(bidAmount) <= parseFloat(blockchainAuction.highestBid)) {
            return res.status(400).json({
                success: false,
                error: "Bid must be higher than current highest bid"
            });
        }

        // Place bid on blockchain
        const blockchainResult = await blockchainService.placeBid(
            auctionId,
            bidAmount,
            bidderAddress
        );

        if (!blockchainResult.success) {
            return res.status(500).json({
                success: false,
                error: `Blockchain error: ${blockchainResult.error}`
            });
        }

        // Update MongoDB cache
        const auction = await client.db(process.env.DATABASE_NAME || "Auction_Platform")
            .collection("auctions")
            .findOne({ _id: parseInt(auctionId) });

        if (auction) {
            const newBidCount = auction.bidCount + 1;
            await client.db(process.env.DATABASE_NAME || "Auction_Platform")
                .collection("auctions")
                .updateOne(
                    { _id: parseInt(auctionId) },
                    { 
                        $set: { 
                            bidCount: newBidCount,
                            winnerAddress: bidderAddress,
                            currentPrice: parseFloat(bidAmount)
                        }
                    }
                );

            // Store bid transaction
            await client.db(process.env.DATABASE_NAME || "Auction_Platform")
                .collection("transactions")
                .insertOne({
                    auctionId: parseInt(auctionId),
                    bidderAddress,
                    amount: parseFloat(bidAmount),
                    transactionHash: blockchainResult.transactionHash,
                    blockNumber: blockchainResult.blockNumber,
                    timestamp: new Date(),
                    order: newBidCount
                });
        }

        // Emit real-time update
        io.emit('bid-placed', {
            auctionId: parseInt(auctionId),
            bidderAddress,
            amount: parseFloat(bidAmount),
            bidCount: auction ? auction.bidCount + 1 : 1,
            transactionHash: blockchainResult.transactionHash
        });

        res.json({
            success: true,
            transactionHash: blockchainResult.transactionHash,
            newHighestBid: bidAmount
        });

    } catch (error) {
        console.error('Error placing bid:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get auction details (from MongoDB cache + blockchain verification)
app.get("/auction/:id", async (req, res) => {
    try {
        const auctionId = parseInt(req.params.id);
        
        // Get from MongoDB cache
        const cachedAuction = await client.db(process.env.DATABASE_NAME || "Auction_Platform")
            .collection("auctions")
            .findOne({ _id: auctionId });

        if (!cachedAuction) {
            return res.status(404).json({
                success: false,
                error: "Auction not found"
            });
        }

        // Get latest data from blockchain
        const blockchainAuction = await blockchainService.getAuction(auctionId);
        
        // Get metadata (mock for development)
        let metadata = {
            title: cachedAuction.title,
            description: cachedAuction.description,
            category: cachedAuction.category,
            startingPrice: cachedAuction.startingPrice,
            duration: cachedAuction.duration,
            imageCID: cachedAuction.imageCID,
            createdAt: cachedAuction.createdAt,
            version: '1.0'
        };

        // Combine data
        const auctionData = {
            ...cachedAuction,
            blockchain: blockchainAuction.success ? blockchainAuction : null,
            metadata: metadata,
            imageUrl: cachedAuction.imageCID ? `https://via.placeholder.com/300x200?text=Mock+Image` : null
        };

        res.json({
            success: true,
            auction: auctionData
        });

    } catch (error) {
        console.error('Error getting auction:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get all auctions with IPFS metadata
app.get("/auctions", async (req, res) => {
    try {
        const auctions = await client.db(process.env.DATABASE_NAME || "Auction_Platform")
            .collection("auctions")
            .find()
            .sort({ createdAt: -1 })
            .toArray();

        // Enhance with mock metadata
        const enhancedAuctions = auctions.map((auction) => {
            const metadata = {
                title: auction.title,
                description: auction.description,
                category: auction.category,
                startingPrice: auction.startingPrice,
                duration: auction.duration,
                imageCID: auction.imageCID,
                createdAt: auction.createdAt,
                version: '1.0'
            };
            
            return {
                ...auction,
                metadata,
                imageUrl: auction.imageCID ? `https://via.placeholder.com/300x200?text=Mock+Image` : null
            };
        });

        res.json({
            success: true,
            auctions: enhancedAuctions
        });

    } catch (error) {
        console.error('Error getting auctions:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get bid history for an auction
app.get("/auction/:id/bids", async (req, res) => {
    try {
        const auctionId = parseInt(req.params.id);
        
        const bids = await client.db(process.env.DATABASE_NAME || "Auction_Platform")
            .collection("transactions")
            .find({ auctionId })
            .sort({ timestamp: -1 })
            .toArray();

        res.json({
            success: true,
            bids
        });

    } catch (error) {
        console.error('Error getting bid history:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get user's pending returns
app.get("/user/:address/pending-returns", async (req, res) => {
    try {
        const userAddress = req.params.address;
        const pendingReturns = await blockchainService.getPendingReturns(userAddress);
        
        res.json({
            success: true,
            pendingReturns
        });

    } catch (error) {
        console.error('Error getting pending returns:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Withdraw pending returns
app.post("/withdraw", async (req, res) => {
    try {
        const { userAddress } = req.body;
        
        // This would need to be implemented with proper wallet management
        // For now, return instructions for manual withdrawal
        res.json({
            success: true,
            message: "Please use MetaMask or your wallet to call the withdraw() function on the smart contract",
            contractAddress: blockchainService.contractAddress
        });

    } catch (error) {
        console.error('Error processing withdrawal:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Legacy endpoints for backward compatibility
app.get("/home", async (req, res) => {
    try {
        const docs = await findall(client);
        res.send(docs);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.post("/product", async (req, res) => {
    try {
        const docs = await find(client, req.body.id);
        res.send(docs);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// Socket.io event handlers
io.on('connection', socket => {
    console.log("Client connected:", socket.id);

    socket.on('disconnect', () => {
        console.log("Client disconnected:", socket.id);
    });

    // Legacy socket events for backward compatibility
    socket.on('change', async data => {
        // This is now handled by the enhanced bidding endpoint
        console.log("Legacy bid event received:", data);
    });

    socket.on('add_auction', async data => {
        // This is now handled by the enhanced auction creation endpoint
        console.log("Legacy auction creation event received:", data);
    });
});

// Helper functions (legacy)
async function findall(client) {
    const cursor = await client.db(process.env.DATABASE_NAME || "Auction_Platform").collection("auctions").find().sort({bid_count:-1});
    const arr = await cursor.toArray();
    const j = JSON.stringify(arr);
    return j;
}

async function find(client, id) {
    console.log(id);
    const cursor = await client.db(process.env.DATABASE_NAME || "Auction_Platform").collection("auctions").findOne({"_id":id});
    const j = JSON.stringify(cursor);
    console.log(j.bidcount);
    return j;
}

async function finduser(client, username) {
    const cursor = await client.db(process.env.DATABASE_NAME || "Auction_Platform").collection("Users").findOne({"username":username});
    console.log("Printing cursor");
    if(!cursor)
        return 0;
    return cursor;
}

// Start servers
server.listen(process.env.SOCKET_PORT || 4000, () => {
    console.log(`Socket server listening on port ${process.env.SOCKET_PORT || 4000}`);
});

app.listen(process.env.PORT || 8000, () => {
    console.log(`API server listening on port ${process.env.PORT || 8000}`);
});
