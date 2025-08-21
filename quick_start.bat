@echo off
echo === PORTABLE ETSY MANAGER - HAZIR SISTEM ===
echo.
echo Credentials otomatik yuklendi, hemen calistirilabilir!
echo.

cd /d "%~dp0"

echo Python kontrol ediliyor...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo HATA: Python bulunamadi!
    echo Python 3.7+ yukleyip PATH'e ekleyin
    pause
    exit /b 1
)

echo.
echo Gerekli kutuphaneler kontrol ediliyor...
python -c "import bs4" >nul 2>&1
if %errorlevel% neq 0 (
    echo BeautifulSoup4 yukleniyor...
    pip install beautifulsoup4 lxml
)

echo.
echo === CREDENTIALS HAZIR - DIREKT CALISTIRILIYOR ===
python portable_etsy_manager.py

echo.
if exist "data\etsy_orders.json" (
    echo BASARILI! JSON dosyasi olusturuldu
    echo React/Next.js icin hazir: data\etsy_orders.json
    start data
) else (
    echo Veri dosyasi olusturulamadi - loglari kontrol edin
    if exist "logs\*.log" (
        echo Son log dosyasi:
        for %%f in (logs\*.log) do echo %%f
    )
)

pause
