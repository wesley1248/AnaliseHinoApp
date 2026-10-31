/**
 * @file useReports.ts
 * @description Hook responsável pela orquestração do carregamento de dados de relatório,
 * filtros por período, ordenação estatística, cálculo de cobertura do hinário (480 hinos)
 * e geração/compartilhamento de relatórios em formato PDF e impressão.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { IHymnRepository } from '@/domain/repositories/IHymnRepository';
import { getHymnRepository } from '@/data/repositories/getHymnRepository';
import { HymnFrequency } from '@/domain/entities/HymnOccurrence';
import { generateReportHtml, ReportItemData, ReportMetricsData } from '@/domain/services/reportHtmlGenerator';
import { getPeriodDateRange, DashboardPeriod } from './useDashboard';

export type ReportPeriod = DashboardPeriod;
export type ReportSortOption = 'mais_tocados' | 'menos_tocados' | 'numero_hino';
export type ReportFilterMode = 'apenas_tocados' | 'todos' | 'nunca_tocados';

export const TOTAL_HYMNS_IN_HYMNAL = 480;

export interface UseReportsOptions {
  repository?: IHymnRepository;
  initialPeriod?: ReportPeriod;
  referenceDate?: string;
}

/**
 * Hook para gerenciamento do estado e exportação da tela de relatórios.
 *
 * @param options Opções opcionais incluindo repositório, período inicial e data de referência.
 */
export function useReports(options?: IHymnRepository | UseReportsOptions) {
  const resolvedOptions: UseReportsOptions = useMemo(() => {
    if (!options) return {};
    if ('getDeduplicatedFrequencies' in options) {
      return { repository: options as IHymnRepository };
    }
    return options as UseReportsOptions;
  }, [options]);

  const [period, setPeriod] = useState<ReportPeriod>(resolvedOptions.initialPeriod ?? '30d');
  const [sortOption, setSortOption] = useState<ReportSortOption>('mais_tocados');
  const [filterMode, setFilterMode] = useState<ReportFilterMode>('apenas_tocados');
  const [frequencies, setFrequencies] = useState<HymnFrequency[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Resolve a instância ativa do repositório.
   */
  const resolveRepository = useCallback(async (): Promise<IHymnRepository> => {
    if (resolvedOptions.repository) {
      return resolvedOptions.repository;
    }
    return await getHymnRepository();
  }, [resolvedOptions.repository]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const repo = await resolveRepository();
      const { startDate, endDate } = getPeriodDateRange(period, resolvedOptions.referenceDate);
      const data = await repo.getDeduplicatedFrequencies(startDate, endDate);
      setFrequencies(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao carregar dados do relatório.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [resolveRepository, period, resolvedOptions.referenceDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Consolida métricas gerais do período.
   */
  const metrics: ReportMetricsData = useMemo(() => {
    let totalExecutions = 0;
    const allDates = new Set<string>();

    frequencies.forEach((f) => {
      totalExecutions += f.totalExecutionsCount;
      f.dates.forEach((d) => allDates.add(d));
    });

    const distinctDaysCount = allDates.size;
    const distinctHymnsCount = frequencies.length;
    const neverPlayedCount = Math.max(0, TOTAL_HYMNS_IN_HYMNAL - distinctHymnsCount);

    return {
      distinctDaysCount,
      totalExecutions,
      distinctHymnsCount,
      neverPlayedCount,
    };
  }, [frequencies]);

  /**
   * Mapeamento completo dos 480 hinos e filtro por modo de visualização.
   */
  const reportItems: ReportItemData[] = useMemo(() => {
    const freqMap = new Map<number, HymnFrequency>();
    frequencies.forEach((f) => freqMap.set(f.hymnNumber, f));

    const totalDays = metrics.distinctDaysCount > 0 ? metrics.distinctDaysCount : 1;

    let items: ReportItemData[] = [];

    if (filterMode === 'apenas_tocados') {
      items = frequencies.map((f) => ({
        hymnNumber: f.hymnNumber,
        distinctDaysCount: f.distinctDaysCount,
        totalExecutions: f.totalExecutionsCount,
        percentageOfDays: (f.distinctDaysCount / totalDays) * 100,
      }));
    } else if (filterMode === 'nunca_tocados') {
      const unplayed: ReportItemData[] = [];
      for (let i = 1; i <= TOTAL_HYMNS_IN_HYMNAL; i++) {
        if (!freqMap.has(i)) {
          unplayed.push({
            hymnNumber: i,
            distinctDaysCount: 0,
            totalExecutions: 0,
            percentageOfDays: 0,
          });
        }
      }
      items = unplayed;
    } else {
      // 'todos' (1 a 480)
      const all: ReportItemData[] = [];
      for (let i = 1; i <= TOTAL_HYMNS_IN_HYMNAL; i++) {
        const f = freqMap.get(i);
        all.push({
          hymnNumber: i,
          distinctDaysCount: f ? f.distinctDaysCount : 0,
          totalExecutions: f ? f.totalExecutionsCount : 0,
          percentageOfDays: f ? (f.distinctDaysCount / totalDays) * 100 : 0,
        });
      }
      items = all;
    }

    // Ordenação
    return items.sort((a, b) => {
      if (sortOption === 'mais_tocados') {
        if (b.distinctDaysCount !== a.distinctDaysCount) {
          return b.distinctDaysCount - a.distinctDaysCount;
        }
        if (b.totalExecutions !== a.totalExecutions) {
          return b.totalExecutions - a.totalExecutions;
        }
        return a.hymnNumber - b.hymnNumber;
      }

      if (sortOption === 'menos_tocados') {
        if (a.distinctDaysCount !== b.distinctDaysCount) {
          return a.distinctDaysCount - b.distinctDaysCount;
        }
        if (a.totalExecutions !== b.totalExecutions) {
          return a.totalExecutions - b.totalExecutions;
        }
        return a.hymnNumber - b.hymnNumber;
      }

      // numero_hino
      return a.hymnNumber - b.hymnNumber;
    });
  }, [frequencies, filterMode, sortOption, metrics.distinctDaysCount]);

  /**
   * Gera o HTML padronizado para exportação.
   */
  const getCompiledHtml = useCallback(() => {
    const { startDate, endDate } = getPeriodDateRange(period, resolvedOptions.referenceDate);
    const periodLabel = !startDate
      ? 'Todo o Histórico'
      : `${startDate.split('-').reverse().join('/')} a ${endDate?.split('-').reverse().join('/')}`;

    const now = new Date();
    const generatedAt = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    return generateReportHtml({
      title: 'Relatório de Frequência de Hinos',
      subtitle: 'Controle Congregacional de Hinos Cantados',
      periodLabel,
      generatedAt,
      metrics,
      items: reportItems,
    });
  }, [period, resolvedOptions.referenceDate, metrics, reportItems]);

  /**
   * Exporta o relatório como PDF e aciona o compartilhamento nativo.
   */
  const exportToPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const html = getCompiledHtml();

      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        return;
      }

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Compartilhar Relatório de Hinos',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao exportar PDF.';
      setError(msg);
    } finally {
      setIsExporting(false);
    }
  }, [getCompiledHtml]);

  /**
   * Abre a caixa de diálogo de impressão direta do sistema.
   */
  const printReport = useCallback(async () => {
    setIsExporting(true);
    try {
      const html = getCompiledHtml();
      await Print.printAsync({ html });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao imprimir relatório.';
      setError(msg);
    } finally {
      setIsExporting(false);
    }
  }, [getCompiledHtml]);

  return {
    period,
    setPeriod,
    sortOption,
    setSortOption,
    filterMode,
    setFilterMode,
    metrics,
    reportItems,
    isLoading,
    isExporting,
    error,
    refresh: loadData,
    exportToPdf,
    printReport,
  };
}
