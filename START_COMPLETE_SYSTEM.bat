@echo off
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════════════╗
echo ║                    🎯 ETSY MANAGER - TAM SİSTEM BAŞLATMA                            ║
echo ║                              Baştan Sona Test                                       ║
echo ╚══════════════════════════════════════════════════════════════════════════════════════╝
echo.

cd /d "C:\Users\Hakan\Desktop\gmail\portable_etsy_manager"

echo 🔍 SİSTEM KONTROL EDİLİYOR...
echo ═══════════════════════════════════════════════════════════════════════════════════════

echo 1️⃣ Çalışma dizini: %CD%
echo.

echo 2️⃣ Kritik dosyalar kontrol ediliyor:
if exist "data\etsy_orders.json" (
    echo ✅ JSON Data dosyası: MEVCUT
    for /f %%i in ('type "data\etsy_orders.json" ^| find /c "transaction_id"') do echo    📊 Toplam order: %%i adet
) else (
    echo ❌ JSON Data dosyası: BULUNAMADI!
    echo.
    echo 🔧 ÇÖZÜM: Önce Gmail verilerini çekin
    echo    BASLA.bat dosyasını çalıştırın
    pause
    exit /b 1
)

if exist "app\main.py" (
    echo ✅ API Backend: MEVCUT
) else (
    echo ❌ API Backend: BULUNAMADI!
    pause
    exit /b 1
)

if exist "app\static\index.html" (
    echo ✅ Frontend: MEVCUT
) else (
    echo ❌ Frontend: BULUNAMADI!
    pause
    exit /b 1
)

echo.
echo 3️⃣ Python ortamı kontrol ediliyor:
python --version
if %errorlevel% neq 0 (
    echo ❌ Python bulunamadı!
    pause
    exit /b 1
)

echo.
echo 4️⃣ Gerekli Python modülleri kontrol ediliyor:
python -c "import fastapi, uvicorn; print('✅ FastAPI ve Uvicorn HAZIR')" 2>nul
if %errorlevel% neq 0 (
    echo ⏳ Gerekli modüller yükleniyor...
    pip install fastapi uvicorn
)

echo.
echo ═══════════════════════════════════════════════════════════════════════════════════════
echo 🚀 WEB SUNUCU BAŞLATILIYOR...
echo ═══════════════════════════════════════════════════════════════════════════════════════
echo.
echo 📍 SAYFALAR:
echo    🏠 Ana Sayfa:     http://localhost:8000
echo    🧪 Debug Test:    http://localhost:8000/debug
echo    📊 API Orders:    http://localhost:8000/api/orders
echo    🩺 Health Check:  http://localhost:8000/health
echo.
echo 💡 TEST ADIMLARI:
echo    1. Önce Debug sayfası açılacak - API test et
echo    2. Sonra Ana sayfa açılacak - Orders tablosunu kontrol et
echo    3. Browser'da F12 bas, Console ve Network sekmelerini izle
echo.
echo 🛑 Sunucuyu durdurmak için Ctrl+C basın
echo.

echo ⏳ 5 saniyede başlatılıyor...
timeout /t 5

echo.
echo 🌐 Debug sayfası açılıyor...
start http://localhost:8000/debug

timeout /t 3

echo 🌐 Ana sayfa açılıyor...
start http://localhost:8000

echo.
echo 🚀 Sunucu başlatılıyor...
echo ═══════════════════════════════════════════════════════════════════════════════════════

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --log-level info

echo.
echo 👋 Sunucu kapatıldı.
pause
