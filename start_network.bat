@echo off
title Etsy Network Server - Multi-User Access
color 0A
echo.
echo ============================================
echo  ETSY ORDER MANAGEMENT - NETWORK ACCESS
echo ============================================
echo.
echo 🔌 Local Network Access Mode
echo 📡 Other computers can access from same WiFi
echo.
echo Current Network IP: 192.168.0.10
echo.
echo ============================================
echo Backend: http://192.168.0.10:8080  (API)
echo Frontend: http://192.168.0.10:5178 (App)
echo.

REM Backend'i network erişimine aç
echo 🚀 Starting Backend (Network Access)...
start "Backend-Network" /min cmd /c "cd /d %~dp0 && python -m uvicorn api:app --host 0.0.0.0 --port 8080"

REM Kısa bekleme
timeout /t 3 /nobreak >nul

REM Frontend'i network erişimine aç
echo 🚀 Starting Frontend (Network Access)...
start "Frontend-Network" /min cmd /c "cd /d %~dp0\frontend && npm run dev -- --host 0.0.0.0 --port 5178"

REM Firewall kuralları
echo 🔓 Opening Windows Firewall (Port 8080, 5178)...
powershell -Command "New-NetFirewallRule -DisplayName 'Etsy Backend API' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8080" 2>nul
powershell -Command "New-NetFirewallRule -DisplayName 'Etsy Frontend App' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5178" 2>nul
powershell -Command "New-NetFirewallRule -DisplayName 'Etsy Frontend Dev' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000" 2>nul

echo.
echo ✅ Network Mode Active!
echo.
echo 🌐 Access URLs for Local Network:
echo - Frontend: http://192.168.0.10:5178
echo - Backend: http://192.168.0.10:8080
echo.
echo 📱 Other devices on same WiFi can access using:
echo - iPhone Safari: 192.168.0.10:5178
echo - Android Chrome: 192.168.0.10:5178
echo - Desktop: 192.168.0.10:5178
echo.
echo ❗ Important Notes:
echo - All devices must be on same WiFi network
echo - Close this window to stop servers
echo - Firewall rules added automatically
echo.
echo 🚀 System ready for multi-user access!
echo.
pause
