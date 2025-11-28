# Quick Start Script for TechBridge Development

Write-Host "Starting TechBridge Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Start backend in background
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; npm run dev" -WindowStyle Normal

# Wait a moment for backend to initialize
Start-Sleep -Seconds 3

# Start frontend in background
Write-Host "Starting frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "✓ Backend starting on http://localhost:5000" -ForegroundColor Green
Write-Host "✓ Frontend starting on http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Both servers are starting in separate windows." -ForegroundColor Cyan
Write-Host "The browser will open automatically when ready." -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to stop all servers..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup - stop processes
Write-Host "Stopping servers..." -ForegroundColor Red
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Write-Host "Servers stopped." -ForegroundColor Green
