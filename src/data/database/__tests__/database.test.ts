import { initDatabase } from '../database';
import { MockSQLiteDatabase } from '../__mocks__/MockSQLiteDatabase';
import { TABLE_HYMN_OCCURRENCES } from '../schema';

describe('Database Initialization (initDatabase)', () => {
  it('deve executar scripts DDL de criação da tabela de ocorrências e índices', async () => {
    // Arrange
    const mockDb = new MockSQLiteDatabase();

    // Act
    await initDatabase(mockDb);

    // Assert
    expect(mockDb.executedStatements.length).toBeGreaterThan(0);
    const fullSql = mockDb.executedStatements.join('\n');
    expect(fullSql).toContain(`CREATE TABLE IF NOT EXISTS ${TABLE_HYMN_OCCURRENCES}`);
    expect(fullSql).toContain('idx_hymn_occurrences_date');
    expect(fullSql).toContain('idx_hymn_occurrences_hymn_number');
    expect(fullSql).toContain('PRAGMA journal_mode = WAL');
  });
});
