@echo off
echo ========================================
echo    HIZLI DÜZELTME - Router Olmadan
echo ========================================
echo.

cd /d "%~dp0\frontend"

echo 🔄 Vite cache temizleniyor...
rmdir /s /q node_modules\.vite >nul 2>&1

echo 🔄 Vite dev server yeniden başlatılıyor...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

start "Frontend Clean" cmd /k "npm run dev"

echo ⏳ 5 saniye bekleniyor...
timeout /t 5 /nobreak >nul

echo 🌐 Tarayıcı açılıyor...
start "" "http://localhost:5173"

echo.
echo ✅ DÜZELTME TAMAMLANDI!
echo.
echo 💡 Şimdi sidebar menüsü çalışmalı!
echo.
pause
