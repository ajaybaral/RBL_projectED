module.exports = {
  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb+srv://Suriyaa:mthaniga@cluster0.rsh4e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    databaseName: process.env.DATABASE_NAME || "Auction_Platform"
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 8000,
    socketPort: process.env.SOCKET_PORT || 4000,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  // Blockchain Configuration
  blockchain: {
    rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
    privateKey: process.env.PRIVATE_KEY || '',
    contractAddress: process.env.CONTRACT_ADDRESS || '',
    bidderPrivateKey: process.env.BIDDER_PRIVATE_KEY || ''
  },

  // IPFS Configuration
  ipfs: {
    host: process.env.IPFS_HOST || 'ipfs.infura.io',
    port: process.env.IPFS_PORT || 5001,
    protocol: process.env.IPFS_PROTOCOL || 'https',
    auth: process.env.IPFS_AUTH ? `Basic ${Buffer.from(process.env.IPFS_AUTH).toString('base64')}` : undefined
  },

  // Environment
  environment: process.env.NODE_ENV || 'development'
};
