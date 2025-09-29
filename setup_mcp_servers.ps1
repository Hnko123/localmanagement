# MCP Sunucularını Kurulum ve Yapılandırma Script'i
# Bu script Model Context Protocol sunucularını kurar ve yapılandırır

Write-Host "=== MCP SUNUCULARI KURULUMU ===" -ForegroundColor Green

# Node.js kurulu mu kontrol et
try {
    $nodeVersion = node --version
    Write-Host "Node.js Versiyonu: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js bulunamadı! Lütfen Node.js'i kurun." -ForegroundColor Red
    Write-Host "https://nodejs.org adresinden indirin." -ForegroundColor Yellow
    exit 1
}

# MCP Sunucularını kur
Write-Host "`nMCP Sunucularını kuruyor..." -ForegroundColor Yellow

$mcpServers = @(
    "@modelcontextprotocol/server-filesystem",
    "@modelcontextprotocol/server-brave-search", 
    "@modelcontextprotocol/server-puppeteer",
    "@modelcontextprotocol/server-github",
    "@modelcontextprotocol/server-sqlite",
    "@modelcontextprotocol/server-postgres"
)

foreach ($server in $mcpServers) {
    Write-Host "Kuruyor: $server" -ForegroundColor Cyan
    try {
        npm install -g $server
        Write-Host "✅ Başarılı: $server" -ForegroundColor Green
    } catch {
        Write-Host "❌ Hata: $server - $($_)" -ForegroundColor Red
    }
}

Write-Host "`n=== KURULUM TAMAMLANDI ===" -ForegroundColor Green
Write-Host "MCP sunucuları artık Cline ve diğer extension'lar tarafından kullanılabilir." -ForegroundColor Yellow
Write-Host "VS Code'u yeniden başlatmanız önerilir." -ForegroundColor Yellow