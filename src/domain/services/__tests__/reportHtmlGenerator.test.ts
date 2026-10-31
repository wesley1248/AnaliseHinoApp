import { generateReportHtml, ReportHtmlData } from '../reportHtmlGenerator';

describe('reportHtmlGenerator', () => {
  const sampleData: ReportHtmlData = {
    title: 'Relatório de Frequência de Hinos',
    subtitle: 'Congregação Local - Análise Estatística',
    periodLabel: '01/10/2026 a 31/10/2026',
    generatedAt: '31/10/2026 14:00',
    metrics: {
      distinctDaysCount: 8,
      totalExecutions: 24,
      distinctHymnsCount: 15,
      neverPlayedCount: 465,
    },
    items: [
      {
        hymnNumber: 43,
        distinctDaysCount: 4,
        totalExecutions: 5,
        percentageOfDays: 50,
      },
      {
        hymnNumber: 100,
        distinctDaysCount: 3,
        totalExecutions: 3,
        percentageOfDays: 37.5,
      },
      {
        hymnNumber: 215,
        distinctDaysCount: 0,
        totalExecutions: 0,
        percentageOfDays: 0,
      },
    ],
  };

  it('deve gerar um HTML válido contendo cabeçalho, métricas e tabela de hinos', () => {
    const html = generateReportHtml(sampleData);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Relatório de Frequência de Hinos');
    expect(html).toContain('Congregação Local - Análise Estatística');
    expect(html).toContain('01/10/2026 a 31/10/2026');
    expect(html).toContain('31/10/2026 14:00');

    // Metricas
    expect(html).toContain('8'); // distinctDaysCount
    expect(html).toContain('24'); // totalExecutions
    expect(html).toContain('15'); // distinctHymnsCount

    // Itens da tabela
    expect(html).toContain('Hino 43');
    expect(html).toContain('Hino 100');
    expect(html).toContain('Hino 215');
    expect(html).toContain('50.0%');
  });

  it('deve exibir mensagem amigável quando a lista de itens estiver vazia', () => {
    const emptyData: ReportHtmlData = {
      ...sampleData,
      items: [],
    };

    const html = generateReportHtml(emptyData);
    expect(html).toContain('Nenhum registro encontrado');
  });

  it('deve incluir nota explicativa da desduplicação diária no rodapé', () => {
    const html = generateReportHtml(sampleData);
    expect(html).toContain('Desduplicação diária:');
  });
});
