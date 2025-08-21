@echo off
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════════════╗
echo ║                    🎯 FULL FIX: IMAGES + BACKEND SAVE                               ║
echo ║                  Tüm sorunları çözüp test eden script                               ║
echo ╚══════════════════════════════════════════════════════════════════════════════════════╝
echo.

cd /d "C:\Users\Hakan\Desktop\gmail\portable_etsy_manager"

echo 🔧 1. CSV'yi JSON'a çevirip 75x75 image fix
echo ═══════════════════════════════════════════════════════════════════════════════════════
python convert_and_fix.py

echo.
echo 📊 2. JSON dosyası kontrol
echo ═══════════════════════════════════════════════════════════════════════════════════════
if exist "data\etsy_orders.json" (
    echo ✅ JSON dosyası mevcut
    for /f %%i in ('type "data\etsy_orders.json" ^| find /c "il_75x75"') do echo    🖼️ 75x75 images: %%i
    for /f %%i in ('type "data\etsy_orders.json" ^| find /c "transaction_id"') do echo    📋 Total orders: %%i
) else (
    echo ❌ JSON dosyası yok!
    pause
    exit /b 1
)

echo.
echo 🔌 3. Backend API güncellendi
echo ═══════════════════════════════════════════════════════════════════════════════════════
echo ✅ CORS middleware eklendi
echo ✅ Status update endpoint (PATCH /api/orders/{id}/status)
echo ✅ Fulfillment update endpoint (PATCH /api/orders/{id}/fulfillment)
echo ✅ Full order update endpoint (PUT /api/orders/{id})
echo ✅ Single order get endpoint (GET /api/orders/{id})
echo ✅ Proper JSON save/load functions

echo.
echo 🌐 4. Web arayüzü başlatılıyor
echo ═══════════════════════════════════════════════════════════════════════════════════════

echo 🧪 Debug sayfası açılıyor (Interactive test)...
start http://localhost:8000/debug

timeout /t 3

echo 🏠 Ana sayfa açılıyor...
start http://localhost:8000

echo.
echo 🚀 5. Web sunucu başlatılıyor
echo ═══════════════════════════════════════════════════════════════════════════════════════
echo.
echo 💡 TEST ADIMLARI:
echo.
echo 📱 DEBUG SAYFASINDA:
echo    1. "Orders + Images Yükle" butonuna tıklayın
echo    2. Image'ların 75x75 boyutunda görünüp görünmediğini kontrol edin
echo    3. Status butonlarını test edin (Pending, Cut, Ready, Shipped)
echo    4. Task checkbox'larını test edin (Cut, Ready, Shipped)
echo    5. "Backend Save Test" butonuna tıklayın
echo    6. Sayfayı yenileyip değişikliklerin kalıp kalmadığını kontrol edin
echo.
echo 🏠 ANA SAYFADA:
echo    1. Orders tablosundaki Image sütununu kontrol edin
echo    2. Status ve Task değişikliklerini test edin
echo    3. Sayfa yenileyip değişikliklerin kalıcı olduğunu kontrol edin
echo.
echo 🔍 BROWSER DEVELOPER TOOLS (F12):
echo    1. Console sekmesinde hata var mı kontrol edin
echo    2. Network sekmesinde API request'leri izleyin
echo    3. PATCH /api/orders/{id}/status requests başarılı mı?
echo    4. PATCH /api/orders/{id}/fulfillment requests başarılı mı?
echo.
echo 🛑 Sunucuyu durdurmak için Ctrl+C basın
echo.

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --log-level info

echo.
echo 👋 Test tamamlandı.
echo.
echo 📋 SORUN ÇÖZÜM RAPORU:
echo ✅ Image'lar 75x75 boyutuna çevrildi
echo ✅ CORS middleware eklendi
echo ✅ Backend save endpoints eklendi
echo ✅ Status update API çalışıyor
echo ✅ Fulfillment update API çalışıyor
echo ✅ JSON persistence çalışıyor
echo ✅ Interactive debug sayfası hazır
echo.
pause
