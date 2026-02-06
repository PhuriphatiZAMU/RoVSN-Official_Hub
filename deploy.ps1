Write-Host "🚀 Starting Automated Deployment for RoV SN Tournament..." -ForegroundColor Cyan

# Function to check for command availability
function Test-CommandExists {
    param ($command)
    if (Get-Command $command -ErrorAction SilentlyContinue) {
        return $true
    }
    return $false
}

# Check for PM2: If not found, install it globally
if (-not (Test-CommandExists pm2)) {
    Write-Host "⚠️ PM2 not found. Installing globally..." -ForegroundColor Yellow
    npm install -g pm2
    if ($LASTEXITCODE -ne 0) { Write-Error "Failed to install PM2. Please install it manually: npm install -g pm2"; exit 1 }
} else {
    Write-Host "✅ PM2 is detected." -ForegroundColor Green
}

# ---------------------------------------------------------
# 1. SERVER BUILD
# ---------------------------------------------------------
Write-Host "`n📦 [1/3] Building SERVER..." -ForegroundColor Magenta
Push-Location server
try {
    Write-Host "   Installing dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) { throw "Server npm install failed" }

    Write-Host "   Compiling TypeScript..."
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Server build failed" }
}
catch {
    Write-Error $_
    Pop-Location
    exit 1
}
Pop-Location

# ---------------------------------------------------------
# 2. CLIENT BUILD
# ---------------------------------------------------------
Write-Host "`n📦 [2/3] Building CLIENT..." -ForegroundColor Magenta
Push-Location client
try {
    Write-Host "   Installing dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) { throw "Client npm install failed" }

    Write-Host "   Building Next.js application..."
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Client build failed" }
}
catch {
    Write-Error $_
    Pop-Location
    exit 1
}
Pop-Location

# ---------------------------------------------------------
# 3. START SERVICES (PM2)
# ---------------------------------------------------------
Write-Host "`n🚀 [3/3] Starting Services with PM2..." -ForegroundColor Cyan

# Stop existing processes to ensure fresh start (Optional, but safe)
pm2 delete rov-server 2>$null
pm2 delete rov-client 2>$null

# Start ecosystem
pm2 start ecosystem.config.js
if ($LASTEXITCODE -ne 0) { 
    Write-Error "Failed to start PM2 services."
    exit 1
}

# Save configuration for auto-restart
pm2 save

Write-Host "`n✅ Deployment Complete! System is running." -ForegroundColor Green
Write-Host "---------------------------------------------------"
pm2 status
Write-Host "---------------------------------------------------"
Write-Host "Use 'pm2 logs' to see application logs."
Write-Host "Use 'pm2 stop all' to stop the server."
