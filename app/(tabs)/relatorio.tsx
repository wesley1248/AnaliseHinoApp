/**
 * @file relatorio.tsx
 * @description Tela de Relatórios e Exportação em PDF com desduplicação diária inviolável.
 * Permite filtrar por períodos temporais, ordenar por critérios analíticos (mais/menos tocados ou número do hino),
 * filtrar a cobertura do hinário (480 hinos) e gerar documento HTML estilizado para impressão e compartilhamento PDF.
 */

import React, { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReports } from '@/presentation/hooks/useReports';
import { PeriodFilterSelector } from '@/presentation/components/dashboard';
import {
  ReportFilterAndSortBar,
  ReportSummaryMetrics,
  ReportActionButtons,
  ReportPreviewTable,
} from '@/presentation/components/reports';

export default function RelatorioScreen() {
  const {
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
  } = useReports();

  // Sincronização automática estritamente ao entrar em foco na aba
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useFocusEffect(
    useCallback(() => {
      refreshRef.current();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Cabeçalho da Tela */}
      <View style={styles.header}>
        <Text style={styles.title}>Relatórios & Exportação</Text>
        <Text style={styles.subtitle}>
          Geração de relatórios analíticos em PDF e impressão direta
        </Text>
      </View>

      {/* Banner de Erro */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Seletor de Período Rápido */}
      <PeriodFilterSelector
        selectedPeriod={period}
        onSelectPeriod={setPeriod}
      />

      {/* Métricas Resumidas dos KPIs */}
      <ReportSummaryMetrics metrics={metrics} />

      {/* Barra de Filtro de Cobertura e Ordenação */}
      <ReportFilterAndSortBar
        selectedSort={sortOption}
        onSelectSort={setSortOption}
        selectedFilter={filterMode}
        onSelectFilter={setFilterMode}
      />

      {/* Tabela de Visualização Prévia */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Carregando dados do relatório...</Text>
        </View>
      ) : (
        <ReportPreviewTable items={reportItems} />
      )}

      {/* Rodapé com Ações de Impressão e PDF */}
      <ReportActionButtons
        onExportPdf={exportToPdf}
        onPrint={printReport}
        isExporting={isExporting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
      },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  errorContainer: {
    backgroundColor: '#7F1D1D',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#FEE2E2',
    fontSize: 13,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94A3B8',
  },
});
