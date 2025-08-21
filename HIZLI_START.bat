@echo off
echo ========================================
echo        ETSY MANAGER - HIZLI START
echo ========================================
echo.

cd /d "%~dp0"

echo 📂 Çalışma dizini: %CD%
echo.

echo 🔧 Backend API başlatılıyor...
start "API Server" cmd /k "python -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload"

echo ⏳ API'nin başlamasını bekleniyor (5 saniye)...
timeout /t 5 /nobreak >nul

echo 🌐 Frontend dev server başlatılıyor...
cd frontend
start "Frontend Dev" cmd /k "npm run dev"

echo ⏳ Frontend'in başlamasını bekleniyor (5 saniye)...
timeout /t 5 /nobreak >nul

echo 🌐 Tarayıcı açılıyor...
start "" "http://localhost:5173"

echo.
echo ✅ UYGULAMA BAŞLATILDI!
echo.
echo 📋 Açık Servisler:
echo    🔗 Frontend: http://localhost:5173
echo    🔗 Backend:  http://localhost:8000
echo    📚 API Docs: http://localhost:8000/docs
echo.
echo 💡 Terminal pencerelerini kapatmayın!
echo.
pause
