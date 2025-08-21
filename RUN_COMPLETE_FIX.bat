@echo off
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════════════╗
echo ║                       🔧 IMAGE URL DÜZELTMESİ VE TEST                               ║
echo ║                      CSV → JSON + 75x75 Image Fix                                   ║
echo ╚══════════════════════════════════════════════════════════════════════════════════════╝
echo.

cd /d "C:\Users\Hakan\Desktop\gmail\portable_etsy_manager"

echo 1️⃣ CSV'yi JSON'a çevirip image URL'leri düzeltiliyor...
echo ═══════════════════════════════════════════════════════════════════════════════════════

python convert_and_fix.py

echo.
echo 2️⃣ JSON dosyası kontrol ediliyor...
echo ═══════════════════════════════════════════════════════════════════════════════════════

if exist "data\etsy_orders.json" (
    echo ✅ JSON dosyası oluşturuldu
    for /f %%i in ('type "data\etsy_orders.json" ^| find /c "il_75x75"') do echo    🖼️ 75x75 image sayısı: %%i
    for /f %%i in ('type "data\etsy_orders.json" ^| find /c "transaction_id"') do echo    📊 Toplam order sayısı: %%i
) else (
    echo ❌ JSON dosyası oluşturulamadı!
    pause
    exit /b 1
)

echo.
echo 3️⃣ Web sunucu başlatılıyor...
echo ═══════════════════════════════════════════════════════════════════════════════════════

echo 🌐 Debug sayfası açılıyor...
start http://localhost:8000/debug

timeout /t 2

echo 🌐 Ana sayfa açılıyor...
start http://localhost:8000

echo.
echo 🚀 Web sunucu başlatılıyor...
echo.
echo 💡 TEST ADIMLARı:
echo    1. Debug sayfasında "Orders + Images Yükle" butonuna tıklayın
echo    2. Image'ların 75x75 boyutunda görünüp görünmediğini kontrol edin
echo    3. Browser'da F12 basın, Network sekmesinde image request'lerini izleyin
echo    4. Ana sayfada Orders tablosundaki Image sütununu kontrol edin
echo    5. Image'lara tıklayarak büyütülebilir olduğunu test edin
echo.
echo 🛑 Sunucuyu durdurmak için Ctrl+C basın
echo.

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

echo.
echo 👋 Test tamamlandı.
pause
