import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload,
  Image,
  Description,
  Category,
  AttachMoney,
  Schedule,
  CheckCircle,
  AccountBalanceWallet,
  Refresh
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const CreateAuction = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startingPrice: '',
    duration: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const steps = [
    'Connect Wallet',
    'Auction Details',
    'Upload Image',
    'Review & Create'
  ];

  const categories = [
    'Art & Collectibles',
    'Electronics',
    'Fashion & Accessories',
    'Home & Garden',
    'Sports & Recreation',
    'Books & Media',
    'Automotive',
    'Jewelry & Watches',
    'Antiques',
    'Other'
  ];

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletConnected(true);
      setWalletAddress(accounts[0]);
      setError(null);
      setActiveStep(1);
    } catch (error) {
      setError('Failed to connect wallet: ' + error.message);
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image size must be less than 10MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const { title, description, category, startingPrice, duration } = formData;
    
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!category) {
      setError('Category is required');
      return false;
    }
    if (!startingPrice || parseFloat(startingPrice) <= 0) {
      setError('Starting price must be greater than 0');
      return false;
    }
    if (!duration || parseInt(duration) <= 0) {
      setError('Duration must be greater than 0');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!walletConnected) {
        setError('Please connect your wallet first');
        return;
      }
    } else if (activeStep === 1) {
      if (!validateForm()) {
        return;
      }
    }
    
    setError(null);
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('startingPrice', formData.startingPrice);
      formDataToSend.append('duration', formData.duration);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await axios.post(`${API_BASE_URL}/create-auction`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setActiveStep(4); // Move to success step
      } else {
        setError(response.data.error || 'Failed to create auction');
      }
    } catch (error) {
      setError('Error creating auction: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      startingPrice: '',
      duration: '',
      image: null
    });
    setPreviewUrl(null);
    setActiveStep(0);
    setSuccess(false);
    setError(null);
    setUploadProgress(0);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <AccountBalanceWallet sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Connect Your Wallet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Connect your MetaMask wallet to create auctions on the blockchain
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={connectWallet}
              disabled={walletConnected}
              startIcon={walletConnected ? <CheckCircle /> : <AccountBalanceWallet />}
            >
              {walletConnected ? 'Wallet Connected' : 'Connect MetaMask'}
            </Button>
            {walletConnected && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={`${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`}
                  color="success"
                  variant="outlined"
                />
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Auction Title"
                value={formData.title}
                onChange={handleInputChange('title')}
                placeholder="Enter a descriptive title for your auction"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="Describe the item being auctioned in detail"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={formData.category}
                onChange={handleInputChange('category')}
                SelectProps={{ native: true }}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Starting Price (ETH)"
                type="number"
                value={formData.startingPrice}
                onChange={handleInputChange('startingPrice')}
                placeholder="0.1"
                inputProps={{ min: 0, step: 0.001 }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Duration (hours)"
                type="number"
                value={formData.duration}
                onChange={handleInputChange('duration')}
                placeholder="24"
                inputProps={{ min: 1, max: 168 }}
                helperText="Auction duration in hours (1-168 hours)"
                required
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Image sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Upload Item Image
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Upload a high-quality image of the item you're auctioning
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  size="large"
                >
                  Choose Image
                </Button>
              </label>
            </Box>

            {previewUrl && (
              <Box sx={{ mt: 3 }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </Box>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Supported formats: JPG, PNG, GIF (Max 10MB)
            </Typography>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Auction
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h6" gutterBottom>
                    {formData.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {formData.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={formData.category} color="primary" size="small" />
                    <Chip label={`${formData.startingPrice} ETH`} color="secondary" size="small" />
                    <Chip label={`${formData.duration}h`} color="default" size="small" />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Important:</strong> Once created, your auction will be stored on the blockchain and IPFS. 
                The auction cannot be modified after creation.
              </Typography>
            </Alert>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Auction Created Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your auction has been created and is now live on the blockchain.
            </Typography>
            <Button
              variant="contained"
              onClick={resetForm}
              startIcon={<Refresh />}
            >
              Create Another Auction
            </Button>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Create New Auction
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  {getStepContent(index)}
                  <Box sx={{ mb: 2, mt: 2 }}>
                    <div>
                      {index < steps.length - 1 && (
                        <Button
                          variant="contained"
                          onClick={index === 3 ? handleSubmit : handleNext}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} /> : null}
                        >
                          {loading ? 'Creating...' : index === 3 ? 'Create Auction' : 'Continue'}
                        </Button>
                      )}
                      {index > 0 && index < 4 && (
                        <Button
                          disabled={loading}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Back
                        </Button>
                      )}
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {loading && uploadProgress > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Uploading to IPFS: {uploadProgress}%
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default CreateAuction;
