/**
 * @file ImportSuccessBanner.tsx
 * @description Mensagem de confirmação de sucesso com feedback de quantidade de hinos importados no Dark Theme.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface ImportSuccessBannerProps {
  count: number;
  onReset: () => void;
}

export function ImportSuccessBanner({ count, onReset }: ImportSuccessBannerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="checkmark-circle" size={48} color="#34D399" />
      </View>

      <Text style={styles.title}>Importação Concluída!</Text>
      <Text style={styles.subtitle}>
        {count} hinos importados e persistidos no banco local com sucesso.
      </Text>

      <TouchableOpacity style={styles.button} onPress={onReset} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Importar Outro Arquivo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#064E3B', // Emerald 900
    borderWidth: 1,
    borderColor: '#059669', // Emerald 600
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ECFDF5',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#A7F3D0',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#10B981', // Emerald 500
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#064E3B',
    fontSize: 14,
    fontWeight: '800',
  },
});
