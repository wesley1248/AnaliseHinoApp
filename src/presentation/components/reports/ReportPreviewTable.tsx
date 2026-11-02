/**
 * @file ReportPreviewTable.tsx
 * @description Tabela de visualização prévia da lista de hinos do relatório no Dark Theme.
 * Exibe destaque visual para hinos repetidos (2+), contagem de cultos, execuções e datas dos cultos.
 */

import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportItemData } from '../../../domain/services/reportHtmlGenerator';

export interface ReportPreviewTableProps {
  items: ReportItemData[];
}

/**
 * Formata datas ISO YYYY-MM-DD para DD/MM/AAAA.
 */
function formatIsoToBr(isoDate: string): string {
  if (!isoDate || !isoDate.includes('-')) return isoDate;
  const parts = isoDate.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : isoDate;
}

export function ReportPreviewTable({ items }: ReportPreviewTableProps) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="musical-notes-outline" size={36} color="#64748B" />
        <Text style={styles.emptyText}>Nenhum registro encontrado para os filtros selecionados.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCol, styles.colRank]}>#</Text>
        <Text style={[styles.headerCol, styles.colHymn]}>Hino</Text>
        <Text style={[styles.headerCol, styles.colNum]}>Cultos</Text>
        <Text style={[styles.headerCol, styles.colNum]}>Exec.</Text>
        <Text style={[styles.headerCol, styles.colNum]}>% Cultos</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.hymnNumber.toString()}
        renderItem={({ item, index }) => {
          const isRepeated = item.distinctDaysCount >= 2;
          const formattedDates = item.dates && item.dates.length > 0
            ? item.dates.map(formatIsoToBr).join(' • ')
            : '';

          return (
            <View
              style={[
                styles.row,
                index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                isRepeated && styles.rowRepeated,
              ]}
            >
              <Text style={[styles.cellText, styles.colRank]}>{index + 1}</Text>
              <View style={styles.colHymn}>
                <View style={styles.hymnNameRow}>
                  <Text style={styles.hymnText}>Hino {item.hymnNumber}</Text>
                  {isRepeated && (
                    <View style={styles.repeatedBadge}>
                      <Text style={styles.repeatedBadgeText}>Repetido</Text>
                    </View>
                  )}
                </View>
                {formattedDates !== '' && (
                  <Text style={styles.datesSubText} numberOfLines={2}>
                    {formattedDates}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.cellText,
                  styles.colNum,
                  styles.boldNum,
                  isRepeated && styles.repeatedNum,
                ]}
              >
                {item.distinctDaysCount}
              </Text>
              <Text style={[styles.cellText, styles.colNum]}>
                {item.totalExecutions}
              </Text>
              <Text style={[styles.cellText, styles.colNum, styles.percentText]}>
                {item.percentageOfDays.toFixed(1)}%
              </Text>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E293B', // Slate 800
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerCol: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8', // Slate 400
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  rowEven: {
    backgroundColor: '#0F172A', // Slate 900
  },
  rowOdd: {
    backgroundColor: '#131D31',
  },
  rowRepeated: {
    backgroundColor: '#1C1917', // Destaque sutil âmbar
  },
  hymnNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  repeatedBadge: {
    backgroundColor: '#78350F',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D97706',
  },
  repeatedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FCD34D',
    textTransform: 'uppercase',
  },
  datesSubText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  colRank: {
    width: 32,
    textAlign: 'center',
  },
  colHymn: {
    flex: 1,
    paddingRight: 8,
  },
  colNum: {
    width: 60,
    textAlign: 'right',
  },
  cellText: {
    fontSize: 12,
    color: '#CBD5E1', // Slate 300
  },
  hymnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  boldNum: {
    fontWeight: '700',
    color: '#F8FAFC',
  },
  repeatedNum: {
    color: '#F59E0B', // Amber 500
  },
  percentText: {
    color: '#60A5FA', // Blue 400
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
