/**
 * @file ImportPreviewList.tsx
 * @description Exibe a lista de pré-visualização das ocorrências extraídas da planilha no Dark Theme.
 */

import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { CreateOccurrenceInput } from '../../../domain/repositories/IHymnRepository';

export interface ImportPreviewListProps {
  samples: CreateOccurrenceInput[];
}

export function ImportPreviewList({ samples }: ImportPreviewListProps) {
  if (samples.length === 0) {
    return null;
  }

  const formatDateBr = (isoDate: string) => {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoDate;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Amostra dos Registros ({samples.length}):</Text>

      <FlatList
        data={samples}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={[styles.itemRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Hino {item.hymnNumber}</Text>
            </View>

            <View style={styles.infoCol}>
              <Text style={styles.dateText}>{formatDateBr(item.date)}</Text>
              {item.notes ? (
                <Text style={styles.notesText} numberOfLines={1}>
                  {item.notes}
                </Text>
              ) : null}
            </View>
          </View>
        )}
        scrollEnabled={false}
      />
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
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  evenRow: {
    backgroundColor: '#0F172A',
  },
  oddRow: {
    backgroundColor: '#162032',
  },
  badge: {
    backgroundColor: '#2563EB',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  infoCol: {
    flex: 1,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  notesText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
});
