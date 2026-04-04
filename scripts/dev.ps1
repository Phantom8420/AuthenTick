# Start MongoDB via Docker Compose, then backend + frontend workspaces.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Starting MongoDB (docker compose)..." -ForegroundColor Cyan
docker compose -f docker/docker-compose.yml up -d mongo

Write-Host "Run in separate terminals:" -ForegroundColor Yellow
Write-Host "  npm run dev -w backend" -ForegroundColor Gray
Write-Host "  npm run dev -w frontend" -ForegroundColor Gray
Write-Host "Optional chain: npm run node -w contracts" -ForegroundColor Gray
