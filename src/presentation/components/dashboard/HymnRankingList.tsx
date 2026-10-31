import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HymnFrequency } from '@/domain/entities/HymnOccurrence';

interface HymnRankingListProps {
  /** Lista de frequências ordenada decrescente por dias distintos */
  frequencies: HymnFrequency[];
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
 * Lista do ranking consolidado de repetições de hinos no período.
 * Apresenta a colocação, número do hino, barra visual de proporção e
 * contagem de cultos (dias distintos) e execuções brutas.
 */
export function HymnRankingList({ frequencies }: HymnRankingListProps) {
  if (frequencies.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Nenhum hino registrado no período</Text>
        <Text style={styles.emptySubtitle}>
          Alterne o período ou adicione lançamentos na aba "Lançar".
        </Text>
      </View>
    );
  }

  // Frequência máxima para base de cálculo da barra de progresso
  const maxDistinctDays = frequencies[0]?.distinctDaysCount || 1;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ranking de Frequência</Text>
      <Text style={styles.sectionSubtitle}>
        Ordenado por cultos distintos (regra de desduplicação diária)
      </Text>

      <View style={styles.list}>
        {frequencies.map((item, index) => {
          const badge = getBadgeStyle(index);
          const progressPercent = Math.min(
            100,
            Math.max(10, Math.round((item.distinctDaysCount / maxDistinctDays) * 100))
          );
          const hasMultiplePerDay = item.totalExecutionsCount > item.distinctDaysCount;

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
                  <Text style={styles.hymnTitle}>Hino {item.hymnNumber}</Text>
                  <View style={styles.countContainer}>
                    <Text style={styles.distinctCount}>
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
                      index < 3 && styles.topProgressFill,
                    ]}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 40,
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
    marginBottom: 16,
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
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
  hymnTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distinctCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#60A5FA', // Blue 400
  },
  totalExecutionsCount: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 6,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6', // Blue 500
    borderRadius: 3,
  },
  topProgressFill: {
    backgroundColor: '#60A5FA', // Blue 400
  },
  emptyContainer: {
    marginHorizontal: 20,
    padding: 32,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
  },
});
