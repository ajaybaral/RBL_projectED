# Environment Variables Setup Guide

## Why Environment Variables?

The StartBid project now uses environment variables to securely manage sensitive configuration data like database credentials and API endpoints. This prevents sensitive information from being exposed in the source code.

## Setup Instructions

### 1. Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following content:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database?retryWrites=true&w=majority
DATABASE_NAME=Auction_Platform

# Server Configuration
PORT=8000
SOCKET_PORT=4000

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend Environment Variables

Create a `.env` file in the `frontend/` directory with the following content:

```env
# Smart Contract Configuration
REACT_APP_CONTRACT_ADDRESS=0xE6CcAFB99015d50D631B2f310B50471EB411f8Da
REACT_APP_NETWORK_ID=3
REACT_APP_NETWORK_NAME=ropsten

# Backend API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SOCKET_URL=http://localhost:4000
```

## Important Notes

### Backend Environment Variables

- **MONGODB_URI**: Your MongoDB Atlas connection string
- **DATABASE_NAME**: The name of your MongoDB database (default: "Auction_Platform")
- **PORT**: API server port (default: 8000)
- **SOCKET_PORT**: Socket.io server port (default: 4000)
- **FRONTEND_URL**: Frontend URL for CORS configuration (default: "http://localhost:3000")

### Frontend Environment Variables

- **REACT_APP_CONTRACT_ADDRESS**: The deployed smart contract address
- **REACT_APP_NETWORK_ID**: Ethereum network ID (3 for Ropsten)
- **REACT_APP_NETWORK_NAME**: Network name for display purposes
- **REACT_APP_API_URL**: Backend API URL
- **REACT_APP_SOCKET_URL**: Socket.io server URL

### Security Considerations

1. **Never commit `.env` files to version control**
2. **Use `.env.example` files** to document required environment variables
3. **Keep sensitive credentials secure** and rotate them regularly
4. **Use different environment files** for development, staging, and production

## Fallback Values

The application includes fallback values for all environment variables, so it will work even without `.env` files, but using environment variables is strongly recommended for security and flexibility.

## Example .env Files

See the `env.example` files in both `backend/` and `frontend/` directories for reference templates.
