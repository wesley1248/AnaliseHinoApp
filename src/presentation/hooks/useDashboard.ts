import { useState, useEffect, useCallback, useMemo } from 'react';
import { HymnFrequency } from '@/domain/entities/HymnOccurrence';
import { IHymnRepository } from '@/domain/repositories/IHymnRepository';
import { getHymnRepository } from '@/data/repositories/getHymnRepository';
import { dataSyncNotifier } from '@/domain/events/dataSyncEvents';

/**
 * Períodos disponíveis para filtragem e análise no Dashboard.
 */
export type DashboardPeriod = '30d' | '90d' | 'ano' | 'todos';

/**
 * Modos de visualização do ranking de hinos.
 */
export type DashboardRankingFilter = 'repetidos' | 'todos' | 'unicos';

/**
 * Resumo consolidado de métricas do repertório de hinos para o período selecionado.
 */
export interface DashboardMetrics {
  /** Total bruto de execuções de hinos no período */
  totalExecutions: number;
  /** Total de cultos / reuniões com registros no período */
  distinctDaysCount: number;
  /** Hino mais frequentemente executado no período (ou null se vazio) */
  mostFrequentHymn: HymnFrequency | null;
  /** Quantidade de hinos distintos já executados no período */
  distinctHymnsCount: number;
  /** Quantidade de hinos que se repetiram (cantados em 2 ou mais cultos) */
  repeatedHymnsCount: number;
  /** Quantidade de hinos cantados em apenas 1 culto no período */
  singleHymnsCount: number;
  /** Taxa percentual de repetição no período (% dos hinos tocados que repetiram) */
  repetitionRate: number;
}

/**
 * Opções de configuração para o hook de Dashboard.
 */
export interface UseDashboardOptions {
  /** Repositório injetável para testes unitários */
  repository?: IHymnRepository;
  /** Período inicial de visualização (padrão: 'todos') */
  initialPeriod?: DashboardPeriod;
  /** Modo de filtro inicial do ranking (padrão: 'repetidos') */
  initialRankingFilter?: DashboardRankingFilter;
  /** Data base de referência no formato ISO YYYY-MM-DD (padrão: hoje) */
  referenceDate?: string;
}

/**
 * Formata um objeto Date para string no formato ISO YYYY-MM-DD local.
 *
 * @param date Objeto Date
 * @returns String YYYY-MM-DD
 */
function formatDateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula o intervalo de datas (startDate, endDate) com base no período selecionado.
 *
 * @param period Período ('30d' | '90d' | 'ano' | 'todos')
 * @param refDateIso Data de referência ISO YYYY-MM-DD
 * @returns Objeto com startDate e endDate (ambos undefined para 'todos')
 */
export function getPeriodDateRange(
  period: DashboardPeriod,
  refDateIso?: string
): { startDate?: string; endDate?: string } {
  if (period === 'todos') {
    return { startDate: undefined, endDate: undefined };
  }

  const baseDate = refDateIso ? new Date(`${refDateIso}T12:00:00`) : new Date();
  const endDate = formatDateToIso(baseDate);

  if (period === '30d') {
    const start = new Date(baseDate);
    start.setDate(start.getDate() - 30);
    return { startDate: formatDateToIso(start), endDate };
  }

  if (period === '90d') {
    const start = new Date(baseDate);
    start.setDate(start.getDate() - 90);
    return { startDate: formatDateToIso(start), endDate };
  }

  if (period === 'ano') {
    const year = baseDate.getFullYear();
    return { startDate: `${year}-01-01`, endDate };
  }

  return { startDate: undefined, endDate: undefined };
}

/**
 * Hook customizado responsável pelo gerenciamento de estado e consultas do Dashboard.
 * 
 * Orquestra os filtros de período temporal, consultas de desduplicação diária
 * e cálculo das métricas de repertório e hinos repetidos (>= 2 cultos).
 */
export function useDashboard(options?: UseDashboardOptions) {
  const [period, setPeriod] = useState<DashboardPeriod>(options?.initialPeriod || 'todos');
  const [rankingFilter, setRankingFilter] = useState<DashboardRankingFilter>(
    options?.initialRankingFilter || 'repetidos'
  );
  const [frequencies, setFrequencies] = useState<HymnFrequency[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Resolve a instância ativa do repositório de hinos.
   */
  const resolveRepository = useCallback(async (): Promise<IHymnRepository> => {
    if (options?.repository) {
      return options.repository;
    }
    return await getHymnRepository();
  }, [options?.repository]);

  /**
   * Carrega os dados de frequência e métricas do repositório para o período selecionado.
   */
  const loadData = useCallback(async (selectedPeriod: DashboardPeriod) => {
    setIsLoading(true);
    setError(null);
    try {
      const repo = await resolveRepository();
      const { startDate, endDate } = getPeriodDateRange(selectedPeriod, options?.referenceDate);

      const freqs = await repo.getDeduplicatedFrequencies(startDate, endDate);
      setFrequencies(freqs);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [resolveRepository, options?.referenceDate]);

  // Carrega ao montar ou mudar o período
  useEffect(() => {
    loadData(period);
  }, [period, loadData]);

  // Sincronização automática em tempo real ao modificar dados em qualquer aba
  useEffect(() => {
    const unsubscribe = dataSyncNotifier.subscribe(() => {
      loadData(period);
    });
    return unsubscribe;
  }, [period, loadData]);

  /**
   * Métricas consolidadas calculadas a partir das frequências do período.
   */
  const metrics: DashboardMetrics = useMemo(() => {
    if (frequencies.length === 0) {
      return {
        totalExecutions: 0,
        distinctDaysCount: 0,
        mostFrequentHymn: null,
        distinctHymnsCount: 0,
        repeatedHymnsCount: 0,
        singleHymnsCount: 0,
        repetitionRate: 0,
      };
    }

    const totalExecutions = frequencies.reduce(
      (acc, curr) => acc + curr.totalExecutionsCount,
      0
    );

    const allDates = new Set<string>();
    for (const freq of frequencies) {
      for (const d of freq.dates) {
        allDates.add(d);
      }
    }

    const repeatedHymns = frequencies.filter((f) => f.distinctDaysCount >= 2);
    const repeatedHymnsCount = repeatedHymns.length;
    const singleHymnsCount = frequencies.filter((f) => f.distinctDaysCount === 1).length;
    const distinctHymnsCount = frequencies.length;
    const repetitionRate = distinctHymnsCount > 0
      ? (repeatedHymnsCount / distinctHymnsCount) * 100
      : 0;

    return {
      totalExecutions,
      distinctDaysCount: allDates.size,
      mostFrequentHymn: frequencies[0] ?? null,
      distinctHymnsCount,
      repeatedHymnsCount,
      singleHymnsCount,
      repetitionRate,
    };
  }, [frequencies]);

  /**
   * Lista filtrada de frequências de acordo com o modo selecionado (repetidos, todos, únicos).
   */
  const filteredFrequencies = useMemo(() => {
    if (rankingFilter === 'repetidos') {
      return frequencies.filter((f) => f.distinctDaysCount >= 2);
    }
    if (rankingFilter === 'unicos') {
      return frequencies.filter((f) => f.distinctDaysCount === 1);
    }
    return frequencies;
  }, [frequencies, rankingFilter]);

  /**
   * Altera o período de análise e dispara nova consulta.
   */
  const handleSetPeriod = useCallback(async (newPeriod: DashboardPeriod) => {
    setPeriod(newPeriod);
  }, []);

  /**
   * Atualiza manualmente os dados do período atual.
   */
  const refresh = useCallback(async () => {
    await loadData(period);
  }, [loadData, period]);

  return {
    period,
    setPeriod: handleSetPeriod,
    rankingFilter,
    setRankingFilter,
    metrics,
    frequencies,
    filteredFrequencies,
    isLoading,
    error,
    refresh,
  };
}
