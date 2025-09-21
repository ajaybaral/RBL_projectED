# 🚀 StartBid Enhanced Platform - Startup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- MongoDB (local or cloud)

## Step-by-Step Startup Process

### 1. 📁 Create Environment Files

#### Backend Environment (`backend/.env`)
```bash
# Create the file
touch backend/.env
```

Add this content to `backend/.env`:
```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://Suriyaa:mthaniga@cluster0.rsh4e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
DATABASE_NAME=Auction_Platform

# Server Configuration
PORT=8000
SOCKET_PORT=4000
FRONTEND_URL=http://localhost:3000

# Blockchain Configuration (Local Hardhat Network)
RPC_URL=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# IPFS Configuration (Using Infura IPFS)
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
IPFS_PROTOCOL=https
IPFS_AUTH=your_project_id:your_project_secret

# Environment
NODE_ENV=development
```

#### Frontend Environment (`frontend/.env`)
```bash
# Create the file
touch frontend/.env
```

Add this content to `frontend/.env`:
```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Environment
REACT_APP_ENV=development
```

### 2. 🔧 Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install contract dependencies
cd ../contract
npm install
```

### 3. 🏗️ Deploy Smart Contracts

```bash
# Navigate to contract directory
cd contract

# Compile contracts
npm run compile

# Run tests (optional but recommended)
npm test

# Start Hardhat local node (Terminal 1)
npm run node
```

In a **new terminal**, deploy the contracts:
```bash
cd contract
npm run deploy
```

**Important**: Copy the deployed contract address and update `backend/.env`:
```env
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 4. 🚀 Start Backend Server

In a **new terminal**:
```bash
cd backend
node app-enhanced.js
```

You should see:
```
✅ Connected to MongoDB successfully
Socket server listening on port 4000
API server listening on port 8000
```

### 5. 🎨 Start Frontend Development Server

In a **new terminal**:
```bash
cd frontend
npm start
```

The frontend will open at `http://localhost:3000`

### 6. 🔗 Configure MetaMask

1. **Install MetaMask** browser extension
2. **Add Local Network**:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

3. **Import Test Account**:
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This account has 10,000 ETH for testing

## 🎯 Quick Start Script

For automated setup, you can use the setup script:

```bash
# Make script executable
chmod +x scripts/setup-enhanced.sh

# Run setup
./scripts/setup-enhanced.sh

# Start all services
./start-all.sh
```

## 🔍 Verification Steps

### 1. Check Backend
- Visit: `http://localhost:8000/auctions`
- Should return JSON with auctions array

### 2. Check Frontend
- Visit: `http://localhost:3000`
- Should show the StartBid dashboard

### 3. Check Smart Contract
- Contract should be deployed on Hardhat network
- Check deployment logs for contract address

### 4. Check MetaMask
- Should show "Hardhat Local" network
- Account should have 10,000 ETH

## 🐛 Troubleshooting

### Common Issues

1. **"Cannot connect to MongoDB"**
   - Check MongoDB connection string
   - Ensure MongoDB is running
   - Verify network access

2. **"Contract not deployed"**
   - Ensure Hardhat node is running
   - Check contract deployment logs
   - Verify contract address in .env

3. **"MetaMask connection failed"**
   - Ensure MetaMask is installed
   - Check network configuration
   - Refresh page and try again

4. **"IPFS upload failed"**
   - Check IPFS credentials
   - Verify network connectivity
   - Check file size limits

### Debug Commands

```bash
# Check if ports are in use
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000
netstat -tulpn | grep :8545

# Check Node.js processes
ps aux | grep node

# Check Hardhat node
curl http://localhost:8545
```

## 📊 Service Status

| Service | URL | Status Check |
|---------|-----|--------------|
| Frontend | http://localhost:3000 | Browser access |
| Backend API | http://localhost:8000 | `curl http://localhost:8000/auctions` |
| Hardhat Node | http://localhost:8545 | `curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545` |
| Socket.io | ws://localhost:4000 | WebSocket connection |

## 🎉 Success Indicators

✅ **All services running**:
- Frontend loads at localhost:3000
- Backend responds at localhost:8000
- Hardhat node accessible at localhost:8545
- MetaMask connected to local network

✅ **Platform ready**:
- Can create auctions
- Can place bids
- Real-time updates working
- IPFS integration functional

---

**🎯 Ready to start bidding! Happy auctioning! 🚀**
