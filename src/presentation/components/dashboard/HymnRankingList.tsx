import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HymnFrequency } from '@/domain/entities/HymnOccurrence';
import { DashboardRankingFilter } from '@/presentation/hooks/useDashboard';

interface HymnRankingListProps {
  /** Lista consolidada de frequências */
  frequencies: HymnFrequency[];
  /** Modo de filtro selecionado */
  rankingFilter?: DashboardRankingFilter;
  /** Callback para alternar o modo de filtro */
  onSelectRankingFilter?: (filter: DashboardRankingFilter) => void;
}

/**
 * Retorna as cores de destaque de medalha para o Top 3 do ranking.
 */
function getBadgeStyle(index: number) {
  switch (index) {
    case 0:
      return { bg: '#FEF08A', text: '#854D0E', border: '#EAB308' }; // Ouro
    case 1:
      return { bg: '#E2E8F0', text: '#334155', border: '#94A3B8' }; // Prata
    case 2:
      return { bg: '#FED7AA', text: '#9A3412', border: '#F97316' }; // Bronze
    default:
      return { bg: '#334155', text: '#94A3B8', border: '#475569' }; // Neutro
  }
}

/**
 * Formata datas ISO YYYY-MM-DD para o formato amigável brasileiro DD/MM/AAAA.
 */
function formatIsoDateToBr(dateStr: string): string {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Lista do ranking consolidado de repetições de hinos no período.
 * Apresenta chips de filtro (Repetidos 2+, Todos, Cantados 1x), contagem de cultos,
 * barra visual de proporção e a lista detalhada das datas em que cada hino foi cantado.
 */
export function HymnRankingList({
  frequencies,
  rankingFilter = 'repetidos',
  onSelectRankingFilter,
}: HymnRankingListProps) {
  const filterOptions: { key: DashboardRankingFilter; label: string }[] = [
    { key: 'repetidos', label: 'Repetidos (2+)' },
    { key: 'todos', label: 'Todos Cantados' },
    { key: 'unicos', label: 'Cantados 1 Vez' },
  ];

  // Filtra de acordo com a opção selecionada
  const filteredList = frequencies.filter((item) => {
    if (rankingFilter === 'repetidos') return item.distinctDaysCount >= 2;
    if (rankingFilter === 'unicos') return item.distinctDaysCount === 1;
    return true;
  });

  // Frequência máxima para base de cálculo da barra de progresso
  const maxDistinctDays = frequencies[0]?.distinctDaysCount || 1;

  return (
    <View style={styles.container}>
      {/* Título da Seção */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ranking de Frequência</Text>
        <Text style={styles.sectionSubtitle}>
          Identifique os hinos reincidentes e as datas dos cultos
        </Text>
      </View>

      {/* Chips de Seleção de Filtro */}
      {onSelectRankingFilter && (
        <View style={styles.filterBar}>
          {filterOptions.map((opt) => {
            const isActive = rankingFilter === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => onSelectRankingFilter(opt.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Exibição da Lista ou Estado Vazio */}
      {filteredList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name={rankingFilter === 'repetidos' ? 'checkmark-circle-outline' : 'musical-notes-outline'}
            size={40}
            color="#60A5FA"
          />
          <Text style={styles.emptyTitle}>
            {rankingFilter === 'repetidos'
              ? 'Nenhum hino repetido no período!'
              : 'Nenhum hino encontrado'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {rankingFilter === 'repetidos'
              ? 'Parabéns! Todos os hinos entoados no período foram cantados em apenas 1 culto.'
              : 'Alterne o período ou adicione lançamentos na aba "Lançar".'}
          </Text>
          {rankingFilter === 'repetidos' && onSelectRankingFilter && (
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => onSelectRankingFilter('todos')}
            >
              <Text style={styles.seeAllButtonText}>Ver todos os cantados</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.list}>
          {filteredList.map((item, index) => {
            const badge = getBadgeStyle(index);
            const progressPercent = Math.min(
              100,
              Math.max(10, Math.round((item.distinctDaysCount / maxDistinctDays) * 100))
            );
            const isRepeated = item.distinctDaysCount >= 2;
            const hasMultiplePerDay = item.totalExecutionsCount > item.distinctDaysCount;

            // Formatação das datas em que o hino foi cantado
            const formattedDates = item.dates
              .map((d) => formatIsoDateToBr(d))
              .join(' • ');

            return (
              <View key={item.hymnNumber} style={styles.itemRow}>
                {/* Badge com a posição */}
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: badge.bg, borderColor: badge.border },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: badge.text }]}>
                    #{index + 1}
                  </Text>
                </View>

                {/* Informações centrais */}
                <View style={styles.infoCol}>
                  <View style={styles.titleRow}>
                    <View style={styles.hymnTitleContainer}>
                      <Text style={styles.hymnTitle}>Hino {item.hymnNumber}</Text>
                      {isRepeated && (
                        <View style={styles.repeatedTag}>
                          <Text style={styles.repeatedTagText}>Repetido</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.countContainer}>
                      <Text
                        style={[
                          styles.distinctCount,
                          isRepeated && styles.distinctCountRepeated,
                        ]}
                      >
                        {item.distinctDaysCount}{' '}
                        {item.distinctDaysCount === 1 ? 'culto' : 'cultos'}
                      </Text>
                      {hasMultiplePerDay && (
                        <Text style={styles.totalExecutionsCount}>
                          ({item.totalExecutionsCount} execuções)
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Barra visual de repetição */}
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${progressPercent}%` },
                        isRepeated && styles.repeatedProgressFill,
                      ]}
                    />
                  </View>

                  {/* Datas dos cultos em que o hino foi cantado */}
                  {item.dates.length > 0 && (
                    <View style={styles.datesContainer}>
                      <Ionicons name="calendar-outline" size={11} color="#94A3B8" />
                      <Text style={styles.datesText} numberOfLines={2}>
                        {formattedDates}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  list: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  infoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  hymnTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hymnTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  repeatedTag: {
    backgroundColor: '#78350F', // Amber 900
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D97706',
  },
  repeatedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FCD34D', // Amber 300
    textTransform: 'uppercase',
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distinctCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  distinctCountRepeated: {
    color: '#F59E0B', // Amber 500
  },
  totalExecutionsCount: {
    fontSize: 11,
    color: '#94A3B8',
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  repeatedProgressFill: {
    backgroundColor: '#F59E0B', // Amber 500
  },
  datesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  datesText: {
    fontSize: 11,
    color: '#94A3B8',
    flex: 1,
  },
  emptyContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 18,
  },
  seeAllButton: {
    marginTop: 14,
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  seeAllButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
