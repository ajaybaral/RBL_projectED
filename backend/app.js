require('dotenv').config();
const express=require("express");
const bodyparser=require("body-parser");
var cors = require('cors')
const { MongoClient } = require('mongodb');
const multer = require('multer');
const { ethers } = require('ethers');
const app=express();
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
const sha256=require("sha256");

// Initialize blockchain service
const blockchainService = {
  provider: new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545'),
  wallet: new ethers.Wallet(process.env.PRIVATE_KEY || '', new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545')),
  
  contractABI: [
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
  ],
  
  contractAddress: process.env.CONTRACT_ADDRESS || '',
  contract: null,
  
  init() {
    if (this.contractAddress) {
      this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.wallet);
    }
  },
  
  async createAuction(ipfsCID, reservePrice, biddingTime) {
    try {
      const reservePriceWei = ethers.parseEther(reservePrice.toString());
      const tx = await this.contract.createAuction(ipfsCID, reservePriceWei, biddingTime);
      const receipt = await tx.wait();
      
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
  },
  
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
};

blockchainService.init();

const uri = process.env.MONGODB_URI || "mongodb+srv://Suriyaa:mthaniga@cluster0.rsh4e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

   
const client = new MongoClient(uri);
async function mains()
{
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB successfully");
    } catch (error) {
        console.log("❌ MongoDB connection failed:", error.message);
        console.log("⚠️  Application will continue but database features may not work");
    }
}
mains();

const io = require('socket.io')(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
})
// Enhanced auction creation endpoint
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

// Enhanced auctions endpoint
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

app.get("/home",async (req,res)=>{
    
    try {
        // Connect to the MongoDB cluster
        
       
        const docs=await findall(client);
        res.send(docs);
    
    
    } catch (e) {
        console.error(e);
    } finally {
        // Close the connection to the MongoDB cluster
       
    
    }
})
app.post("/product",async (req,res)=>{
    
    try {
        // Connect to the MongoDB cluster
       
        const docs=await find(client,req.body.id);
        res.send(docs);
    
    
    } catch (e) {
        console.error(e);
    } finally {
        // Close the connection to the MongoDB cluster
      
    }
})

app.post("/login",async (req,res)=>{
    try {
        // Connect to the MongoDB cluster
       obj=req.body;
        const result=await finduser(client,obj.name);
        var finalans={};

        if(result===0){
            finalans["success"]=-1;
            res.send(JSON.stringify(finalans));
        }
        
        if(result.password===sha256(req.body.password))
        {
            finalans["success"]=1;
        }
        else
        finalans["success"]=0;
        res.send(JSON.stringify(finalans));
       
         
    } catch (e) {
        console.error(e);
    } finally {
        // Close the connection to the MongoDB cluster
       //  await client.close();
    
    }
   
})

app.post("/signup",async (req,res)=>{
    try {
        console.log("hi")
        // Connect to the MongoDB cluster
       obj=req.body;
       var userdata={username:obj.username,password:sha256(obj.password)};
        const tempresult = await finduser(client,obj.username);
        if(tempresult===0){
            const result = await client.db(process.env.DATABASE_NAME || "Auction_Platform").collection("Users").insertOne(userdata);
            console.log(result);
            var finalans={
                'success': 1
            };
        }
        else{
            var finalans={
                'success': -1
            };
        }
        res.send(JSON.stringify(finalans));
        } catch (e) {
            console.error(e);
        } finally {
            // Close the connection to the MongoDB cluster
        //  await client.close();
        
        }
   
})


app.post("/addauction",async (req,res)=>{
    try {
        // Connect to the MongoDB cluster
        const cursor = await client.db(process.env.DATABASE_NAME || "Auction_Platform").collection("auctions").find();
        const arr= await cursor.toArray();
       
      
       
       var obj=req.body;
       obj["price"]=parseInt(obj["price"]);
       obj["ending_date"]=parseInt(obj["ending_date"]);
       obj["_id"]=arr.length;
       obj["winner_address"]="";
       obj["bid_count"]=0;
       console.log(obj);


        const result = await client.db(process.env.DATABASE_NAME || "Auction_Platform").collection("auctions").insertOne(req.body);
         console.log(result)
    } catch (e) {
        console.error(e);
    } finally {
        // Close the connection to the MongoDB cluster
       //  await client.close();
    
    }
   
})
 
io.on('connection', socket => {
    console.log("connected")

    socket.on('change', async data => {
      
       
      
        var myquery = { _id:data["id"] };
        var newvalues = { $set: {price:parseInt(data["news"]) } };

        var qval = await client.db(process.env.DATABASE_NAME || "Auction_Platform").collection("auctions").findOne({"_id":data["id"]});

        if(data["news"] > qval.price){
            data["bidcount"]=qval.bid_count+1;
            io.emit("message",data);

            const result=await client.db(process.env.DATABASE_NAME || "Auction_Platform").collection("auctions").updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
              
              });
              
              var bidder_address =data["address"];
              var bidcount = qval.bid_count;
              var new_bidcount = bidcount+1;
              newvalues = { $set: {bid_count: new_bidcount, winner_address:bidder_address} };
            
            const result2=await client.db(process.env.DATABASE_NAME || "Auction_Platform").collection("auctions").updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
              
              });
            var amtbidded = data["news"];
            var auction_id_bidded = data["id"];

            var document={
                bidder_address:bidder_address,
                amount_bidded:amtbidded,
                auction_id:auction_id_bidded,
                order: new_bidcount
            };
           
            const result3 = await client.db(process.env.DATABASE_NAME || "Auction_Platform").collection("transactions").insertOne(document);
        }
        
    })

    socket.on('add_auction', async data => {
      
        var obj = data;
        try {
            // Connect to the MongoDB cluster
            var cursor = await client.db(process.env.DATABASE_NAME || "Auction_Platform").collection("auctions").find();
            var arr= await cursor.toArray();
           
           obj["price"]=parseInt(obj["price"]);
           obj["ending_date"]=parseInt(obj["ending_date"]);
           obj["_id"]=arr.length;
           obj["winner_address"]="";
           obj["bid_count"]=0;
           console.log(obj);
    
    
            var result = await client.db(process.env.DATABASE_NAME || "Auction_Platform").collection("auctions").insertOne(obj);
            cursor = await client.db(process.env.DATABASE_NAME || "Auction_Platform").collection("auctions").find().sort({bid_count:-1});
            arr= await cursor.toArray();
            io.emit('update',arr);
    
        } catch (e) {
            console.error(e);
        } finally {
            // Close the connection to the MongoDB cluster
           //  await client.close();
        
        }
        
    })
})

 server.listen(process.env.SOCKET_PORT || 4000,()=>{
    console.log(`Socket server listening on port ${process.env.SOCKET_PORT || 4000}`);
 })
 
app.listen(process.env.PORT || 8000,()=>{
    console.log(`API server listening on port ${process.env.PORT || 8000}`);
})
async function findall(client)
{
    const cursor = await client.db(process.env.DATABASE_NAME || "Auction_Platform").collection("auctions").find().sort({bid_count:-1});
    const arr= await cursor.toArray();
    const j=JSON.stringify(arr);
   return j;
}
async function find(client,id)
{
    console.log(id);
    const cursor = await client.db(process.env.DATABASE_NAME || "Auction_Platform").collection("auctions").findOne({"_id":id});
    const j=JSON.stringify(cursor);
  console.log(j.bidcount)
  return j;
}
async function finduser(client,username)
{
    const cursor = await client.db(process.env.DATABASE_NAME || "Auction_Platform").collection("Users").findOne({"username":username});
    console.log("Printing cursor")
    if(!cursor)
        return 0;
    return cursor;
}

