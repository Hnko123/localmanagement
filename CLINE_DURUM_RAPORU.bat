@echo off
echo === CLINE EXTENSION DURUMU RAPORU ===
echo.

echo 1. Yüklü VS Code Extension'ları:
code --list-extensions | findstr /i "cline\|claude\|anthropic"

echo.
echo 2. VS Code Global Ayarları:
findstr /i "cline\|claude" "%APPDATA%\Code\User\settings.json"

echo.
echo 3. Workspace Ayarları:
if exist ".vscode\settings.json" (
    findstr /i "cline\|claude" ".vscode\settings.json"
) else (
    echo Workspace settings.json bulunamadı
)

echo.
echo 4. VS Code Sürümü:
code --version

echo.
echo === RAPOR TAMAMLANDI ===
echo VS Code'u yeniden başlatmayı unutmayın!
pause