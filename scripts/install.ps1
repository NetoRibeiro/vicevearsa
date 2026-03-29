$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║       ViceVearsa Installer           ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# ── Check Node.js ────────────────────────────────────────────────────
function Test-NodeVersion {
    try {
        $version = (node -v) -replace 'v', ''
        $major = [int]($version.Split('.')[0])
        if ($major -ge 20) {
            Write-Host "  ✓ Node.js v$version detected" -ForegroundColor Green
            return $true
        }
    } catch { }
    return $false
}

function Install-Node {
    Write-Host "  ⚠ Node.js 20+ not found. Installing..." -ForegroundColor Yellow

    # Try fnm first (fast Node manager)
    if (Get-Command fnm -ErrorAction SilentlyContinue) {
        Write-Host "  Using existing fnm..."
        fnm install 20
        fnm use 20
    } else {
        Write-Host "  Installing fnm (Fast Node Manager)..."
        winget install Schniz.fnm -e --accept-package-agreements --accept-source-agreements 2>$null

        if ($?) {
            # Reload PATH
            $env:PATH = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
            fnm install 20
            fnm use 20
        } else {
            Write-Host "  fnm install failed. Trying direct Node.js installer..." -ForegroundColor Yellow
            $nodeUrl = "https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi"
            $installer = "$env:TEMP\node-installer.msi"
            Invoke-WebRequest -Uri $nodeUrl -OutFile $installer
            Start-Process msiexec.exe -Wait -ArgumentList "/i `"$installer`" /quiet"
            Remove-Item $installer -Force
            # Reload PATH
            $env:PATH = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        }
    }

    if (-not (Test-NodeVersion)) {
        Write-Host "  ✗ Failed to install Node.js 20+. Please install manually:" -ForegroundColor Red
        Write-Host "    https://nodejs.org/en/download/"
        exit 1
    }
}

if (-not (Test-NodeVersion)) {
    Install-Node
}

# ── Create workspace ─────────────────────────────────────────────────
$Workspace = Join-Path $HOME "vicevearsa-workspace"

if (Test-Path (Join-Path $Workspace "_vicevearsa")) {
    Write-Host "  ⚠ ViceVearsa already installed at $Workspace" -ForegroundColor Yellow
    Write-Host "  Re-running setup..."
} else {
    Write-Host "  → Creating workspace at $Workspace" -ForegroundColor Green
    New-Item -ItemType Directory -Path $Workspace -Force | Out-Null
}

Set-Location $Workspace

# ── Run ViceVearsa init ──────────────────────────────────────────────
Write-Host "  → Installing ViceVearsa..." -ForegroundColor Green
npx vicevearsa init --quick

Write-Host ""
Write-Host "  ════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✓ ViceVearsa is ready!" -ForegroundColor Green
Write-Host "  ════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  Dashboard: http://localhost:5173"
Write-Host "  Workspace: $Workspace"
Write-Host ""
