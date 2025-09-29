@echo off
chcp 65001 >nul 2>&1
cls
echo.
echo ================================================
echo   🚀 ETSY ORDER MANAGEMENT - HOST LAUNCHER
echo ================================================
echo.
echo Bu uygulama tamamen OTOMATIK'c olarak:
echo • Firewall kurallari isler
echo • Server'lari baslatir
echo • IP adresienizi gösterir
echo • Kullanicilarinizin baglanmasini saglar
echo.
echo Devam etmek için bir tusa basin...
pause >nul

echo.
echo ================================================
echo              HOSTING BASLATILIYOR...
echo ================================================
echo.

REM Firewall kurallarini ayarla
echo [1/4] Firewall kurallari kontrol ediliyor...
setup_firewall.bat >nul 2>&1

echo [2/4] Ag erisimi ayarlanıyor...
network_cozum.bat >nul 2>&1

echo [3/4] Sunucular başlatılıyor...
start /B start_network.bat >nul 2>&1

REM IP adresini almak icin 5 saniye bekle
timeout /t 5 /nobreak >nul

echo [4/4] Sistem durumu kontrol ediliyor...
echo.

REM IP adresini bul
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /R /C:"IPv4 Address"') do (
    for /f "tokens=*" %%a in ("%%i") do (
        set LOCAL_IP=%%a
        goto found_ip
    )
)
:found_ip

if defined LOCAL_IP (
    echo ================================================
    echo          ✅ HOSTING BASARIYLA BASLATILDI!
    echo ================================================
    echo.
    echo 🌐 Lokal IP Adresiniz: %LOCAL_IP%
    echo.
    echo ============================
    echo    KULLANICI BAGLANTI URL'LERI:
    echo ============================
    echo.
    echo 📱 Uygulama: http://%LOCAL_IP%:5178
    echo 🔗 API Docs:   http://%LOCAL_IP%:8080/docs
    echo.
    echo ============================
    echo          NASIL YAYIN YAPACAKSINIZ?
    echo ============================
    echo.
    echo 1️⃣ Bu IP'yi arkadaşlarınıza söyleyin
    echo 2️⃣ WhatsApp/Telegram'da paylaşın
    echo 3️⃣ Onlar http://[IP]:5178'e gitsinler
    echo 4️⃣ Register butonuna tıkladıklarında hesap açsınlar
    echo.
    echo ============================
    echo    SISTEMI DURDURMAK ICIN:
    echo ============================
    echo.
    echo Bu pencereyi kapatın VEYA...
    echo .\STOP_HOST.bat çalıştırın
    echo.
    echo Not: Sistem bu pencere açık kaldığı sürece çalışır!
    echo ================================================
    echo.
) else (
    echo ================================================
    echo            ❌ SORUN OLUSTU
    echo ================================================
    echo.
    echo IP adresi tespit edilemedi.
    echo Lütfen ag ayarlarinizi kontrol edin.
    echo.
)

echo Sistem hazır! Bu pencereyi kapatmayın...
echo (Kapatırsanız hosting durur)
echo.
pause >nul
