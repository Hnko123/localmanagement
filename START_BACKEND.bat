@echo off
echo ========================================
echo      BACKEND API - MANUEL START
echo ========================================
echo.

cd /d "%~dp0"

echo 📂 Çalışma dizini: %CD%
echo.

echo 🔧 Python versiyonu kontrol ediliyor...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python bulunamadı!
    echo 📥 Python yükleyin: https://python.org
    pause
    exit /b 1
)

echo ✅ Python hazır
echo.

echo 📦 Python paketleri yükleniyor...
pip install fastapi uvicorn

echo.
echo 🚀 Backend API başlatılıyor...
echo 📍 Port: 8000
echo 🌐 URL: http://localhost:8000
echo.

python -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload

pause
