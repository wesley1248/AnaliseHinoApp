import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DashboardMetrics } from '@/presentation/hooks/useDashboard';

interface DashboardMetricsCardsProps {
  /** Métricas consolidadas calculadas pelo hook */
  metrics: DashboardMetrics;
}

/**
 * Grid de cartões informativos com os principais KPIs de repertório de hinos:
 * Total de execuções, cultos registrados, hino mais tocado e repertório ativo.
 */
export function DashboardMetricsCards({ metrics }: DashboardMetricsCardsProps) {
  const mostFrequentLabel = metrics.mostFrequentHymn
    ? `Hino ${metrics.mostFrequentHymn.hymnNumber}`
    : '-';

  const mostFrequentDetail = metrics.mostFrequentHymn
    ? `${metrics.mostFrequentHymn.distinctDaysCount} cultos`
    : 'Sem dados';

  return (
    <View style={styles.gridContainer}>
      {/* Linha 1 */}
      <View style={styles.row}>
        {/* Card 1: Total de Hinos */}
        <View style={styles.card}>
          <Text style={styles.cardValue}>{metrics.totalExecutions}</Text>
          <Text style={styles.cardTitle}>Total de Hinos</Text>
          <Text style={styles.cardSubtitle}>Execuções brutas</Text>
        </View>

        {/* Card 2: Cultos / Dias */}
        <View style={styles.card}>
          <Text style={styles.cardValue}>{metrics.distinctDaysCount}</Text>
          <Text style={styles.cardTitle}>Cultos / Dias</Text>
          <Text style={styles.cardSubtitle}>Com registros</Text>
        </View>
      </View>

      {/* Linha 2 */}
      <View style={styles.row}>
        {/* Card 3: Mais Cantado */}
        <View style={[styles.card, styles.highlightCard]}>
          <Text style={[styles.cardValue, styles.highlightValue]} numberOfLines={1}>
            {mostFrequentLabel}
          </Text>
          <Text style={styles.cardTitle}>Mais Cantado</Text>
          <Text style={styles.cardSubtitle}>{mostFrequentDetail}</Text>
        </View>

        {/* Card 4: Repertório */}
        <View style={styles.card}>
          <Text style={styles.cardValue}>{metrics.distinctHymnsCount}</Text>
          <Text style={styles.cardTitle}>Repertório</Text>
          <Text style={styles.cardSubtitle}>Hinos distintos</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#334155', // Slate 700
  },
  highlightCard: {
    borderColor: '#2563EB', // Blue 600
    backgroundColor: '#172554', // Blue 950 / Slate Dark
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  highlightValue: {
    color: '#60A5FA', // Blue 400
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
});
