import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface NumericKeypadProps {
  onDigitPress: (digit: string) => void;
  onClear: () => void;
  onAddPress: () => void;
  canAdd: boolean;
}

export function NumericKeypad({
  onDigitPress,
  onClear,
  onAddPress,
  canAdd,
}: NumericKeypadProps) {
  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map(digit => (
            <TouchableOpacity
              key={`digit-${digit}`}
              testID={`btn-digit-${digit}`}
              style={styles.keyButton}
              onPress={() => onDigitPress(digit)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Dígito ${digit}`}
            >
              <Text style={styles.keyText}>{digit}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* 4ª linha: Limpar, 0, Adicionar + */}
      <View style={styles.row}>
        <TouchableOpacity
          testID="btn-clear"
          style={[styles.keyButton, styles.clearButton]}
          onPress={onClear}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Limpar número"
        >
          <Text style={styles.clearText}>Limpar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="btn-digit-0"
          style={styles.keyButton}
          onPress={() => onDigitPress('0')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Dígito 0"
        >
          <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="btn-add-hymn"
          style={[styles.keyButton, styles.addButton, !canAdd && styles.addButtonDisabled]}
          onPress={onAddPress}
          disabled={!canAdd}
          activeOpacity={canAdd ? 0.7 : 1}
          accessibilityRole="button"
          accessibilityLabel="Adicionar hino"
        >
          <Text style={[styles.addText, !canAdd && styles.addTextDisabled]}>Adicionar +</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  keyButton: {
    flex: 1,
    height: 64,
    backgroundColor: '#1E293B',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  keyText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  clearButton: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  clearText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  addButton: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  addButtonDisabled: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    opacity: 0.5,
  },
  addText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addTextDisabled: {
    color: '#64748B',
  },
});
