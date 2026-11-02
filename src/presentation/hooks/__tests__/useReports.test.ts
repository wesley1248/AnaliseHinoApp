import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useReports } from '../useReports';
import { dataSyncNotifier } from '@/domain/events/dataSyncEvents';
import { IHymnRepository } from '../../../domain/repositories/IHymnRepository';
import { HymnFrequency } from '../../../domain/entities/HymnOccurrence';

describe('useReports hook', () => {
  let mockRepository: jest.Mocked<IHymnRepository>;

  const mockFrequencies: HymnFrequency[] = [
    {
      hymnNumber: 43,
      distinctDaysCount: 5,
      totalExecutionsCount: 6,
      dates: ['2026-10-01', '2026-10-05', '2026-10-10', '2026-10-15', '2026-10-20'],
    },
    {
      hymnNumber: 100,
      distinctDaysCount: 2,
      totalExecutionsCount: 2,
      dates: ['2026-10-01', '2026-10-05'],
    },
    {
      hymnNumber: 15,
      distinctDaysCount: 3,
      totalExecutionsCount: 3,
      dates: ['2026-10-02', '2026-10-08', '2026-10-12'],
    },
    {
      hymnNumber: 50,
      distinctDaysCount: 1,
      totalExecutionsCount: 1,
      dates: ['2026-10-02'],
    },
  ];

  beforeEach(() => {
    mockRepository = {
      addOccurrence: jest.fn(),
      addOccurrencesBatch: jest.fn(),
      deleteOccurrence: jest.fn(),
      deleteOccurrencesByDateRange: jest.fn(),
      getByDate: jest.fn(),
      getAllOccurrences: jest.fn(),
      getOccurrencesByDateRange: jest.fn(),
      getDeduplicatedFrequencies: jest.fn().mockResolvedValue(mockFrequencies),
      getDistinctDates: jest.fn().mockResolvedValue([
        '2026-10-01',
        '2026-10-02',
        '2026-10-05',
        '2026-10-08',
        '2026-10-10',
        '2026-10-12',
        '2026-10-15',
        '2026-10-20',
      ]),
      clearAll: jest.fn(),
    };
  });

  it('deve carregar os dados e calcular métricas consolidadas incluindo hinos repetidos', async () => {
    const { result } = renderHook(() => useReports(mockRepository));

    await act(async () => {});

    expect(result.current.isLoading).toBe(false);
    expect(result.current.metrics.totalExecutions).toBe(12); // 6 + 2 + 3 + 1
    expect(result.current.metrics.distinctHymnsCount).toBe(4);
    expect(result.current.metrics.neverPlayedCount).toBe(480 - 4);
    expect(result.current.metrics.distinctDaysCount).toBe(8);
    // Hinos 43 (5), 100 (2), 15 (3) são repetidos (>= 2). Hino 50 (1) não é.
    expect(result.current.metrics.repeatedHymnsCount).toBe(3);
  });

  it('deve filtrar apenas hinos repetidos por padrão (filterMode: apenas_repetidos)', async () => {
    const { result } = renderHook(() => useReports(mockRepository));
    await act(async () => {});

    expect(result.current.filterMode).toBe('apenas_repetidos');
    expect(result.current.reportItems.length).toBe(3);
    const hymnNumbers = result.current.reportItems.map((i) => i.hymnNumber);
    expect(hymnNumbers).toContain(43);
    expect(hymnNumbers).toContain(15);
    expect(hymnNumbers).toContain(100);
    expect(hymnNumbers).not.toContain(50);
  });

  it('deve listar todos cantados ao mudar filterMode para "apenas_tocados"', async () => {
    const { result } = renderHook(() => useReports(mockRepository));
    await act(async () => {});

    act(() => {
      result.current.setFilterMode('apenas_tocados');
    });

    expect(result.current.reportItems.length).toBe(4);
    expect(result.current.reportItems.some((i) => i.hymnNumber === 50)).toBe(true);
  });

  it('deve ordenar por mais tocados por padrão', async () => {
    const { result } = renderHook(() => useReports(mockRepository));
    await act(async () => {});

    const items = result.current.reportItems;
    expect(items[0].hymnNumber).toBe(43); // 5 cultos
    expect(items[1].hymnNumber).toBe(15); // 3 cultos
    expect(items[2].hymnNumber).toBe(100); // 2 cultos
  });

  it('deve ordenar por número do hino ao alterar ordenação', async () => {
    const { result } = renderHook(() => useReports(mockRepository));
    await act(async () => {});

    act(() => {
      result.current.setSortOption('numero_hino');
    });

    const items = result.current.reportItems;
    expect(items[0].hymnNumber).toBe(15);
    expect(items[1].hymnNumber).toBe(43);
    expect(items[2].hymnNumber).toBe(100);
  });

  it('deve incluir todos os 480 hinos quando filterMode for "todos"', async () => {
    const { result } = renderHook(() => useReports(mockRepository));
    await act(async () => {});

    act(() => {
      result.current.setFilterMode('todos');
    });

    expect(result.current.reportItems.length).toBe(480);
  });

  it('deve incluir apenas nunca tocados quando filterMode for "nunca_tocados"', async () => {
    const { result } = renderHook(() => useReports(mockRepository));
    await act(async () => {});

    act(() => {
      result.current.setFilterMode('nunca_tocados');
    });

    expect(result.current.reportItems.length).toBe(480 - 4);
    expect(result.current.reportItems.some((i) => i.hymnNumber === 43)).toBe(false);
  });

  it('deve reagir à emissão de dataSyncNotifier.notify()', async () => {
    const { result } = renderHook(() => useReports(mockRepository));
    await act(async () => {});

    mockRepository.getDeduplicatedFrequencies.mockClear();

    act(() => {
      dataSyncNotifier.notify();
    });

    await waitFor(() => {
      expect(mockRepository.getDeduplicatedFrequencies).toHaveBeenCalled();
    });
  });
});
