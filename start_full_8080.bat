@echo off
title Etsy Manager - Quick Start (Port 8080)
color 0B
echo.
echo ==========================================
echo  ETSY MANAGER - HIZLI BASLAT (PORT 8080)
echo ==========================================
echo.
echo 🔄 Backend ve Frontend birlikte baslatiliyor...
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo ==========================================

REM Backend'i arka planda başlat
echo 🚀 Backend baslatiliyor (Port 8080)...
start "Backend" /min python start_web.py

REM 3 saniye bekle
timeout /t 3 /nobreak >nul

REM Frontend'e geç ve başlat
echo 🚀 Frontend baslatiliyor (Port 5173)...
cd frontend
start "Frontend" npm run dev

REM Ana dizine geri dön
cd ..

echo.
echo ✅ Her iki servis de baslatildi!
echo.
echo 🌐 Erisim adresleri:
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:8080
echo.
echo 📝 Terminal pencerelerini kapatmayin!
echo 🛑 Durdurmak icin terminal pencerelerinde Ctrl+C basin
echo.
echo Tarayici otomatik olarak acilacak...

REM Tarayıcıyı aç
timeout /t 2 /nobreak >nul
start http://localhost:5173

pause