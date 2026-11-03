import { initDatabase, getDatabase, resetDatabaseCache } from '../database';
import { MockSQLiteDatabase } from '../__mocks__/MockSQLiteDatabase';
import { TABLE_HYMN_OCCURRENCES, TABLE_APP_PREFERENCES } from '../schema';
import * as SQLite from 'expo-sqlite';

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

describe('Database Initialization & Concurrency Safety', () => {
  beforeEach(() => {
    resetDatabaseCache();
    jest.clearAllMocks();
  });

  it('deve executar scripts DDL de criação da tabela de ocorrências, preferências e índices', async () => {
    // Arrange
    const mockDb = new MockSQLiteDatabase();

    // Act
    await initDatabase(mockDb);

    // Assert
    expect(mockDb.executedStatements.length).toBeGreaterThan(0);
    const fullSql = mockDb.executedStatements.join('\n');
    expect(fullSql).toContain(`CREATE TABLE IF NOT EXISTS ${TABLE_HYMN_OCCURRENCES}`);
    expect(fullSql).toContain(`CREATE TABLE IF NOT EXISTS ${TABLE_APP_PREFERENCES}`);
    expect(fullSql).toContain('idx_hymn_occurrences_date');
    expect(fullSql).toContain('idx_hymn_occurrences_hymn_number');
    expect(fullSql).toContain('PRAGMA journal_mode = WAL');
  });

  it('deve sincronizar chamadas concorrentes a getDatabase para abrir o banco uma única vez', async () => {
    // Arrange
    const mockDb = new MockSQLiteDatabase();
    let resolveOpen: (val: any) => void;
    const openPromise = new Promise((resolve) => {
      resolveOpen = resolve;
    });

    (SQLite.openDatabaseAsync as jest.Mock).mockReturnValue(
      openPromise.then(() => mockDb)
    );

    // Act: dispara 5 chamadas concorrentes simulando cold start acelerado
    const call1 = getDatabase();
    const call2 = getDatabase();
    const call3 = getDatabase();
    const call4 = getDatabase();
    const call5 = getDatabase();

    // Libera a abertura do banco
    resolveOpen!(mockDb);

    const [db1, db2, db3, db4, db5] = await Promise.all([call1, call2, call3, call4, call5]);

    // Assert: todas as chamadas retornam exatamente a mesma instância e abriram apenas uma vez
    expect(SQLite.openDatabaseAsync).toHaveBeenCalledTimes(1);
    expect(db1).toBe(mockDb);
    expect(db2).toBe(mockDb);
    expect(db3).toBe(mockDb);
    expect(db4).toBe(mockDb);
    expect(db5).toBe(mockDb);
  });
});
