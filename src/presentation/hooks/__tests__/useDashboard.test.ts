import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useDashboard, getPeriodDateRange, DashboardPeriod } from '../useDashboard';
import { IHymnRepository } from '@/domain/repositories/IHymnRepository';
import { HymnOccurrence, HymnFrequency } from '@/domain/entities/HymnOccurrence';

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

  it('deve carregar dados iniciais e calcular métricas consolidadas', async () => {
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

    // Altera para 30 dias
    await act(async () => {
      await result.current.setPeriod('30d');
    });

    expect(result.current.period).toBe('30d');
    expect(mockRepo.getDeduplicatedFrequencies).toHaveBeenCalledWith('2026-10-01', '2026-10-31');
  });

  it('deve lidar com lista vazia de hinos sem estourar erro', async () => {
    mockRepo.getDeduplicatedFrequencies.mockResolvedValueOnce([]);
    mockRepo.getDistinctDates.mockResolvedValueOnce([]);

    const { result } = renderHook(() =>
      useDashboard({
        repository: mockRepo,
        initialPeriod: '30d',
        referenceDate: '2026-10-31',
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.frequencies).toEqual([]);
    expect(result.current.metrics.totalExecutions).toBe(0);
    expect(result.current.metrics.distinctHymnsCount).toBe(0);
    expect(result.current.metrics.mostFrequentHymn).toBeNull();
    expect(result.current.metrics.distinctDaysCount).toBe(0);
  });

  it('deve capturar erros do repositório e popular o estado de erro', async () => {
    mockRepo.getDeduplicatedFrequencies.mockRejectedValueOnce(new Error('Falha no banco SQLite'));

    const { result } = renderHook(() =>
      useDashboard({
        repository: mockRepo,
        initialPeriod: 'todos',
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Falha no banco SQLite');
  });
});
