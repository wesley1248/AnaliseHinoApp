import {
  IHymnRepository,
  CreateOccurrenceInput,
} from '../../domain/repositories/IHymnRepository';
import {
  HymnOccurrence,
  HymnFrequency,
} from '../../domain/entities/HymnOccurrence';
import { calculateDeduplicatedFrequencies } from '../../domain/rules/dailyDeduplication';

const STORAGE_KEY = '@analise_hinos_occurrences';

/**
 * Repositório para o ambiente Web (navegador), utilizando LocalStorage / Memória
 * para permitir testes e prototipagem interativa sem depender do módulo nativo ExpoSQLite.
 */
export class WebLocalStorageHymnRepository implements IHymnRepository {
  private inMemoryCache: HymnOccurrence[] = [];
  private isLoaded = false;

  private loadFromStorage(): HymnOccurrence[] {
    if (this.isLoaded) return this.inMemoryCache;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this.inMemoryCache = JSON.parse(raw);
        }
      } catch {
        // Fallback para memória se houver restrição no localStorage
      }
    }
    this.isLoaded = true;
    return this.inMemoryCache;
  }

  private persist(data: HymnOccurrence[]): void {
    this.inMemoryCache = data;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Ignora erros de quota no web preview
      }
    }
  }

  public async addOccurrence(input: CreateOccurrenceInput): Promise<HymnOccurrence> {
    const list = this.loadFromStorage();
    const nextId = list.length > 0 ? Math.max(...list.map(o => o.id ?? 0)) + 1 : 1;

    const item: HymnOccurrence = {
      id: nextId,
      hymnNumber: input.hymnNumber,
      date: input.date,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };

    list.push(item);
    this.persist(list);
    return item;
  }

  public async addOccurrencesBatch(inputs: CreateOccurrenceInput[]): Promise<number> {
    let count = 0;
    for (const input of inputs) {
      await this.addOccurrence(input);
      count++;
    }
    return count;
  }

  public async deleteOccurrence(id: number): Promise<boolean> {
    const list = this.loadFromStorage();
    const filtered = list.filter(o => o.id !== id);
    const deleted = filtered.length < list.length;
    if (deleted) {
      this.persist(filtered);
    }
    return deleted;
  }

  public async getByDate(date: string): Promise<HymnOccurrence[]> {
    const list = this.loadFromStorage();
    return list.filter(o => o.date === date);
  }

  public async getAllOccurrences(): Promise<HymnOccurrence[]> {
    return [...this.loadFromStorage()];
  }

  public async getOccurrencesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<HymnOccurrence[]> {
    const list = this.loadFromStorage();
    return list.filter(o => o.date >= startDate && o.date <= endDate);
  }

  public async getDeduplicatedFrequencies(
    startDate?: string,
    endDate?: string
  ): Promise<HymnFrequency[]> {
    let occurrences: HymnOccurrence[];
    if (startDate && endDate) {
      occurrences = await this.getOccurrencesByDateRange(startDate, endDate);
    } else {
      occurrences = await this.getAllOccurrences();
    }
    return calculateDeduplicatedFrequencies(occurrences);
  }

  public async getDistinctDates(): Promise<string[]> {
    const list = this.loadFromStorage();
    const dates = Array.from(new Set(list.map(o => o.date)));
    return dates.sort();
  }

  public async clearAll(): Promise<void> {
    this.persist([]);
  }
}
