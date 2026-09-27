import { calculateDeduplicatedFrequencies } from '../dailyDeduplication';
import { HymnOccurrence } from '../../entities/HymnOccurrence';

describe('Regra de Negócio: Desduplicação Diária (Inviolável)', () => {
  it('deve computar apenas 1 ocorrência quando o mesmo hino é tocado mais de uma vez na mesma data', () => {
    const records: HymnOccurrence[] = [
      { hymnNumber: 15, date: '2026-09-27', notes: 'Culto da Manhã' },
      { hymnNumber: 15, date: '2026-09-27', notes: 'Culto da Noite' },
      { hymnNumber: 15, date: '2026-09-27', notes: 'Prelúdio' },
    ];

    const result = calculateDeduplicatedFrequencies(records);

    expect(result).toHaveLength(1);
    expect(result[0].hymnNumber).toBe(15);
    expect(result[0].distinctDaysCount).toBe(1);
    expect(result[0].totalExecutionsCount).toBe(3);
  });

  it('deve computar dias separados quando o hino é tocado em datas distintas', () => {
    const records: HymnOccurrence[] = [
      { hymnNumber: 15, date: '2026-09-20' },
      { hymnNumber: 15, date: '2026-09-27' },
      { hymnNumber: 15, date: '2026-09-27' }, // repetição na mesma data
    ];

    const result = calculateDeduplicatedFrequencies(records);

    expect(result).toHaveLength(1);
    expect(result[0].hymnNumber).toBe(15);
    expect(result[0].distinctDaysCount).toBe(2);
    expect(result[0].totalExecutionsCount).toBe(3);
  });

  it('deve ordenar o ranking por dias distintos decrescente', () => {
    const records: HymnOccurrence[] = [
      // Hino 100 tocado em 3 dias distintos
      { hymnNumber: 100, date: '2026-09-01' },
      { hymnNumber: 100, date: '2026-09-02' },
      { hymnNumber: 100, date: '2026-09-03' },

      // Hino 200 tocado 4 vezes, mas em apenas 1 dia
      { hymnNumber: 200, date: '2026-09-01' },
      { hymnNumber: 200, date: '2026-09-01' },
      { hymnNumber: 200, date: '2026-09-01' },
      { hymnNumber: 200, date: '2026-09-01' },

      // Hino 50 tocado em 2 dias distintos
      { hymnNumber: 50, date: '2026-09-01' },
      { hymnNumber: 50, date: '2026-09-05' },
    ];

    const result = calculateDeduplicatedFrequencies(records);

    expect(result).toHaveLength(3);
    // Hino 100: 3 dias distintos -> 1º lugar
    expect(result[0].hymnNumber).toBe(100);
    expect(result[0].distinctDaysCount).toBe(3);

    // Hino 50: 2 dias distintos -> 2º lugar
    expect(result[1].hymnNumber).toBe(50);
    expect(result[1].distinctDaysCount).toBe(2);

    // Hino 200: 1 dia distinto (apesar de 4 execuções brutas) -> 3º lugar
    expect(result[2].hymnNumber).toBe(200);
    expect(result[2].distinctDaysCount).toBe(1);
    expect(result[2].totalExecutionsCount).toBe(4);
  });

  it('deve desempatar por número de hino crescente quando distinctDaysCount for igual', () => {
    const records: HymnOccurrence[] = [
      { hymnNumber: 45, date: '2026-09-01' },
      { hymnNumber: 12, date: '2026-09-01' },
      { hymnNumber: 88, date: '2026-09-01' },
    ];

    const result = calculateDeduplicatedFrequencies(records);

    expect(result.map((r) => r.hymnNumber)).toEqual([12, 45, 88]);
  });
});
