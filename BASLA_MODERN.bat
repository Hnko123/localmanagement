@echo off
chcp 65001 >nul
title Portable Etsy Manager - Modern UI

echo.
echo ========================================
echo   PORTABLE ETSY MANAGER - MODERN UI
echo ========================================
echo.
echo 🚀 Modern 3D Kanban arayüzü başlatılıyor...
echo.

REM Modern exe dosyasını çalıştır
echo 📱 Modern UI uygulaması başlatılıyor...
start "" "portable_etsy_manager_modern.exe"

REM 3 saniye bekle
timeout /t 3 /nobreak >nul

REM Web tarayıcısını aç
echo 🌐 Web tarayıcısı açılıyor...
start "" "http://localhost:3000"

echo.
echo ✅ Modern arayüz başlatıldı!
echo.
echo 📋 Özellikler:
echo    • 3D Kanban board
echo    • Drag & Drop sipariş yönetimi
echo    • Modern gradient tasarım
echo    • Gerçek zamanlı güncelleme
echo.
echo 🌐 Tarayıcıda açılan sayfada siparişlerinizi yönetebilirsiniz
echo.
echo 💡 İpucu: Siparişleri sürükleyip bırakarak durumlarını değiştirebilirsiniz
echo.
pause
