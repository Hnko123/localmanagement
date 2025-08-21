@echo off
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════════════╗
echo ║                           🎯 ETSY MANAGER - WEB ARAYUZ                              ║
echo ║                              Sorun Giderme Modu                                     ║
echo ╚══════════════════════════════════════════════════════════════════════════════════════╝
echo.

cd /d "C:\Users\Hakan\Desktop\gmail\portable_etsy_manager"

echo 1️⃣ Dosya kontrolleri yapiliyor...
echo.

if exist "data\etsy_orders.json" (
    echo ✅ Orders JSON dosyasi mevcut
    for /f %%i in ('type "data\etsy_orders.json" ^| find /c "transaction_id"') do echo    📊 Toplam order sayisi: %%i
) else (
    echo ❌ Orders JSON dosyasi bulunamadi!
    goto :error
)

if exist "app\static\index.html" (
    echo ✅ Frontend HTML dosyasi mevcut
) else (
    echo ❌ Frontend dosyalari bulunamadi!
    goto :error
)

if exist "app\routes\orders.py" (
    echo ✅ API Routes dosyasi mevcut
) else (
    echo ❌ API Routes dosyasi bulunamadi!
    goto :error
)

echo.
echo 2️⃣ Python modulleri kontrol ediliyor...
python -c "import fastapi, uvicorn; print('✅ FastAPI ve Uvicorn hazir')" 2>nul
if %errorlevel% neq 0 (
    echo ⏳ Gerekli moduller yukleniyor...
    pip install fastapi uvicorn
)

echo.
echo 3️⃣ Web sunucu baslatiliyor...
echo.
echo 📍 URL: http://localhost:8000
echo 📊 API: http://localhost:8000/api/orders  
echo 🩺 Health: http://localhost:8000/health
echo.
echo 💡 NOTLAR:
echo    - Tarayicinizda F12 basin ve Console sekmesini acin
echo    - Network sekmesinde API cagrilarini izleyin
echo    - Hata mesajlari icin console'u kontrol edin
echo.
echo 🛑 Durdurmak icin Ctrl+C basin
echo.

timeout /t 3 >nul
start http://localhost:8000

echo Sunucu baslatiliyor...
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --log-level debug

goto :end

:error
echo.
echo ❌ Kritik dosyalar eksik! Lutfen uygulamayi yeniden kurun.
pause

:end
