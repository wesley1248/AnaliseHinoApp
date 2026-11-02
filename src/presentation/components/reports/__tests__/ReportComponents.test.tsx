import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ReportFilterAndSortBar } from '../ReportFilterAndSortBar';
import { ReportSummaryMetrics } from '../ReportSummaryMetrics';
import { ReportPreviewTable } from '../ReportPreviewTable';
import { ReportActionButtons } from '../ReportActionButtons';

describe('ReportFilterAndSortBar Component', () => {
  it('deve renderizar chips de ordenação e filtro com opção de Repetidos (2+)', () => {
    const mockSort = jest.fn();
    const mockFilter = jest.fn();

    const { getByText } = render(
      <ReportFilterAndSortBar
        selectedSort="mais_tocados"
        onSelectSort={mockSort}
        selectedFilter="apenas_repetidos"
        onSelectFilter={mockFilter}
      />
    );

    expect(getByText('Mais Tocados')).toBeTruthy();
    expect(getByText('Repetidos (2+)')).toBeTruthy();
    expect(getByText('Apenas Tocados')).toBeTruthy();
    expect(getByText('Todos (1-480)')).toBeTruthy();

    fireEvent.press(getByText('Repetidos (2+)'));
    expect(mockFilter).toHaveBeenCalledWith('apenas_repetidos');

    fireEvent.press(getByText('Nº Hino'));
    expect(mockSort).toHaveBeenCalledWith('numero_hino');
  });
});

describe('ReportSummaryMetrics Component', () => {
  const sampleMetrics = {
    distinctDaysCount: 8,
    totalExecutions: 24,
    distinctHymnsCount: 15,
    neverPlayedCount: 465,
    repeatedHymnsCount: 4,
  };

  it('deve exibir os 4 cards de KPI com destaque para hinos repetidos', () => {
    const { getByText } = render(<ReportSummaryMetrics metrics={sampleMetrics} />);

    expect(getByText('Repetidos (2+)')).toBeTruthy();
    expect(getByText('4')).toBeTruthy();
    expect(getByText('Cantados')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
    expect(getByText('Cultos')).toBeTruthy();
    expect(getByText('8')).toBeTruthy();
    expect(getByText('Não Tocados')).toBeTruthy();
    expect(getByText('465')).toBeTruthy();
  });

  it('deve abrir o modal de ajuda ao tocar no ícone (?) do card de Repetidos', () => {
    const { getByLabelText, getByText } = render(
      <ReportSummaryMetrics metrics={sampleMetrics} />
    );

    const helpButton = getByLabelText('Ajuda sobre Hinos Repetidos no Relatório');
    fireEvent.press(helpButton);

    expect(getByText('Hinos Repetidos (2+)')).toBeTruthy();
    expect(getByText('Entendido')).toBeTruthy();
  });
});

describe('ReportPreviewTable Component', () => {
  const sampleItems = [
    {
      hymnNumber: 43,
      distinctDaysCount: 4,
      totalExecutions: 5,
      percentageOfDays: 50,
      dates: ['2026-10-01', '2026-10-08'],
    },
    {
      hymnNumber: 100,
      distinctDaysCount: 1,
      totalExecutions: 1,
      percentageOfDays: 12.5,
    },
  ];

  it('deve renderizar linhas com dados dos hinos, badge repetido e datas', () => {
    const { getByText } = render(<ReportPreviewTable items={sampleItems} />);

    expect(getByText('Hino 43')).toBeTruthy();
    expect(getByText('Repetido')).toBeTruthy();
    expect(getByText('01/10/2026 • 08/10/2026')).toBeTruthy();
    expect(getByText('4')).toBeTruthy();
    expect(getByText('50.0%')).toBeTruthy();

    expect(getByText('Hino 100')).toBeTruthy();
  });

  it('deve exibir aviso quando a lista de itens estiver vazia', () => {
    const { getByText } = render(<ReportPreviewTable items={[]} />);
    expect(getByText('Nenhum registro encontrado para os filtros selecionados.')).toBeTruthy();
  });
});

describe('ReportActionButtons Component', () => {
  it('deve disparar onExportPdf e onPrint ao tocar nos respectivos botões', () => {
    const mockExportPdf = jest.fn();
    const mockPrint = jest.fn();

    const { getByText } = render(
      <ReportActionButtons
        onExportPdf={mockExportPdf}
        onPrint={mockPrint}
        isExporting={false}
      />
    );

    fireEvent.press(getByText('Exportar PDF'));
    expect(mockExportPdf).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText('Imprimir'));
    expect(mockPrint).toHaveBeenCalledTimes(1);
  });
});
