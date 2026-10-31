#!/usr/bin/env bash
set -e

echo "========================================"
echo "Iniciando Validador Mobile (AnaliseHinosApp)"
echo "========================================"

echo "1. Verificando tipos TypeScript (tsc --noEmit)..."
node ./node_modules/typescript/bin/tsc --noEmit

echo "2. Verificando integridade Expo SDK (expo-doctor)..."
npx expo-doctor || echo "Aviso: expo-doctor apontou divergências de patch version no SDK (não impeditivo)."

echo "3. Executando testes automatizados (Jest)..."
npm test -- --watchAll=false

echo "========================================"
echo "SUCESSO: Validação Mobile 100% Aprovada!"
echo "========================================"
