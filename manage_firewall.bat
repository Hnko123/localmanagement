@echo off
echo Windows Guvenlik Duvari Yonetimi
echo =================================
echo.
echo UYARI: Guvenlik duvari kapatilacak!
echo Bu sadece gelistirme amacli kullanilmalidir.
echo.
echo 1. Guvenlik duvarini kapat
echo 2. Guvenlik duvarini ac
echo 3. Sadece port 8000'e izin ver (Onerilen)
echo 4. Cikis
echo.
set /p choice="Seciminizi yapin (1-4): "

if "%choice%"=="1" (
    echo Guvenlik duvari kapatiliyor...
    netsh advfirewall set allprofiles state off
    echo ✅ Guvenlik duvari kapatildi!
    echo ⚠️  UYARI: Bilgisayariniz korunmasiz durumda!
) else if "%choice%"=="2" (
    echo Guvenlik duvari aciliyor...
    netsh advfirewall set allprofiles state on
    echo ✅ Guvenlik duvari acildi!
) else if "%choice%"=="3" (
    echo Port 8000 icin kural ekleniyor...
    powershell -Command "New-NetFirewallRule -DisplayName 'Etsy Manager Port 8000' -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow"
    if !errorlevel! equ 0 (
        echo ✅ Port 8000 kuralı eklendi!
    ) else (
        echo ❌ Hata: Yonetici yetkileriyle calistirin!
    )
) else if "%choice%"=="4" (
    echo Cikiliyor...
    exit /b
) else (
    echo Gecersiz secim!
)

echo.
echo Mevcut durum:
netsh advfirewall show allprofiles state

echo.
pause