# StartBid - Enhanced Decentralized Auction Platform

## 🚀 Overview

StartBid is now enhanced with **Hardhat**, **IPFS**, and **Material-UI** to provide a robust, decentralized auction platform with:

- ✅ **Smart Contract Testing** with Hardhat
- ✅ **IPFS Integration** for decentralized file storage
- ✅ **Modern UI/UX** with Material-UI components
- ✅ **Real-time Bidding** with Socket.io
- ✅ **Blockchain Event Syncing** with MongoDB caching
- ✅ **Comprehensive Testing** for contracts and frontend

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Blockchain    │
│   (React + MUI) │◄──►│  (Node.js +     │◄──►│   (Hardhat +    │
│                 │    │   Express)      │    │   Solidity)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   IPFS Gateway  │    │    MongoDB      │    │   MetaMask       │
│   (File Storage)│    │   (Caching)     │    │  (Wallet)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension
- **MongoDB** (local or cloud)
- **IPFS Node** (Infura or local)

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd StartBid-A-Decentralized-Auctioning-Platform

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

### 2. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
DATABASE_NAME=Auction_Platform

# Server Configuration
PORT=8000
SOCKET_PORT=4000
FRONTEND_URL=http://localhost:3000

# Blockchain Configuration
RPC_URL=http://localhost:8545
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_contract_address_here

# IPFS Configuration
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
IPFS_PROTOCOL=https
IPFS_AUTH=project_id:project_secret
```

### 3. Smart Contract Setup

```bash
cd contract

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to local network
npm run node  # In one terminal
npm run deploy  # In another terminal
```

### 4. Backend Setup

```bash
cd backend

# Start the enhanced backend
node app-enhanced.js
```

### 5. Frontend Setup

```bash
cd frontend

# Start the development server
npm start
```

## 🎯 Key Features

### 🔧 Smart Contract Features

- **Auction Creation**: Create auctions with IPFS metadata
- **Secure Bidding**: Funds held in escrow until auction ends
- **Automatic Settlement**: Winner selection and payout
- **Withdrawal Pattern**: Safe refund mechanism for outbid users
- **Platform Fees**: Configurable platform fees (default 2.5%)

### 📁 IPFS Integration

- **Image Storage**: Upload auction images to IPFS
- **Metadata Storage**: Store auction details as JSON on IPFS
- **Decentralized Access**: Access files via IPFS gateway
- **Content Addressing**: Immutable file references

### 🎨 Enhanced UI/UX

- **Material-UI Components**: Modern, responsive design
- **Auction Dashboard**: View active, ended, and canceled auctions
- **Real-time Updates**: Live bidding updates via Socket.io
- **Wallet Integration**: MetaMask connection and management
- **Bid History**: Complete transaction history
- **Image Previews**: High-quality image display

### 🔄 Backend Enhancements

- **Blockchain Sync**: Real-time blockchain event monitoring
- **MongoDB Caching**: Fast auction data retrieval
- **IPFS Service**: Dedicated IPFS upload/retrieval service
- **Blockchain Service**: Smart contract interaction layer
- **Error Handling**: Comprehensive error management

## 🧪 Testing

### Smart Contract Tests

```bash
cd contract
npm test
```

Tests cover:
- Auction creation and validation
- Bidding mechanics
- Withdrawal functionality
- Settlement process
- Admin functions

### Frontend Tests

```bash
cd frontend
npm test
```

## 🚀 Deployment

### Smart Contract Deployment

```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia

# Verify contract on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Backend Deployment

Deploy to platforms like:
- **Heroku**
- **Railway**
- **DigitalOcean**
- **AWS**

### Frontend Deployment

Deploy to platforms like:
- **Vercel**
- **Netlify**
- **GitHub Pages**

## 📊 API Endpoints

### Enhanced Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-auction` | Create auction with IPFS upload |
| POST | `/place-bid` | Place bid on auction |
| GET | `/auctions` | Get all auctions with metadata |
| GET | `/auction/:id` | Get auction details |
| GET | `/auction/:id/bids` | Get bid history |
| GET | `/user/:address/pending-returns` | Get pending returns |

### Legacy Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/home` | Get all auctions (legacy) |
| POST | `/product` | Get auction by ID (legacy) |
| POST | `/login` | User authentication |
| POST | `/signup` | User registration |

## 🔐 Security Features

- **Reentrancy Protection**: Withdrawal pattern implementation
- **Input Validation**: Comprehensive data validation
- **Access Control**: Role-based permissions
- **Secure File Upload**: File type and size validation
- **Error Handling**: Safe error responses

## 🎮 Usage Guide

### Creating an Auction

1. **Connect Wallet**: Connect MetaMask to the platform
2. **Fill Details**: Enter auction title, description, category
3. **Set Price**: Define starting price and duration
4. **Upload Image**: Upload item image to IPFS
5. **Review**: Confirm auction details
6. **Create**: Deploy auction to blockchain

### Placing Bids

1. **Browse Auctions**: View active auctions on dashboard
2. **Select Auction**: Click on auction to view details
3. **Place Bid**: Enter bid amount higher than current highest
4. **Confirm**: Transaction sent to blockchain
5. **Monitor**: Watch real-time bid updates

### Managing Funds

1. **View Pending**: Check pending returns from outbid auctions
2. **Withdraw**: Use MetaMask to call withdraw function
3. **Monitor Balance**: Track wallet balance and transactions

## 🐛 Troubleshooting

### Common Issues

1. **MetaMask Connection Failed**
   - Ensure MetaMask is installed and unlocked
   - Check network configuration
   - Refresh page and try again

2. **IPFS Upload Failed**
   - Check IPFS node connectivity
   - Verify file size limits
   - Ensure proper authentication

3. **Smart Contract Errors**
   - Verify contract deployment
   - Check RPC URL configuration
   - Ensure sufficient gas fees

4. **MongoDB Connection Issues**
   - Verify connection string
   - Check network access
   - Ensure database exists

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Hardhat** for smart contract development framework
- **IPFS** for decentralized file storage
- **Material-UI** for React components
- **Ethers.js** for blockchain interaction
- **Socket.io** for real-time communication

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our community Discord

---

**Happy Bidding! 🎯**
