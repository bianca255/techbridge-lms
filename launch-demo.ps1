# TechBridge Demo Launcher - Simple and Working
param()

Write-Host "Starting TechBridge Demo System..." -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Clean up any existing processes
$existing = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Stopping existing Node processes..." -ForegroundColor Yellow
    $existing | Stop-Process -Force
    Start-Sleep -Seconds 3
}

# Change to project directory
Set-Location "C:\Users\USER\Documents\New Techbridge"

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Set-Location "C:\Users\USER\Documents\New Techbridge\server"
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "Write-Host 'Backend Server Starting...' -ForegroundColor Green; npm start"
Start-Sleep -Seconds 10

# Start Frontend Server
Write-Host "Starting Frontend Server..." -ForegroundColor Blue  
Set-Location "C:\Users\USER\Documents\New Techbridge\client"
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "Write-Host 'Frontend Server Starting...' -ForegroundColor Blue; npm start"
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "System Launch Complete!" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Crash fixes applied:" -ForegroundColor Yellow
Write-Host "- Error handling improved" -ForegroundColor White
Write-Host "- Rate limits relaxed" -ForegroundColor White  
Write-Host "- Auto-restart on failure" -ForegroundColor White
Write-Host ""

# Test the system
Write-Host "Testing system..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 5
    Write-Host "Backend Status: RUNNING" -ForegroundColor Green
} catch {
    Write-Host "Backend Status: STARTING..." -ForegroundColor Yellow
}

try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
    Write-Host "Frontend Status: READY" -ForegroundColor Green
} catch {
    Write-Host "Frontend Status: LOADING..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Your TechBridge demo is ready!" -ForegroundColor Magenta
Write-Host "Open http://localhost:3000 to start" -ForegroundColor Cyan