import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Gavel,
  Schedule,
  CheckCircle,
  Cancel,
  Visibility,
  TrendingUp,
  AccountBalanceWallet,
  Refresh
} from '@mui/icons-material';
import axios from 'axios';
import { ethers } from 'ethers';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AuctionDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [pendingReturns, setPendingReturns] = useState('0');

  useEffect(() => {
    loadAuctions();
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
          loadPendingReturns(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletConnected(true);
      setWalletAddress(accounts[0]);
      loadPendingReturns(accounts[0]);
    } catch (error) {
      setError('Failed to connect wallet: ' + error.message);
    }
  };

  const loadPendingReturns = async (address) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${address}/pending-returns`);
      if (response.data.success) {
        setPendingReturns(response.data.pendingReturns);
      }
    } catch (error) {
      console.error('Error loading pending returns:', error);
    }
  };

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/auctions`);
      if (response.data.success) {
        setAuctions(response.data.auctions);
      } else {
        setError('Failed to load auctions');
      }
    } catch (error) {
      setError('Error loading auctions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBidHistory = async (auctionId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auction/${auctionId}/bids`);
      if (response.data.success) {
        setBidHistory(response.data.bids);
      }
    } catch (error) {
      console.error('Error loading bid history:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAuctionClick = (auction) => {
    setSelectedAuction(auction);
    loadBidHistory(auction._id);
  };

  const handleBidClick = (auction) => {
    if (!walletConnected) {
      setError('Please connect your wallet to place a bid');
      return;
    }
    setSelectedAuction(auction);
    setBidDialogOpen(true);
  };

  const handleBidSubmit = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    try {
      setBidLoading(true);
      const response = await axios.post(`${API_BASE_URL}/place-bid`, {
        auctionId: selectedAuction._id,
        bidAmount: parseFloat(bidAmount),
        bidderAddress: walletAddress
      });

      if (response.data.success) {
        setBidDialogOpen(false);
        setBidAmount('');
        loadAuctions(); // Refresh auctions
        loadBidHistory(selectedAuction._id); // Refresh bid history
        setError(null);
      } else {
        setError(response.data.error || 'Failed to place bid');
      }
    } catch (error) {
      setError('Error placing bid: ' + error.response?.data?.error || error.message);
    } finally {
      setBidLoading(false);
    }
  };

  const getAuctionStatus = (auction) => {
    const now = new Date();
    const endTime = new Date(auction.blockchain?.endTime || auction.createdAt);
    
    if (auction.blockchain?.settled) return 'settled';
    if (auction.blockchain?.canceled) return 'canceled';
    if (now > endTime) return 'ended';
    return 'active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'ended': return 'warning';
      case 'settled': return 'info';
      case 'canceled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <TrendingUp />;
      case 'ended': return <Schedule />;
      case 'settled': return <CheckCircle />;
      case 'canceled': return <Cancel />;
      default: return <Gavel />;
    }
  };

  const filteredAuctions = auctions.filter(auction => {
    const status = getAuctionStatus(auction);
    switch (activeTab) {
      case 0: return status === 'active';
      case 1: return status === 'ended' || status === 'settled';
      case 2: return status === 'canceled';
      default: return true;
    }
  });

  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const AuctionCard = ({ auction }) => {
    const status = getAuctionStatus(auction);
    const timeRemaining = formatTimeRemaining(auction.blockchain?.endTime || auction.createdAt);
    
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {auction.imageUrl && (
          <CardMedia
            component="img"
            height="200"
            image={auction.imageUrl}
            alt={auction.title}
            sx={{ objectFit: 'cover' }}
          />
        )}
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="h2" noWrap>
              {auction.title}
            </Typography>
            <Chip
              icon={getStatusIcon(status)}
              label={status.toUpperCase()}
              color={getStatusColor(status)}
              size="small"
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '3em' }}>
            {auction.description?.substring(0, 100)}...
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="primary">
              {auction.blockchain?.highestBid || auction.currentPrice} ETH
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {auction.bidCount} bid{auction.bidCount !== 1 ? 's' : ''}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {status === 'active' ? `Ends in ${timeRemaining}` : `Ended ${timeRemaining}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reserve: {auction.startingPrice} ETH
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => handleAuctionClick(auction)}
              fullWidth
            >
              View Details
            </Button>
            {status === 'active' && (
              <Button
                variant="contained"
                startIcon={<Gavel />}
                onClick={() => handleBidClick(auction)}
                disabled={!walletConnected}
                fullWidth
              >
                Place Bid
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Auction Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {walletConnected ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceWallet color="success" />
              <Typography variant="body2">
                {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
              </Typography>
              {parseFloat(pendingReturns) > 0 && (
                <Chip
                  label={`${pendingReturns} ETH pending`}
                  color="warning"
                  size="small"
                />
              )}
            </Box>
          ) : (
            <Button
              variant="contained"
              startIcon={<AccountBalanceWallet />}
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          )}
          <Tooltip title="Refresh auctions">
            <IconButton onClick={loadAuctions}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Active Auctions" />
          <Tab label="Ended Auctions" />
          <Tab label="Canceled Auctions" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {filteredAuctions.map((auction) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={auction._id}>
            <AuctionCard auction={auction} />
          </Grid>
        ))}
      </Grid>

      {filteredAuctions.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No auctions found in this category
          </Typography>
        </Box>
      )}

      {/* Bid Dialog */}
      <Dialog open={bidDialogOpen} onClose={() => setBidDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Place Bid</DialogTitle>
        <DialogContent>
          {selectedAuction && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedAuction.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current highest bid: {selectedAuction.blockchain?.highestBid || selectedAuction.currentPrice} ETH
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Reserve price: {selectedAuction.startingPrice} ETH
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Bid Amount (ETH)"
                type="number"
                fullWidth
                variant="outlined"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                inputProps={{ min: selectedAuction.blockchain?.highestBid || selectedAuction.currentPrice, step: 0.001 }}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBidDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleBidSubmit}
            variant="contained"
            disabled={bidLoading || !bidAmount}
            startIcon={bidLoading ? <CircularProgress size={20} /> : <Gavel />}
          >
            {bidLoading ? 'Placing Bid...' : 'Place Bid'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auction Details Dialog */}
      <Dialog
        open={!!selectedAuction && !bidDialogOpen}
        onClose={() => setSelectedAuction(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedAuction && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {selectedAuction.title}
                <Chip
                  icon={getStatusIcon(getAuctionStatus(selectedAuction))}
                  label={getAuctionStatus(selectedAuction).toUpperCase()}
                  color={getStatusColor(getAuctionStatus(selectedAuction))}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  {selectedAuction.imageUrl && (
                    <CardMedia
                      component="img"
                      height="300"
                      image={selectedAuction.imageUrl}
                      alt={selectedAuction.title}
                      sx={{ borderRadius: 1 }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" paragraph>
                    {selectedAuction.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h5" color="primary">
                      {selectedAuction.blockchain?.highestBid || selectedAuction.currentPrice} ETH
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedAuction.bidCount} bid{selectedAuction.bidCount !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Reserve Price: {selectedAuction.startingPrice} ETH
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Category: {selectedAuction.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Created: {new Date(selectedAuction.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Bid History
                  </Typography>
                  <List>
                    {bidHistory.map((bid, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={`${bid.amount} ETH`}
                            secondary={`${bid.bidderAddress.substring(0, 6)}...${bid.bidderAddress.substring(38)} • ${new Date(bid.timestamp).toLocaleString()}`}
                          />
                        </ListItem>
                        {index < bidHistory.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedAuction(null)}>Close</Button>
              {getAuctionStatus(selectedAuction) === 'active' && (
                <Button
                  variant="contained"
                  onClick={() => {
                    setSelectedAuction(null);
                    handleBidClick(selectedAuction);
                  }}
                  disabled={!walletConnected}
                >
                  Place Bid
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AuctionDashboard;
