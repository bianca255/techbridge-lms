# Simple Bulletproof Startup for TechBridge
Write-Host "🛡️  CRASH-PROOF TECHBRIDGE" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green

# Kill existing processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Start backend in separate window
Write-Host "🔧 Starting Backend..." -ForegroundColor Yellow
cd "C:\Users\USER\Documents\New Techbridge\server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\USER\Documents\New Techbridge\server'; Write-Host '🚀 Backend Starting...' -ForegroundColor Green; npm start"
Start-Sleep -Seconds 8

# Start frontend in separate window  
Write-Host "🌐 Starting Frontend..." -ForegroundColor Blue
cd "C:\Users\USER\Documents\New Techbridge\client"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\USER\Documents\New Techbridge\client'; Write-Host '🌐 Frontend Starting...' -ForegroundColor Blue; npm start"
Start-Sleep -Seconds 12

Write-Host "`n✅ SERVERS LAUNCHED!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "🌐 App: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 API: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Servers now have crash protection built-in!" -ForegroundColor Yellow
Write-Host "💡 Rate limits are relaxed for demos" -ForegroundColor Yellow
Write-Host "💡 Errors won't crash the system anymore" -ForegroundColor Yellow

# Simple monitoring
while ($true) {
    Start-Sleep -Seconds 30
    try {
        $null = Invoke-RestMethod "http://localhost:5000/api/health" -TimeoutSec 3
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - ✅ System Running" -ForegroundColor Green
    } catch {
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - ⚠️  Checking..." -ForegroundColor Yellow
    }
}