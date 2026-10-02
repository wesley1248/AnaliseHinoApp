import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface HymnInputDisplayProps {
  value: string;
  onBackspace: () => void;
}

export function HymnInputDisplay({ value, onBackspace }: HymnInputDisplayProps) {
  const hasValue = value.length > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.card, hasValue && styles.cardActive]}>
        <View style={styles.numberWrapper}>
          <Ionicons
            name="musical-note"
            size={28}
            color={hasValue ? '#38BDF8' : '#64748B'}
            style={styles.musicIcon}
          />
          <Text
            testID="display-hymn-number"
            style={[styles.numberText, !hasValue && styles.placeholderText]}
          >
            {hasValue ? value : 'Número do Hino'}
          </Text>
        </View>

        {hasValue && (
          <TouchableOpacity
            testID="btn-backspace"
            onPress={onBackspace}
            style={styles.backspaceButton}
            accessibilityLabel="Apagar dígito"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="backspace-outline" size={26} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: '#334155',
    minHeight: 74,
  },
  cardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#0F172A',
  },
  numberWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  musicIcon: {
    marginRight: 14,
  },
  numberText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 1,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#64748B',
    letterSpacing: 0,
  },
  backspaceButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },
});
