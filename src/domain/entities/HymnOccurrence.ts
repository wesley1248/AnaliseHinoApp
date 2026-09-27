/**
 * Entidade de Domínio: Ocorrência de Hino
 */
export interface HymnOccurrence {
  id?: string;
  hymnNumber: number;
  date: string; // Formato YYYY-MM-DD
  notes?: string;
  createdAt?: string;
}

/**
 * Resumo de frequência consolidado por hino
 */
export interface HymnFrequency {
  hymnNumber: number;
  distinctDaysCount: number; // Métrica principal com desduplicação diária
  totalExecutionsCount: number; // Total bruto de execuções
  dates: string[];
}
