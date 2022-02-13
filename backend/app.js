const express=require("express");
const bodyparser=require("body-parser");
var cors = require('cors')
const { MongoClient } = require('mongodb');
const app=express();
app.use(cors());
app.use(bodyparser.json());
const http = require("http");
const server = http.createServer(app);

const uri = "mongodb+srv://Suriyaa:mthaniga@cluster0.rsh4e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

   
const client = new MongoClient(uri);
async function mains()
{
    await client.connect();
}
mains();

const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
})

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
        
        if(result.password===req.body.password)
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
        // Connect to the MongoDB cluster
       obj=req.body;
        const result=await adduser(client,obj);
        var finalans={
            'success': 1
        };

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
        const cursor = await client.db("Auction_Platform").collection("auctions").find();
        const arr= await cursor.toArray();
       
      
       
       var obj=req.body;
       obj["price"]=parseInt(obj["price"]);
       obj["tod"]=parseInt(obj["tod"]);
       obj["_id"]=arr.length;
       obj["winner_address"]="";
       console.log(obj);


        const result = await client.db("Auction_Platform").collection("auctions").insertOne(req.body);
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

        var qval = await client.db("Auction_Platform").collection("auctions").findOne({"_id":data["id"]});

        if(data["news"] > qval.price){
            data["bidcount"]=qval.bid_count+1;
            io.emit("message",data);

            const result=await client.db("Auction_Platform").collection("auctions").updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
              
              });
              
              var bidder_address =data["address"];
              var bidcount = qval.bid_count;
              var new_bidcount = bidcount+1;
              newvalues = { $set: {bid_count: new_bidcount, winner_address:bidder_address} };
            
            const result2=await client.db("Auction_Platform").collection("auctions").updateOne(myquery, newvalues, function(err, res) {
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

            // newvalues = { $set: {winner_address: bidder_address} };
            // const result4=await client.db("Auction_Platform").collection("auctions").updateOne(myquery, newvalues, function(err, res) {
            //     if (err) throw err;
            //     console.log("1 document updated");
              
            //   });
           
            const result3 = await client.db("Auction_Platform").collection("transactions").insertOne(document);
        }
        
    })
})


 server.listen(4000,()=>{
    console.log("listening 4000");
 })
 
app.listen(8000,()=>{
    console.log("listening 8000");
})
async function findall(client)
{
    const cursor = await client.db("Auction_Platform").collection("auctions").find();
    const arr= await cursor.toArray();
    const j=JSON.stringify(arr);
   return j;
}
async function find(client,id)
{
    console.log(id);
    const cursor = await client.db("Auction_Platform").collection("auctions").findOne({"_id":id});
    const j=JSON.stringify(cursor);
  console.log(j.bidcount)
  return j;
}
async function finduser(client,username)
{
    const cursor = await client.db("Auction_Platform").collection("Users").findOne({"username":username});
    console.log(cursor);
    return cursor;
}

async function adduser(client,userdata)
{
    const cursor = await client.db("Auction_Platform").collection("Users").insertOne({newUser});
    console.log(cursor);
    return cursor;
}