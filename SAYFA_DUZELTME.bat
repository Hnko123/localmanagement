@echo off
echo ========================================
echo     SAYFA GEÇİŞ SORUNU - DÜZELTME
echo ========================================
echo.

cd /d "%~dp0\frontend"

echo 🔧 Çalışan port'ları durdur...
taskkill /f /im node.exe >nul 2>&1

echo 📦 React Router yükleniyor...
npm install react-router-dom@^6.8.0

echo 🔄 Cache temizleniyor...
rmdir /s /q node_modules\.vite >nul 2>&1
rmdir /s /q dist >nul 2>&1

echo 🚀 Frontend yeniden başlatılıyor...
start "Frontend Fixed" cmd /k "npm run dev"

echo ⏳ 5 saniye bekleniyor...
timeout /t 5 /nobreak >nul

echo 🌐 Tarayıcı açılıyor...
start "" "http://localhost:5173"

echo.
echo ✅ DÜZELTME TAMAMLANDI!
echo.
echo 💡 Artık tüm sayfalar çalışmalı:
echo    📊 Dashboard
echo    📦 Orders
echo    ✅ Tasks
echo    📅 Calendar
echo    💬 Chat
echo.
pause
