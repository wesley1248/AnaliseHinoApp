/**
 * @file FilePickerDropzone.tsx
 * @description Área interativa para seleção e upload de planilhas Excel (.xlsx) e arquivos .csv no Dark Theme.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface FilePickerDropzoneProps {
  onPickFile: () => void;
  isParsing: boolean;
}

export function FilePickerDropzone({ onPickFile, isParsing }: FilePickerDropzoneProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropzone}
        onPress={onPickFile}
        disabled={isParsing}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-upload-outline" size={40} color="#60A5FA" />
        </View>

        <Text style={styles.title}>Selecionar Planilha Excel</Text>
        <Text style={styles.subtitle}>Formatos aceitos: .xlsx, .xls ou .csv</Text>

        <View style={styles.button}>
          {isParsing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Selecionar Arquivo</Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  dropzone: {
    backgroundColor: '#1E293B', // Slate 800
    borderWidth: 2,
    borderColor: '#334155', // Slate 700
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0F172A', // Slate 900
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 18,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563EB', // Blue 600
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
