import {
  IHymnRepository,
  CreateOccurrenceInput,
} from '../../domain/repositories/IHymnRepository';
import {
  HymnOccurrence,
  HymnFrequency,
} from '../../domain/entities/HymnOccurrence';
import { calculateDeduplicatedFrequencies } from '../../domain/rules/dailyDeduplication';
import { ISQLiteDatabase } from '../database/types';
import { TABLE_HYMN_OCCURRENCES, HymnOccurrenceRow } from '../database/schema';

/**
 * Implementação do repositório de hinos utilizando SQLite local (`expo-sqlite`).
 * 
 * Responsável pela persistência transacional de ocorrências de hinos e consultas
 * consolidadas, garantindo que o aplicativo funcione de forma autônoma e 100% offline.
 */
export class SQLiteHymnRepository implements IHymnRepository {
  /**
   * Construtor com injeção da conexão de banco de dados SQLite.
   * 
   * @param db Conexão ativa compatível com a interface ISQLiteDatabase
   */
  constructor(private readonly db: ISQLiteDatabase) {}

  /**
   * Converte uma linha bruta do SQLite para a entidade de domínio HymnOccurrence.
   */
  private mapRowToEntity(row: HymnOccurrenceRow): HymnOccurrence {
    return {
      id: row.id,
      hymnNumber: row.hymn_number,
      date: row.date,
      notes: row.notes !== null && row.notes !== undefined ? row.notes : undefined,
      createdAt: row.created_at,
    };
  }

  /**
   * Adiciona um registro individual de execução de hino no banco local.
   */
  public async addOccurrence(input: CreateOccurrenceInput): Promise<HymnOccurrence> {
    const query = `
      INSERT INTO ${TABLE_HYMN_OCCURRENCES} (hymn_number, date, notes)
      VALUES (?, ?, ?);
    `;

    const result = await this.db.runAsync(
      query,
      input.hymnNumber,
      input.date,
      input.notes ?? null
    );

    const created = await this.db.getFirstAsync<HymnOccurrenceRow>(
      `SELECT * FROM ${TABLE_HYMN_OCCURRENCES} WHERE id = ?;`,
      result.lastInsertRowId
    );

    if (!created) {
      return {
        id: result.lastInsertRowId,
        hymnNumber: input.hymnNumber,
        date: input.date,
        notes: input.notes,
        createdAt: new Date().toISOString(),
      };
    }

    return this.mapRowToEntity(created);
  }

  /**
   * Adiciona um lote de hinos dentro de uma única transação atômica.
   */
  public async addOccurrencesBatch(inputs: CreateOccurrenceInput[]): Promise<number> {
    if (!inputs || inputs.length === 0) {
      return 0;
    }

    let insertedCount = 0;
    await this.db.withTransactionAsync(async () => {
      const query = `
        INSERT INTO ${TABLE_HYMN_OCCURRENCES} (hymn_number, date, notes)
        VALUES (?, ?, ?);
      `;

      for (const item of inputs) {
        await this.db.runAsync(query, item.hymnNumber, item.date, item.notes ?? null);
        insertedCount++;
      }
    });

    return insertedCount;
  }

  /**
   * Remove uma ocorrência pelo seu identificador único.
   */
  public async deleteOccurrence(id: number): Promise<boolean> {
    const query = `DELETE FROM ${TABLE_HYMN_OCCURRENCES} WHERE id = ?;`;
    const result = await this.db.runAsync(query, id);
    return result.changes > 0;
  }

  /**
   * Retorna as ocorrências registradas em uma data específica.
   */
  public async getByDate(date: string): Promise<HymnOccurrence[]> {
    const query = `
      SELECT * FROM ${TABLE_HYMN_OCCURRENCES}
      WHERE date = ?
      ORDER BY id ASC;
    `;
    const rows = await this.db.getAllAsync<HymnOccurrenceRow>(query, date);
    return rows.map(r => this.mapRowToEntity(r));
  }

  /**
   * Retorna todas as ocorrências de hinos da base de dados.
   */
  public async getAllOccurrences(): Promise<HymnOccurrence[]> {
    const query = `
      SELECT * FROM ${TABLE_HYMN_OCCURRENCES}
      ORDER BY date DESC, id DESC;
    `;
    const rows = await this.db.getAllAsync<HymnOccurrenceRow>(query);
    return rows.map(r => this.mapRowToEntity(r));
  }

  /**
   * Retorna ocorrências filtradas dentro de um intervalo de datas.
   */
  public async getOccurrencesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<HymnOccurrence[]> {
    const query = `
      SELECT * FROM ${TABLE_HYMN_OCCURRENCES}
      WHERE date >= ? AND date <= ?
      ORDER BY date ASC, id ASC;
    `;
    const rows = await this.db.getAllAsync<HymnOccurrenceRow>(query, startDate, endDate);
    return rows.map(r => this.mapRowToEntity(r));
  }

  /**
   * Retorna o ranking consolidado aplicando a regra de desduplicação diária.
   */
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

  /**
   * Retorna todas as datas distintas cadastradas no banco em ordem cronológica.
   */
  public async getDistinctDates(): Promise<string[]> {
    const query = `
      SELECT DISTINCT date FROM ${TABLE_HYMN_OCCURRENCES}
      ORDER BY date ASC;
    `;
    const rows = await this.db.getAllAsync<{ date: string }>(query);
    return rows.map(r => r.date);
  }

  /**
   * Limpa todos os dados da tabela de ocorrências.
   */
  public async clearAll(): Promise<void> {
    await this.db.runAsync(`DELETE FROM ${TABLE_HYMN_OCCURRENCES};`);
  }
}
