@echo off
echo === PORTABLE ETSY MANAGER - OTOMATIK KURULUM ===
echo.
echo Bu script mevcut Gmail bilgilerinizi portable sisteme kopyalar
echo Boylece tekrar giris bilgisi girmenize gerek kalmaz!
echo.

cd /d "%~dp0"

echo Python kontrol ediliyor...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo HATA: Python bulunamadi!
    echo Lutfen Python 3.7+ yukleyin ve PATH'e ekleyin
    pause
    exit /b 1
)

echo.
echo === OTOMATIK KURULUM BASLIYOR ===
python auto_setup.py

echo.
if exist "quick_start.bat" (
    echo.
    echo KURULUM TAMAMLANDI!
    echo.
    choice /C YN /M "Hemen calistirmak istiyor musunuz? (Y/N)"
    if !errorlevel!==1 (
        echo.
        echo === PORTABLE ETSY MANAGER CALISTIRILIYOR ===
        call quick_start.bat
    ) else (
        echo.
        echo Daha sonra calistirmak icin: quick_start.bat
    )
) else (
    echo Kurulum basarisiz oldu
)

pause
