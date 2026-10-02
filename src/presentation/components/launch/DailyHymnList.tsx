import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HymnOccurrence } from '../../../domain/entities/HymnOccurrence';

export interface DailyHymnListProps {
  hymns: HymnOccurrence[];
  onRemove: (id: number) => void;
  isLoading?: boolean;
}

export function DailyHymnList({ hymns, onRemove }: DailyHymnListProps) {
  const count = hymns.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hinos Tocados ({count})</Text>
      </View>

      {count === 0 ? (
        <View testID="empty-hymn-list" style={styles.emptyContainer}>
          <Ionicons name="musical-notes-outline" size={32} color="#475569" style={styles.emptyIcon} />
          <Text style={styles.emptyText}>
            Nenhum hino registrado nesta data ainda.
          </Text>
          <Text style={styles.emptySubtext}>
            Use o teclado acima para adicionar o primeiro hino.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {hymns.map(item => (
            <View key={`hymn-chip-${item.id}`} style={styles.chip}>
              <View style={styles.chipBadge}>
                <Text style={styles.chipText}>Hino {item.hymnNumber}</Text>
              </View>
              <TouchableOpacity
                testID={`btn-remove-${item.id}`}
                style={styles.removeButton}
                onPress={() => item.id !== undefined && onRemove(item.id)}
                accessibilityLabel={`Remover hino ${item.hymnNumber}`}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  scrollContent: {
    gap: 10,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  chipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
});
