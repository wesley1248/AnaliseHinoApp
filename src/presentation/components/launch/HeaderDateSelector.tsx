import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface HeaderDateSelectorProps {
  selectedDate: string;
  onPrevious: () => void;
  onNext: () => void;
}

/**
 * Converte data ISO 'YYYY-MM-DD' em texto amigável (ex: 'Hoje • 02 Out 2026' ou 'Ontem...').
 */
function formatDateLabel(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  const target = new Date(year, month - 1, day);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  const formattedDay = String(day).padStart(2, '0');
  const monthStr = monthNames[month - 1];

  let prefix = '';
  if (diffDays === 0) prefix = 'Hoje • ';
  else if (diffDays === -1) prefix = 'Ontem • ';
  else if (diffDays === 1) prefix = 'Amanhã • ';

  return `${prefix}${formattedDay} ${monthStr} ${year}`;
}

export function HeaderDateSelector({
  selectedDate,
  onPrevious,
  onNext,
}: HeaderDateSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Lançar Hinos</Text>
        <Text style={styles.subtitle}>Registro rápido de culto</Text>
      </View>

      <View style={styles.pillContainer}>
        <View style={styles.dateLabelContainer}>
          <Ionicons name="calendar-outline" size={18} color="#60A5FA" style={styles.icon} />
          <Text style={styles.dateText}>{formatDateLabel(selectedDate)}</Text>
        </View>

        <View style={styles.navButtons}>
          <TouchableOpacity
            testID="btn-previous-date"
            onPress={onPrevious}
            style={styles.navButton}
            accessibilityLabel="Voltar um dia"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity
            testID="btn-next-date"
            onPress={onNext}
            style={styles.navButton}
            accessibilityLabel="Avançar um dia"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  titleRow: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dateLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  dateText: {
    color: '#F1F5F9',
    fontSize: 15,
    fontWeight: '600',
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
});
