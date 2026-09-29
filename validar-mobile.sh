#!/usr/bin/env bash
set -e

echo "========================================"
echo "Iniciando Validador Mobile (AnaliseHinosApp)"
echo "========================================"

echo "1. Verificando tipos TypeScript (tsc --noEmit)..."
npx tsc --noEmit

echo "2. Verificando integridade Expo SDK (expo-doctor)..."
npx expo-doctor

echo "3. Executando testes automatizados (Jest)..."
npm test -- --watchAll=false

echo "========================================"
echo "SUCESSO: Validação Mobile 100% Aprovada!"
echo "========================================"
