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
   * Sanitiza os parâmetros para impedir que valores indefinidos alcancem o bridge nativo.
   */
  public async addOccurrence(input: CreateOccurrenceInput): Promise<HymnOccurrence> {
    const hymnNumber = Number(input.hymnNumber);
    const date = String(input.date || '').trim();
    const notes = input.notes !== undefined && input.notes !== null ? String(input.notes).trim() : null;

    if (!date || isNaN(hymnNumber) || hymnNumber <= 0) {
      throw new Error(`Dados de ocorrência inválidos: número=${input.hymnNumber}, data=${input.date}`);
    }

    const query = `
      INSERT INTO ${TABLE_HYMN_OCCURRENCES} (hymn_number, date, notes)
      VALUES (?, ?, ?);
    `;

    const result = await this.db.runAsync(
      query,
      hymnNumber,
      date,
      notes
    );

    const created = await this.db.getFirstAsync<HymnOccurrenceRow>(
      `SELECT * FROM ${TABLE_HYMN_OCCURRENCES} WHERE id = ?;`,
      Number(result.lastInsertRowId)
    );

    if (!created) {
      return {
        id: result.lastInsertRowId,
        hymnNumber,
        date,
        notes: notes ?? undefined,
        createdAt: new Date().toISOString(),
      };
    }

    return this.mapRowToEntity(created);
  }

  /**
   * Adiciona um lote de hinos dentro de uma única transação atômica.
   * Sanitiza cada item individualmente para prevenir NullPointerExceptions nativos.
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
        const hymnNumber = Number(item.hymnNumber);
        const date = String(item.date || '').trim();
        const notes = item.notes !== undefined && item.notes !== null ? String(item.notes).trim() : null;

        if (date && !isNaN(hymnNumber) && hymnNumber > 0) {
          await this.db.runAsync(query, hymnNumber, date, notes);
          insertedCount++;
        }
      }
    });

    return insertedCount;
  }

  /**
   * Remove uma ocorrência pelo seu identificador único.
   * Valida o identificador numérico antes de interagir com o SQLite.
   */
  public async deleteOccurrence(id: number): Promise<boolean> {
    const validId = Number(id);
    if (isNaN(validId) || validId <= 0) {
      return false;
    }
    const query = `DELETE FROM ${TABLE_HYMN_OCCURRENCES} WHERE id = ?;`;
    const result = await this.db.runAsync(query, validId);
    return result.changes > 0;
  }

  /**
   * Remove todas as ocorrências de hinos dentro de um intervalo de datas (inclusive).
   * 
   * @param startDate Data inicial no formato YYYY-MM-DD
   * @param endDate Data final no formato YYYY-MM-DD
   * @returns Quantidade total de registros deletados
   */
  public async deleteOccurrencesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<number> {
    const safeStart = String(startDate || '').trim();
    const safeEnd = String(endDate || '').trim();
    if (!safeStart || !safeEnd) {
      return 0;
    }
    const query = `
      DELETE FROM ${TABLE_HYMN_OCCURRENCES}
      WHERE date >= ? AND date <= ?;
    `;
    const result = await this.db.runAsync(query, safeStart, safeEnd);
    return result.changes;
  }

  /**
   * Retorna as ocorrências registradas em uma data específica.
   * Retorna array vazio imediatamente se a data fornecida for vazia ou inválida.
   */
  public async getByDate(date: string): Promise<HymnOccurrence[]> {
    const safeDate = String(date || '').trim();
    if (!safeDate) {
      return [];
    }
    const query = `
      SELECT * FROM ${TABLE_HYMN_OCCURRENCES}
      WHERE date = ?
      ORDER BY id ASC;
    `;
    const rows = await this.db.getAllAsync<HymnOccurrenceRow>(query, safeDate);
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
    const safeStart = String(startDate || '').trim();
    const safeEnd = String(endDate || '').trim();
    if (!safeStart || !safeEnd) {
      return [];
    }
    const query = `
      SELECT * FROM ${TABLE_HYMN_OCCURRENCES}
      WHERE date >= ? AND date <= ?
      ORDER BY date ASC, id ASC;
    `;
    const rows = await this.db.getAllAsync<HymnOccurrenceRow>(query, safeStart, safeEnd);
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

    const safeStart = startDate ? String(startDate).trim() : undefined;
    const safeEnd = endDate ? String(endDate).trim() : undefined;

    if (safeStart && safeEnd) {
      occurrences = await this.getOccurrencesByDateRange(safeStart, safeEnd);
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
