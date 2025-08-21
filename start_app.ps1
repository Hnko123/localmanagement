# Portable Etsy Manager - PowerShell Startup Script
Write-Host "========================================" -ForegroundColor Green
Write-Host "Portable Etsy Manager - Baslatiliyor..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

# Activate virtual environment
& ".\.venv\Scripts\Activate.ps1"

# Run the application
python portable_etsy_manager.py

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Uygulama tamamlandi." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Read-Host "Devam etmek icin Enter'a basin"
