@echo off
chcp 65001 >nul 2>&1
cls
echo.
echo ================================================
echo   🛑 ETSY ORDER MANAGEMENT - HOST STOPPER
echo ================================================
echo.
echo Bu script şunları yapacaktır:
echo • Tüm sunucuları durduracaktır
echo • Ağ bağlantılarını kapatacaktır
echo • Veritabanı bağlantılarını kesmektedir
echo.
echo Devam etmek için bir tuşa basın...
pause >nul

echo.
echo ================================================
echo              SISTEM DURDURULUYOR...
echo ================================================
echo.

REM Python process'leri durdur
echo [1/3] Backend süreciklerini durduruyorum...
taskkill /F /FI "IMAGENAME eq python.exe" /FI "WINDOWTITLE eq start_web.py*" >nul 2>&1
taskkill /F /FI "IMAGENAME eq python.exe" /FI "WINDOWTITLE eq start_network.bat*" >nul 2>&1
for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq python.exe" /NH ^| findstr python.exe') do (
    if not %%i==No (
        taskkill /PID %%i /F >nul 2>&1
    )
)

REM Node.js process'leri durdur
echo [2/3] Frontend süreciklerini durduruyorum...
taskkill /F /FI "IMAGENAME eq node.exe" >nul 2>&1
for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq node.exe" /NH ^| findstr node.exe') do (
    if not %%i==No (
        taskkill /PID %%i /F >nul 2>&1
    )
)

REM Uvicorn/FastAPI process'leri durdur
echo [3/3] Tüm ağ işlemlerini durduruyorum...
netstat -ano | findstr :8080 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
        taskkill /PID %%a /F >nul 2>&1
    )
)
netstat -ano | findstr :5178 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5178 ^| findstr LISTENING') do (
        taskkill /PID %%a /F >nul 2>&1
    )
)

REM Port'lari kontrol et
timeout /t 2 /nobreak >nul
netstat -ano | findstr :8080 >nul 2>&1
if %errorlevel% equ 0 (
    echo Uyari: Port 8080 hala kullaniliyor.
) else (
    echo Port 8080 serbest.
)

netstat -ano | findstr :5178 >nul 2>&1
if %errorlevel% equ 0 (
    echo Uyari: Port 5178 hala kullaniliyor.
) else (
    echo Port 5178 serbest.
)

echo.
echo ================================================
echo          ✅ SISTEM TAMAMEN DURDURULDU!
echo ================================================
echo.
echo Tüm sunucular kapatıldı.
echo Veritabanı bağlantıları kesildi.
echo Ağ erişimi durduruldu.
echo.
echo ████████╗███████╗██████╗░░█████╗░░░░░░██╗░░██╗████████╗████████╗███████╗
echo ╚══██╔══╝██╔════╝██╔══██╗██╔══██╗░░░░░██║░░██║╚══██╔══╝╚══██╔══╝██╔════╝
echo ░░░██║░░░█████╗░░██████╔╝██║░░╚═╝░░░░░███████║░░░██║░░░░░░██║░░░█████╗░░
echo ░░░██║░░░██╔══╝░░██╔══██╗██║░░██╗░░░░░██╔══██║░░░██║░░░░░░██║░░░██╔══╝░░
echo ░░░██║░░░███████╗██║░░██║╚█████╔╝░░░░░██║░░██║░░░██║░░░░░░██║░░░███████╗
echo ░░░╚═╝░░░╚══════╝╚═╝░░╚═╝░╚════╝░░░░░░╚═╝░░╚═╝░░░╚═╝░░░░░░╚═╝░░░╚══════╝
echo.
echo İYİ ÇALIŞMALAR! 🎉
echo Sisteminizi yeniden başlatmak için LAUNCH_HOST.bat kullanın
echo ================================================
echo.
timeout /t 3 /nobreak >nul
echo Pencere 3 saniye sonra kapatılacak...
timeout /t 3 /nobreak >nul
