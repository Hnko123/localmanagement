@echo off
echo ========================================
echo     ETSY MANAGER - SORUN GİDERME
echo ========================================
echo.

cd /d "%~dp0"

echo 📍 Çalışma dizini: %CD%
echo.

echo 🔍 Gerekli kontroller...

REM Python kontrolü
echo 🐍 Python kontrol ediliyor...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python bulunamadı! Python 3.7+ yükleyin.
    pause
    exit /b 1
) else (
    python --version
    echo ✅ Python OK
)

REM Node.js kontrolü
echo 📦 Node.js kontrol ediliyor...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js bulunamadı! Node.js yükleyin.
    pause
    exit /b 1
) else (
    node --version
    echo ✅ Node.js OK
)

echo.
echo 🔧 Backend API başlatılıyor...
echo.

REM Python dependencies yükle
pip install fastapi uvicorn --quiet

REM Backend'i başlat
start "Backend API" cmd /k "echo 🔧 Backend API çalışıyor && python -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload"

echo ⏳ Backend'in başlamasını bekleniyor...
timeout /t 7 /nobreak >nul

echo.
echo 🌐 Frontend dev server başlatılıyor...
cd frontend

REM NPM dependencies kontrol et
if not exist "node_modules\.bin\vite.cmd" (
    echo 📦 NPM modülleri yükleniyor...
    npm install
)

REM Frontend'i başlat
start "Frontend Dev" cmd /k "echo 🌐 Frontend çalışıyor && npm run dev"

echo ⏳ Frontend'in başlamasını bekleniyor...
timeout /t 10 /nobreak >nul

echo.
echo 🌐 Tarayıcı açılıyor...
start "" "http://localhost:5173"

echo.
echo ✅ UYGULAMA BAŞLATILDI!
echo.
echo 📋 Çalışan Servisler:
echo    🔗 Frontend: http://localhost:5173
echo    🔗 Backend:  http://localhost:8000
echo    📚 API Docs: http://localhost:8000/docs
echo.
echo 💡 Eğer hala sorun varsa:
echo    1. Windows Defender Firewall'u kontrol edin
echo    2. Antivirus yazılımını geçici kapatın
echo    3. Port 5173 ve 8000'in boş olduğunu kontrol edin
echo.
echo ❗ Terminal pencerelerini kapatmayın!
echo.
pause
