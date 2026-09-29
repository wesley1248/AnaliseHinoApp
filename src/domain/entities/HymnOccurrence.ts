/**
 * Entidade de Domínio: Ocorrência de Hino.
 * 
 * Representa o registro individual de execução de um hino em uma data específica
 * (ex: culto, ensaio, reunião).
 */
export interface HymnOccurrence {
  /** Identificador único autoincrementado da ocorrência no banco de dados */
  id?: number;
  /** Número do hino registrado (ex: 1 a 480) */
  hymnNumber: number;
  /** Data da execução no formato ISO YYYY-MM-DD */
  date: string;
  /** Observações contextuais opcionais sobre a ocasião da execução */
  notes?: string;
  /** Carimbo de data/hora da criação do registro */
  createdAt?: string;
}

/**
 * Resumo de frequência consolidado por hino.
 * 
 * Estrutura agregada utilizada em dashboards, rankings e relatórios,
 * garantindo a aplicação estrita da regra de desduplicação diária.
 */
export interface HymnFrequency {
  /** Número do hino */
  hymnNumber: number;
  /** Métrica principal: quantidade de dias distintos em que o hino foi tocado */
  distinctDaysCount: number;
  /** Total bruto de vezes em que o hino foi tocado (sem desduplicação) */
  totalExecutionsCount: number;
  /** Lista cronológica ordenada de datas distintas em que o hino foi tocado */
  dates: string[];
}
