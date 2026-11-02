# 🤖 Diretrizes e Instruções para Agentes de IA (AGENTS.md)

> **Documento Oficial de Engenharia e Governança para Agentes Autônomos de IA**
> **Projeto:** Análise de Hinos (`AnaliseHinosApp`)
> **Head de Engenharia & Dono do Produto:** Wesley Moraes Santos

---

## 1. 🎯 Propósito Central e Visão do Produto

O **Análise de Hinos** é um aplicativo mobile focado em **auxiliar líderes de louvor, regentes, secretarias e ministérios a monitorar, equilibrar e identificar a repetição de hinos no repertório congregacional**.

### ⚠️ Regra de Ouro de Negócio (O Que é um Hino Repetido):
* **Hino Repetido:** Um hino é considerado **repetido** em um determinado período se, e somente se, foi cantado em **2 ou mais cultos distintos** ($\ge 2$ presenças).
* **Hino Cantado 1 Vez:** Se um hino foi entoado em apenas 1 culto no período selecionado, ele **NÃO é um hino repetido**. Ele deve ser tratado e categorizado separadamente para não poluir nem confundir as análises de reincidência.
* **Desduplicação Diária (Inviolável):** Se o mesmo número de hino for registrado mais de uma vez na mesma data (ex: culto da manhã e da noite, ou reentoado na mesma reunião), o sistema computa **apenas 1 presença diária** para as métricas e rankings. O total bruto de execuções fica preservado apenas para auditoria de volume.

---

## 2. 👥 Papéis e Dinâmica de Trabalho

* **Wesley (Head de Engenharia / Product Owner):**
  * Define requisitos, escopo, regras de negócio e valida planos técnicos.
  * Avalia relatórios de entrega e toma decisões estratégicas.
  * **Não atua em pair-programming linha a linha e rejeita terminantemente "vibe coding" sem testes.**
* **Agente de IA (Tech Lead & Desenvolvedor Sênior):**
  * Realiza a implementação técnica de forma autônoma, organizada e defensiva.
  * Segue estritamente TDD, documentando cada componente com clareza.
  * Apresenta relatórios executivos concisos, com testes comprovados e evidências claras.

---

## 3. 🏗️ Arquitetura e Estrutura do Código

O projeto segue princípios de **Clean Architecture**, **Local-First** e **Clean Code**:

```
AnaliseHinosApp/
├── app/                              # Camada de Apresentação & Navegação (Expo Router)
│   ├── _layout.tsx                   # Layout raiz, SafeArea e Providers
│   └── (tabs)/                       # Abas principais
│       ├── index.tsx                 # Lançamento Diário (teclado numérico, exclusão por range)
│       ├── dashboard.tsx             # Dashboard Analítico (KPIs de repetição e rankings)
│       ├── relatorio.tsx             # Relatórios analíticos e exportação em PDF/impressão
│       └── importar.tsx              # Importador de planilhas Excel (.xlsx) e CSV
├── src/
│   ├── core/constants/Colors.ts      # Paleta de cores oficial (Dark Slate Modern)
│   ├── data/
│   │   ├── database/                 # SQLite local (expo-sqlite) e mock para web/testes
│   │   └── repositories/             # Implementações de persistência (SQLiteHymnRepository)
│   ├── domain/
│   │   ├── entities/                 # Entidades ricas (HymnOccurrence, HymnFrequency)
│   │   ├── events/                   # Notificador de sincronização reativa (dataSyncNotifier)
│   │   ├── repositories/             # Contratos de repositório (IHymnRepository)
│   │   ├── rules/                    # Regras de negócio puras (dailyDeduplication)
│   │   └── services/                 # Serviços de domínio (geração de HTML/PDF, parser Excel)
│   └── presentation/
│       ├── components/               # Componentes visuais atômicos por domínio
│       │   ├── dashboard/            # Cartões de métricas, ranking e filtros
│       │   ├── launch/               # Teclado numérico, seletor de data, modais
│       │   ├── reports/              # Tabela prévia, resumo, botões de ação
│       │   └── import/               # Dropzone de arquivo, preview e resumo de importação
│       └── hooks/                    # Hooks de orquestração de estado (useDashboard, useReports, etc.)
└── __tests__/                        # Testes de integração e sanidade
```

---

## 4. 📐 Princípios Inegociáveis de Desenvolvimento

Toda alteração de código realizada por agentes de IA **DEVE** respeitar:

1. **TDD Obrigatório (Test-Driven Development):**
   * Antes de considerar qualquer funcionalidade ou correção concluída, novos testes unitários devem ser criados ou os existentes atualizados.
   * A suite de testes (`npm test`) deve rodar com **100% de sucesso**. Nenhuma quebra de regressão é tolerada.
2. **Sincronização Reativa em Tempo Real:**
   * Qualquer inclusão, edição ou exclusão de dados na aba de *Lançamento* ou *Importação* deve emitir o evento através de `dataSyncNotifier.notify()`.
   * As abas *Dashboard* e *Relatórios* devem assinar o evento e também usar `useFocusEffect` para manter os dados sempre sincronizados na tela sem necessidade de recarregar o app.
3. **Padrão Visual e Dark Theme Consistente:**
   * Background principal: `#0F172A` (Slate 900).
   * Cards e containers: `#1E293B` (Slate 800) com borda `#334155` (Slate 700).
   * Destaques de ação e métricas: `#2563EB` (Blue 600) / `#60A5FA` (Blue 400).
   * Cores de status/repetição: Destaque visual (âmbar/dourado/laranja) para hinos que atingem alta frequência no período.
4. **Didática e Documentação em Código (TSDoc / JSDoc):**
   * Todo componente exportado, hook customizado, regra de negócio ou método de repositório deve conter comentário didático explicando o propósito e a relevância para o usuário.
5. **Comunicação Direta e Linguagem de Domínio:**
   * Evitar termos puramente de banco nas telas de usuário (como "desduplicação diária bruta").
   * Preferir: *"Hinos repetidos no período"*, *"Presenças em cultos"*, *"Total de cultos analisados"*.

---

## 5. 💡 UX Didática & Autoexplicativa (Ícone de Ajuda `(?)` em Cada Card)

Para garantir que qualquer usuário (mesmo sem conhecimento técnico de estatística) compreenda exatamente o significado de cada métrica exibida:

1. **Ícone de Ajuda Interativo `(?)` em Cada Card:**
   * Todo card de indicador ou métrica (no Dashboard e nos Relatórios) deve conter no canto superior um pequeno botão acessível com ícone `(?)` ou `help-circle`.
2. **Exibição Contextual Didática:**
   * Ao tocar no ícone `(?)`, abrir um modal/bottom-sheet no tema escuro contendo:
     * **Título da Métrica:** Nome claro e amigável.
     * **O que significa:** Explicação em português simples e direto sobre o que aquele número representa.
     * **Como é calculado:** Detalhamento transparente do cálculo (ex: explicando a desduplicação de múltiplos cultos no mesmo dia e a regra de hinos repetidos $\ge 2$).
     * **Importância prática:** Como aquela informação ajuda na prática os líderes e a igreja a equilibrarem o repertório.
3. **Fechamento Ágil:**
   * O modal deve fechar com um toque fora (backdrop) ou no botão "Entendido".

---

## 6. 🧭 Onboarding & Tour Guiado Interativo (Instalação e Atualização)

Para guiar os novos usuários e apresentar as novidades a cada atualização do aplicativo:

1. **Gatilho de Disparo Automático (Instalação / Atualização):**
   * O aplicativo deve persistir localmente a última versão em que o tour foi concluído (ex: via `AsyncStorage`).
   * Ao inicializar, se for a **primeira instalação** OU se a **versão atual do app for superior à última gravada**, o aplicativo exibe um convite inicial não intrusivo.
2. **Convite Amigável:**
   * Um diálogo modal moderno com o tema escuro contendo:
     * *"Bem-vindo ao Análise de Hinos!"* (ou *"Nova versão instalada!"*).
     * *"Deseja fazer um tour rápido de 1 minuto para conhecer todos os recursos e novidades?"*
     * Botões de ação: **[Sim, iniciar tour]** e **[Agora não / Pular]**.
3. **Passos do Tour Interativo (Carrossel / Overlay Guiado):**
   * **Passo 1 (Lançamento):** Teclado numérico rápido, histórico do culto e exclusão segura por intervalo de datas.
   * **Passo 2 (Dashboard & Hinos Repetidos):** Explicação da regra de repetição ($\ge 2$ cultos), desduplicação diária e ranking com as datas de cada culto.
   * **Passo 3 (Relatórios & PDF):** Filtros analíticos, cobertura dos 480 hinos e geração de relatórios oficiais para impressão e WhatsApp.
   * **Passo 4 (Importação):** Como migrar de planilhas Excel (`.xlsx`) ou CSV de forma 100% offline e segura.
4. **Opção de Rever a Qualquer Momento:**
   * O usuário deve ter acesso a um botão de atalho permanente (ex: ícone de lâmpada ou interrogação no cabeçalho ou menu) para rever o tour quando quiser.

---

## 7. 🛡️ Governança de Comandos e Segurança

### Operações Liberadas para Execução Autônoma:
* Leitura de arquivos e análise de código.
* Edição cirúrgica de arquivos respeitando padrões existentes.
* Execução de testes: `npm test`, `./validar-mobile.ps1`.
* Comandos padrão de Git sem impacto destrutivo: `git status`, `git diff`, `git add`, `git commit`.

### Operações com Confirmação Manual Obrigatória do Wesley:
* Comandos destrutivos de Git: `git reset --hard`, `git clean -fd`, `git push --force`, `git rebase`.
* Exclusão recursiva de diretórios inteiros.
* Alteração de arquivos sensíveis ou credenciais (`.env`).

---

## 8. 🚀 Checklist de Verificação Antes de Finalizar Qualquer Tarefa

- [ ] A alteração atende diretamente à necessidade real do usuário final (foco em hinos repetidos)?
- [ ] Cada card de métrica possui o botão/ícone de ajuda `(?)` com explicação didática clara?
- [ ] O fluxo de onboarding/tour guiado (se envolvido na tarefa) respeita a verificação de versão e não é intrusivo?
- [ ] O código segue a separação de camadas da Clean Architecture?
- [ ] Foram adicionados ou atualizados testes unitários cobrindo o novo comportamento?
- [ ] O comando `npm test` passou com **100% dos testes verdes**?
- [ ] O tema escuro e os alinhamentos de SafeArea foram preservados?
- [ ] As mensagens de commit são atômicas e seguem o padrão semântico (*Conventional Commits*: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`)?
