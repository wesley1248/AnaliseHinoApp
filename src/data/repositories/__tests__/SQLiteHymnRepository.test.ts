import { SQLiteHymnRepository } from '../SQLiteHymnRepository';
import { MockSQLiteDatabase } from '../../database/__mocks__/MockSQLiteDatabase';

describe('SQLiteHymnRepository', () => {
  let mockDb: MockSQLiteDatabase;
  let repository: SQLiteHymnRepository;

  beforeEach(() => {
    mockDb = new MockSQLiteDatabase();
    repository = new SQLiteHymnRepository(mockDb);
  });

  describe('addOccurrence', () => {
    it('deve inserir uma nova ocorrência de hino e retornar o objeto persistido com ID', async () => {
      // Arrange
      const input = {
        hymnNumber: 15,
        date: '2026-09-29',
        notes: 'Culto da Noite',
      };

      // Act
      const result = await repository.addOccurrence(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.hymnNumber).toBe(15);
      expect(result.date).toBe('2026-09-29');
      expect(result.notes).toBe('Culto da Noite');
      expect(result.createdAt).toBeDefined();
      expect(mockDb.getStoredRows()).toHaveLength(1);
    });

    it('deve permitir inserção sem observações opcionais', async () => {
      // Arrange
      const input = {
        hymnNumber: 300,
        date: '2026-09-29',
      };

      // Act
      const result = await repository.addOccurrence(input);

      // Assert
      expect(result.hymnNumber).toBe(300);
      expect(result.notes).toBeUndefined();
    });
  });

  describe('addOccurrencesBatch', () => {
    it('deve inserir múltiplos hinos em uma única transação', async () => {
      // Arrange
      const inputs = [
        { hymnNumber: 1, date: '2026-09-29' },
        { hymnNumber: 2, date: '2026-09-29' },
        { hymnNumber: 3, date: '2026-09-29', notes: 'Ensaio' },
      ];

      // Act
      const insertedCount = await repository.addOccurrencesBatch(inputs);

      // Assert
      expect(insertedCount).toBe(3);
      expect(mockDb.getStoredRows()).toHaveLength(3);
    });

    it('deve retornar 0 quando o lote estiver vazio', async () => {
      // Act
      const insertedCount = await repository.addOccurrencesBatch([]);

      // Assert
      expect(insertedCount).toBe(0);
      expect(mockDb.getStoredRows()).toHaveLength(0);
    });
  });

  describe('getByDate', () => {
    it('deve retornar apenas as ocorrências da data solicitada', async () => {
      // Arrange
      mockDb.seedRows([
        { hymn_number: 10, date: '2026-09-28' },
        { hymn_number: 20, date: '2026-09-29' },
        { hymn_number: 30, date: '2026-09-29' },
      ]);

      // Act
      const results = await repository.getByDate('2026-09-29');

      // Assert
      expect(results).toHaveLength(2);
      expect(results.map(r => r.hymnNumber)).toEqual([20, 30]);
    });
  });

  describe('deleteOccurrence', () => {
    it('deve remover a ocorrência correspondente pelo id e retornar true', async () => {
      // Arrange
      mockDb.seedRows([
        { id: 1, hymn_number: 10, date: '2026-09-29' },
        { id: 2, hymn_number: 20, date: '2026-09-29' },
      ]);

      // Act
      const removed = await repository.deleteOccurrence(1);

      // Assert
      expect(removed).toBe(true);
      expect(mockDb.getStoredRows()).toHaveLength(1);
      expect(mockDb.getStoredRows()[0].id).toBe(2);
    });

    it('deve retornar false quando o id não for encontrado', async () => {
      // Arrange
      mockDb.seedRows([{ id: 1, hymn_number: 10, date: '2026-09-29' }]);

      // Act
      const removed = await repository.deleteOccurrence(999);

      // Assert
      expect(removed).toBe(false);
      expect(mockDb.getStoredRows()).toHaveLength(1);
    });
  });

  describe('getOccurrencesByDateRange', () => {
    it('deve retornar ocorrências dentro do intervalo de datas especificado', async () => {
      // Arrange
      mockDb.seedRows([
        { hymn_number: 5, date: '2026-09-01' },
        { hymn_number: 15, date: '2026-09-15' },
        { hymn_number: 25, date: '2026-09-30' },
        { hymn_number: 35, date: '2026-10-05' },
      ]);

      // Act
      const results = await repository.getOccurrencesByDateRange('2026-09-10', '2026-09-30');

      // Assert
      expect(results).toHaveLength(2);
      expect(results.map(r => r.hymnNumber)).toEqual([15, 25]);
    });
  });

  describe('getDistinctDates', () => {
    it('deve retornar lista ordenada de datas distintas', async () => {
      // Arrange
      mockDb.seedRows([
        { hymn_number: 1, date: '2026-09-29' },
        { hymn_number: 2, date: '2026-09-29' },
        { hymn_number: 3, date: '2026-09-20' },
      ]);

      // Act
      const dates = await repository.getDistinctDates();

      // Assert
      expect(dates).toEqual(['2026-09-20', '2026-09-29']);
    });
  });

  describe('getDeduplicatedFrequencies (Regra Inegociável de Desduplicação)', () => {
    it('deve computar apenas 1 ocorrência diária quando o mesmo hino for tocado mais de uma vez na mesma data', async () => {
      // Arrange
      // Hino 20 tocado 3 vezes: 2x no dia 2026-09-29 e 1x no dia 2026-09-30 -> 2 dias distintos, 3 execuções brutas
      // Hino 10 tocado 1 vez no dia 2026-09-29 -> 1 dia distinto, 1 execução bruta
      // Hino 30 tocado 2 vezes no mesmo dia 2026-09-29 -> 1 dia distinto, 2 execuções brutas
      mockDb.seedRows([
        { hymn_number: 20, date: '2026-09-29', notes: 'Manhã' },
        { hymn_number: 20, date: '2026-09-29', notes: 'Noite' },
        { hymn_number: 20, date: '2026-09-30', notes: 'Quarta' },
        { hymn_number: 10, date: '2026-09-29' },
        { hymn_number: 30, date: '2026-09-29', notes: 'Culto 1' },
        { hymn_number: 30, date: '2026-09-29', notes: 'Culto 2' },
      ]);

      // Act
      const frequencies = await repository.getDeduplicatedFrequencies();

      // Assert
      expect(frequencies).toHaveLength(3);

      // Primeiro lugar: Hino 20 (2 dias distintos)
      expect(frequencies[0]).toEqual({
        hymnNumber: 20,
        distinctDaysCount: 2,
        totalExecutionsCount: 3,
        dates: ['2026-09-29', '2026-09-30'],
      });

      // Segundo e terceiro lugares empatados em 1 dia distinto (ordenados por hymnNumber: 10 e 30)
      expect(frequencies[1].hymnNumber).toBe(10);
      expect(frequencies[1].distinctDaysCount).toBe(1);
      expect(frequencies[1].totalExecutionsCount).toBe(1);

      expect(frequencies[2].hymnNumber).toBe(30);
      expect(frequencies[2].distinctDaysCount).toBe(1);
      expect(frequencies[2].totalExecutionsCount).toBe(2);
    });

    it('deve filtrar frequências por intervalo de datas quando informado', async () => {
      // Arrange
      mockDb.seedRows([
        { hymn_number: 5, date: '2026-08-01' },
        { hymn_number: 5, date: '2026-09-10' },
        { hymn_number: 5, date: '2026-09-20' },
      ]);

      // Act
      const frequencies = await repository.getDeduplicatedFrequencies('2026-09-01', '2026-09-30');

      // Assert
      expect(frequencies).toHaveLength(1);
      expect(frequencies[0].hymnNumber).toBe(5);
      expect(frequencies[0].distinctDaysCount).toBe(2);
      expect(frequencies[0].dates).toEqual(['2026-09-10', '2026-09-20']);
    });
  });

  describe('clearAll', () => {
    it('deve limpar todas as ocorrências armazenadas', async () => {
      // Arrange
      mockDb.seedRows([
        { hymn_number: 1, date: '2026-09-29' },
        { hymn_number: 2, date: '2026-09-29' },
      ]);

      // Act
      await repository.clearAll();

      // Assert
      expect(mockDb.getStoredRows()).toHaveLength(0);
    });
  });
});
