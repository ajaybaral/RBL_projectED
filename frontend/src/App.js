import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Gavel,
  Add,
  Dashboard,
  AccountBalanceWallet,
  Settings,
  Logout,
  Refresh
} from '@mui/icons-material';
import Main from './Components/Main';
import { ethers } from 'ethers';

// Create a custom theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState('0');
  const [anchorEl, setAnchorEl] = useState(null);
  const [network, setNetwork] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    checkWalletConnection();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
          await updateWalletInfo(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const updateWalletInfo = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();
      
      setWalletBalance(ethers.formatEther(balance));
      setNetwork(network);
    } catch (error) {
      console.error('Error updating wallet info:', error);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setWalletConnected(false);
      setWalletAddress('');
      setWalletBalance('0');
    } else {
      setWalletAddress(accounts[0]);
      updateWalletInfo(accounts[0]);
    }
  };

  const handleChainChanged = (chainId) => {
    window.location.reload();
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      showAlert('MetaMask is not installed. Please install MetaMask to continue.', 'error');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletConnected(true);
      setWalletAddress(accounts[0]);
      await updateWalletInfo(accounts[0]);
      showAlert('Wallet connected successfully!', 'success');
    } catch (error) {
      showAlert('Failed to connect wallet: ' + error.message, 'error');
    }
  };

  const showAlert = (message, severity = 'info') => {
    setAlert({ open: true, message, severity });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDisconnect = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setWalletBalance('0');
    setNetwork(null);
    handleMenuClose();
    showAlert('Wallet disconnected', 'info');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 11155111: return 'Sepolia Testnet';
      case 1337: return 'Hardhat Local';
      default: return `Chain ${chainId}`;
    }
  };

  const getNetworkColor = (chainId) => {
    switch (chainId) {
      case 1: return 'success';
      case 11155111: return 'warning';
      case 1337: return 'info';
      default: return 'default';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Gavel sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              StartBid
            </Typography>
            
            {walletConnected ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {network && (
                  <Chip
                    label={getNetworkName(Number(network.chainId))}
                    color={getNetworkColor(Number(network.chainId))}
                    size="small"
                    variant="outlined"
                  />
                )}
                <Chip
                  label={`${parseFloat(walletBalance).toFixed(4)} ETH`}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  sx={{ color: 'white' }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {walletAddress.substring(2, 4).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem disabled>
                    <Typography variant="body2">
                      {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleDisconnect}>
                    <Logout sx={{ mr: 1 }} />
                    Disconnect
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Button
                color="inherit"
                startIcon={<AccountBalanceWallet />}
                onClick={connectWallet}
              >
                Connect Wallet
              </Button>
            )}
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 3 }}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              centered
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab
                icon={<Dashboard />}
                label="Dashboard"
                iconPosition="start"
              />
              <Tab
                icon={<Add />}
                label="Create Auction"
                iconPosition="start"
              />
            </Tabs>
          </Paper>

          <Main />
        </Container>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
