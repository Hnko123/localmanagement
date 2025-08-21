@echo off
chcp 65001 >nul
title Portable Etsy Manager - Tam Sistem

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║               PORTABLE ETSY ORDER MANAGER                   ║
echo  ║                    FULL STACK SOLUTION                      ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🎯 Modern 3D React Frontend + FastAPI Backend
echo 📧 Gmail entegrasyonu ile otomatik sipariş çekme
echo 📊 Kanban board ile sipariş takibi
echo.

cd /d "%~dp0"

echo 📂 Çalışma dizini: %CD%
echo.

:menu
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                        MENÜ SEÇENEKLERİ                       ║
echo ╠════════════════════════════════════════════════════════════════╣
echo ║ 1. 📧 Gmail'den Etsy siparişlerini çek                        ║
echo ║ 2. 🚀 Frontend + Backend'i başlat                             ║
echo ║ 3. 🌐 Sadece Frontend'i başlat                                ║
echo ║ 4. 🔧 Sadece Backend API'yi başlat                            ║
echo ║ 5. 📊 Mevcut verileri görüntüle                               ║
echo ║ 6. ⚙️  Sistem durumunu kontrol et                             ║
echo ║ 0. 🚪 Çıkış                                                    ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set /p choice="Seçiminiz (0-6): "

if "%choice%"=="1" goto fetch_data
if "%choice%"=="2" goto start_full
if "%choice%"=="3" goto start_frontend
if "%choice%"=="4" goto start_backend
if "%choice%"=="5" goto view_data
if "%choice%"=="6" goto check_system
if "%choice%"=="0" goto exit
goto menu

:fetch_data
echo.
echo 📧 Gmail'den Etsy siparişleri çekiliyor...
call cek_verileri.bat
goto menu

:start_full
echo.
echo 🚀 Full Stack uygulama başlatılıyor...
call start_frontend.bat
goto menu

:start_frontend
echo.
echo 🌐 Frontend başlatılıyor...
cd frontend
if not exist "node_modules" (
    echo 📦 NPM modülleri yükleniyor...
    npm install
)
start "Etsy Manager Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"
echo ✅ Frontend başlatıldı: http://localhost:5173
cd ..
goto menu

:start_backend
echo.
echo 🔧 Backend API başlatılıyor...
start "Etsy Manager API" cmd /k "python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak >nul
start "" "http://localhost:8000/docs"
echo ✅ Backend API başlatıldı: http://localhost:8000
goto menu

:view_data
echo.
echo 📊 Mevcut veriler kontrol ediliyor...
if exist "data\etsy_orders.json" (
    echo ✅ Veri dosyaları mevcut:
    echo.
    for %%f in (data\etsy_orders.*) do (
        echo    📄 %%~nxf: %%~zf bytes
    )
    echo.
    set /p open="Veri klasörünü açmak ister misiniz? (y/n): "
    if /i "!open!"=="y" explorer data
) else (
    echo ❌ Veri dosyaları bulunamadı!
    echo 💡 Önce '1. Gmail'den veri çek' seçeneğini kullanın
)
goto menu

:check_system
echo.
echo ⚙️  Sistem durumu kontrol ediliyor...
echo.

echo 🔧 Python:
python --version >nul 2>&1
if %errorlevel% equ 0 (
    python --version
    echo ✅ Python kurulu
) else (
    echo ❌ Python bulunamadı
)

echo.
echo 🔧 Node.js:
node --version >nul 2>&1
if %errorlevel% equ 0 (
    node --version
    echo ✅ Node.js kurulu
) else (
    echo ❌ Node.js bulunamadı
)

echo.
echo 📁 Dosya Yapısı:
if exist "settings.json" (echo ✅ settings.json) else (echo ❌ settings.json)
if exist "api.py" (echo ✅ api.py) else (echo ❌ api.py)
if exist "frontend\package.json" (echo ✅ frontend\package.json) else (echo ❌ frontend\package.json)
if exist "config\gmail_credentials.txt" (echo ✅ config\gmail_credentials.txt) else (echo ❌ config\gmail_credentials.txt)

echo.
echo 📊 Veri Durumu:
if exist "data\etsy_orders.json" (
    echo ✅ Sipariş verileri mevcut
    for /f %%i in ('type "data\etsy_orders.json" ^| find /c "transaction_id"') do echo    📋 Yaklaşık %%i sipariş
) else (
    echo ❌ Sipariş verileri yok
)

goto menu

:exit
echo.
echo 👋 Görüşmek üzere!
pause
exit

echo.
pause
