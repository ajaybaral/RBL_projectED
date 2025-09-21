# Environment Configuration Setup

## Backend .env File

Create a file named `.env` in the `backend` directory with the following content:

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

## Frontend .env File

Create a file named `.env` in the `frontend` directory with the following content:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Environment
REACT_APP_ENV=development
```

## Important Notes

1. **PRIVATE_KEY**: The provided key is Hardhat's default account #0 private key (safe for local development only)
2. **CONTRACT_ADDRESS**: This will be generated when you deploy the contract
3. **IPFS_AUTH**: Replace with your actual Infura project credentials
4. **MONGODB_URI**: Update with your actual MongoDB connection string
