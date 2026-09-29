$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Iniciando Validador Mobile (AnaliseHinosApp)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "1. Verificando tipos TypeScript (tsc --noEmit)..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: TypeScript typecheck falhou!" -ForegroundColor Red
    exit 1
}

Write-Host "2. Verificando integridade Expo SDK (expo-doctor)..." -ForegroundColor Yellow
npx expo-doctor
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: expo-doctor detectou problemas no SDK!" -ForegroundColor Red
    exit 1
}

Write-Host "3. Executando testes automatizados (Jest)..." -ForegroundColor Yellow
npm test -- --watchAll=false
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Testes automatizados falharam!" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "SUCESSO: Validador Mobile 100% Aprovado!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
