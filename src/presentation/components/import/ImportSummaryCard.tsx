/**
 * @file ImportSummaryCard.tsx
 * @description Exibe o resumo analítico da planilha carregada (válidos, descartados e cultos) no Dark Theme.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface ImportSummaryCardProps {
  fileName: string;
  totalRows: number;
  validRecordsCount: number;
  invalidRecordsCount: number;
  distinctDatesCount: number;
}

export function ImportSummaryCard({
  fileName,
  totalRows,
  validRecordsCount,
  invalidRecordsCount,
  distinctDatesCount,
}: ImportSummaryCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.fileLabel}>Arquivo Carregado:</Text>
        <Text style={styles.fileName} numberOfLines={1}>
          {fileName}
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, styles.validColor]}>{validRecordsCount}</Text>
          <Text style={styles.statLabel}>Válidos</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statValue, invalidRecordsCount > 0 && styles.invalidColor]}>
            {invalidRecordsCount}
          </Text>
          <Text style={styles.statLabel}>Inválidos</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statValue, styles.infoColor]}>{distinctDatesCount}</Text>
          <Text style={styles.statLabel}>Cultos</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 10,
  },
  fileLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  fileName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  validColor: {
    color: '#34D399', // Emerald 400
  },
  invalidColor: {
    color: '#F87171', // Red 400
  },
  infoColor: {
    color: '#60A5FA', // Blue 400
  },
});
