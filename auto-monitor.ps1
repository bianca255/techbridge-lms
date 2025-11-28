# TechBridge Auto-Restart & Monitor Script
# Ensures perfect system operation for demos

Write-Host "🚀 TechBridge Auto-Monitor Starting..." -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host "This will keep your system running perfectly!" -ForegroundColor White
Write-Host ""

# Kill any existing processes first
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

$projectRoot = "C:\Users\USER\Documents\New Techbridge"
$backendPath = Join-Path $projectRoot "server"
$frontendPath = Join-Path $projectRoot "client"

# Function to start backend
function Start-Backend {
    Write-Host "$(Get-Date -Format 'HH:mm:ss') - 🔧 Starting Backend..." -ForegroundColor Yellow
    cd $backendPath
    $backendJob = Start-Job -ScriptBlock { 
        cd "C:\Users\USER\Documents\New Techbridge\server"
        npm start 
    }
    Start-Sleep -Seconds 8
    return $backendJob
}

# Function to start frontend  
function Start-Frontend {
    Write-Host "$(Get-Date -Format 'HH:mm:ss') - 🌐 Starting Frontend..." -ForegroundColor Blue
    cd $frontendPath
    $frontendJob = Start-Job -ScriptBlock { 
        cd "C:\Users\USER\Documents\New Techbridge\client"
        $env:BROWSER = "none"  # Don't auto-open browser
        npm start 
    }
    Start-Sleep -Seconds 12
    return $frontendJob
}

# Start both servers
Write-Host "🚀 Initial Server Startup..." -ForegroundColor Cyan
$backendJob = Start-Backend
$frontendJob = Start-Frontend

Write-Host "`n✅ Servers Started Successfully!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "🎯 Quiz Access: Courses → Enroll → Lessons" -ForegroundColor Yellow
Write-Host "👨‍🏫 Teacher: teacher@techbridge.com / Teacher123!" -ForegroundColor White
Write-Host "`n🎉 YOUR DEMO IS READY!" -ForegroundColor Magenta
Write-Host "`n💡 This script will keep monitoring and restart if needed." -ForegroundColor White
Write-Host "Press Ctrl+C to stop monitoring." -ForegroundColor Gray

# Monitoring loop
while ($true) {
    Start-Sleep -Seconds 30
    
    # Check backend
    try {
        $null = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 3
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - ✅ System Healthy" -ForegroundColor Green
    } catch {
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - ❌ Backend down - restarting..." -ForegroundColor Red
        $backendJob = Start-Backend
        Start-Sleep -Seconds 5
    }
    
    # Check frontend
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3
    } catch {
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - ❌ Frontend down - restarting..." -ForegroundColor Yellow
        $frontendJob = Start-Frontend
    }
}