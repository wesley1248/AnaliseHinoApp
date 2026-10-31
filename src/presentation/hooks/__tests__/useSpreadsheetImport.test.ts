import { renderHook, act } from '@testing-library/react-native';
import { useSpreadsheetImport } from '../useSpreadsheetImport';
import { IHymnRepository } from '../../../domain/repositories/IHymnRepository';

describe('useSpreadsheetImport hook', () => {
  let mockRepository: jest.Mocked<IHymnRepository>;

  beforeEach(() => {
    mockRepository = {
      addOccurrence: jest.fn(),
      addOccurrencesBatch: jest.fn().mockResolvedValue(5),
      deleteOccurrence: jest.fn(),
      getByDate: jest.fn(),
      getAllOccurrences: jest.fn(),
      getOccurrencesByDateRange: jest.fn(),
      getDeduplicatedFrequencies: jest.fn(),
      getDistinctDates: jest.fn(),
      clearAll: jest.fn(),
    };
  });

  it('deve inicializar com estado inicial padrão', () => {
    const { result } = renderHook(() => useSpreadsheetImport({ repository: mockRepository }));

    expect(result.current.fileInfo).toBeNull();
    expect(result.current.parseResult).toBeNull();
    expect(result.current.isParsing).toBe(false);
    expect(result.current.isImporting).toBe(false);
    expect(result.current.importedCount).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('deve processar linhas cruas via processRawRows e disponibilizar resultado', () => {
    const { result } = renderHook(() => useSpreadsheetImport({ repository: mockRepository }));

    const rawRows = [
      { Data: '2026-10-01', Hino: 43 },
      { Data: '2026-10-05', Hino: 100 },
      { Data: '2026-10-10', Hino: 15 },
    ];

    act(() => {
      result.current.processRawRows('hinos_outubro.xlsx', rawRows);
    });

    expect(result.current.fileInfo?.name).toBe('hinos_outubro.xlsx');
    expect(result.current.parseResult?.validRecords).toHaveLength(3);
    expect(result.current.parseResult?.distinctDatesCount).toBe(3);
  });

  it('deve executar a importação em lote chamando addOccurrencesBatch', async () => {
    const { result } = renderHook(() => useSpreadsheetImport({ repository: mockRepository }));

    const rawRows = [
      { Data: '2026-10-01', Hino: 43 },
      { Data: '2026-10-05', Hino: 100 },
    ];

    act(() => {
      result.current.processRawRows('teste.xlsx', rawRows);
    });

    await act(async () => {
      await result.current.confirmImport();
    });

    expect(mockRepository.addOccurrencesBatch).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ hymnNumber: 43, date: '2026-10-01' }),
        expect.objectContaining({ hymnNumber: 100, date: '2026-10-05' }),
      ])
    );
    expect(result.current.importedCount).toBe(5);
    expect(result.current.isImporting).toBe(false);
  });

  it('deve resetar o estado quando reset for chamado', () => {
    const { result } = renderHook(() => useSpreadsheetImport({ repository: mockRepository }));

    act(() => {
      result.current.processRawRows('teste.xlsx', [{ Data: '2026-10-01', Hino: 43 }]);
    });
    expect(result.current.fileInfo).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.fileInfo).toBeNull();
    expect(result.current.parseResult).toBeNull();
    expect(result.current.importedCount).toBeNull();
  });
});
