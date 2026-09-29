import { HymnOccurrence, HymnFrequency } from '../entities/HymnOccurrence';

/**
 * Dados de entrada para registro de uma ocorrência de hino.
 */
export interface CreateOccurrenceInput {
  /** Número do hino (ex: 1 a 480) */
  hymnNumber: number;
  /** Data da execução no formato YYYY-MM-DD */
  date: string;
  /** Observações contextuais opcionais (ex: 'Culto da Família', 'Ensaio') */
  notes?: string;
}

/**
 * Contrato de repositório para persistência e consulta de ocorrências de hinos.
 * 
 * Segue o padrão Clean Architecture, isolando regras de negócio e casos de uso
 * de detalhes específicos de armazenamento (SQLite, LocalStorage, etc.).
 */
export interface IHymnRepository {
  /**
   * Adiciona um registro individual de execução de hino.
   * 
   * @param input Dados do hino e data de execução
   * @returns Ocorrência persistida com identificador gerado
   */
  addOccurrence(input: CreateOccurrenceInput): Promise<HymnOccurrence>;

  /**
   * Adiciona um lote de registros de hinos em uma única transação atômica.
   * Ideal para importação de planilhas Excel legadas ou inserção múltipla rápida.
   * 
   * @param inputs Coleção de registros a serem inseridos
   * @returns Quantidade total de registros inseridos com sucesso
   */
  addOccurrencesBatch(inputs: CreateOccurrenceInput[]): Promise<number>;

  /**
   * Remove uma ocorrência de hino pelo seu ID.
   * 
   * @param id Identificador numérico da ocorrência
   * @returns Verdadeiro se o registro foi removido, falso se não encontrado
   */
  deleteOccurrence(id: number): Promise<boolean>;

  /**
   * Obtém todas as ocorrências registradas em uma data específica.
   * 
   * @param date Data no formato YYYY-MM-DD
   * @returns Lista de ocorrências do dia
   */
  getByDate(date: string): Promise<HymnOccurrence[]>;

  /**
   * Retorna todas as ocorrências registradas no histórico.
   * 
   * @returns Lista completa de ocorrências
   */
  getAllOccurrences(): Promise<HymnOccurrence[]>;

  /**
   * Retorna ocorrências filtradas dentro de um intervalo de datas.
   * 
   * @param startDate Data inicial (inclusive, YYYY-MM-DD)
   * @param endDate Data final (inclusive, YYYY-MM-DD)
   * @returns Lista de ocorrências no intervalo
   */
  getOccurrencesByDateRange(startDate: string, endDate: string): Promise<HymnOccurrence[]>;

  /**
   * Retorna o ranking consolidado de hinos aplicando a regra inegociável de desduplicação diária.
   * Hinos repetidos no mesmo dia contam apenas 1 vez para a contagem de dias distintos.
   * 
   * @param startDate Data inicial opcional para filtro
   * @param endDate Data final opcional para filtro
   * @returns Lista de frequências ordenada por dias distintos decrescente
   */
  getDeduplicatedFrequencies(startDate?: string, endDate?: string): Promise<HymnFrequency[]>;

  /**
   * Retorna a lista de todas as datas distintas que possuem pelo menos um hino registrado.
   * 
   * @returns Lista de strings de datas (YYYY-MM-DD) ordenadas cronologicamente
   */
  getDistinctDates(): Promise<string[]>;

  /**
   * Remove todos os registros de ocorrências (utilizado para reset ou testes).
   */
  clearAll(): Promise<void>;
}
