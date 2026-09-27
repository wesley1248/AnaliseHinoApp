import { HymnOccurrence, HymnFrequency } from '../entities/HymnOccurrence';

/**
 * Regra de Negócio Central (Inviolável): Desduplicação Diária.
 *
 * Se o mesmo número de hino for registrado mais de uma vez na mesma data,
 * o sistema computa apenas 1 ocorrência diária para o ranking de frequência.
 *
 * @param occurrences Lista de registros brutos de hinos executados
 * @returns Lista consolidada de frequências ordenada por dias distintos (decrescente)
 */
export function calculateDeduplicatedFrequencies(
  occurrences: HymnOccurrence[]
): HymnFrequency[] {
  const map = new Map<number, { dates: Set<string>; totalCount: number }>();

  for (const occ of occurrences) {
    if (!map.has(occ.hymnNumber)) {
      map.set(occ.hymnNumber, { dates: new Set(), totalCount: 0 });
    }
    const entry = map.get(occ.hymnNumber)!;
    entry.dates.add(occ.date);
    entry.totalCount += 1;
  }

  const results: HymnFrequency[] = [];

  for (const [hymnNumber, data] of map.entries()) {
    results.push({
      hymnNumber,
      distinctDaysCount: data.dates.size,
      totalExecutionsCount: data.totalCount,
      dates: Array.from(data.dates).sort(),
    });
  }

  // Ordenação decrescente por dias distintos; critério de desempate por número de hino crescente
  return results.sort((a, b) => {
    if (b.distinctDaysCount !== a.distinctDaysCount) {
      return b.distinctDaysCount - a.distinctDaysCount;
    }
    return a.hymnNumber - b.hymnNumber;
  });
}
