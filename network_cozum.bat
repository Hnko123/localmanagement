@echo off
title Etsy Manager - Network Cozumu
color 0A
echo.
echo ==========================================
echo  ETSY MANAGER - NETWORK COZUM ASISTANI
echo ==========================================
echo.
echo Sorun: Frontend ile Backend arasinda baglanti hatasi
echo Sebep: Windows Guvenlik Duvari port 8000'i engelliyor
echo.
echo COZUM SECENEKLERI:
echo ==================
echo.
echo 1. Backend'i port 8080'e tasi (UYGULANDI - Onerilen)
echo 2. Port 8000 icin guvenlik duvari kurali ekle
echo 3. Geçici olarak guvenlik duvarini kapat
echo 4. Network durumunu kontrol et
echo 5. Tum portlari test et
echo 0. Cikis
echo.
set /p choice="Seciminizi yapin (0-5): "

if "%choice%"=="1" (
    echo.
    echo ✅ Backend port 8080'e degistirildi!
    echo.
    echo Degisiklikler:
    echo - start_web.py: Port 8000 → 8080
    echo - App.jsx: API URL 8000 → 8080  
    echo - Login.jsx: API URL 8000 → 8080
    echo - Register.jsx: API URL 8000 → 8080
    echo.
    echo Simdi uygulamayi yeniden baslatin:
    echo 1. Backend: python start_web.py
    echo 2. Frontend: npm run dev (frontend klasoründe)
    echo.

) else if "%choice%"=="2" (
    echo.
    echo Port 8000 ve 8080 icin guvenlik duvari kurallari ekleniyor...
    echo.
    echo Yonetici yetkileri gerekiyor...
    powershell -Command "Start-Process cmd -ArgumentList '/c netsh advfirewall firewall add rule name=\"Etsy Manager Port 8000\" dir=in action=allow protocol=TCP localport=8000 && netsh advfirewall firewall add rule name=\"Etsy Manager Port 8080\" dir=in action=allow protocol=TCP localport=8080 && echo. && echo ✅ Kurallar eklendi! && pause' -Verb RunAs"

) else if "%choice%"=="3" (
    echo.
    echo ⚠️  UYARI: Guvenlik duvari geçici olarak kapatilacak!
    echo Bu sadece test amacli kullanilmalidir.
    echo.
    set /p confirm="Devam etmek istiyor musunuz? (E/H): "
    if /i "%confirm%"=="E" (
        echo.
        echo Guvenlik duvari kapatiliyor...
        powershell -Command "Start-Process cmd -ArgumentList '/c netsh advfirewall set allprofiles state off && echo. && echo ✅ Guvenlik duvari kapatildi! && echo ⚠️  Test bitince tekrar acmayi unutmayin! && pause' -Verb RunAs"
    )

) else if "%choice%"=="4" (
    echo.
    echo Network durumu kontrol ediliyor...
    echo.
    echo 🔍 Aktif baglanti portlari:
    netstat -an | findstr ":8000\|:8080\|:5173"
    echo.
    echo 🔍 Guvenlik duvari durumu:
    netsh advfirewall show allprofiles state
    echo.
    echo 🔍 Etsy Manager kurallari:
    netsh advfirewall firewall show rule name="Etsy Manager Port 8000" 2>nul || echo Port 8000 kurali yok
    netsh advfirewall firewall show rule name="Etsy Manager Port 8080" 2>nul || echo Port 8080 kurali yok
    echo.

) else if "%choice%"=="5" (
    echo.
    echo Port testi baslatiliyor...
    echo.
    echo Test ediliyor: Port 8000
    powershell -Command "Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet" && echo ✅ Port 8000 acik || echo ❌ Port 8000 kapali
    
    echo Test ediliyor: Port 8080  
    powershell -Command "Test-NetConnection -ComputerName localhost -Port 8080 -InformationLevel Quiet" && echo ✅ Port 8080 acik || echo ❌ Port 8080 kapali
    
    echo Test ediliyor: Port 5173
    powershell -Command "Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet" && echo ✅ Port 5173 acik || echo ❌ Port 5173 kapali
    echo.

) else if "%choice%"=="0" (
    echo Cikiliyor...
    exit /b
) else (
    echo Gecersiz secim!
    goto :eof
)

echo.
echo ==========================================
echo  ONEMLI NOTLAR:
echo ==========================================
echo.
echo ✅ Backend artik port 8080'de calisiyor
echo ✅ Frontend port 5173'te calisiyor  
echo ✅ API cagrilari 8080'e yonlendiriliyor
echo.
echo 🚀 BASLAT:
echo 1. Backend: python start_web.py
echo 2. Frontend: cd frontend ^&^& npm run dev
echo.
echo 🌐 ERIS:
echo - Backend: http://localhost:8080
echo - Frontend: http://localhost:5173
echo.
pause