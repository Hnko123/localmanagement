@echo off
echo ========================================
echo   ETSY SİPARİŞ VERİLERİNİ ÇEK
echo ========================================
echo.

cd /d "%~dp0"

echo 📂 Çalışma dizini: %CD%
echo.

echo 🔧 Python kontrol ediliyor...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python bulunamadı!
    echo 📥 Python indirip yükleyin: https://python.org
    pause
    exit /b 1
)

python --version
echo ✅ Python hazır
echo.

echo 📦 Python modülleri kontrol ediliyor...
pip install -r requirements.txt --quiet

echo.
echo 📧 Gmail'den Etsy siparişleri çekiliyor...
echo ⚠️  Bu işlem birkaç dakika sürebilir...
echo.

python portable_etsy_manager.py

echo.
echo ========================================
echo             İŞLEM TAMAMLANDI
echo ========================================
echo.

if exist "data\etsy_orders.json" (
    echo ✅ BAŞARILI! Veriler hazır:
    echo.
    echo 📄 JSON Dosyası: data\etsy_orders.json
    echo 📄 CSV Dosyası:  data\etsy_orders.csv
    echo.
    
    echo 📊 Dosya boyutları:
    for %%f in (data\etsy_orders.*) do echo    %%~nxf: %%~zf bytes
    echo.
    
    echo 📂 Veri klasörünü açıyor...
    explorer data
    
) else (
    echo ❌ Veri dosyaları oluşturulamadı!
    echo.
    echo 🔍 Hata ayıklama:
    if exist "logs\*.log" (
        echo 📋 Log dosyaları:
        dir /b logs\*.log
        echo.
        echo 📖 Son log dosyasını açıyor...
        for /f %%f in ('dir /b /o:d logs\*.log') do set "lastlog=%%f"
        start "" "logs\%lastlog%"
    ) else (
        echo 📝 Log dosyası bulunamadı
    )
)

echo.
echo 💡 Sonraki çalıştırmalar sadece YENİ siparişleri çekecektir
echo.
pause
