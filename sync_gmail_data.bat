@echo off
echo ===========================================
echo    GMAIL VERİ SENKRONIZASYONU
echo ===========================================
echo.
echo 🔄 Gmail'den Etsy sipariş verileri çekiliyor...
echo.

REM Ana dizine git
cd /d %~dp0..

REM Gmail siparişlerini çek
echo 📧 Gmail API ile sipariş verilerini çekiyor...
python etsy_orders.py

REM Portable manager'a kopyala
if exist "etsy_data\etsy_orders.json" (
    echo 📥 Veriler portable manager'a kopyalanıyor...
    copy "etsy_data\etsy_orders.json" "portable_etsy_manager\data\etsy_orders.json"
    echo ✅ Veriler başarıyla kopyalandı!
    
    REM Backup oluştur
    set timestamp=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
    set timestamp=%timestamp: =0%
    copy "portable_etsy_manager\data\etsy_orders.json" "portable_etsy_manager\data\backup\etsy_orders_%timestamp%.json"
    echo 💾 Backup oluşturuldu: etsy_orders_%timestamp%.json
) else (
    echo ❌ Gmail'den veri çekilemedi!
    echo 💡 Gmail API bağlantısını kontrol edin.
)

echo.
echo 🔄 İşlem tamamlandı.
pause
