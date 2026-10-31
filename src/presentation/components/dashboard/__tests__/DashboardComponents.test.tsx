import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PeriodFilterSelector } from '../PeriodFilterSelector';
import { DashboardMetricsCards } from '../DashboardMetricsCards';
import { HymnRankingList } from '../HymnRankingList';
import { HymnFrequency } from '@/domain/entities/HymnOccurrence';

describe('PeriodFilterSelector Component', () => {
  it('deve renderizar as 4 opções de período e disparar onChange ao tocar', () => {
    const mockOnChange = jest.fn();
    const { getByText } = render(
      <PeriodFilterSelector selectedPeriod="todos" onSelectPeriod={mockOnChange} />
    );

    expect(getByText('Todos')).toBeTruthy();
    expect(getByText('30 Dias')).toBeTruthy();
    expect(getByText('90 Dias')).toBeTruthy();
    expect(getByText('Este Ano')).toBeTruthy();

    fireEvent.press(getByText('30 Dias'));
    expect(mockOnChange).toHaveBeenCalledWith('30d');
  });
});

describe('DashboardMetricsCards Component', () => {
  it('deve renderizar as métricas corretamente', () => {
    const metrics = {
      totalExecutions: 42,
      distinctDaysCount: 15,
      mostFrequentHymn: {
        hymnNumber: 15,
        distinctDaysCount: 8,
        totalExecutionsCount: 10,
        dates: ['2026-10-01'],
      },
      distinctHymnsCount: 20,
    };

    const { getByText } = render(<DashboardMetricsCards metrics={metrics} />);

    expect(getByText('42')).toBeTruthy();
    expect(getByText('Total de Hinos')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
    expect(getByText('Cultos / Dias')).toBeTruthy();
    expect(getByText('Hino 15')).toBeTruthy();
    expect(getByText('Mais Cantado')).toBeTruthy();
    expect(getByText('20')).toBeTruthy();
    expect(getByText('Repertório')).toBeTruthy();
  });

  it('deve exibir traço "-" quando não houver hino mais frequente', () => {
    const metrics = {
      totalExecutions: 0,
      distinctDaysCount: 0,
      mostFrequentHymn: null,
      distinctHymnsCount: 0,
    };

    const { getByText } = render(<DashboardMetricsCards metrics={metrics} />);
    expect(getByText('-')).toBeTruthy();
  });
});

describe('HymnRankingList Component', () => {
  const sampleFrequencies: HymnFrequency[] = [
    {
      hymnNumber: 15,
      distinctDaysCount: 5,
      totalExecutionsCount: 7,
      dates: ['2026-10-01', '2026-10-05', '2026-10-10', '2026-10-15', '2026-10-20'],
    },
    {
      hymnNumber: 100,
      distinctDaysCount: 3,
      totalExecutionsCount: 3,
      dates: ['2026-10-02', '2026-10-07', '2026-10-12'],
    },
  ];

  it('deve renderizar o ranking de hinos com posição e métricas', () => {
    const { getByText } = render(<HymnRankingList frequencies={sampleFrequencies} />);

    expect(getByText('Ranking de Frequência')).toBeTruthy();
    expect(getByText('Hino 15')).toBeTruthy();
    expect(getByText('5 cultos')).toBeTruthy();
    expect(getByText('(7 execuções)')).toBeTruthy();

    expect(getByText('Hino 100')).toBeTruthy();
    expect(getByText('3 cultos')).toBeTruthy();
  });

  it('deve exibir mensagem de lista vazia quando não houver hinos', () => {
    const { getByText } = render(<HymnRankingList frequencies={[]} />);
    expect(getByText('Nenhum hino registrado no período')).toBeTruthy();
  });
});
