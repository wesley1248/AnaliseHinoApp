import { parseSpreadsheetData } from '../spreadsheetParser';

describe('spreadsheetParser', () => {
  it('deve extrair registros tabulares com colunas "Hino" e "Data" no formato BR', () => {
    const rawRows = [
      { Data: '05/10/2026', Hino: 43, Observacao: 'Culto da Família' },
      { Data: '05/10/2026', Hino: '100', Observacao: 'Culto da Família' },
      { Data: '12/10/2026', Hino: 15 },
    ];

    const result = parseSpreadsheetData(rawRows);

    expect(result.validRecords).toHaveLength(3);
    expect(result.validRecords[0]).toEqual({
      hymnNumber: 43,
      date: '2026-10-05',
      notes: 'Culto da Família',
    });
    expect(result.validRecords[1]).toEqual({
      hymnNumber: 100,
      date: '2026-10-05',
      notes: 'Culto da Família',
    });
    expect(result.validRecords[2]).toEqual({
      hymnNumber: 15,
      date: '2026-10-12',
      notes: undefined,
    });
    expect(result.invalidRecordsCount).toBe(0);
    expect(result.distinctDatesCount).toBe(2);
  });

  it('deve extrair registros em formato matriz (Data com colunas Hino 1, Hino 2, Hino 3)', () => {
    const rawRows = [
      {
        Data: '2026-10-01',
        'Hino 1': 10,
        'Hino 2': 20,
        'Hino 3': 30,
      },
      {
        Data: '2026-10-08',
        'Hino 1': 43,
        'Hino 2': 15,
      },
    ];

    const result = parseSpreadsheetData(rawRows);

    expect(result.validRecords).toHaveLength(5);
    expect(result.validRecords.map((r) => r.hymnNumber)).toEqual([10, 20, 30, 43, 15]);
    expect(result.distinctDatesCount).toBe(2);
  });

  it('deve ignorar registros com números de hinos inválidos (< 1 ou > 480 ou NaN)', () => {
    const rawRows = [
      { Data: '2026-10-01', Hino: 0 }, // Inválido (< 1)
      { Data: '2026-10-01', Hino: 481 }, // Inválido (> 480)
      { Data: '2026-10-01', Hino: 'ABC' }, // Inválido
      { Data: '2026-10-01', Hino: 43 }, // Válido
    ];

    const result = parseSpreadsheetData(rawRows);

    expect(result.validRecords).toHaveLength(1);
    expect(result.validRecords[0].hymnNumber).toBe(43);
    expect(result.invalidRecordsCount).toBe(3);
  });

  it('deve lidar com serial do Excel de datas', () => {
    // 45596 no Excel corresponde aproximadamente a 31/10/2024
    const rawRows = [
      { Data: 45596, Hino: 43 },
    ];

    const result = parseSpreadsheetData(rawRows);

    expect(result.validRecords).toHaveLength(1);
    expect(result.validRecords[0].hymnNumber).toBe(43);
    expect(result.validRecords[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
