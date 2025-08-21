# build_portable.ps1
#
# Adimlar:
#   1. Frontend build (React + 3D effects)
#   2. Statik dosyalar app/static'e kopyala
#   3. Python virtualenv olustur & paketleri yedekle
#   4. PyInstaller ile modern UI exe üret
#   5. Gereksiz klasorleri temizle

param(
    [switch]$Force
)

function Throw-Error {
    param([string]$msg)
    Write-Host "ERROR: $msg" -ForegroundColor Red
    Exit 1
}

Write-Host "Build script started"
Write-Host ""

# Frontend build (React + 3D effects)
Write-Host "Building frontend with 3D effects..."
$frontendDir = Join-Path $PSScriptRoot 'frontend'

if (Test-Path $frontendDir) {
    Push-Location $frontendDir
    
    # Install dependencies
    Write-Host "Installing frontend dependencies..."
    npm install --legacy-peer-deps | Out-Null
    
    # Build frontend
    Write-Host "Building React app with 3D effects..."
    npm run build | Out-Null
    
    Pop-Location
    
    # Copy static files to app/static
    $dest = Join-Path $PSScriptRoot 'app\static'
    if (Test-Path $dest) {
        Remove-Item -Recurse -Force $dest
    }
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
    
    $distDir = Join-Path $frontendDir 'dist'
    if (Test-Path $distDir) {
        Copy-Item -Path "$distDir\*" -Destination $dest -Recurse -Force
        Write-Host "Frontend built and copied to $dest"
    } else {
        Write-Host "Frontend build failed, creating empty static directory"
    }
} else {
    Write-Host "Frontend directory not found, creating empty static directory"
    $dest = Join-Path $PSScriptRoot 'app\static'
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
}

# Python virtualenv olustur / aktif et
$venv = Join-Path $PSScriptRoot '.venv'
if (-not (Test-Path $venv) -or $Force.IsPresent) {
    Write-Host "Creating virtual environment..."
    python -m venv $venv | Out-Null
}
$activate = Join-Path $venv 'Scripts\Activate.ps1'
. $activate

Write-Host "Installing Python dependencies..."
pip install --upgrade pip | Out-Null
pip install -r (Join-Path $PSScriptRoot 'requirements.txt') | Out-Null
# Ensure PyInstaller is available
pip install pyinstaller | Out-Null

# PyInstaller ile modern UI exe olustur
$mainPy = Join-Path $PSScriptRoot 'app\main.py'
Write-Host "Building modern UI executable with PyInstaller..."

# PyInstaller command with all necessary data files
pyinstaller --onefile `
    --name portable_etsy_manager_modern `
    --add-data "app/static;static" `
    --add-data "settings.json;." `
    --add-data "config/gmail_credentials.txt;config" `
    --add-data "data/etsy_orders.json;data" `
    --add-data "order_schema.json;." `
    $mainPy | Out-Null

if (-not (Test-Path (Join-Path $PSScriptRoot 'dist\portable_etsy_manager_modern.exe'))) {
    Throw-Error "PyInstaller .exe olusturamadı."
}

# Exe'yi cok dizine tasi
Move-Item -Force (Join-Path $PSScriptRoot 'dist' 'portable_etsy_manager_modern.exe') $PSScriptRoot

Write-Host ""
Write-Host "Modern UI executable created: $(Join-Path $PSScriptRoot 'portable_etsy_manager_modern.exe')"

# Temizlik
Remove-Item -Recurse -Force (Join-Path $PSScriptRoot 'dist')
Remove-Item -Recurse -Force (Join-Path $PSScriptRoot 'build')
Remove-Item -Force *.spec

Write-Host "Cleaning temporary files..."
Remove-Item -Recurse -Force $venv

Write-Host ""
Write-Host "Build complete! Run portable_etsy_manager.exe"