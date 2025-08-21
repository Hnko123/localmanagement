@echo off
echo Web arayuzu baslatiliyor...
cd /d "%~dp0"

echo.
echo ===============================================
echo   PORTABLE ETSY MANAGER - WEB ARAYUZ
echo ===============================================
echo.

echo Python kontrol ediliyor...
python --version
if %errorlevel% neq 0 (
    echo.
    echo PYTHON BULUNAMADI!
    pause
    exit /b 1
)

echo.
echo Web sunucusu baslatiliyor...
echo.
echo Tarayicinizda su adresi acilacak:
echo http://localhost:8000
echo.
echo Uygulamayi kapatmak icin Ctrl+C basiniz
echo.

start http://localhost:8000

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
