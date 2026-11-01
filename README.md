# 📱 Análise de Hinos (AnaliseHinosApp)

> Aplicativo mobile moderno, independente e de código aberto para registro, análise estatística e acompanhamento de frequência do repertório de hinos de louvor em cultos e reuniões.

[![React Native](https://img.shields.io/badge/React%20Native-Expo%20SDK%2057-000000?style=flat&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/SQLite-Local--First%20(Offline)-003B57?style=flat&logo=sqlite)](https://docs.expo.dev/versions/latest/sdk/sqlite/)
[![Tests](https://img.shields.io/badge/Tests-100%25%20Passing-success?style=flat&logo=jest)](https://jestjs.io/)
[![Version](https://img.shields.io/badge/Version-1.0.2-blue?style=flat)](https://github.com/wesley1248/AnaliseHinoApp/releases/tag/v1.0.2)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🛡️ Aviso de Segurança e Como Instalar no Android (APK)

O **Análise de Hinos** é um aplicativo **100% seguro, gratuito, de código aberto, livre de anúncios e sem rastreamento ou coleta de dados pessoais**. Toda a sua informação fica armazenada de forma privativa e segura apenas na memória interna do seu próprio smartphone (**arquitetura Local-First**).

### ❓ Por que o Android exibe um alerta ao instalar?
Ao baixar e tentar instalar o arquivo `.apk` diretamente (fora da loja oficial da Google Play Store), o sistema operacional Android e o sistema de proteção nativo (**Google Play Protect**) exibem avisos de segurança padrão para qualquer aplicativo baixado da internet que ainda não tenha uma assinatura comercial cadastrada no console da loja. **Isso é perfeitamente normal e esperado em distribuições de código aberto via GitHub.**

---

### 📲 Passo a Passo para Instalar o APK no seu Celular:

1. **Baixe o arquivo `.apk`** mais recente na aba de [Releases do GitHub](https://github.com/wesley1248/AnaliseHinoApp/releases/latest).
2. **Abra o arquivo baixado** através da notificação de download do navegador ou pelo aplicativo de *Arquivos / Gerenciador de Arquivos* do seu celular.
3. **Se o Android solicitar permissão de "Fontes Desconhecidas":**
   * Surgirá uma mensagem: *"Para sua segurança, o smartphone não tem permissão para instalar apps desconhecidos desta fonte"*.
   * Toque no botão **Configurações**.
   * Ative a opção **Permitir desta fonte** (chave seletora para o seu navegador ou gerenciador de arquivos).
   * Toque no botão de **Voltar** do celular.
4. **Se o Google Play Protect exibir uma tela de aviso:**
   * Caso apareça a mensagem *"Bloqueado pelo Play Protect"* ou *"App não verificado / fonte externa"*, toque no texto ou botão **Mais detalhes** (ou *Saiba mais*).
   * Em seguida, toque em **Instalar assim mesmo** (ou *Install anyway*).
5. **Concluir a Instalação:**
   * Toque em **Instalar**.
   * Pronto! O aplicativo estará disponível na sua tela de início com seu ícone oficial.

---

## ✨ Principais Recursos do Aplicativo

O aplicativo foi projetado para atender regentes, líderes de louvor, músicos e secretarias que desejam equilíbrio e variedade na escolha dos hinos da congregação:

* ⚡ **Lançamento Rápido Diário:**
  * Teclado numérico virtual customizado para inserção ágil e sem atrito de vários hinos em sequência.
  * Feedback tátil (*haptics*) a cada toque para uma experiência fluida.
  * Histórico em tempo real dos hinos já entoados na data selecionada, com remoção simplificada em caso de erro de digitação.

* 📅 **Seletor de Data por Calendário Interativo:**
  * Navegação rápida e direta por meses e anos para preenchimento de dados retroativos sem precisar clicar dia a dia.
  * Atalho inteligente "Hoje" para retorno instantâneo à data atual.
  * Destaque visual sofisticado no tema escuro (*Dark Modern*).

* 🗑️ **Exclusão em Massa por Intervalo de Datas (Range):**
  * Limpeza ágil de hinos cadastrados em um determinado período (*De: Data Inicial → Até: Data Final*).
  * Atalhos rápidos: *Hoje*, *Últimos 7 dias* e *Mês Atual*.
  * **Trava de Segurança em 2 Etapas:** Exige confirmação explícita antes da remoção permanente para evitar qualquer perda acidental de dados.

* 🔄 **Sincronização Reativa Instantânea entre Abas:**
  * Notificador de eventos em tempo real (`dataSyncNotifier`) combinado com `useFocusEffect`.
  * Qualquer inclusão, exclusão ou importação de hinos atualiza na mesma hora o Dashboard e os Relatórios, sem delay e sem necessidade de recarregar a tela manualmente.

* 📐 **SafeArea & Layout Dinâmico:**
  * Cálculo dinâmico de insets no topo e no rodapé da barra de abas, garantindo visual perfeito sem sobreposição de Status Bar, entalhes (*punch-hole/notches*) e botões virtuais de navegação do Android/iOS.

* 🎯 **Regra de Negócio de Desduplicação Diária (Inviolável):**
  * Se o mesmo hino for tocado mais de uma vez no mesmo dia (por exemplo, no culto da manhã e no culto da noite, ou repetido na mesma reunião), o sistema computa **apenas 1 presença** para o ranking daquele dia, garantindo estatísticas justas e fidedignas.

* 📊 **Dashboard Analítico Inteligente:**
  * Resumo executivo de métricas: total de cultos realizados, total de hinos registrados e repertório de hinos distintos.
  * Ranking decrescente de frequência: identifique claramente quais hinos são mais tocados e quais estão com baixa rotatividade.
  * Filtros temporais dinâmicos: visualize os dados por **Últimos 30 dias**, **Últimos 90 dias**, **Ano Atual** ou **Todo o Histórico**.

* 📄 **Relatórios e Compartilhamento:**
  * Geração instantânea de relatórios consolidados em HTML formatado para impressão direta ou exportação em PDF.
  * Integração nativa com o compartilhamento do sistema operacional para envio direto de relatórios via **WhatsApp**, **Telegram** ou **E-mail**.

* 📥 **Migração e Importação de Planilhas:**
  * Importador integrado compatível com arquivos de planilhas legadas (`.xlsx` / Excel) e CSV, permitindo carregar de uma só vez todo o histórico anterior diretamente para o banco de dados do app.

* 🔒 **Operação 100% Offline (Local-First):**
  * O aplicativo funciona sem necessidade de internet, sem cadastro de conta e sem dependência de servidores em nuvem. Os dados são gravados localmente em um banco de dados relacional SQLite (`expo-sqlite`).

---

## 🧭 Como Usar o Aplicativo (Guia Prático)

| Aba | Para que serve | Como utilizar |
| :--- | :--- | :--- |
| **Lançamento** | Registrar os hinos cantados no culto de hoje ou em datas anteriores. | Toque no card de data para abrir o calendário ou navegue com `<` e `>`. Digite os números dos hinos no teclado e adicione. Para expurgar um período, use o botão **Excluir Período**. |
| **Dashboard** | Acompanhar a distribuição e repetição dos hinos. | Escolha o período desejado nos botões superiores (30d, 90d, Ano, Todos) e consulte os cartões de métricas e a listagem de frequência sincronizada em tempo real. |
| **Relatórios** | Prestar contas ou compartilhar o repertório com o grupo de louvor. | Defina o período e ordenação, confira a pré-visualização na tela e toque em **Exportar PDF** ou **Imprimir**. |
| **Importar** | Trazer histórico antigo já digitado em Excel. | Toque em **Selecionar Arquivo Excel**, escolha a planilha do seu dispositivo e confirme a importação automática no banco. |

---

## 🛠️ Stack Tecnológica & Arquitetura

O projeto foi construído seguindo princípios de **Clean Architecture**, **TDD (Test-Driven Development)** e código desacoplado:

* **Engine:** React Native com Expo (SDK 57+)
* **Navegação:** Expo Router (roteamento baseado em sistema de arquivos)
* **Linguagem:** TypeScript (tipagem estrita sem concessões)
* **Persistência de Dados:** SQLite nativo via `expo-sqlite` (mobile) e `LocalStorage` (web preview)
* **Sincronização Reativa:** Event Notifier pub-sub desacoplado + `useFocusEffect`
* **Feedback e Mídia:** `expo-haptics`, `expo-print`, `expo-sharing`, `expo-document-picker`
* **Testes Automatizados:** Jest com 100% de aprovação (90 testes unitários e de integração cobrindo domínio, repositórios, hooks e UI)

---

## 💻 Como Rodar o Projeto em Desenvolvimento

Caso você seja um desenvolvedor e queira contribuir ou executar o projeto em sua máquina:

### 1. Pré-requisitos
* [Node.js](https://nodejs.org/) (versão 20 LTS ou superior)
* Gerenciador de pacotes `npm` ou `yarn`
* Celular físico com o app **Expo Go** instalado (Android/iOS) ou um emulador configurado

### 2. Instalação e Execução
```bash
# Instalar dependências
npm install

# Executar testes automatizados
npm test

# Executar validador completo do projeto
./validar-mobile.ps1

# Iniciar servidor de desenvolvimento
npx expo start
```
