@echo off
echo ========================================
echo      FRONTEND - MANUEL START
echo ========================================
echo.

cd /d "%~dp0\frontend"

echo 📂 Frontend dizini: %CD%
echo.

echo 🔧 Node.js versiyonu kontrol ediliyor...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js bulunamadı!
    echo 📥 Node.js yükleyin: https://nodejs.org
    pause
    exit /b 1
)

node --version
echo ✅ Node.js hazır
echo.

echo 📦 NPM paketleri kontrol ediliyor...
if not exist "node_modules" (
    echo 📥 NPM paketleri yükleniyor...
    npm install
)

echo ✅ NPM paketleri hazır
echo.

echo 🚀 Frontend dev server başlatılıyor...
echo 📍 Port: 5173
echo 🌐 URL: http://localhost:5173
echo.

npm run dev

pause
