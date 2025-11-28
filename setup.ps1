# TechBridge Local Development Setup

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "TechBridge LMS - Local Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js v18 or higher from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green

# Check if MongoDB is running (optional for local development)
Write-Host ""
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
Write-Host "Note: You can use MongoDB Atlas if local MongoDB is not available" -ForegroundColor Gray

# Check if .env files exist
Write-Host ""
Write-Host "Checking environment configuration..." -ForegroundColor Yellow

if (Test-Path "server\.env") {
    Write-Host "✓ Server .env file exists" -ForegroundColor Green
} else {
    Write-Host "✗ Server .env file missing! Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item "server\.env.example" "server\.env"
    Write-Host "✓ Created server\.env - Please update with your configuration" -ForegroundColor Green
}

if (Test-Path "client\.env") {
    Write-Host "✓ Client .env file exists" -ForegroundColor Green
} else {
    Write-Host "✗ Client .env file missing! Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item "client\.env.example" "client\.env"
    Write-Host "✓ Created client\.env" -ForegroundColor Green
}

# Check if dependencies are installed
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Yellow

if (Test-Path "server\node_modules") {
    Write-Host "✓ Server dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Server dependencies not installed! Installing..." -ForegroundColor Yellow
    cd server
    npm install
    cd ..
    Write-Host "✓ Server dependencies installed" -ForegroundColor Green
}

if (Test-Path "client\node_modules") {
    Write-Host "✓ Client dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Client dependencies not installed! Installing..." -ForegroundColor Yellow
    cd client
    npm install
    cd ..
    Write-Host "✓ Client dependencies installed" -ForegroundColor Green
}

# Display next steps
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update server\.env with your MongoDB connection string" -ForegroundColor White
Write-Host "2. Start the backend server:" -ForegroundColor White
Write-Host "   cd server" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. In a new terminal, start the frontend:" -ForegroundColor White
Write-Host "   cd client" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "OR use VS Code Task Runner:" -ForegroundColor White
Write-Host "   Press Ctrl+Shift+B and select 'Start Full Stack (Dev)'" -ForegroundColor Gray
Write-Host ""
Write-Host "Backend will run on: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend will run on: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
