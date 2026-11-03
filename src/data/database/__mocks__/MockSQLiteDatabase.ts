import { ISQLiteDatabase } from '../types';
import { HymnOccurrenceRow } from '../schema';

/**
 * Mock em memória do banco de dados SQLite para testes unitários com Jest.
 * 
 * Simula a persistência relacional do SQLite para permitir testes 100% determinísticos,
 * rápidos e desacoplados de módulos binários nativos.
 */
export class MockSQLiteDatabase implements ISQLiteDatabase {
  private rows: HymnOccurrenceRow[] = [];
  private preferences: Map<string, string> = new Map();
  private currentId = 1;
  public executedStatements: string[] = [];

  public async execAsync(source: string): Promise<void> {
    this.executedStatements.push(source);
    // Simula comandos como TRUNCATE / DELETE ALL ou criação de tabelas
    if (source.includes('DELETE FROM hymn_occurrences') || source.includes('DROP TABLE')) {
      this.rows = [];
    }
    if (source.includes('DELETE FROM app_preferences') || source.includes('DROP TABLE')) {
      this.preferences.clear();
    }
  }

  public async runAsync(
    source: string,
    ...params: any[]
  ): Promise<{ lastInsertRowId: number; changes: number }> {
    this.executedStatements.push(source);
    const upper = source.toUpperCase();

    // Preferências do app (app_preferences)
    if (upper.includes('APP_PREFERENCES')) {
      if (upper.includes('INSERT') || upper.includes('REPLACE')) {
        const [key, value] = params;
        this.preferences.set(String(key), String(value));
        return { lastInsertRowId: 1, changes: 1 };
      }

      if (upper.includes('DELETE') && upper.includes('KEY =')) {
        const key = String(params[0]);
        const had = this.preferences.has(key);
        this.preferences.delete(key);
        return { lastInsertRowId: 0, changes: had ? 1 : 0 };
      }

      if (upper.includes('DELETE')) {
        const changes = this.preferences.size;
        this.preferences.clear();
        return { lastInsertRowId: 0, changes };
      }
    }

    if (upper.includes('INSERT INTO HYMN_OCCURRENCES')) {
      const [hymnNumber, date, notes] = params;
      const newRow: HymnOccurrenceRow = {
        id: this.currentId++,
        hymn_number: Number(hymnNumber),
        date: String(date),
        notes: notes !== undefined && notes !== null ? String(notes) : null,
        created_at: new Date().toISOString(),
      };
      this.rows.push(newRow);
      return { lastInsertRowId: newRow.id, changes: 1 };
    }

    if (upper.includes('DELETE FROM HYMN_OCCURRENCES WHERE ID =')) {
      const id = Number(params[0]);
      const initialLength = this.rows.length;
      this.rows = this.rows.filter(r => r.id !== id);
      const changes = initialLength - this.rows.length;
      return { lastInsertRowId: 0, changes };
    }

    if (upper.includes('DELETE FROM HYMN_OCCURRENCES') && upper.includes('DATE >=') && upper.includes('DATE <=')) {
      const [startDate, endDate] = params;
      const initialLength = this.rows.length;
      this.rows = this.rows.filter(r => r.date < String(startDate) || r.date > String(endDate));
      const changes = initialLength - this.rows.length;
      return { lastInsertRowId: 0, changes };
    }

    if (upper.includes('DELETE FROM HYMN_OCCURRENCES')) {
      const changes = this.rows.length;
      this.rows = [];
      return { lastInsertRowId: 0, changes };
    }

    return { lastInsertRowId: 0, changes: 0 };
  }

  public async getAllAsync<T>(source: string, ...params: any[]): Promise<T[]> {
    this.executedStatements.push(source);
    const upper = source.toUpperCase();

    // Preferências
    if (upper.includes('FROM APP_PREFERENCES')) {
      if (upper.includes('WHERE KEY =') || upper.includes('WHERE KEY = ?')) {
        const key = String(params[0]);
        const val = this.preferences.get(key);
        if (val !== undefined) {
          return [{ key, value: val }] as unknown as T[];
        }
        return [];
      }
      return Array.from(this.preferences.entries()).map(([key, value]) => ({ key, value })) as unknown as T[];
    }

    let filtered = [...this.rows];

    // Filtro por data exata (WHERE date = ?)
    if (upper.includes('WHERE DATE =') || upper.includes('WHERE DATE = ?')) {
      const targetDate = String(params[0]);
      filtered = filtered.filter(r => r.date === targetDate);
    }
    // Filtro por intervalo (WHERE date >= ? AND date <= ?)
    else if (upper.includes('DATE >=') && upper.includes('DATE <=')) {
      const [startDate, endDate] = params;
      filtered = filtered.filter(r => r.date >= String(startDate) && r.date <= String(endDate));
    }
    // Filtro apenas data inicial
    else if (upper.includes('DATE >=')) {
      const [startDate] = params;
      filtered = filtered.filter(r => r.date >= String(startDate));
    }
    // Filtro apenas data final
    else if (upper.includes('DATE <=')) {
      const [endDate] = params;
      filtered = filtered.filter(r => r.date <= String(endDate));
    }

    // Consulta de datas distintas
    if (upper.includes('SELECT DISTINCT DATE')) {
      const uniqueDates = Array.from(new Set(filtered.map(r => r.date))).sort();
      return uniqueDates.map(date => ({ date })) as unknown as T[];
    }

    // Ordenação
    if (upper.includes('ORDER BY DATE DESC, ID DESC')) {
      filtered.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    } else if (upper.includes('ORDER BY ID ASC')) {
      filtered.sort((a, b) => a.id - b.id);
    }

    return filtered as unknown as T[];
  }

  public async getFirstAsync<T>(source: string, ...params: any[]): Promise<T | null> {
    const upper = source.toUpperCase();
    if (upper.includes('FROM APP_PREFERENCES') && (upper.includes('WHERE KEY =') || upper.includes('WHERE KEY = ?'))) {
      const key = String(params[0]);
      const val = this.preferences.get(key);
      if (val !== undefined) {
        return { value: val } as unknown as T;
      }
      return null;
    }

    const results = await this.getAllAsync<T>(source, ...params);
    return results.length > 0 ? results[0] : null;
  }

  public async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    await task();
  }

  // Helpers para asserções de teste
  public getStoredRows(): HymnOccurrenceRow[] {
    return [...this.rows];
  }

  public getStoredPreferences(): Map<string, string> {
    return new Map(this.preferences);
  }

  public seedRows(
    rows: Array<{
      id?: number;
      hymn_number: number;
      date: string;
      notes?: string | null;
      created_at?: string;
    }>
  ): void {
    for (const r of rows) {
      this.rows.push({
        id: r.id ?? this.currentId++,
        hymn_number: r.hymn_number,
        date: r.date,
        notes: r.notes !== undefined ? r.notes : null,
        created_at: r.created_at ?? new Date().toISOString(),
      });
    }
  }
}
