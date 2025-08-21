@echo off
echo ===========================================
echo    PORTABLE ETSY MANAGER - FULL SYSTEM
echo ===========================================
echo.
echo 🚀 Sistem başlatılıyor...
echo.

REM Backend başlat
echo 📡 Backend API başlatılıyor...
start "Backend API" cmd /k "cd /d %~dp0 && .\.venv\Scripts\activate && uvicorn api:app --host 127.0.0.1 --port 8000"

REM 3 saniye bekle
timeout /t 3 /nobreak >nul

REM Frontend başlat
echo 🎨 Frontend UI başlatılıyor...
start "Frontend UI" cmd /k "cd /d %~dp0\frontend && npm run dev"

REM 2 saniye bekle
timeout /t 2 /nobreak >nul

echo.
echo ✅ Sistem başarıyla başlatıldı!
echo.
echo 📡 Backend API: http://localhost:8000/api/orders
echo 🎨 Frontend UI: http://localhost:5173
echo.
echo 🌐 Browser'da http://localhost:5173 adresini açın
echo 📦 Orders sayfasında Gmail verilerinizi görebilirsiniz
echo.
echo Çıkmak için bu pencereyi kapatabilirsiniz.
pause
