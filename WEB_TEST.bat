@echo off
echo.
echo ========================================
echo   ETSY MANAGER - WEB SUNUCU TEST
echo ========================================
echo.

cd /d "C:\Users\Hakan\Desktop\gmail\portable_etsy_manager"

echo Orders dosyasi kontrol ediliyor...
if exist "data\etsy_orders.json" (
    echo ✅ Orders dosyasi mevcut
) else (
    echo ❌ Orders dosyasi bulunamadi!
    pause
    exit /b 1
)

echo.
echo Python ve gerekli moduller kontrol ediliyor...
python -c "import fastapi, uvicorn; print('✅ FastAPI ve Uvicorn hazir')" 2>nul
if %errorlevel% neq 0 (
    echo Gerekli moduller yukleniyor...
    pip install fastapi uvicorn
)

echo.
echo Web sunucu baslatiliyor...
echo.
echo Tarayicinizda acilacak: http://localhost:8000
echo.
echo Durdurmak icin Ctrl+C basin
echo.

timeout /t 2 >nul
start http://localhost:8000

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

pause
