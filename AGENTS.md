# 🧠 AnaliseHinosApp — AI Memory & Engineering Context

## 1. Governança e Papéis
- **Wesley Moraes Santos:** Head de Engenharia e Dono do Produto.
  - Perfil: Validação executiva de planos, arquitetura e aprovação de entregas.
  - Rejeição expressa a "vibe coding".
  - Exigências inegociáveis: TDD (Test-Driven Development), Clean Code, Clean Architecture, commits semânticos atômicos.
- **Agente IA:** Tech Lead & Desenvolvedor Mobile Sênior.
  - Perfil: Execução autônoma do trabalho pesado, disciplina técnica, relatórios executivos concisos e testes 100% verdes antes de qualquer conclusão de etapa.

## 2. Visão do Produto & Regra de Negócio Central
- **App:** AnaliseHinosApp (React Native + Expo SDK 52, TypeScript strict, Standalone / Local-First).
- **Legado Substituído:** Scripts Python e planilhas Excel (https://github.com/wesley1248/Analise_Repeti-o_hino).
- **Regra de Negócio Central (Inviolável) — Desduplicação Diária:**
  > Se o mesmo número de hino for registrado mais de uma vez na mesma data (ex: culto da manhã, da noite, prelúdio), o sistema deve computar **apenas 1 ocorrência diária** no ranking de repetições e relatórios.

## 3. Arquitetura e Decisões Técnicas Homologadas
- **Stack:** React Native + Expo (SDK 52+), Expo Router (Abas), TypeScript (Strict mode).
- **Banco de Dados Local:** `expo-sqlite` rodando 100% embarcado no dispositivo mobile (zero servidor, zero nuvem, sandboxed nos diretórios privados do app).
- **UI & Estilo:** NativeWind (Tailwind CSS) + `lucide-react-native` + `@expo/vector-icons` (Ionicons).
- **Feedback Tátil:** `expo-haptics` para digitação e ações táteis.
- **Relatórios:** `expo-print` (HTML para PDF) + `expo-sharing` (compartilhamento nativo).
- **Importação Legada:** `expo-document-picker` + `xlsx` (SheetJS).
- **Testes Automatizados:** Jest (`jest-expo`) + React Native Testing Library (RNTL).
  - Configuração de cache: `/tmp/jest-cache` no Docker para evitar latência de I/O em mounts 9P/Windows.

## 4. Estrutura de Pastas (Clean Architecture)
```text
src/
├── core/                  # Constantes globais (Colors.ts), utilitários e tipos base
├── domain/                # Entidades e Regras de Negócio puras (agnósticas de framework)
│   ├── entities/          # HymnOccurrence, HymnFrequency
│   ├── rules/             # dailyDeduplication.ts (Regra de ouro testada)
│   └── repositories/      # Interfaces de persistência (DIP)
├── data/                  # Implementações concretas de dados (expo-sqlite, migrations)
├── services/              # Exportação de PDF, Leitor de planilhas XLSX, Haptics
└── presentation/          # Telas, componentes reutilizáveis, hooks customizados
app/                       # Expo Router (Rotas e Abas)
├── _layout.tsx            # RootLayout com Splash Screen e fontes
└── (tabs)/                # Navegação por Abas
    ├── _layout.tsx        # Configuração das 4 abas com Ionicons e HapticTab
    ├── index.tsx          # Aba Lançamento (/lançar)
    ├── dashboard.tsx      # Aba Dashboard (/dashboard)
    ├── relatorio.tsx      # Aba Relatórios (/relatorio)
    └── importar.tsx       # Aba Importação (/importar)
```

## 5. Status do Roadmap de 5 Etapas
- [x] **Etapa 1:** Setup do repositório Git, `.gitignore` e ambiente isolado `.devcontainer`.
- [x] **Etapa 2:** Inicialização do Expo (SDK 52+) com TypeScript, Expo Router, Jest e estrutura de pastas.
- [ ] **Etapa 3:** Camada de banco de dados (`expo-sqlite`), migrations, entidade de domínio e testes unitários de desduplicação integrados.
- [ ] **Etapa 4:** Construção da UI (Lançamento rápido, Dashboard, Exportação PDF, Importação XLSX).
- [ ] **Etapa 5:** QA local, testes 100% verdes, documentação final e entrega no GitHub.

## 6. Próximo Ponto de Retomada (Etapa 3)
Ao reiniciar a sessão:
1. Instalar `expo-sqlite` compatível com SDK 52 (`npx expo install expo-sqlite`).
2. Implementar schema de migrations do SQLite (`migrations.ts`).
3. Criar interface `IHymnRepository` em `src/domain/repositories/` e implementação `HymnSQLiteRepository` em `src/data/repositories/`.
4. Implementar testes de integração e unitários com mock/in-memory para o repositório SQLite.
