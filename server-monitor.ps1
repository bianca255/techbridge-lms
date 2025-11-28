#!/bin/bash
# Server Stability Fix Script
# This keeps servers running and restarts them if they crash

Write-Host "🚀 TechBridge Server Monitor" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host "This script will keep your servers running stable" -ForegroundColor White
Write-Host ""

while ($true) {
    # Check backend
    try {
        $null = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 3
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - ✅ Backend OK" -ForegroundColor Green
    } catch {
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - ❌ Backend down - restarting..." -ForegroundColor Red
        Get-Process | Where-Object {$_.ProcessName -eq "node" -and $_.WS -lt 100MB} | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        cd "C:\Users\USER\Documents\New Techbridge\server"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
        Start-Sleep -Seconds 10
    }
    
    # Check frontend
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - ✅ Frontend OK" -ForegroundColor Green
    } catch {
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - ❌ Frontend down - restarting..." -ForegroundColor Yellow
        Get-Process | Where-Object {$_.ProcessName -eq "node" -and $_.WS -gt 200MB} | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        cd "C:\Users\USER\Documents\New Techbridge\client"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
        Start-Sleep -Seconds 15
    }
    
    # Wait 30 seconds before next check
    Start-Sleep -Seconds 30
}