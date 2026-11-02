import { dataSyncNotifier } from '@/domain/events/dataSyncEvents';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useDashboard, getPeriodDateRange, DashboardPeriod } from '../useDashboard';
import { IHymnRepository } from '@/domain/repositories/IHymnRepository';
import { HymnFrequency } from '@/domain/entities/HymnOccurrence';

describe('getPeriodDateRange helper', () => {
  const refDate = '2026-10-31';

  it('deve retornar undefined para startDate e endDate quando período for "todos"', () => {
    const range = getPeriodDateRange('todos', refDate);
    expect(range.startDate).toBeUndefined();
    expect(range.endDate).toBeUndefined();
  });

  it('deve retornar intervalo correto para últimos 30 dias', () => {
    const range = getPeriodDateRange('30d', refDate);
    expect(range.endDate).toBe('2026-10-31');
    expect(range.startDate).toBe('2026-10-01');
  });

  it('deve retornar intervalo correto para últimos 90 dias', () => {
    const range = getPeriodDateRange('90d', refDate);
    expect(range.endDate).toBe('2026-10-31');
    expect(range.startDate).toBe('2026-08-02');
  });

  it('deve retornar início do ano corrente para período "ano"', () => {
    const range = getPeriodDateRange('ano', refDate);
    expect(range.startDate).toBe('2026-01-01');
    expect(range.endDate).toBe('2026-10-31');
  });
});

describe('useDashboard Hook', () => {
  let mockRepo: jest.Mocked<IHymnRepository>;

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
    {
      hymnNumber: 45,
      distinctDaysCount: 1,
      totalExecutionsCount: 2,
      dates: ['2026-10-05'],
    },
  ];

  beforeEach(() => {
    mockRepo = {
      addOccurrence: jest.fn(),
      addOccurrencesBatch: jest.fn(),
      deleteOccurrence: jest.fn(),
      deleteOccurrencesByDateRange: jest.fn(),
      getByDate: jest.fn(),
      getAllOccurrences: jest.fn(),
      getOccurrencesByDateRange: jest.fn(),
      getDeduplicatedFrequencies: jest.fn().mockResolvedValue(sampleFrequencies),
      getDistinctDates: jest.fn().mockResolvedValue(['2026-10-01', '2026-10-02', '2026-10-05', '2026-10-07', '2026-10-10', '2026-10-12', '2026-10-15', '2026-10-20']),
      clearAll: jest.fn(),
    };
  });

  it('deve carregar dados iniciais e calcular métricas consolidadas com foco em repetições', async () => {
    const { result } = renderHook(() =>
      useDashboard({
        repository: mockRepo,
        initialPeriod: 'todos',
        referenceDate: '2026-10-31',
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.period).toBe('todos');
    expect(result.current.frequencies).toHaveLength(3);

    // Métricas
    expect(result.current.metrics.totalExecutions).toBe(12); // 7 + 3 + 2
    expect(result.current.metrics.distinctHymnsCount).toBe(3);
    expect(result.current.metrics.mostFrequentHymn?.hymnNumber).toBe(15);
    expect(result.current.metrics.distinctDaysCount).toBe(8);

    // Novas métricas de repetição: 15 e 100 têm >= 2 cultos; 45 tem 1 culto
    expect(result.current.metrics.repeatedHymnsCount).toBe(2);
    expect(result.current.metrics.singleHymnsCount).toBe(1);
    expect(result.current.metrics.repetitionRate).toBeCloseTo((2 / 3) * 100, 1);

    // Filtro inicial do ranking padrão: apenas repetidos
    expect(result.current.rankingFilter).toBe('repetidos');
    expect(result.current.filteredFrequencies).toHaveLength(2);
    expect(result.current.filteredFrequencies[0].hymnNumber).toBe(15);
    expect(result.current.filteredFrequencies[1].hymnNumber).toBe(100);
  });

  it('deve alternar filtro do ranking entre repetidos, todos e únicos', async () => {
    const { result } = renderHook(() =>
      useDashboard({
        repository: mockRepo,
        initialPeriod: 'todos',
        referenceDate: '2026-10-31',
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Alterna para 'todos'
    act(() => {
      result.current.setRankingFilter('todos');
    });
    expect(result.current.filteredFrequencies).toHaveLength(3);

    // Alterna para 'unicos'
    act(() => {
      result.current.setRankingFilter('unicos');
    });
    expect(result.current.filteredFrequencies).toHaveLength(1);
    expect(result.current.filteredFrequencies[0].hymnNumber).toBe(45);
  });

  it('deve recalcular e refazer busca ao alterar o período', async () => {
    const { result } = renderHook(() =>
      useDashboard({
        repository: mockRepo,
        initialPeriod: 'todos',
        referenceDate: '2026-10-31',
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.setPeriod('30d');
    });

    expect(result.current.period).toBe('30d');
    expect(mockRepo.getDeduplicatedFrequencies).toHaveBeenCalledWith('2026-10-01', '2026-10-31');
  });

  it('deve reagir a evento do dataSyncNotifier e recarregar os dados', async () => {
    const { result } = renderHook(() =>
      useDashboard({
        repository: mockRepo,
        initialPeriod: 'todos',
        referenceDate: '2026-10-31',
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockRepo.getDeduplicatedFrequencies.mockClear();

    act(() => {
      dataSyncNotifier.notify();
    });

    await waitFor(() => {
      expect(mockRepo.getDeduplicatedFrequencies).toHaveBeenCalled();
    });
  });

  it('deve retornar métricas zeradas quando não houver frequências', async () => {
    mockRepo.getDeduplicatedFrequencies.mockResolvedValue([]);

    const { result } = renderHook(() =>
      useDashboard({
        repository: mockRepo,
        initialPeriod: 'todos',
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metrics.totalExecutions).toBe(0);
    expect(result.current.metrics.distinctDaysCount).toBe(0);
    expect(result.current.metrics.distinctHymnsCount).toBe(0);
    expect(result.current.metrics.repeatedHymnsCount).toBe(0);
    expect(result.current.metrics.singleHymnsCount).toBe(0);
    expect(result.current.metrics.repetitionRate).toBe(0);
    expect(result.current.metrics.mostFrequentHymn).toBeNull();
  });
});
