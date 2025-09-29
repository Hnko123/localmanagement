@echo off
echo Windows Guvenlik Duvari Port 8000 Kurulumu
echo ==========================================
echo.
echo Bu script yonetici yetkileri gerektirir!
echo.
pause

REM Port 8000 icin kural ekle
powershell -Command "New-NetFirewallRule -DisplayName 'Etsy Manager Port 8000' -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Port 8000 basariyla acildi!
    echo.
) else (
    echo.
    echo ❌ Hata: Yonetici yetkileriyle calistirin!
    echo Sag tik -> "Run as administrator"
    echo.
)

echo Mevcut guvenlik duvari kurallari kontrol ediliyor...
powershell -Command "Get-NetFirewallRule -DisplayName '*Etsy*' | Select-Object DisplayName, Enabled, Direction"

echo.
pause