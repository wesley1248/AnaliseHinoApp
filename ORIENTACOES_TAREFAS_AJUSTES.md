# 📋 Plano de Ajustes e Novas Funcionalidades — AnaliseHinosApp

Este documento orienta com precisão técnica a execução das três melhorias solicitadas pelo usuário para o aplicativo mobile **AnaliseHinosApp**.

---

## ⚠️ Regras Inegociáveis de Versionamento e Publicação

1. **Criação de Branch Obrigatória:**
   - Antes de iniciar qualquer linha de código, deve ser criada uma nova branch a partir da `main`:
     ```bash
     git checkout -b feature/ajustes-layout-calendario-exclusao
     ```
2. **Proibido Enviar ao Repositório Remoto (Sem Push):**
   - **NÃO FAZER PUSH** para o GitHub (`origin`). Todo o desenvolvimento, commits atômicos e validações devem permanecer **estritamente locais**.
3. **Validação Conjunta com o Wesley:**
   - O Wesley testará o app em tempo real no dispositivo/emulador quando estiver em casa.
4. **Merge e Release Somente Após Aprovação:**
   - Apenas após aprovação manual explícita do Wesley:
     - Realizar o merge seguro na `main`.
     - Fazer o push da `main` para o repositório remoto.
     - Atualizar a versão no `package.json` e `app.json` (ex: `1.0.2` / `versionCode: 2`).
     - Gerar nova build APK e publicar no **GitHub Releases**.

---

## 📌 Escopo dos 3 Ajustes Solicitados

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                             RESUMO DO ESCOPO                                 │
├──────┬────────────────────────────────┬──────────────────────────────────────┤
│ #    │ Funcionalidade                 │ Objetivo Principal                   │
├──────┼────────────────────────────────┼──────────────────────────────────────┤
│ 1    │ SafeArea & Insets Globais      │ Corrigir sobreposição de Status Bar  │
│      │                                │ no topo e Navigation Bar no rodapé   │
├──────┼────────────────────────────────┼──────────────────────────────────────┤
│ 2    │ Seletor por Calendário         │ Permitir selecionar datas retroativas│
│      │                                │ diretamente via calendário interativo│
├──────┼────────────────────────────────┼──────────────────────────────────────┤
│ 3    │ Exclusão por Intervalo (Range) │ Deletar hinos em lote por período    │
│      │                                │ (De: Data Inicial -> Até: Data Final)│
└──────┴────────────────────────────────┴──────────────────────────────────────┘
```

---

## 🛠️ Detalhamento Técnico das Tarefas

### Tarefa 1: Correção de SafeArea (Status Bar e Barra de Navegação Inferior)

#### Contexto e Diagnóstico
* **Problema no Topo:** Em dispositivos modernos com notch, punch-hole ou status bar alta, os títulos/abas (especialmente a tela de cadastro `Lançar`) ficam colados ou sobrepostos aos ícones de bateria, Wi-Fi e relógio. O uso atual de `paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0` falha em aparelhos que utilizam bordas arredondadas ou cutouts.
* **Problema no Rodapé:** A barra de abas (`TabLayout` em `app/(tabs)/_layout.tsx`) possui altura fixa (`height: 60`) sem considerar os botões virtuais do Android (Voltar / Home / Apps recentes) ou barra de gestos, fazendo com que a barra do sistema fique em cima dos ícones e textos das abas.

#### Ações a Implementar
1. **Uso de `react-native-safe-area-context`:**
   - Obter os insets dinâmicos via hook `useSafeAreaInsets()`:
     - `insets.top` para o espaçamento do cabeçalho.
     - `insets.bottom` para a barra inferior.
2. **Ajuste na TabBar (`app/(tabs)/_layout.tsx`):**
   - Calcular dinamicamente a altura e preenchimento inferior:
     ```typescript
     const insets = useSafeAreaInsets();
     // tabBarStyle:
     {
       backgroundColor: '#0F172A',
       borderTopColor: '#1E293B',
       height: 60 + insets.bottom,
       paddingBottom: Math.max(insets.bottom, 8),
       paddingTop: 8,
     }
     ```
3. **Ajuste nas Telas Principais (`index.tsx`, `dashboard.tsx`, `relatorio.tsx`, `importar.tsx`):**
   - Substituir o `SafeAreaView` legado do React Native por `SafeAreaView` do `react-native-safe-area-context` ou aplicar `paddingTop: insets.top` diretamente no container raiz para garantir consistência visual no Android e iOS.

---

### Tarefa 2: Seletor de Data com Calendário Interativo na Tela de Lançamento

#### Contexto e Diagnóstico
* **Problema:** Atualmente a navegação entre datas só ocorre clicando nos botões de avançar (`>`) ou retroceder (`<`) dia a dia. Para preencher dados retroativos de semanas ou meses anteriores, o usuário precisa clicar dezenas de vezes.

#### Ações a Implementar
1. **Manter Atalhos Existentes:**
   - Os botões `<` e `>` continuam funcionando normalmente para avançar e voltar 1 dia rápido.
2. **Adicionar Ação de Calendário:**
   - Tornar o card/badge da data atual clicável e/ou adicionar um botão de ícone de calendário com feedback tátil (`calendar-outline`).
3. **Modal de Calendário (Dark Modern):**
   - Criar componente de modal de seleção de data (`DatePickerModal` ou componente integrado de calendário no tema `#0F172A` / `#1E293B` / `#2563EB`).
   - Permitir navegar pelos meses, selecionar o dia desejado e confirmar.
   - Ao confirmar, atualizar o estado `selectedDate` no hook `useDailyLaunch`.
   - Carregar automaticamente os hinos da data escolhida.
4. **Tratamento Multiplataforma:**
   - Garantir compatibilidade no Android, iOS e Web.

---

### Tarefa 3: Exclusão em Massa de Hinos por Intervalo de Datas (Range)

#### Contexto e Diagnóstico
* **Problema:** Quando há necessidade de limpar uma grande massa de dados ou expurgar lançamentos incorretos de um período (ex: dias lançados em duplicidade ou importação errônea), o usuário é obrigado a ir dia por dia e deletar hino por hino.

#### Ações a Implementar
1. **Camada de Domínio e Repositório (Clean Architecture + TDD):**
   - Atualizar a interface `IHymnRepository`:
     ```typescript
     /**
      * Remove todas as ocorrências de hinos dentro de um intervalo de datas (inclusive).
      * @param startDate Data inicial no formato YYYY-MM-DD
      * @param endDate Data final no formato YYYY-MM-DD
      * @returns Quantidade total de registros deletados
      */
     deleteOccurrencesByDateRange(startDate: string, endDate: string): Promise<number>;
     ```
   - Implementar em `SQLiteHymnRepository` (utilizando query SQL `DELETE FROM occurrences WHERE date >= ? AND date <= ?`).
   - Implementar em `WebLocalStorageHymnRepository` (para suporte no modo Web).
   - Escrever testes unitários em `SQLiteHymnRepository.test.ts` e `WebLocalStorageHymnRepository.test.ts` garantindo que:
     - Deleta somente registros dentro do intervalo especificado.
     - Mantém intactos registros anteriores à data inicial ou posteriores à data final.
     - Retorna a contagem exata de itens removidos.
2. **Hook de Apresentação (`useDailyLaunch`):**
   - Adicionar método `deleteHymnsByRange(startDate: string, endDate: string): Promise<number>`.
   - Se a `selectedDate` estiver contida no intervalo excluído, recarregar automaticamente a listagem local para refletir a exclusão.
3. **Interface Visual (UI / UX na Tela de Lançamento):**
   - Inserir um botão de ação rápida no topo da tela de Lançamento (ex: ícone de lixeira com filtro ou botão secundário "Excluir Período").
   - Modal de Exclusão por Intervalo:
     - Campos: "Data Inicial" (De) e "Data Final" (Até).
     - Botões rápidos ou seletores de data.
     - **Trava de Segurança Obrigatória:** Exibir modal de confirmação explícito antes da execução ("Atenção: Esta ação excluirá permanentemente todos os hinos cadastrados entre DD/MM/AAAA e DD/MM/AAAA. Deseja continuar?").
     - Feedback claro com toast ou banner informando quantos hinos foram excluídos (ex: "18 hinos foram excluídos com sucesso!").

---

## 🧪 Estratégia de Testes Automatizados (TDD)

Todos os passos devem seguir a disciplina rigorosa de testes do projeto:
1. **Testes de Repositório:** Validar deleção por range no SQLite e Web.
2. **Testes do Hook:** Validar chamada do repositório, atualização de estado e tratamento de erro no `useDailyLaunch.test.ts`.
3. **Testes de Componentes:** Validar renderização do seletor de calendário e do modal de exclusão em lote no `LaunchComponents.test.tsx`.
4. **Verificação de Regressão:** Executar `./validar-mobile.ps1` ou `npm test` garantindo 100% dos testes verdes e compilação TypeScript sem warnings.

---

## 🚀 Roteiro de Conclusão e Release (Pós-Validação do Wesley)

Quando o Wesley validar e der o sinal verde:
1. `git checkout main`
2. `git merge feature/ajustes-layout-calendario-exclusao`
3. Atualizar versão no `package.json` (`1.0.2`) e `app.json` (`version: 1.0.2`, `android.versionCode: 2`).
4. Criar commit de versão: `git commit -m "chore(release): bump version to 1.0.2"`
5. Criar tag Git: `git tag v1.0.2`
6. `git push origin main --tags`
7. Compilar o novo APK (`eas build --platform android --profile preview` ou build local).
8. Criar release correspondente no GitHub Releases anexando o APK gerado.
