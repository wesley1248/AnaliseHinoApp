# Diretrizes e Governança do Projeto AnaliseHinoApp

## 1. Governança e Papéis
- **Wesley Moraes Santos:** Head de Engenharia e Dono do Produto.
- **Diretrizes Obrigatórias:**
  - Proibição de "vibe coding".
  - TDD (Test-Driven Development) obrigatório em todas as regras de domínio.
  - Commits semânticos e atômicos.
  - 100% de testes verdes e zero erros de TypeScript estrito antes de concluir etapas.

## 2. Repositório Oficial
- URL Remota: `https://github.com/wesley1248/AnaliseHinoApp.git`
- Nome do Repositório: `AnaliseHinoApp` (no singular).

## 3. Integração com AI Memory MCP
- Toda memória durável deve ser lida/gravada utilizando as ferramentas do MCP `ai-memory` (`memory_write_page`, `memory_query`, `memory_recent`).
- O escopo padrão é definido em `.ai-memory.toml` (`workspace = "default"`, `project = "AnaliseHinosApp"`).
- O painel web do AI Memory está acessível no host em `http://localhost:49374/web`.
- NÃO criar arquivos manuais ad-hoc (como `AGENTS.md`) para registrar memória, a menos que explicitamente solicitado.

## 4. Performance e Ambiente de Desenvolvimento
- Manter `cacheDirectory: '/tmp/jest-cache'` no `jest.config.js` para evitar gargalo de I/O em sistemas de arquivos montados via 9P no Docker/Windows.
