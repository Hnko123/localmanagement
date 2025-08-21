@echo off
echo === PORTABLE ETSY MANAGER ===
echo.
echo Bu portable uygulama her bilgisayarda calisir.
echo Tum dosyalar relative path'lerle organize edilmistir.
echo.

REM Mevcut dizini portable_etsy_manager olarak ayarla
cd /d "%~dp0"

echo Calisma dizini: %CD%
echo.

echo Python kontrol ediliyor...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo HATA: Python bulunamadi!
    echo Lutfen Python 3.7+ yukleyin ve PATH'e ekleyin
    pause
    exit /b 1
)

python --version
echo.

echo Gerekli Python kutuphaneleri kontrol ediliyor...
python -c "import imaplib, email, json, csv, pathlib, bs4, re, datetime" >nul 2>&1
if %errorlevel% neq 0 (
    echo Bazi kutuphaneler eksik, yukleniyor...
    pip install beautifulsoup4 lxml
    echo.
)

echo Dosya yapisi kontrol ediliyor...
if not exist "settings.json" (
    echo HATA: settings.json bulunamadi!
    echo Bu dosya portable_etsy_manager klasorunun ana dizininde olmali
    pause
    exit /b 1
)

if not exist "config\gmail_credentials.txt" (
    echo HATA: Gmail credentials bulunamadi!
    echo Lutfen config\gmail_credentials.txt dosyasini olusturun:
    echo Satir 1: Gmail adresi
    echo Satir 2: 16 haneli uygulama sifresi
    pause
    exit /b 1
)

echo Klasor yapisi:
tree /f /a
echo.

echo === PORTABLE ETSY MANAGER CALISTIRILIYOR ===
echo.

python portable_etsy_manager.py

echo.
echo === ISLEM TAMAMLANDI ===

if exist "data\etsy_orders.json" (
    echo BASARILI! Veriler hazir:
    echo.
    echo DOSYALAR:
    dir /b data\*.*
    echo.
    echo JSON dosya boyutu:
    dir "data\etsy_orders.json" | find ".json"
    echo.
    echo Veri klasorunu aciyor...
    start data
) else (
    echo Veri dosyalari olusturulamadi
)

echo.
echo LOG DOSYALARI:
if exist "logs\*.log" (
    dir /b logs\*.log
    echo Son log dosyasi:
    for %%f in (logs\*.log) do set "lastlog=%%f"
    echo %lastlog%
) else (
    echo Log dosyasi bulunamadi
)

echo.
echo KULLANIM KILAVUZU:
echo 1. Bu klasoru baska bilgisayara kopyalayabilirsiniz
echo 2. Sadece config\gmail_credentials.txt dosyasini guncellemeniz yeterli
echo 3. settings.json ile ayarlari degistirebilirsiniz
echo 4. data\ klasorundeki dosyalar React/Next.js icin hazir

pause
