# 📱 Análise de Hinos (AnaliseHinosApp)

> Aplicativo mobile moderno, independente e de código aberto para registro, análise estatística e acompanhamento de frequência do repertório de hinos de louvor em cultos e reuniões.

[![React Native](https://img.shields.io/badge/React%20Native-Expo%20SDK%2057-000000?style=flat&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/SQLite-Local--First%20(Offline)-003B57?style=flat&logo=sqlite)](https://docs.expo.dev/versions/latest/sdk/sqlite/)
[![Tests](https://img.shields.io/badge/Tests-100%25%20Passing-success?style=flat&logo=jest)](https://jestjs.io/)
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

* 🎯 **Regra de Negócio de Desduplicação Diária (Inviolável):**
  * Se o mesmo hino for tocado mais de uma vez no mesmo dia (por exemplo, no culto da manhã e no culto da noite, ou repetido na mesma reunião), o sistema computa **apenas 1 presença** para o ranking daquele dia, garantindo estatísticas justas e fidedignas.

* 📊 **Dashboard Analítico Inteligente:**
  * Resumo executivo de métricas: total de cultos realizados, total de hinos registrados e média de hinos por culto.
  * Ranking decrescente de frequência: identifique claramente quais hinos são mais tocados e quais estão esquecidos ou com baixa rotatividade no repertório.
  * Filtros temporais dinâmicos: visualize os dados filtrando por **Últimos 30 dias**, **Últimos 90 dias**, **Ano Atual** ou **Todo o Histórico**.

* 📄 **Relatórios e Compartilhamento:**
  * Geração instantânea de relatórios consolidados em HTML formatado e visualmente elegante para impressão ou PDF.
  * Integração nativa com o compartilhamento do sistema operacional para envio direto de relatórios via **WhatsApp**, **Telegram** ou **E-mail**.

* 📥 **Migração e Importação de Planilhas:**
  * Importador integrado compatível com arquivos de planilhas legadas (`.xlsx` / Excel), permitindo carregar de uma só vez todo o histórico anterior da sua igreja diretamente para o banco de dados do app.

* 🔒 **Operação 100% Offline (Local-First):**
  * O aplicativo funciona sem necessidade de internet, sem cadastro de conta e sem dependência de servidores em nuvem. Os dados são gravados localmente em um banco de dados relacional SQLite (`expo-sqlite`).

---

## 🧭 Como Usar o Aplicativo (Guia Prático)

| Aba | Para que serve | Como utilizar |
| :--- | :--- | :--- |
| **Lançamento** | Registrar os hinos cantados no culto de hoje ou em datas anteriores. | Selecione a data desejada, digite os números dos hinos no teclado numérico e toque em adicionar. Os hinos entram imediatamente na lista do dia. |
| **Dashboard** | Acompanhar a distribuição e repetição dos hinos. | Escolha o período desejado nos botões superiores (30d, 90d, Ano, Geral) e consulte os cartões de métricas e a listagem ordenada de frequência. |
| **Relatórios** | Prestar contas ou compartilhar o repertório com o grupo de louvor. | Defina o período de início e fim, confira a pré-visualização na tela e toque em **Compartilhar Relatório** para enviar o documento formatado. |
| **Importar** | Trazer histórico antigo já digitado em Excel. | Toque em **Selecionar Arquivo Excel**, escolha a planilha do seu dispositivo e aguarde a validação e carga automática no banco. |

---

## 🛠️ Stack Tecnológica & Arquitetura

O projeto foi construído seguindo princípios de **Clean Architecture**, **TDD (Test-Driven Development)** e código desacoplado:

* **Engine:** React Native com Expo (SDK 57+)
* **Navegação:** Expo Router (roteamento baseado em sistema de arquivos)
* **Linguagem:** TypeScript (tipagem estrita sem concessões)
* **Persistência de Dados:** SQLite nativo via `expo-sqlite` (mobile) e `LocalStorage` (web preview)
* **Feedback e Mídia:** `expo-haptics`, `expo-print`, `expo-sharing`, `expo-document-picker`
* **Testes Automatizados:** Jest com cobertura integral de regras de domínio, banco de dados e componentes de apresentação

---

## 💻 Como Rodar o Projeto em Desenvolvimento

Caso você seja um desenvolvedor e queira contribuir ou executar o projeto em sua máquina:

### 1. Pré-requisitos
* [Node.js](https://nodejs.org/) (versão 20 LTS ou superior)
* Gerenciador de pacotes `npm` ou `yarn`
* Celular físico com o app **Expo Go** instalado (Android/iOS) ou um emulador configurado

### 2. Clonar o Repositório e Instalar Dependências
```bash
git clone https://github.com/wesley1248/AnaliseHinosApp.git
cd AnaliseHinosApp
npm install
```

### 3. Iniciar o Servidor Expo
```bash
npx expo start
```
* Aponte a câmera do seu celular (ou o leitor de QR Code do Expo Go) para o terminal para abrir o aplicativo no seu dispositivo.
* Pressione `w` no terminal caso deseje abrir a versão Web no navegador.

### 4. Executar os Testes Automatizados
```bash
# Rodar todos os testes unitários e de integração
npm test

# Ou executar o validador rigoroso do projeto (PowerShell no Windows):
.\validar-mobile.ps1
```

---

## ⚖️ Licença de Uso Aberto

Este projeto é distribuído sob a licença **MIT**. Isso significa que ele é **100% livre e de código aberto**: qualquer igreja, congregação, desenvolvedor ou comunidade pode usar, estudar, customizar, modificar e redistribuir o aplicativo gratuitamente, sem restrições comerciais ou exigência de pagamento.

Consulte o arquivo [`LICENSE`](./LICENSE) para o texto legal completo da licença.

---

Feito com dedicação para aprimorar a organização do louvor congregacional. Contribuições, sugestões e melhorias são sempre bem-vindas!
