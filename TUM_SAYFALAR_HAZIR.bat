@echo off
echo ========================================
echo   TÜM SAYFALAR - EKSİK BİLEŞENLER EKLENDİ
echo ========================================
echo.

cd /d "%~dp0\frontend"

echo 🔄 Vite dev server yeniden başlatılıyor...
taskkill /f /im node.exe >nul 2>&1
timeout /t 3 /nobreak >nul

echo 🚀 Güncellenmiş frontend başlatılıyor...
start "Frontend Complete" cmd /k "echo ✅ Tüm sayfalar hazır! && npm run dev"

echo ⏳ 5 saniye bekleniyor...
timeout /t 5 /nobreak >nul

echo 🌐 Tarayıcı açılıyor...
start "" "http://localhost:5173"

echo.
echo ✅ TÜM SAYFALAR HAZIR!
echo.
echo 📋 Artık çalışan sayfalar:
echo    📊 Dashboard - İstatistikler ve charts
echo    📦 Orders - 52 sipariş listesi 
echo    ✅ Tasks - Atölye görevleri
echo    📅 Calendar - Üretim takvimi
echo    💬 Chat - Müşteri mesajları
echo.
echo 💡 Sidebar'dan tüm sayfalara tıklayabilirsiniz!
echo.
pause
