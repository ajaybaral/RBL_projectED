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
        console.log(docs);
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
        console.log(docs);
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
      console.log(finalans)
        res.send(JSON.stringify(finalans));
       
         
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
        console.log(data)
      
       
      
        var myquery = { _id:data["id"] };
        var newvalues = { $set: {price:parseInt(data["news"]) } };

        const result=await client.db("Auction_Platform").collection("auctions").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
          
          });
          io.emit("message",data);
        console.log(data["news"]);
       
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
  
  return j;
}
async function finduser(client,username)
{
    const cursor = await client.db("Auction_Platform").collection("Users").findOne({"username":username});
    console.log(cursor);
    return cursor;
}