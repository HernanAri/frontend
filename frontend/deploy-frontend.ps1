# Ubicación: front/Frontend/frontend/deploy-frontend.ps1
# Script de despliegue del frontend en IIS

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CLOKIFY - Despliegue Frontend en IIS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar privilegios de administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "X Este script requiere privilegios de administrador" -ForegroundColor Red
    Write-Host "  Ejecuta PowerShell como Administrador" -ForegroundColor Yellow
    exit 1
    }

# 1. Verificar Node.js
Write-Host "[1/7] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js instalado: $nodeVersion" -ForegroundColor Green
    } catch {
    Write-Host "X Node.js no está instalado" -ForegroundColor Red
    exit 1
    }

# 2. Verificar IIS
Write-Host "`n[2/7] Verificando IIS..." -ForegroundColor Yellow
$iisFeature = Get-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole
if ($iisFeature.State -eq "Enabled") {
    Write-Host "✓ IIS está instalado" -ForegroundColor Green
    } else {
    Write-Host "X IIS no está instalado. Instalando..." -ForegroundColor Yellow
    Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole -All
    Enable-WindowsOptionalFeature -Online -FeatureName IIS-URLRewriting -All
    Write-Host "✓ IIS instalado. Reinicia el servidor y vuelve a ejecutar este script." -ForegroundColor Green
    exit 0
    }

# 3. Verificar URL Rewrite
Write-Host "`n[3/7] Verificando URL Rewrite Module..." -ForegroundColor Yellow
$rewriteModule = Get-WebGlobalModule | Where-Object { $_.Name -eq "RewriteModule" }
if (-not $rewriteModule) {
    Write-Host "X URL Rewrite Module no está instalado" -ForegroundColor Yellow
    Write-Host "  Descárgalo desde: https://www.iis.net/downloads/microsoft/url-rewrite" -ForegroundColor Yellow
    Write-Host "  O instala con: choco install urlrewrite" -ForegroundColor Yellow
    } else {
    Write-Host "✓ URL Rewrite Module instalado" -ForegroundColor Green
    }

# 4. Instalar dependencias
Write-Host "`n[4/7] Instalando dependencias..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "X Error al instalar dependencias" -ForegroundColor Red
    exit 1
    }   
Write-Host "✓ Dependencias instaladas" -ForegroundColor Green

# 5. Build
Write-Host "`n[5/7] Compilando aplicación para producción..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "X Error al compilar" -ForegroundColor Red
    exit 1
    }
Write-Host "✓ Aplicación compilada" -ForegroundColor Green

# 6. Copiar web.config
Write-Host "`n[6/7] Copiando web.config..." -ForegroundColor Yellow
$webConfigPath = Join-Path $PSScriptRoot "web.config"
$distPath = Join-Path $PSScriptRoot "dist"

if (Test-Path $webConfigPath) {
    Copy-Item $webConfigPath -Destination $distPath -Force
    Write-Host "✓ web.config copiado a dist/" -ForegroundColor Green
    } else {
    Write-Host "⚠ web.config no encontrado. Puedes crear uno en la raíz" -ForegroundColor Yellow
    }

# 7. Configurar IIS
Write-Host "`n[7/7] Configurando IIS..." -ForegroundColor Yellow

$siteName = "Clokify"
$appPoolName = "ClokifyAppPool"
$physicalPath = $distPath

# Crear Application Pool
if (-not (Get-IISAppPool -Name $appPoolName -ErrorAction SilentlyContinue)) {
    New-WebAppPool -Name $appPoolName
    Write-Host "✓ Application Pool creado" -ForegroundColor Green
    } else {
    Write-Host "✓ Application Pool ya existe" -ForegroundColor Green
    }

# Configurar Application Pool
Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name "managedRuntimeVersion" -Value ""
Write-Host "✓ AppPool configurado (No Managed Code)" -ForegroundColor Green

# Eliminar sitio si existe
$existingSite = Get-Website -Name $siteName -ErrorAction SilentlyContinue
if ($existingSite) {
    Stop-Website -Name $siteName
    Remove-Website -Name $siteName
    Write-Host "✓ Sitio anterior eliminado" -ForegroundColor Green
    }

# Crear sitio
New-Website -Name $siteName `
    -PhysicalPath $physicalPath `
    -ApplicationPool $appPoolName `
    -Port 80

Write-Host "✓ Sitio creado" -ForegroundColor Green

# Iniciar sitio
Start-Website -Name $siteName
Write-Host "✓ Sitio iniciado" -ForegroundColor Green

# Configurar firewall
$firewallRule = Get-NetFirewallRule -DisplayName "CLOKIFY - HTTP" -ErrorAction SilentlyContinue
if (-not $firewallRule) {
    New-NetFirewallRule -DisplayName "CLOKIFY - HTTP" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort 80 `
        -Action Allow
    Write-Host "✓ Regla de firewall creada" -ForegroundColor Green
    } else {
    Write-Host "✓ Regla de firewall ya existe" -ForegroundColor Green
    }

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✓ Despliegue completado exitosamente" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""
Write-Host "Frontend desplegado en:" -ForegroundColor Cyan
Write-Host "  http://localhost"
Write-Host "  http://$env:COMPUTERNAME"
Write-Host ""
Write-Host "Ruta física: $physicalPath"
Write-Host ""
Write-Host "Para abrir IIS ejecuta: inetmgr" -ForegroundColor Yellow
