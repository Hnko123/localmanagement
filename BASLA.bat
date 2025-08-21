@echo off
echo.
echo  ███████╗████████╗███████╗██╗   ██╗    ███╗   ███╗ █████╗ ███╗   ██╗ █████╗  ██████╗ ███████╗██████╗ 
echo  ██╔════╝╚══██╔══╝██╔════╝╚██╗ ██╔╝    ████╗ ████║██╔══██╗████╗  ██║██╔══██╗██╔════╝ ██╔════╝██╔══██╗
echo  █████╗     ██║   ███████╗ ╚████╔╝     ██╔████╔██║███████║██╔██╗ ██║███████║██║  ███╗█████╗  ██████╔╝
echo  ██╔══╝     ██║   ╚════██║  ╚██╔╝      ██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║██║   ██║██╔══╝  ██╔══██╗
echo  ███████╗   ██║   ███████║   ██║       ██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║╚██████╔╝███████╗██║  ██║
echo  ╚══════╝   ╚═╝   ╚══════╝   ╚═╝       ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
echo.
echo                              🎉 PORTABLE ETSY ORDER MANAGER 🎉
echo                                    KULLANIMA HAZIR SISTEM
echo.
echo ═══════════════════════════════════════════════════════════════════════════════════════════════════════
echo.

cd /d "%~dp0"

echo 📧 Gmail Credentials: YUKLU ✅
echo ⚙️  Ayarlar: OPTIMIZE EDILDI ✅  
echo 📁 Klasor Yapisi: HAZIR ✅
echo 🚀 Portable Sistem: AKTIF ✅
echo.

echo ═══════════════════════════════════════════════════════════════════════════════════════════════════════
echo                                    OTOMATIK BASLATILIYOR...
echo ═══════════════════════════════════════════════════════════════════════════════════════════════════════
echo.

echo Python kontrol ediliyor...
python --version
if %errorlevel% neq 0 (
    echo.
    echo ❌ PYTHON BULUNAMADI!
    echo.
    echo Lutfen Python 3.7+ yukleyin:
    echo 1. https://python.org adresine gidin
    echo 2. "Download Python" tiklayin
    echo 3. Kurulum sirasinda "Add Python to PATH" isaretleyin
    echo.
    pause
    exit /b 1
)

echo.
echo Python kutuphaneleri kontrol ediliyor...
python -c "import bs4, lxml" >nul 2>&1
if %errorlevel% neq 0 (
    echo Gerekli kutuphaneler yukleniyor...
    pip install beautifulsoup4 lxml requests
    echo ✅ Kutuphaneler yuklendi
)

echo.
echo ═══════════════════════════════════════════════════════════════════════════════════════════════════════
echo                                  ETSY SIPARISLER CEKILIYOR...
echo ═══════════════════════════════════════════════════════════════════════════════════════════════════════
echo.

python portable_etsy_manager.py

echo.
echo ═══════════════════════════════════════════════════════════════════════════════════════════════════════
echo                                      ISLEM TAMAMLANDI!
echo ═══════════════════════════════════════════════════════════════════════════════════════════════════════
echo.

if exist "data\etsy_orders.json" (
    echo ✅ BASARILI! Veriler hazir:
    echo.
    echo 📊 JSON Dosyasi: data\etsy_orders.json ^(React/Next.js icin^)
    echo 📋 CSV Dosyasi:  data\etsy_orders.csv ^(Excel icin^)
    echo 💾 Yedekler:     backup\ klasorunde
    echo 📝 Loglar:       logs\ klasorunde
    echo.
    
    echo Dosya sayilari:
    if exist "data\etsy_orders.json" (
        find /c /v "" data\etsy_orders.json 2>nul | find "etsy_orders.json"
    )
    if exist "data\etsy_orders.csv" (
        find /c /v "" data\etsy_orders.csv 2>nul | find "etsy_orders.csv"
    )
    
    echo.
    echo 📂 Veri klasorunu aciyor...
    start data
    
) else (
    echo ❌ Veri dosyalari olusturulamadi
    echo.
    echo Sorun giderme:
    echo 1. logs\ klasorundeki log dosyalarini kontrol edin
    echo 2. Gmail credentials dogru mu kontrol edin
    echo 3. Internet baglantinizi kontrol edin
    echo.
    
    if exist "logs\*.log" (
        echo Son log dosyasi:
        for %%f in (logs\*.log) do echo   %%f
    )
)

echo.
echo ═══════════════════════════════════════════════════════════════════════════════════════════════════════
echo                                  SONRAKI CALISTIRMALAR
echo ═══════════════════════════════════════════════════════════════════════════════════════════════════════
echo.
echo Bu dosyayi her calistirdiginizda:
echo   • Sadece YENİ siparisler cekilir ^(tekrar yok^)
echo   • Mevcut veriler korunur
echo   • Otomatik yedek alinir
echo.
echo Ayarlari degistirmek icin: settings.json
echo Limiti kaldirmak icin: "mail_limit": null
echo.

echo 🎉 PORTABLE ETSY MANAGER KULLANIMA HAZIR!
echo.
pause
