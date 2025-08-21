@echo off
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════════════╗
echo ║                       🖼️ IMAGE BOYUT DÜZELTMESİ                                     ║
echo ║                     250x250 → 75x75 dönüşümü                                        ║
echo ╚══════════════════════════════════════════════════════════════════════════════════════╝
echo.

cd /d "C:\Users\Hakan\Desktop\gmail\portable_etsy_manager"

echo 1️⃣ Mevcut image URL'leri kontrol ediliyor...
echo ═══════════════════════════════════════════════════════════════════════════════════════

python fix_image_sizes.py

echo.
echo 2️⃣ Web sunucu başlatılıyor...
echo ═══════════════════════════════════════════════════════════════════════════════════════

echo 🌐 Debug sayfası açılıyor...
start http://localhost:8000/debug

timeout /t 2

echo 🌐 Ana sayfa açılıyor...
start http://localhost:8000

echo.
echo 🚀 Web sunucu başlatılıyor...
echo.
echo 💡 TEST:
echo    - Debug sayfasında "Orders + Images Yükle" butonuna tıklayın
echo    - Image'ların 75x75 boyutunda görünüp görünmediğini kontrol edin
echo    - Browser Network sekmesinde image request'lerini izleyin
echo.

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

pause
