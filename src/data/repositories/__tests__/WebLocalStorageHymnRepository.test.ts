import { WebLocalStorageHymnRepository } from '../WebLocalStorageHymnRepository';

describe('WebLocalStorageHymnRepository', () => {
  let repository: WebLocalStorageHymnRepository;

  beforeEach(() => {
    repository = new WebLocalStorageHymnRepository();
  });

  it('deve adicionar uma ocorrência e persistir', async () => {
    const item = await repository.addOccurrence({ hymnNumber: 452, date: '2026-10-02' });

    expect(item.id).toBe(1);
    expect(item.hymnNumber).toBe(452);
    expect(item.date).toBe('2026-10-02');

    const list = await repository.getByDate('2026-10-02');
    expect(list).toHaveLength(1);
    expect(list[0].hymnNumber).toBe(452);
  });

  it('deve remover uma ocorrência existente', async () => {
    const item = await repository.addOccurrence({ hymnNumber: 15, date: '2026-10-02' });
    expect(item.id).toBeDefined();

    const deleted = await repository.deleteOccurrence(item.id!);
    expect(deleted).toBe(true);

    const list = await repository.getByDate('2026-10-02');
    expect(list).toHaveLength(0);
  });

  it('deve aplicar desduplicação diária no cálculo de frequências', async () => {
    // Mesmo hino adicionado duas vezes no mesmo dia
    await repository.addOccurrence({ hymnNumber: 88, date: '2026-10-02', notes: 'Manhã' });
    await repository.addOccurrence({ hymnNumber: 88, date: '2026-10-02', notes: 'Noite' });
    // Outro hino em outra data
    await repository.addOccurrence({ hymnNumber: 88, date: '2026-10-03' });

    const frequencies = await repository.getDeduplicatedFrequencies();
    expect(frequencies).toHaveLength(1);
    expect(frequencies[0].hymnNumber).toBe(88);
    // Deve contar apenas 2 (1 do dia 02 e 1 do dia 03)
    expect(frequencies[0].distinctDaysCount).toBe(2);
  });
});
