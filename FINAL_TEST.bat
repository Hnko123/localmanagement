@echo off
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════════════╗
echo ║                        🎯 ETSY MANAGER - SON TEST ve DÜZELTME                        ║
echo ║                               Orders Tablosu Sorunu                                  ║
echo ╚══════════════════════════════════════════════════════════════════════════════════════╝
echo.

cd /d "C:\Users\Hakan\Desktop\gmail\portable_etsy_manager"

echo 🔍 1. DOSYA KONTROLÜ
echo ═══════════════════════════════════════════════════════════════════════════════════════
if exist "data\etsy_orders.json" (
    echo ✅ Orders JSON: Mevcut
    for /f %%i in ('type "data\etsy_orders.json" ^| find /c "transaction_id"') do echo    📊 Order sayısı: %%i
) else (
    echo ❌ Orders JSON: Bulunamadı!
    goto :error
)

if exist "app\main.py" (
    echo ✅ Main API: Mevcut
) else (
    echo ❌ Main API: Bulunamadı!
    goto :error
)

if exist "app\routes\orders.py" (
    echo ✅ Orders Route: Mevcut
) else (
    echo ❌ Orders Route: Bulunamadı!
    goto :error
)

if exist "app\static\index.html" (
    echo ✅ Frontend HTML: Mevcut
) else (
    echo ❌ Frontend HTML: Bulunamadı!
    goto :error
)

echo.
echo 🐍 2. PYTHON VE MODÜL KONTROLÜ
echo ═══════════════════════════════════════════════════════════════════════════════════════
python --version
python -c "import fastapi, uvicorn; print('✅ FastAPI ve Uvicorn hazır')" 2>nul
if %errorlevel% neq 0 (
    echo ⏳ Gerekli modüller yükleniyor...
    pip install fastapi uvicorn
)

echo.
echo 🚀 3. WEB SUNUCU BAŞLATILIYOR
echo ═══════════════════════════════════════════════════════════════════════════════════════
echo.
echo 📍 ANA SAYFA:    http://localhost:8000
echo 🧪 DEBUG SAYFA:  http://localhost:8000/debug  
echo 📊 API ORDERS:   http://localhost:8000/api/orders
echo 🩺 HEALTH:       http://localhost:8000/health
echo.
echo 💡 SORUN GİDERME ADIMLARı:
echo    1. Ana sayfaya git: http://localhost:8000
echo    2. Eğer Orders tablosu boşsa, Debug sayfasına git: http://localhost:8000/debug
echo    3. Debug sayfasında "API Test Et" ve "Orders Yükle" butonlarına tıkla
echo    4. Console (F12) ve Network sekmelerini kontrol et
echo    5. Hata mesajlarını not al
echo.
echo 🛑 Durdurmak için Ctrl+C basın
echo.

timeout /t 3 >nul

start http://localhost:8000/debug
timeout /t 2 >nul
start http://localhost:8000

echo ⏳ Sunucu başlatılıyor... (3 saniye)
timeout /t 3 >nul

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --log-level info

goto :end

:error
echo.
echo ❌ HATA: Kritik dosyalar eksik!
echo.
echo Lütfen şu adımları takip edin:
echo 1. Gmail uygulamasını BASLA.bat ile çalıştırın
echo 2. Orders verilerinin data/etsy_orders.json dosyasında olduğundan emin olun
echo 3. Bu script'i tekrar çalıştırın
echo.
pause

:end
echo.
echo 👋 Sunucu kapatıldı.
pause
