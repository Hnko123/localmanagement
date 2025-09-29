# VS Code Extension'ları Tam Yetki Yapılandırması
Write-Host "=== VS CODE EXTENSION YETKİLERİ YAPILANDIRILIYOR ===" -ForegroundColor Green

# Python yolunu ayarla
$pythonPath = "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python312\python.exe"

if (Test-Path $pythonPath) {
    Write-Host "✅ Python bulundu: $pythonPath" -ForegroundColor Green
} else {
    Write-Host "❌ Python bulunamadı: $pythonPath" -ForegroundColor Red
    $pythonPath = (Get-Command python -ErrorAction SilentlyContinue).Source
    if ($pythonPath) {
        Write-Host "📍 Alternatif Python: $pythonPath" -ForegroundColor Yellow
    }
}

# VS Code User Settings dosyasını bul
$userSettingsPath = "$env:APPDATA\Code\User\settings.json"

Write-Host "`nVS Code kullanıcı ayarlarını yapılandırıyor..." -ForegroundColor Yellow

$globalSettings = @{
    # Python Ayarları
    "python.defaultInterpreterPath" = $pythonPath
    "python.pythonPath" = $pythonPath
    "python.terminal.activateEnvironment" = $true
    "python.terminal.executeInFileDir" = $true
    
    # Cline Extension - Tam Yetki (Tüm varyantlar)
    "cline.autoApprove" = $true
    "cline.autoApproveFileEdits" = $true
    "cline.autoApproveFileCreation" = $true
    "cline.autoApproveFileDeletion" = $true
    "cline.autoApproveTerminalCommands" = $true
    "cline.maxRequestsPerTask" = 500
    "cline.alwaysAllowReadOnly" = $true
    "cline.alwaysAllowWriteOnly" = $true
    "cline.experimentalTerminalCommands" = $true
    
    # Roo-Cline Extension
    "roo-cline.autoApprove" = $true
    "roo-cline.autoApproveFileEdits" = $true
    "roo-cline.autoApproveFileCreation" = $true
    "roo-cline.autoApproveFileDeletion" = $true
    "roo-cline.autoApproveTerminalCommands" = $true
    "roo-cline.maxRequestsPerTask" = 500
    "roo-cline.alwaysAllowReadOnly" = $true
    "roo-cline.alwaysAllowWriteOnly" = $true
    
    # Claude-dev Extension  
    "claude-dev.autoApprove" = $true
    "claude-dev.autoApproveFileEdits" = $true
    "claude-dev.autoApproveFileCreation" = $true
    "claude-dev.autoApproveFileDeletion" = $true
    "claude-dev.autoApproveTerminalCommands" = $true
    
    # GitHub Copilot - Tam Yetki
    "github.copilot.enable" = @{
        "*" = $true
        "yaml" = $true
        "plaintext" = $true
        "markdown" = $true
        "python" = $true
        "javascript" = $true
        "typescript" = $true
        "html" = $true
        "css" = $true
        "json" = $true
        "jsonc" = $true
        "powershell" = $true
        "shellscript" = $true
    }
    
    # Güvenlik - Gevşek
    "security.workspace.trust.untrustedFiles" = "open"
    "security.workspace.trust.enabled" = $false
    
    # Dosya İşlemleri - Onaysız
    "explorer.confirmDelete" = $false
    "explorer.confirmDragAndDrop" = $false
    "files.autoSave" = "afterDelay"
    
    # Terminal - Tam Erişim
    "terminal.integrated.confirmOnExit" = "never"
    "terminal.integrated.confirmOnKill" = "never"
    "terminal.integrated.enableMultiLinePasteWarning" = $false
    "terminal.integrated.showExitAlert" = $false
    
    # MCP Support
    "mcp.enabled" = $true
    "mcp.autoStart" = $true
}

try {
    if (Test-Path $userSettingsPath) {
        $currentSettings = Get-Content $userSettingsPath -Raw | ConvertFrom-Json -AsHashtable
    } else {
        $currentSettings = @{}
        New-Item -Path (Split-Path $userSettingsPath) -ItemType Directory -Force -ErrorAction SilentlyContinue
    }
    
    # Ayarları birleştir
    foreach ($key in $globalSettings.Keys) {
        $currentSettings[$key] = $globalSettings[$key]
    }
    
    # JSON olarak kaydet
    $currentSettings | ConvertTo-Json -Depth 10 | Set-Content $userSettingsPath -Encoding UTF8
    Write-Host "✅ VS Code kullanıcı ayarları güncellendi" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Ayarlar güncellenemedi: $_" -ForegroundColor Red
}

Write-Host "`n=== YAPILANDIRMA TAMAMLANDI ===" -ForegroundColor Green
Write-Host "Cline, Copilot ve diğer extension'lar artık tam yetkiye sahip!" -ForegroundColor Yellow
Write-Host "MCP sunucularını kurmak için: .\setup_mcp_servers.ps1" -ForegroundColor Cyan
Write-Host "VS Code'u yeniden başlatın." -ForegroundColor Yellow