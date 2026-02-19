$ErrorActionPreference = "Stop"

param(
  [switch]$SkipHealthCheck,
  [switch]$NoBuild
)

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Read-DotEnv {
  param([string]$Path)
  $map = @{}
  Get-Content -Path $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not [string]::IsNullOrWhiteSpace($line) -and -not $line.StartsWith("#")) {
      $idx = $line.IndexOf("=")
      if ($idx -ge 1) {
        $key = $line.Substring(0, $idx).Trim()
        $value = $line.Substring($idx + 1).Trim()
        $map[$key] = $value
      }
    }
  }
  return $map
}

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $repoRoot

$envFile = Join-Path $repoRoot ".env"
if (-not (Test-Path $envFile)) {
  throw ".env file not found. Run: Copy-Item .env.example .env"
}

$envMap = Read-DotEnv -Path $envFile
$requiredKeys = @(
  "NGINX_SERVER_NAME",
  "CORS_ORIGIN",
  "FRONTEND_HTTP_PORT",
  "FRONTEND_HTTPS_PORT",
  "PORT",
  "POSTGRES_DB",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD"
)

foreach ($key in $requiredKeys) {
  if (-not $envMap.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($envMap[$key])) {
    throw "Missing required .env key: $key"
  }
}

$certDir = Join-Path $repoRoot "docker\\certs"
$fullchain = Join-Path $certDir "fullchain.pem"
$privkey = Join-Path $certDir "privkey.pem"
if (-not (Test-Path $fullchain)) { throw "Missing certificate file: $fullchain" }
if (-not (Test-Path $privkey)) { throw "Missing certificate file: $privkey" }

Write-Step "Checking Docker daemon"
docker info | Out-Null

$composeArgs = @(
  "-f", "docker-compose.yml",
  "-f", "docker-compose.prod.yml"
)

Write-Step "Validating compose config"
docker compose @composeArgs config | Out-Null

Write-Step "Deploying production stack"
if ($NoBuild) {
  docker compose @composeArgs up -d
} else {
  docker compose @composeArgs up -d --build
}

if (-not $SkipHealthCheck) {
  Write-Step "Running health check"
  $backendPort = [int]$envMap["PORT"]
  $healthUrl = "http://localhost:$backendPort/api/health"
  $maxRetry = 30
  $ok = $false
  for ($i = 1; $i -le $maxRetry; $i++) {
    try {
      $res = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 3
      if ($res.ok -eq $true) {
        $ok = $true
        break
      }
    } catch {
      Start-Sleep -Seconds 2
    }
  }
  if (-not $ok) {
    throw "Backend health check failed: $healthUrl"
  }

  $httpPort = [int]$envMap["FRONTEND_HTTP_PORT"]
  $httpUrl = "http://localhost:$httpPort/"
  Write-Step "Checking HTTP to HTTPS redirect"
  try {
    Invoke-WebRequest -Uri $httpUrl -Method Get -MaximumRedirection 0 -TimeoutSec 5 | Out-Null
  } catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -notin @(301, 302, 307, 308)) {
      throw "Expected redirect on $httpUrl but got status: $statusCode"
    }
  }
}

Write-Step "Done"
Write-Host "Domain: $($envMap['NGINX_SERVER_NAME'])"
Write-Host "HTTPS URL: https://$($envMap['NGINX_SERVER_NAME'])"
Write-Host ""
Write-Host "Useful commands:"
Write-Host "  docker compose -f docker-compose.yml -f docker-compose.prod.yml ps"
Write-Host "  docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f frontend_prod backend"
