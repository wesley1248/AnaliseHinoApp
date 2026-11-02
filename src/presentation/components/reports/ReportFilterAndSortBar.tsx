/**
 * @file ReportFilterAndSortBar.tsx
 * @description Barra de opções com chips interativos para ordenação e filtragem dos registros no Dark Theme.
 * Permite filtrar por hinos repetidos (2+), apenas tocados, todos (1-480) ou nunca tocados.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { ReportFilterMode, ReportSortOption } from '../../hooks/useReports';

export interface ReportFilterAndSortBarProps {
  selectedSort: ReportSortOption;
  onSelectSort: (sort: ReportSortOption) => void;
  selectedFilter: ReportFilterMode;
  onSelectFilter: (filter: ReportFilterMode) => void;
}

export function ReportFilterAndSortBar({
  selectedSort,
  onSelectSort,
  selectedFilter,
  onSelectFilter,
}: ReportFilterAndSortBarProps) {
  const sortOptions: { key: ReportSortOption; label: string }[] = [
    { key: 'mais_tocados', label: 'Mais Tocados' },
    { key: 'menos_tocados', label: 'Menos Tocados' },
    { key: 'numero_hino', label: 'Nº Hino' },
  ];

  const filterOptions: { key: ReportFilterMode; label: string }[] = [
    { key: 'apenas_repetidos', label: 'Repetidos (2+)' },
    { key: 'apenas_tocados', label: 'Apenas Tocados' },
    { key: 'todos', label: 'Todos (1-480)' },
    { key: 'nunca_tocados', label: 'Nunca Tocados' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Ordenar por:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
          {sortOptions.map((opt) => {
            const isActive = selectedSort === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => onSelectSort(opt.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Exibir:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
          {filterOptions.map((opt) => {
            const isActive = selectedFilter === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.chip,
                  isActive && (opt.key === 'apenas_repetidos' ? styles.chipRepeatedActive : styles.chipActive),
                ]}
                onPress={() => onSelectFilter(opt.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    isActive && styles.chipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A', // Slate 900
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 10,
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8', // Slate 400
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: '#1E293B', // Slate 800
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155', // Slate 700
  },
  chipActive: {
    backgroundColor: '#2563EB', // Blue 600
    borderColor: '#3B82F6',
  },
  chipRepeatedActive: {
    backgroundColor: '#D97706', // Amber 600
    borderColor: '#F59E0B',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8', // Slate 400
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
