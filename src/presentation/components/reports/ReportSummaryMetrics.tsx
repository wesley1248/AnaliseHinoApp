/**
 * @file ReportSummaryMetrics.tsx
 * @description Cards de resumo com as 4 métricas principais calculadas para o relatório selecionado no Dark Theme.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ReportMetricsData } from '../../../domain/services/reportHtmlGenerator';

export interface ReportSummaryMetricsProps {
  metrics: ReportMetricsData;
}

export function ReportSummaryMetrics({ metrics }: ReportSummaryMetricsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Cultos</Text>
        <Text style={styles.value}>{metrics.distinctDaysCount}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Execuções</Text>
        <Text style={styles.value}>{metrics.totalExecutions}</Text>
      </View>

      <View style={[styles.card, styles.highlightCard]}>
        <Text style={[styles.label, styles.highlightLabel]}>Cantados</Text>
        <Text style={[styles.value, styles.highlightValue]}>{metrics.distinctHymnsCount}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Nunca Tocados</Text>
        <Text style={styles.value}>{metrics.neverPlayedCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155', // Slate 700
  },
  highlightCard: {
    backgroundColor: '#172554', // Blue 950
    borderColor: '#2563EB', // Blue 600
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8', // Slate 400
    textTransform: 'uppercase',
    marginBottom: 4,
    textAlign: 'center',
  },
  highlightLabel: {
    color: '#60A5FA', // Blue 400
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC', // Slate 50
  },
  highlightValue: {
    color: '#60A5FA', // Blue 400
  },
});
