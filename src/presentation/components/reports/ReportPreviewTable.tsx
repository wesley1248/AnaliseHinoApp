/**
 * @file ReportPreviewTable.tsx
 * @description Tabela de visualização prévia da lista de hinos do relatório no Dark Theme.
 */

import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { ReportItemData } from '../../../domain/services/reportHtmlGenerator';

export interface ReportPreviewTableProps {
  items: ReportItemData[];
}

export function ReportPreviewTable({ items }: ReportPreviewTableProps) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
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
        renderItem={({ item, index }) => (
          <View style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
            <Text style={[styles.cellText, styles.colRank]}>{index + 1}</Text>
            <View style={styles.colHymn}>
              <Text style={styles.hymnText}>Hino {item.hymnNumber}</Text>
            </View>
            <Text style={[styles.cellText, styles.colNum, styles.boldNum]}>
              {item.distinctDaysCount}
            </Text>
            <Text style={[styles.cellText, styles.colNum]}>
              {item.totalExecutions}
            </Text>
            <Text style={[styles.cellText, styles.colNum, styles.percentText]}>
              {item.percentageOfDays.toFixed(1)}%
            </Text>
          </View>
        )}
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  rowEven: {
    backgroundColor: '#0F172A', // Slate 900
  },
  rowOdd: {
    backgroundColor: '#162032', // Leve contraste escuro
  },
  colRank: {
    width: 36,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
  },
  colHymn: {
    flex: 1,
    paddingLeft: 8,
  },
  hymnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  colNum: {
    width: 58,
    textAlign: 'right',
  },
  cellText: {
    fontSize: 13,
    color: '#CBD5E1',
  },
  boldNum: {
    fontWeight: '700',
    color: '#F8FAFC',
  },
  percentText: {
    color: '#60A5FA', // Blue 400
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#0F172A',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
});
