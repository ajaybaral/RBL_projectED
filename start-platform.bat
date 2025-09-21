@echo off
echo 🚀 Starting StartBid Enhanced Platform...
echo.

@REM echo 📁 Setting up environment files...
@REM copy backend\env-template backend\.env
@REM copy frontend\env-template frontend\.env
@REM echo ✅ Environment files created

echo.
echo 🔧 Installing dependencies...
cd backend
call npm install
cd ..\frontend
call npm install
cd ..\contract
call npm install
cd ..
echo ✅ Dependencies installed

echo.
echo 🏗️ Compiling smart contracts...
cd contract
call npm run compile
echo ✅ Contracts compiled

echo.
echo 🚀 Starting services...
echo.
echo 📋 Instructions:
echo 1. Open Terminal 1: cd contract && npm run node
echo 2. Open Terminal 2: cd contract && npm run deploy
echo 3. Open Terminal 3: cd backend && node app-enhanced.js
echo 4. Open Terminal 4: cd frontend && npm start
echo.
echo 🌐 URLs:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:8000
echo - Hardhat: http://localhost:8545
echo.
echo 🎯 Ready to start bidding!
pause
