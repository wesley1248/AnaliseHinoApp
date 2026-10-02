import { renderHook, act } from '@testing-library/react-native';
import { useDailyLaunch } from '../useDailyLaunch';
import { IHymnRepository } from '../../../domain/repositories/IHymnRepository';
import { HymnOccurrence } from '../../../domain/entities/HymnOccurrence';

class InMemoryHymnRepository implements IHymnRepository {
  private occurrences: HymnOccurrence[] = [];
  private nextId = 1;

  async addOccurrence(input: { hymnNumber: number; date: string; notes?: string }): Promise<HymnOccurrence> {
    const item: HymnOccurrence = {
      id: this.nextId++,
      hymnNumber: input.hymnNumber,
      date: input.date,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };
    this.occurrences.push(item);
    return item;
  }

  async addOccurrencesBatch(inputs: { hymnNumber: number; date: string; notes?: string }[]): Promise<number> {
    for (const input of inputs) {
      await this.addOccurrence(input);
    }
    return inputs.length;
  }

  async deleteOccurrence(id: number): Promise<boolean> {
    const initialLen = this.occurrences.length;
    this.occurrences = this.occurrences.filter(o => o.id !== id);
    return this.occurrences.length < initialLen;
  }

  async getByDate(date: string): Promise<HymnOccurrence[]> {
    return this.occurrences.filter(o => o.date === date);
  }

  async getAllOccurrences(): Promise<HymnOccurrence[]> {
    return [...this.occurrences];
  }

  async getOccurrencesByDateRange(startDate: string, endDate: string): Promise<HymnOccurrence[]> {
    return this.occurrences.filter(o => o.date >= startDate && o.date <= endDate);
  }

  async getDeduplicatedFrequencies() {
    return [];
  }

  async getDistinctDates(): Promise<string[]> {
    return Array.from(new Set(this.occurrences.map(o => o.date)));
  }

  async clearAll(): Promise<void> {
    this.occurrences = [];
  }
}

describe('useDailyLaunch Hook', () => {
  let mockRepository: InMemoryHymnRepository;

  beforeEach(() => {
    mockRepository = new InMemoryHymnRepository();
  });

  it('deve inicializar com o número vazio e carregar hinos da data inicial', async () => {
    // Arrange
    await mockRepository.addOccurrence({ hymnNumber: 15, date: '2026-10-02' });

    // Act
    const { result } = renderHook(() =>
      useDailyLaunch({ repository: mockRepository, initialDate: '2026-10-02' })
    );

    // Assert
    expect(result.current.currentNumber).toBe('');
    expect(result.current.selectedDate).toBe('2026-10-02');

    // Aguarda carregamento inicial
    await act(async () => {});
    expect(result.current.hymnsToday).toHaveLength(1);
    expect(result.current.hymnsToday[0].hymnNumber).toBe(15);
  });

  it('deve digitar números e concatenar respeitando limite máximo de 4 dígitos', async () => {
    // Arrange
    const { result } = renderHook(() =>
      useDailyLaunch({ repository: mockRepository, initialDate: '2026-10-02' })
    );
    await act(async () => {});

    // Act
    act(() => {
      result.current.typeDigit('4');
      result.current.typeDigit('5');
      result.current.typeDigit('2');
    });

    // Assert
    expect(result.current.currentNumber).toBe('452');

    // Tentativa de extrapolar o limite de 4 dígitos
    act(() => {
      result.current.typeDigit('1');
      result.current.typeDigit('9');
    });
    expect(result.current.currentNumber).toBe('4521');
  });

  it('não deve permitir 0 como primeiro dígito', async () => {
    const { result } = renderHook(() =>
      useDailyLaunch({ repository: mockRepository, initialDate: '2026-10-02' })
    );
    await act(async () => {});

    act(() => {
      result.current.typeDigit('0');
    });

    expect(result.current.currentNumber).toBe('');
  });

  it('deve apagar o último dígito com backspace e resetar com clear', async () => {
    const { result } = renderHook(() =>
      useDailyLaunch({ repository: mockRepository, initialDate: '2026-10-02' })
    );
    await act(async () => {});

    act(() => {
      result.current.typeDigit('4');
      result.current.typeDigit('5');
      result.current.typeDigit('2');
    });
    expect(result.current.currentNumber).toBe('452');

    act(() => {
      result.current.backspace();
    });
    expect(result.current.currentNumber).toBe('45');

    act(() => {
      result.current.clear();
    });
    expect(result.current.currentNumber).toBe('');
  });

  it('deve adicionar um hino válido ao banco e atualizar a lista do dia', async () => {
    const { result } = renderHook(() =>
      useDailyLaunch({ repository: mockRepository, initialDate: '2026-10-02' })
    );

    await act(async () => {});

    act(() => {
      result.current.typeDigit('4');
      result.current.typeDigit('5');
      result.current.typeDigit('2');
    });

    await act(async () => {
      await result.current.addHymn();
    });

    expect(result.current.currentNumber).toBe('');
    expect(result.current.hymnsToday).toHaveLength(1);
    expect(result.current.hymnsToday[0].hymnNumber).toBe(452);
  });

  it('deve remover um hino existente e atualizar a lista do dia', async () => {
    const { result } = renderHook(() =>
      useDailyLaunch({ repository: mockRepository, initialDate: '2026-10-02' })
    );

    await act(async () => {});

    act(() => {
      result.current.typeDigit('1');
      result.current.typeDigit('5');
    });
    await act(async () => {
      await result.current.addHymn();
    });

    const addedId = result.current.hymnsToday[0].id;
    expect(addedId).toBeDefined();

    await act(async () => {
      await result.current.removeHymn(addedId!);
    });

    expect(result.current.hymnsToday).toHaveLength(0);
  });

  it('deve navegar entre datas (ontem e amanhã) e carregar os hinos correspondentes', async () => {
    await mockRepository.addOccurrence({ hymnNumber: 10, date: '2026-10-01' });
    await mockRepository.addOccurrence({ hymnNumber: 20, date: '2026-10-02' });

    const { result } = renderHook(() =>
      useDailyLaunch({ repository: mockRepository, initialDate: '2026-10-02' })
    );

    await act(async () => {});
    expect(result.current.hymnsToday).toHaveLength(1);
    expect(result.current.hymnsToday[0].hymnNumber).toBe(20);

    // Navega para ontem
    await act(async () => {
      await result.current.goToPreviousDay();
    });
    expect(result.current.selectedDate).toBe('2026-10-01');
    expect(result.current.hymnsToday).toHaveLength(1);
    expect(result.current.hymnsToday[0].hymnNumber).toBe(10);

    // Navega de volta para hoje
    await act(async () => {
      await result.current.goToNextDay();
    });
    expect(result.current.selectedDate).toBe('2026-10-02');
    expect(result.current.hymnsToday).toHaveLength(1);
    expect(result.current.hymnsToday[0].hymnNumber).toBe(20);
  });
});
