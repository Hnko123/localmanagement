# =============================================================================
# 🚀 ETSY ORDER MANAGEMENT - CLIENT SETUP SCRIPT
# =============================================================================
# Automatic client setup for team members joining the shared dashboard
# =============================================================================

param(
    [string]$AdminIP = "auto",
    [string]$ForceIP = "",
    [switch]$SkipNetworkCheck,
    [switch]$AutoOpenBrowser
)

# =============================================================================
# CONFIGURATION
# =============================================================================

$FRONTEND_PORT = "5178"
$BACKEND_PORT = "8080"
$SETUP_VERSION = "1.0"
$REQUIRED_ADMIN_EMAIL = "etsyortakk@gmail.com"

# =============================================================================
# COLORS AND LOGGING
# =============================================================================

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    param([string]$Text)
    Write-Host ("=" * 80) -ForegroundColor Cyan
    Write-Host ("    $Text") -ForegroundColor Yellow
    Write-Host ("=" * 80) -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Message)
    Write-Host ("[SETUP] $Message") -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host ("[WARNING] $Message") -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host ("[ERROR] $Message") -ForegroundColor Red
}

# =============================================================================
# NETWORK UTILITIES
# =============================================================================

function Test-InternetConnection {
    Write-Step "Testing internet connection..."
    try {
        $response = Invoke-WebRequest -Uri "https://httpbin.org/ip" -TimeoutSec 5 -ErrorAction Stop
        Write-Step "✅ Internet connection OK"
        return $true
    } catch {
        Write-Warning "❌ No internet connection detected"
        return $false
    }
}

function Get-LocalIPAddresses {
    $localIPs = @()
    try {
        $adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" -and $_.Name -notlike "*Loopback*" }
        foreach ($adapter in $adapters) {
            $addresses = Get-NetIPAddress -InterfaceIndex $adapter.InterfaceIndex -AddressFamily IPv4
            foreach ($address in $addresses) {
                if ($address.IPAddress -like "192.168.*" -or $address.IPAddress -like "10.*" -or $address.IPAddress -like "172.*") {
                    $localIPs += $address.IPAddress
                }
            }
        }
    } catch {
        Write-Warning "Could not enumerate network adapters (requires admin permissions)"
        # Fallback to IP configuration
        try {
            $ipLines = & ipconfig | findstr IPv4
            foreach ($line in $ipLines) {
                if ($line -match "(\d+\.\d+\.\d+\.\d+)") {
                    $ip = $matches[1]
                    if ($ip -like "192.168.*" -or $ip -like "10.*" -or $ip -like "172.*") {
                        $localIPs += $ip
                    }
                }
            }
        } catch {
            Write-Error "Could not determine local IP address"
        }
    }

    return $localIPs | Sort-Object -Unique
}

function Find-ServerIP {
    param([string]$Hint)

    Write-Step "Detecting server IP address..."

    if ($ForceIP -and $ForceIP -ne "") {
        Write-Step "Using forced IP address: $ForceIP"
        return $ForceIP
    }

    if ($Hint -and $Hint -ne "auto") {
        Write-Step "Testing provided IP hint: $Hint"
        if (Test-ServerConnection $Hint) {
            return $Hint
        }
    }

    Write-Step "Scanning local network for Etsy Order Management server..."
    $localIPs = Get-LocalIPAddresses

    foreach ($baseIP in $localIPs) {
        $networkRange = $baseIP -replace "\.\d+$", "."
        Write-Step "Scanning network: ${networkRange}0/24 (this may take a moment...)"

        # Test a few common IPs first
        $testIPs = @("1", "100", "101", "150", "200")

        foreach ($lastOctet in $testIPs) {
            $testIP = "${networkRange}${lastOctet}"
            if (Test-ServerConnection $testIP -Timeout 2) {
                Write-Step "✅ Found server at: $testIP"
                return $testIP
            }
        }
    }

    Write-Error "Could not automatically detect server IP"
    Write-Host ""
    Write-Host "Manual IP Entry:" -ForegroundColor Yellow
    Write-Host "Please enter the server IP address provided by your admin:" -ForegroundColor White
    $manualIP = Read-Host
    return $manualIP
}

function Test-ServerConnection {
    param([string]$IP, [int]$Timeout = 3)

    try {
        $url = "http://${IP}:${BACKEND_PORT}/api/test"
        $response = Invoke-WebRequest -Uri $url -TimeoutSec $Timeout -ErrorAction Stop -Method GET

        if ($response.StatusCode -eq 200) {
            $content = ConvertFrom-Json $response.Content
            if ($content.message -eq "Backend is working!") {
                return $true
            }
        }
    } catch {
        # Server not found on this IP/port
    }

    return $false
}

function Test-FrontendConnection {
    param([string]$IP)

    try {
        $url = "http://${IP}:${FRONTEND_PORT}"
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 5 -ErrorAction Stop -Method GET

        if ($response.StatusCode -eq 200) {
            return $true
        }
    } catch {
        return $false
    }

    return $false
}

# =============================================================================
# SYSTEM CHECKS
# =============================================================================

function Test-Prerequisites {
    Write-Step "Checking prerequisites..."

    # Check PowerShell version
    $psVersion = $PSVersionTable.PSVersion.Major
    Write-Step "PowerShell version: $psVersion"
    if ($psVersion -lt 5) {
        Write-Error "This script requires PowerShell 5.0 or higher"
        exit 1
    }

    # Check if running as administrator (optional warning)
    $isAdmin = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
    if (-not $isAdmin.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Write-Warning "Running as non-administrator - some network checks may be limited"
    }

    Write-Step "✅ Prerequisites OK"
}

# =============================================================================
# FIREWALL CONFIGURATION
# =============================================================================

function Configure-Firewall {
    Write-Step "Checking Windows Firewall configuration..."

    $firewallRules = @(
        @{
            Name = "Etsy Order Management - Custom Ports"
            DisplayName = "Etsy Order Management"
            Direction = "Inbound"
            Action = "Allow"
            Protocol = "TCP"
            LocalPort = "$FRONTEND_PORT,$BACKEND_PORT"
        }
    )

    foreach ($rule in $firewallRules) {
        try {
            $existingRule = Get-NetFirewallRule -DisplayName $rule.DisplayName -ErrorAction SilentlyContinue

            if (-not $existingRule) {
                New-NetFirewallRule @rule -ErrorAction Stop | Out-Null
                Write-Step "✅ Created firewall rule: $($rule.DisplayName)"
            } else {
                Write-Step "ℹ️ Firewall rule already exists: $($rule.DisplayName)"
            }
        } catch {
            Write-Warning "Could not configure firewall rule: $($_.Exception.Message)"
            Write-Warning "You may need to run as Administrator or manually open ports $FRONTEND_PORT, $BACKEND_PORT"
        }
    }
}

# =============================================================================
# USER REGISTRATION
# =============================================================================

function Register-UserAccount {
    param([string]$ServerIP)

    Write-Step "Setting up user account..."

    $userData = @{
        username = "client_" + [Environment]::UserName.ToLower() + "_" + (Get-Random -Minimum 1000 -Maximum 9999)
        email = [Environment]::UserName.ToLower() + "@local.team"
        full_name = [Environment]::UserName
        password = "welcome123"  # Default password, user can change later
    }

    try {
        $jsonData = ConvertTo-Json $userData -Compress
        $url = "http://${ServerIP}:${BACKEND_PORT}/api/auth/register"
        $response = Invoke-WebRequest -Uri $url -Method POST -Body $jsonData -ContentType "application/json" -TimeoutSec 10

        if ($response.StatusCode -eq 200) {
            $result = ConvertFrom-Json $response.Content
            Write-Step "✅ User account created successfully!"
            Write-Step "Username: $($result.username)"
            Write-Step "Password: $($userData.password)"
            Write-Step "Email: $($result.email)"

            return @{
                Success = $true
                Username = $result.username
                Password = $userData.password
                UserID = $result.id
            }
        }
    } catch {
        Write-Error "Failed to create user account: $($_.Exception.Message)"
        return @{ Success = $false }
    }

    return @{ Success = $false }
}

# =============================================================================
# CONNECTION TESTING
# =============================================================================

function Test-FullConnection {
    param([string]$ServerIP)

    Write-Step "Testing full connection..."

    $tests = @(
        @{
            Name = "Backend API"
            URL = "http://${ServerIP}:${BACKEND_PORT}/api/test"
            ExpectedStatus = 200
        },
        @{
            Name = "Frontend App"
            URL = "http://${ServerIP}:${FRONTEND_PORT}"
            ExpectedStatus = 200
        }
    )

    $results = @{}

    foreach ($test in $tests) {
        try {
            $response = Invoke-WebRequest -Uri $test.URL -TimeoutSec 5 -ErrorAction Stop
            if ($response.StatusCode -eq $test.ExpectedStatus) {
                Write-Step "✅ $($test.Name): Connected"
                $results[$test.Name] = $true
            } else {
                Write-Error "❌ $($test.Name): Wrong status code ($($response.StatusCode))"
                $results[$test.Name] = $false
            }
        } catch {
            Write-Error "❌ $($test.Name): Connection failed"
            Write-Error $_.Exception.Message
            $results[$test.Name] = $false
        }
    }

    $allPassed = ($results.Values | Where-Object { $_ -eq $false }).Count -eq 0

    if ($allPassed) {
        Write-Step "🎉 All connection tests passed!"
        return $true
    } else {
        Write-Error "Some connections failed. Please check server status."
        return $false
    }
}

# =============================================================================
# BROWSER LAUNCHING
# =============================================================================

function Open-Browser {
    param([string]$ServerIP)

    if (-not $AutoOpenBrowser) {
        Write-Host ""
        $openNow = Read-Host "Open browser to Etsy Order Management now? (Y/N)"
        if ($openNow -notlike "y*") {
            return
        }
    }

    Write-Step "Launching browser..."

    $url = "http://${ServerIP}:${FRONTEND_PORT}"
    try {
        Start-Process $url
        Write-Step "✅ Browser opened at: $url"
    } catch {
        Write-Error "Could not open browser automatically"
        Write-Host "Please manually open: $url" -ForegroundColor Yellow
    }
}

# =============================================================================
# CONFIGURATION FILE
# =============================================================================

function Create-ConfigFile {
    param([string]$ServerIP, [hashtable]$UserInfo)

    $configDir = "$env:USERPROFILE\.etsy-order-management"
    $configFile = "$configDir\client-config.json"

    # Create directory if it doesn't exist
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }

    $config = @{
        version = $SETUP_VERSION
        server_ip = $ServerIP
        server_ports = @{
            frontend = $FRONTEND_PORT
            backend = $BACKEND_PORT
        }
        user = $UserInfo
        setup_date = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        notes = "Client configuration for Etsy Order Management system"
    }

    $jsonConfig = ConvertTo-Json $config -Depth 10
    $jsonConfig | Set-Content -Path $configFile -Encoding UTF8

    Write-Step "✅ Configuration saved to: $configFile"

    return $configFile
}

# =============================================================================
# MAIN SETUP FUNCTION
# =============================================================================

function Start-ClientSetup {
    Write-Header "ETSY ORDER MANAGEMENT - CLIENT SETUP v$SETUP_VERSION"

    Write-Host ""
    Write-Host "This script will:" -ForegroundColor Cyan
    Write-Host "  • Detect the server IP automatically"
    Write-Host "  • Test network connections"
    Write-Host "  • Create a user account for you"
    Write-Host "  • Configure firewall rules"
    Write-Host "  • Launch the browser with your login"
    Write-Host ""

    # Initial checks
    if (-not $SkipNetworkCheck) {
        $hasInternet = Test-InternetConnection
        if (-not $hasInternet) {
            Write-Warning "No internet connection. Network features may be limited."
        }
    }

    Test-Prerequisites

    # Configure firewall
    Configure-Firewall

    # Detect server IP
    $serverIP = Find-ServerIP -Hint $AdminIP

    if (-not $serverIP) {
        Write-Error "Could not determine server IP address"
        Write-Host "Please contact your administrator for the correct server IP address"
        exit 1
    }

    Write-Host ""
    Write-Host "Server Configuration:" -ForegroundColor Yellow
    Write-Host "  • Server IP: $serverIP" -ForegroundColor White
    Write-Host "  • Frontend URL: http://${serverIP}:${FRONTEND_PORT}" -ForegroundColor White
    Write-Host "  • Backend URL: http://${serverIP}:${BACKEND_PORT}" -ForegroundColor White
    Write-Host ""

    # Test connections
    $connectionsOK = Test-FullConnection -ServerIP $serverIP

    if (-not $connectionsOK) {
        Write-Error "Server connections failed. Please check if the server is running and accessible."
        exit 1
    }

    # Create user account
    $userResult = Register-UserAccount -ServerIP $serverIP

    if (-not $userResult.Success) {
        Write-Error "Could not create user account. Server may be busy or configuration issue."
        Write-Host "Please contact administrator for manual account setup."
    } else {
        Write-Host ""
        Write-Host "🎉 Setup Complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your Account:" -ForegroundColor Yellow
        Write-Host "  • Username: $($userResult.Username)" -ForegroundColor White
        Write-Host "  • Password: $($userResult.Password)" -ForegroundColor White
        Write-Host ""
        Write-Host "Access URLs:" -ForegroundColor Yellow
        Write-Host "  • Application: http://${serverIP}:${FRONTEND_PORT}" -ForegroundColor Cyan
        Write-Host "  • API Status: http://${serverIP}:${BACKEND_PORT}/docs" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Login Instructions:" -ForegroundColor Yellow
        Write-Host "  1. Use the username and password above to login" -ForegroundColor White
        Write-Host "  2. Change your password after first login" -ForegroundColor White
        Write-Host "  3. You can view and edit orders, tasks, and calendar" -ForegroundColor White
        Write-Host "  4. Administrator features are restricted" -ForegroundColor White
        Write-Host ""

        # Save configuration
        $configFile = Create-ConfigFile -ServerIP $serverIP -UserInfo $userResult

        # Open browser
        Open-Browser -ServerIP $serverIP
    }

    Write-Host ""
    Write-Host "Setup completed successfully! 🎉" -ForegroundColor Green
    Write-Host "Config saved to: $configFile" -ForegroundColor Gray
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================

try {
    Start-ClientSetup
} catch {
    Write-Error "Setup failed with exception: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Ensure you are on the same WiFi network as the server"
    Write-Host "  2. Check that the server is running (start_network.bat on server)"
    Write-Host "  3. Try running this script as Administrator"
    Write-Host "  4. Check Windows Firewall settings"
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Need help? Contact your administrator or check the GitHub repository." -ForegroundColor Gray
Write-Host "Repository: https://github.com/Hnko123/localetsymanagement" -ForegroundColor Gray

# Keep window open briefly so user can see results
if (-not $AutoOpenBrowser) {
    Write-Host ""
    Read-Host "Press Enter to exit"
}
