#!/bin/bash

# StartBid Enhanced Setup Script
# This script sets up the enhanced StartBid platform with Hardhat, IPFS, and Material-UI

set -e

echo "🚀 Starting StartBid Enhanced Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js (v16 or higher) first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "npm $(npm --version) is installed"
}

# Install dependencies for each component
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    # Contract dependencies
    print_status "Installing contract dependencies..."
    cd contract
    npm install
    cd ..
    
    print_success "All dependencies installed successfully"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment configuration..."
    
    # Create backend .env file if it doesn't exist
    if [ ! -f "backend/.env" ]; then
        print_status "Creating backend .env file..."
        cat > backend/.env << EOF
# MongoDB Configuration
MONGODB_URI=mongodb+srv://Suriyaa:mthaniga@cluster0.rsh4e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
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

# Environment
NODE_ENV=development
EOF
        print_success "Backend .env file created"
    else
        print_warning "Backend .env file already exists"
    fi
    
    # Create frontend .env file if it doesn't exist
    if [ ! -f "frontend/.env" ]; then
        print_status "Creating frontend .env file..."
        cat > frontend/.env << EOF
# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Environment
REACT_APP_ENV=development
EOF
        print_success "Frontend .env file created"
    else
        print_warning "Frontend .env file already exists"
    fi
}

# Compile smart contracts
compile_contracts() {
    print_status "Compiling smart contracts..."
    cd contract
    npm run compile
    cd ..
    print_success "Smart contracts compiled successfully"
}

# Run smart contract tests
run_contract_tests() {
    print_status "Running smart contract tests..."
    cd contract
    npm test
    cd ..
    print_success "Smart contract tests passed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    # Create uploads directory for backend
    mkdir -p backend/uploads
    
    # Create logs directory
    mkdir -p logs
    
    print_success "Directories created"
}

# Setup IPFS (if available)
setup_ipfs() {
    print_status "Checking IPFS availability..."
    
    if command -v ipfs &> /dev/null; then
        print_success "IPFS is installed"
        print_status "Initializing IPFS repository..."
        ipfs init
        print_status "Starting IPFS daemon..."
        ipfs daemon &
        IPFS_PID=$!
        echo $IPFS_PID > ipfs.pid
        print_success "IPFS daemon started (PID: $IPFS_PID)"
    else
        print_warning "IPFS is not installed. You can use Infura IPFS service instead."
        print_status "To install IPFS: https://docs.ipfs.io/install/"
    fi
}

# Create startup scripts
create_startup_scripts() {
    print_status "Creating startup scripts..."
    
    # Create start-all script
    cat > start-all.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting StartBid Enhanced Platform..."

# Start IPFS daemon if available
if [ -f "ipfs.pid" ]; then
    echo "Starting IPFS daemon..."
    ipfs daemon &
fi

# Start Hardhat node
echo "Starting Hardhat local node..."
cd contract
npm run node &
HARDHAT_PID=$!
cd ..

# Wait for Hardhat to start
sleep 5

# Deploy contracts
echo "Deploying contracts..."
cd contract
npm run deploy
cd ..

# Start backend
echo "Starting backend server..."
cd backend
node app-enhanced.js &
BACKEND_PID=$!
cd ..

# Start frontend
echo "Starting frontend development server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ All services started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo "Hardhat: http://localhost:8545"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down services..."
    kill $HARDHAT_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null
    if [ -f "ipfs.pid" ]; then
        kill $(cat ipfs.pid) 2>/dev/null
        rm ipfs.pid
    fi
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for user to stop
echo "Press Ctrl+C to stop all services"
wait
EOF

    chmod +x start-all.sh
    
    # Create stop-all script
    cat > stop-all.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping StartBid Enhanced Platform..."

# Kill all Node.js processes
pkill -f "node.*app-enhanced.js"
pkill -f "node.*hardhat"
pkill -f "npm.*start"

# Kill IPFS daemon if running
if [ -f "ipfs.pid" ]; then
    kill $(cat ipfs.pid) 2>/dev/null
    rm ipfs.pid
fi

echo "✅ All services stopped"
EOF

    chmod +x stop-all.sh
    
    print_success "Startup scripts created"
}

# Main setup function
main() {
    echo "🎯 StartBid Enhanced Setup Script"
    echo "=================================="
    echo ""
    
    # Check prerequisites
    check_node
    check_npm
    
    # Setup
    create_directories
    install_dependencies
    setup_environment
    compile_contracts
    run_contract_tests
    setup_ipfs
    create_startup_scripts
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update the .env files with your actual configuration"
    echo "2. Install MetaMask browser extension"
    echo "3. Run './start-all.sh' to start all services"
    echo "4. Open http://localhost:3000 in your browser"
    echo ""
    echo "📚 For detailed setup instructions, see ENHANCED_SETUP_GUIDE.md"
    echo ""
    echo "🔧 Configuration files created:"
    echo "   - backend/.env"
    echo "   - frontend/.env"
    echo "   - start-all.sh"
    echo "   - stop-all.sh"
    echo ""
    print_success "Setup complete! Happy bidding! 🎯"
}

# Run main function
main "$@"
