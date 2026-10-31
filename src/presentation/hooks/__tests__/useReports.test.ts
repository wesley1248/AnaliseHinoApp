import { renderHook, act } from '@testing-library/react-native';
import { useReports } from '../useReports';
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
  ];

  beforeEach(() => {
    mockRepository = {
      addOccurrence: jest.fn(),
      addOccurrencesBatch: jest.fn(),
      deleteOccurrence: jest.fn(),
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

  it('deve carregar os dados e calcular métricas consolidadas', async () => {
    const { result } = renderHook(() => useReports(mockRepository));

    await act(async () => {});

    expect(result.current.isLoading).toBe(false);
    expect(result.current.metrics.totalExecutions).toBe(11); // 6 + 2 + 3
    expect(result.current.metrics.distinctHymnsCount).toBe(3);
    expect(result.current.metrics.neverPlayedCount).toBe(480 - 3);
    expect(result.current.metrics.distinctDaysCount).toBe(8); // datas únicas entre os hinos retornados
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

  it('deve filtrar apenas hinos nunca tocados quando filterMode for "nunca_tocados"', async () => {
    const { result } = renderHook(() => useReports(mockRepository));
    await act(async () => {});

    act(() => {
      result.current.setFilterMode('nunca_tocados');
    });

    expect(result.current.reportItems.length).toBe(480 - 3);
    expect(result.current.reportItems.some((i) => i.hymnNumber === 43)).toBe(false);
  });
});
