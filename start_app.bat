@echo off
echo ========================================
echo Portable Etsy Manager - Baslatiliyor...
echo ========================================
echo.

cd /d "%~dp0"

REM Virtual environment'i aktif et
call .venv\Scripts\Activate.bat

REM Uygulamayi calistir
python portable_etsy_manager.py

echo.
echo ========================================
echo Uygulama tamamlandi.
echo ========================================
pause
