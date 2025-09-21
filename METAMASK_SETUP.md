# 🔗 MetaMask Setup for StartBid Platform

## 🎯 **Configure MetaMask for Hardhat Local Network**

### **Step 1: Add Hardhat Local Network**

1. **Open MetaMask** in your browser
2. **Click on Network dropdown** (top of MetaMask)
3. **Click "Add Network"** or "Add Network Manually"
4. **Enter these details**:

```
Network Name: Hardhat Local
RPC URL: http://localhost:8545
Chain ID: 1337
Currency Symbol: ETH
Block Explorer URL: (leave empty)
```

5. **Click "Save"**

### **Step 2: Import Test Account**

1. **Click on MetaMask account icon** (top right)
2. **Click "Import Account"**
3. **Select "Private Key"**
4. **Enter this private key**:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
5. **Click "Import"**

### **Step 3: Verify Setup**

✅ **Check that you have**:
- **Network**: "Hardhat Local" selected
- **Account**: Shows 10,000 ETH balance
- **Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

## 🚨 **Important Notes**

- **This is a LOCAL test network** - not real ETH
- **10,000 ETH is for testing only**
- **Never use this private key on mainnet**
- **Switch back to Mainnet for real transactions**

## 🔄 **Switching Networks**

- **For Testing**: Use "Hardhat Local" network
- **For Real ETH**: Switch back to "Ethereum Mainnet"

## 🐛 **Troubleshooting**

### **"Insufficient Funds" Error**
- Make sure you're on "Hardhat Local" network
- Check that Hardhat node is running
- Restart Hardhat node if needed

### **"Network Not Found" Error**
- Verify RPC URL: `http://localhost:8545`
- Check Chain ID: `1337`
- Ensure Hardhat node is running

### **"Transaction Failed" Error**
- Check Hardhat node is running
- Verify contract is deployed
- Check console for error messages

---

**🎯 Ready to test with free ETH! 🚀**
