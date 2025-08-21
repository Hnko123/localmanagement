@echo off
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════════════╗
echo ║                    🖼️ ETSY IMAGE TEST - 75x75 PX                                    ║
echo ║               Gmail'den Etsy image URL'leri çekme testi                             ║
echo ╚══════════════════════════════════════════════════════════════════════════════════════╝
echo.

cd /d "C:\Users\Hakan\Desktop\gmail\portable_etsy_manager"

echo 1️⃣ Mevcut veriler temizleniyor...
echo ═══════════════════════════════════════════════════════════════════════════════════════
if exist "data\etsy_orders.json" (
    echo 📄 Eski JSON dosyası siliniyor...
    del "data\etsy_orders.json"
)

if exist "data\processed_ids.json" (
    echo 📄 İşlenmiş ID'ler temizleniyor...
    del "data\processed_ids.json"
)

echo ✅ Veriler temizlendi, fresh başlangıç yapılacak
echo.

echo 2️⃣ Gmail'den fresh veri çekiliyor (75x75 Etsy images)...
echo ═══════════════════════════════════════════════════════════════════════════════════════
echo 💡 Bu process şunları yapacak:
echo    - Gmail'deki img tag'lerinden Google proxy URL'lerini bulacak
echo    - # işaretinden sonraki gerçek Etsy URL'sini çıkaracak  
echo    - il_XXxXX kısmını il_75x75 ile değiştirecek
echo    - Orders JSON'una direkt Etsy URL'sini kaydedecek
echo.

python portable_etsy_manager.py

echo.
echo 3️⃣ Veriler kontrol ediliyor...
echo ═══════════════════════════════════════════════════════════════════════════════════════

if exist "data\etsy_orders.json" (
    echo ✅ JSON verisi oluşturuldu
    for /f %%i in ('type "data\etsy_orders.json" ^| find /c "transaction_id"') do echo    📊 Order sayısı: %%i
    for /f %%i in ('type "data\etsy_orders.json" ^| find /c "i.etsystatic.com"') do echo    🖼️ Etsy image URL sayısı: %%i
    for /f %%i in ('type "data\etsy_orders.json" ^| find /c "il_75x75"') do echo    📐 75x75 image sayısı: %%i
) else (
    echo ❌ Veri çekilemedi!
    pause
    exit /b 1
)

echo.
echo 4️⃣ Web sunucu başlatılıyor...
echo ═══════════════════════════════════════════════════════════════════════════════════════

echo 🌐 Debug sayfası açılıyor (Image test)...
start http://localhost:8000/debug

timeout /t 3

echo 🌐 Ana sayfa açılıyor...
start http://localhost:8000

echo.
echo 🚀 Web sunucu başlatılıyor...
echo.
echo 💡 TEST ADIMLARI:
echo    1. Debug sayfasında "Orders + Images Yükle" butonuna tıklayın
echo    2. Image'ların 75x75 boyutunda görünüp görünmediğini kontrol edin
echo    3. Browser'da F12 basın, Network sekmesinde image isteklerini izleyin
echo    4. Image'lara tıklayıp büyütülebiliyor mu kontrol edin
echo    5. Ana sayfada Orders tablosundaki Image sütununu kontrol edin
echo.
echo 🛑 Durdurmak için Ctrl+C basın
echo.

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --log-level info

echo.
echo 👋 Test tamamlandı.
pause
