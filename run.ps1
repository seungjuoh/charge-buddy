# Charge Buddy 2 - Auto Setup and Run Script
Write-Host "Starting Charge Buddy 2..." -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "Dependencies already installed." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Yellow
npm run dev

Read-Host "Press Enter to exit" 