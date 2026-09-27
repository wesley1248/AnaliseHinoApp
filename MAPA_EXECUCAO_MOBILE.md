# 📱 AnaliseHinosApp — Especificação e Mapa de Execução

## 1. Visão Geral do Produto
O **AnaliseHinosApp** é um aplicativo mobile nativo (Android e iOS) desenvolvido com **React Native e Expo**, operando na arquitetura **Standalone / Local-First** (100% offline).

O objetivo é substituir e modernizar o fluxo legado de planilhas Excel e scripts Python do projeto [Analise_Repeti-o_hino](https://github.com/wesley1248/Analise_Repeti-o_hino), permitindo que músicos, regentes e líderes registrem, analisem e compartilhem a frequência e repetição de hinos tocados em cultos e reuniões diretamente pelo smartphone.

---

## 2. Perfis e Governança
* **Wesley Moraes Santos:** Head de Engenharia e Dono do Produto. Define requisitos, valida planos arquiteturais e aprova entregas. Não faz pair programming linha a linha nem aceita "vibe coding".
* **Agente IA:** Atua como **Tech Lead & Desenvolvedor Mobile Sênior**, executando o trabalho pesado de implementação autônoma, guiado por TDD, Clean Code e commits semânticos atômicos.

---

## 3. Regra de Negócio Central (Inviolável)
> **Desduplicação Diária:**  
> Se o mesmo número de hino for registrado mais de uma vez na mesma data (ex: culto da manhã e da noite, ou repetição no mesmo culto), o sistema deve computar **apenas 1 ocorrência** para aquele dia no ranking de frequência.

---

## 4. Stack Técnica Homologada
* **Framework:** React Native + Expo (SDK 52+).
* **Navegação:** Expo Router (File-based routing com navegação por Abas / Tabs).
* **Linguagem:** TypeScript (Strict mode).
* **Persistência Local:** `expo-sqlite` (armazenamento relacional no dispositivo).
* **UI & Estilo:** NativeWind (Tailwind CSS) + `lucide-react-native`.
* **Feedback Tátil:** `expo-haptics` para digitação no teclado numérico customizado.
* **Relatórios e Compartilhamento:** `expo-print` (HTML para PDF) + `expo-sharing` (envio direto via WhatsApp).
* **Importação Legada:** `expo-document-picker` + `xlsx` (SheetJS) para ler `.xlsx`.
* **Testes Automatizados:** Jest + React Native Testing Library (RNTL).

---

## 5. Módulos e Telas do App (Abas)
1. **Aba Lançamento (`/lançar`):**
   * Seleção de data (padrão: data de hoje).
   * Teclado numérico rápido para inserção ágil de múltiplos hinos.
   * Lista visual dos hinos já adicionados na data com opção de remover.
2. **Aba Dashboard (`/dashboard`):**
   * Métricas rápidas: Total de hinos tocados, hino mais cantado, hinos menos cantados.
   * Filtro de período dinâmico: Últimos 30 dias, 90 dias, Ano atual, Todo o histórico.
   * Gráficos e ranking ordenado decrescente de frequência.
3. **Aba Relatórios & Exportação (`/relatorio`):**
   * Seleção de intervalo de datas para o relatório.
   * Pré-visualização e geração de PDF com cabeçalho, totalizadores e tabela estilizada.
   * Botão de compartilhamento nativo para WhatsApp / Telegram / E-mail.
4. **Aba Importação (`/importar`):**
   * Upload de planilha `.xlsx` para migração dos dados históricos existentes para o SQLite.

---

## 6. Roteiro de Entregas (Roadmap por Etapas)
- [x] **Etapa 1:** Setup do repositório Git, `.gitignore` e ambiente isolado `.devcontainer`.
- [x] **Etapa 2:** Inicialização do Expo (SDK 52+) com TypeScript, Expo Router, Jest e estrutura de pastas.
- [ ] **Etapa 3:** Camada de banco de dados (`expo-sqlite`), migrations, entidade de domínio e testes unitários de desduplicação.
- [ ] **Etapa 4:** Construção da UI:
  - [ ] Tela de Lançamento rápido com Haptics.
  - [ ] Tela de Dashboard com métricas e rankings.
  - [ ] Tela de Exportação de PDF com `expo-print` e compartilhamento nativo.
  - [ ] Tela de Importação de planilhas `.xlsx`.
- [ ] **Etapa 5:** Validação de QA local, testes 100% verdes, documentação final e entrega no GitHub.
