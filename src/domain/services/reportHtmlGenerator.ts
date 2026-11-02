/**
 * @file reportHtmlGenerator.ts
 * @description Gerador de HTML limpo e profissional para impressão e exportação em PDF.
 * Inclui cabeçalho, resumo de KPIs (com foco em hinos repetidos), tabela estilizada com
 * indicação das datas dos cultos onde o hino foi cantado e rodapé explicativo da desduplicação.
 */

export interface ReportItemData {
  hymnNumber: number;
  distinctDaysCount: number;
  totalExecutions: number;
  percentageOfDays: number;
  /** Datas ISO em que o hino foi entoado (opcional para exibição de detalhe) */
  dates?: string[];
}

export interface ReportMetricsData {
  distinctDaysCount: number;
  totalExecutions: number;
  distinctHymnsCount: number;
  neverPlayedCount: number;
  /** Quantidade de hinos que se repetiram (>= 2 cultos) */
  repeatedHymnsCount?: number;
}

export interface ReportHtmlData {
  title: string;
  subtitle: string;
  periodLabel: string;
  generatedAt: string;
  metrics: ReportMetricsData;
  items: ReportItemData[];
}

/**
 * Formata data ISO YYYY-MM-DD para DD/MM/AAAA.
 */
function formatIsoToBr(isoDate: string): string {
  if (!isoDate || !isoDate.includes('-')) return isoDate;
  const parts = isoDate.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : isoDate;
}

/**
 * Gera a string HTML completa estruturada para renderização e impressão/PDF.
 *
 * @param data Objeto com os dados estruturados do relatório.
 * @returns String contendo o documento HTML formatado com estilos inline e CSS print.
 */
export function generateReportHtml(data: ReportHtmlData): string {
  const { title, subtitle, periodLabel, generatedAt, metrics, items } = data;

  const repeatedCount = metrics.repeatedHymnsCount ?? items.filter((i) => i.distinctDaysCount >= 2).length;

  const rowsHtml = items.length > 0
    ? items
        .map((item, index) => {
          const isRepeated = item.distinctDaysCount >= 2;
          const formattedDates = item.dates && item.dates.length > 0
            ? item.dates.map(formatIsoToBr).join(', ')
            : '';

          return `
        <tr class="${index % 2 === 0 ? 'even' : 'odd'} ${isRepeated ? 'row-repeated' : ''}">
          <td class="col-rank">${index + 1}</td>
          <td class="col-hymn">
            <div class="hymn-title-cell">
              <strong>Hino ${item.hymnNumber}</strong>
              ${isRepeated ? '<span class="badge-repeated">Repetido</span>' : ''}
            </div>
            ${formattedDates ? `<div class="dates-list">Cultos: ${formattedDates}</div>` : ''}
          </td>
          <td class="col-num ${isRepeated ? 'num-highlight' : ''}">${item.distinctDaysCount}</td>
          <td class="col-num">${item.totalExecutions}</td>
          <td class="col-num">${item.percentageOfDays.toFixed(1)}%</td>
        </tr>`;
        })
        .join('')
    : `
      <tr>
        <td colspan="5" class="empty-state">
          Nenhum registro encontrado para o período e critérios selecionados.
        </td>
      </tr>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0F172A;
      background-color: #FFFFFF;
      padding: 32px;
      font-size: 13px;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #2563EB;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header-main h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 4px;
    }
    .header-main p {
      font-size: 13px;
      color: #64748B;
    }
    .header-meta {
      text-align: right;
      font-size: 12px;
      color: #64748B;
    }
    .header-meta strong {
      color: #1E293B;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 12px 14px;
    }
    .kpi-card.highlight {
      background-color: #EFF6FF;
      border-color: #BFDBFE;
    }
    .kpi-card.repeated-highlight {
      background-color: #FFFBEB;
      border-color: #FDE68A;
    }
    .kpi-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748B;
      margin-bottom: 4px;
    }
    .kpi-card.repeated-highlight .kpi-label {
      color: #B45309;
    }
    .kpi-value {
      font-size: 20px;
      font-weight: 800;
      color: #0F172A;
    }
    .kpi-card.highlight .kpi-value {
      color: #1D4ED8;
    }
    .kpi-card.repeated-highlight .kpi-value {
      color: #D97706;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    thead {
      display: table-header-group;
    }
    th {
      background-color: #0F172A;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 12px;
      text-align: left;
    }
    th.col-num, td.col-num {
      text-align: right;
    }
    th.col-rank, td.col-rank {
      width: 48px;
      text-align: center;
    }
    td {
      padding: 9px 12px;
      border-bottom: 1px solid #E2E8F0;
      font-size: 12px;
      vertical-align: top;
    }
    tr.even {
      background-color: #F8FAFC;
    }
    tr.odd {
      background-color: #FFFFFF;
    }
    tr.row-repeated {
      background-color: #FFFDF5;
    }
    .hymn-title-cell {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .badge-repeated {
      background-color: #FEF3C7;
      color: #92400E;
      border: 1px solid #FCD34D;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 1px 5px;
      border-radius: 4px;
    }
    .dates-list {
      font-size: 10px;
      color: #64748B;
      margin-top: 3px;
    }
    .num-highlight {
      font-weight: 700;
      color: #B45309;
    }
    .empty-state {
      text-align: center;
      padding: 32px;
      color: #94A3B8;
      font-style: italic;
    }
    .footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #94A3B8;
    }
    .footer strong {
      color: #64748B;
    }
    @media print {
      body {
        padding: 0;
      }
      .kpi-card {
        border-color: #CBD5E1;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-main">
      <h1>${title}</h1>
      <p>${subtitle}</p>
    </div>
    <div class="header-meta">
      <div>Período: <strong>${periodLabel}</strong></div>
      <div>Gerado em: <strong>${generatedAt}</strong></div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card repeated-highlight">
      <div class="kpi-label">Hinos Repetidos (2+)</div>
      <div class="kpi-value">${repeatedCount}</div>
    </div>
    <div class="kpi-card highlight">
      <div class="kpi-label">Hinos Cantados</div>
      <div class="kpi-value">${metrics.distinctHymnsCount}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Cultos no Período</div>
      <div class="kpi-value">${metrics.distinctDaysCount}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Total de Execuções</div>
      <div class="kpi-value">${metrics.totalExecutions}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="col-rank">#</th>
        <th class="col-hymn">Hino</th>
        <th class="col-num">Cultos Distintos</th>
        <th class="col-num">Execuções Totais</th>
        <th class="col-num">% dos Cultos</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="footer">
    <div>
      <strong>Desduplicação diária:</strong> Múltiplas execuções do mesmo hino no mesmo dia contam como 1 culto distinto. Hinos com 2+ cultos são repetidos.
    </div>
    <div>Análise de Frequência de Hinos • Local-First</div>
  </div>
</body>
</html>`;
}
