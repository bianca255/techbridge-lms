# Quick Server Verification Script
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   TECHBRIDGE SERVER STATUS CHECK" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Check Backend
Write-Host "Backend (http://localhost:5000):" -ForegroundColor Yellow
try {
    $backend = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 5
    Write-Host "  ✅ RUNNING" -ForegroundColor Green
    Write-Host "  Status: $($backend.status)" -ForegroundColor White
    Write-Host "  Message: $($backend.message)" -ForegroundColor White
} catch {
    Write-Host "  ❌ NOT RESPONDING" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Check Frontend
Write-Host "`nFrontend (http://localhost:3000):" -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "  ✅ RUNNING" -ForegroundColor Green
    Write-Host "  Status Code: $($frontend.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "  ❌ NOT RESPONDING" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Check MongoDB
Write-Host "`nMongoDB (localhost:27017):" -ForegroundColor Yellow
$mongoRunning = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($mongoRunning) {
    Write-Host "  ✅ RUNNING" -ForegroundColor Green
} else {
    Write-Host "  ❌ NOT RUNNING" -ForegroundColor Red
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   NEXT STEPS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "1. Open browser: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host "2. Test login with admin credentials" -ForegroundColor White
Write-Host "3. Ready for demo!`n" -ForegroundColor Green
