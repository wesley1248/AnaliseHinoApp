/**
 * @file useReports.ts
 * @description Hook responsável pela orquestração do carregamento de dados de relatório,
 * filtros por período, foco em hinos repetidos (>= 2 cultos), ordenação estatística,
 * cálculo de cobertura do hinário (480 hinos) e geração/compartilhamento de relatórios em formato PDF e impressão.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { IHymnRepository } from '@/domain/repositories/IHymnRepository';
import { getHymnRepository } from '@/data/repositories/getHymnRepository';
import { dataSyncNotifier } from '@/domain/events/dataSyncEvents';
import { HymnFrequency } from '@/domain/entities/HymnOccurrence';
import { generateReportHtml, ReportItemData, ReportMetricsData } from '@/domain/services/reportHtmlGenerator';
import { getPeriodDateRange, DashboardPeriod } from './useDashboard';

export type ReportPeriod = DashboardPeriod;
export type ReportSortOption = 'mais_tocados' | 'menos_tocados' | 'numero_hino';
export type ReportFilterMode = 'apenas_repetidos' | 'apenas_tocados' | 'todos' | 'nunca_tocados';

export const TOTAL_HYMNS_IN_HYMNAL = 480;

export interface UseReportsOptions {
  repository?: IHymnRepository;
  initialPeriod?: ReportPeriod;
  initialFilterMode?: ReportFilterMode;
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
  const [filterMode, setFilterMode] = useState<ReportFilterMode>(
    resolvedOptions.initialFilterMode ?? 'apenas_repetidos'
  );
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

  // Sincronização automática em tempo real ao modificar dados em qualquer aba
  useEffect(() => {
    const unsubscribe = dataSyncNotifier.subscribe(() => {
      loadData();
    });
    return unsubscribe;
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
    const repeatedHymnsCount = frequencies.filter((f) => f.distinctDaysCount >= 2).length;

    return {
      distinctDaysCount,
      totalExecutions,
      distinctHymnsCount,
      neverPlayedCount,
      repeatedHymnsCount,
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

    if (filterMode === 'apenas_repetidos') {
      const repeated = frequencies.filter((f) => f.distinctDaysCount >= 2);
      items = repeated.map((f) => ({
        hymnNumber: f.hymnNumber,
        distinctDaysCount: f.distinctDaysCount,
        totalExecutions: f.totalExecutionsCount,
        percentageOfDays: (f.distinctDaysCount / totalDays) * 100,
        dates: f.dates,
      }));
    } else if (filterMode === 'apenas_tocados') {
      items = frequencies.map((f) => ({
        hymnNumber: f.hymnNumber,
        distinctDaysCount: f.distinctDaysCount,
        totalExecutions: f.totalExecutionsCount,
        percentageOfDays: (f.distinctDaysCount / totalDays) * 100,
        dates: f.dates,
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
            dates: [],
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
          dates: f ? f.dates : [],
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
      title: 'Relatório Analítico de Frequência de Hinos',
      subtitle: 'Controle de Repetições e Desduplicação Diária',
      periodLabel,
      generatedAt,
      metrics,
      items: reportItems,
    });
  }, [period, metrics, reportItems, resolvedOptions.referenceDate]);

  /**
   * Exporta o relatório gerando um arquivo PDF e abrindo o menu de compartilhamento.
   */
  const exportToPdf = useCallback(async () => {
    setIsExporting(true);
    setError(null);
    try {
      const html = getCompiledHtml();

      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
        return;
      }

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Exportar Relatório de Hinos',
          UTI: 'com.adobe.pdf',
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
   * Dispara a impressão direta do relatório utilizando o driver do sistema operacional.
   */
  const printReport = useCallback(async () => {
    setIsExporting(true);
    setError(null);
    try {
      const html = getCompiledHtml();

      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
        return;
      }

      await Print.printAsync({ html });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao imprimir relatório.';
      setError(msg);
    } finally {
      setIsExporting(false);
    }
  }, [getCompiledHtml]);

  /**
   * Atualiza manualmente os dados do relatório.
   */
  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

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
    exportToPdf,
    printReport,
    refresh,
  };
}
