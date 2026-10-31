import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DashboardPeriod } from '@/presentation/hooks/useDashboard';

interface PeriodFilterSelectorProps {
  /** Período atualmente ativo */
  selectedPeriod: DashboardPeriod;
  /** Callback acionado ao selecionar um novo período */
  onSelectPeriod: (period: DashboardPeriod) => void;
}

const PERIOD_OPTIONS: { id: DashboardPeriod; label: string }[] = [
  { id: '30d', label: '30 Dias' },
  { id: '90d', label: '90 Dias' },
  { id: 'ano', label: 'Este Ano' },
  { id: 'todos', label: 'Todos' },
];

/**
 * Seletor em abas segmentadas para alternar o período temporal de análise do Dashboard.
 */
export function PeriodFilterSelector({
  selectedPeriod,
  onSelectPeriod,
}: PeriodFilterSelectorProps) {
  const handlePress = (period: DashboardPeriod) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Fallback silencioso
      }
    }
    onSelectPeriod(period);
  };

  return (
    <View style={styles.container}>
      {PERIOD_OPTIONS.map(option => {
        const isActive = selectedPeriod === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.pill, isActive && styles.activePill]}
            onPress={() => handlePress(option.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  activePill: {
    backgroundColor: '#2563EB', // Blue 600
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8', // Slate 400
  },
  activeLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
