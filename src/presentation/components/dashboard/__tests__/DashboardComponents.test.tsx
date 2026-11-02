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
    repeatedHymnsCount: 5,
    singleHymnsCount: 15,
    repetitionRate: 25.0,
  };

  it('deve renderizar as métricas de repetição e cards corretamente', () => {
    const { getByText } = render(<DashboardMetricsCards metrics={metrics} />);

    expect(getByText('Hinos Repetidos')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    expect(getByText('25.0% do repertório')).toBeTruthy();

    expect(getByText('Repertório')).toBeTruthy();
    expect(getByText('20')).toBeTruthy();

    expect(getByText('Mais Cantado')).toBeTruthy();
    expect(getByText('Hino 15')).toBeTruthy();

    expect(getByText('Cultos / Dias')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
  });

  it('deve abrir o modal de ajuda ao tocar no ícone (?) de Hinos Repetidos', () => {
    const { getByLabelText, getByText } = render(<DashboardMetricsCards metrics={metrics} />);

    const helpButton = getByLabelText('Ajuda sobre Hinos Repetidos');
    fireEvent.press(helpButton);

    expect(getByText('Hinos Repetidos (2+ Cultos)')).toBeTruthy();
    expect(getByText('Entendido')).toBeTruthy();
  });

  it('deve exibir traço "-" quando não houver hino mais frequente', () => {
    const emptyMetrics = {
      totalExecutions: 0,
      distinctDaysCount: 0,
      mostFrequentHymn: null,
      distinctHymnsCount: 0,
      repeatedHymnsCount: 0,
      singleHymnsCount: 0,
      repetitionRate: 0,
    };

    const { getByText } = render(<DashboardMetricsCards metrics={emptyMetrics} />);
    expect(getByText('-')).toBeTruthy();
  });
});

describe('HymnRankingList Component', () => {
  const sampleFrequencies: HymnFrequency[] = [
    {
      hymnNumber: 15,
      distinctDaysCount: 5,
      totalExecutionsCount: 7,
      dates: ['2026-10-01', '2026-10-05', '2026-10-10'],
    },
    {
      hymnNumber: 100,
      distinctDaysCount: 2,
      totalExecutionsCount: 2,
      dates: ['2026-10-02', '2026-10-07'],
    },
    {
      hymnNumber: 42,
      distinctDaysCount: 1,
      totalExecutionsCount: 1,
      dates: ['2026-10-12'],
    },
  ];

  it('deve renderizar apenas repetidos por padrão com tag e datas dos cultos', () => {
    const { getByText, queryByText } = render(
      <HymnRankingList frequencies={sampleFrequencies} rankingFilter="repetidos" />
    );

    expect(getByText('Ranking de Frequência')).toBeTruthy();
    expect(getByText('Hino 15')).toBeTruthy();
    expect(getByText('5 cultos')).toBeTruthy();
    expect(getByText('01/10/2026 • 05/10/2026 • 10/10/2026')).toBeTruthy();

    expect(getByText('Hino 100')).toBeTruthy();
    expect(getByText('2 cultos')).toBeTruthy();

    // Hino 42 tem apenas 1 culto, não deve aparecer no filtro "repetidos"
    expect(queryByText('Hino 42')).toBeNull();
  });

  it('deve renderizar todos cantados quando rankingFilter for "todos"', () => {
    const { getByText } = render(
      <HymnRankingList frequencies={sampleFrequencies} rankingFilter="todos" />
    );

    expect(getByText('Hino 15')).toBeTruthy();
    expect(getByText('Hino 100')).toBeTruthy();
    expect(getByText('Hino 42')).toBeTruthy();
  });

  it('deve disparar onSelectRankingFilter ao tocar nos chips', () => {
    const mockOnSelect = jest.fn();
    const { getByText } = render(
      <HymnRankingList
        frequencies={sampleFrequencies}
        rankingFilter="repetidos"
        onSelectRankingFilter={mockOnSelect}
      />
    );

    fireEvent.press(getByText('Todos Cantados'));
    expect(mockOnSelect).toHaveBeenCalledWith('todos');

    fireEvent.press(getByText('Cantados 1 Vez'));
    expect(mockOnSelect).toHaveBeenCalledWith('unicos');
  });

  it('deve exibir mensagem de nenhum hino repetido quando lista for vazia', () => {
    const singleOnly: HymnFrequency[] = [
      {
        hymnNumber: 42,
        distinctDaysCount: 1,
        totalExecutionsCount: 1,
        dates: ['2026-10-12'],
      },
    ];

    const { getByText } = render(
      <HymnRankingList frequencies={singleOnly} rankingFilter="repetidos" />
    );
    expect(getByText('Nenhum hino repetido no período!')).toBeTruthy();
  });
});
