/**
 * @file ReportActionButtons.tsx
 * @description Botões de ação para exportar PDF via compartilhamento nativo ou imprimir no Dark Theme.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';

export interface ReportActionButtonsProps {
  onExportPdf: () => void;
  onPrint: () => void;
  isExporting: boolean;
}

export function ReportActionButtons({
  onExportPdf,
  onPrint,
  isExporting,
}: ReportActionButtonsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.primaryButton, isExporting && styles.buttonDisabled]}
        onPress={onExportPdf}
        disabled={isExporting}
        activeOpacity={0.8}
      >
        {isExporting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>Exportar PDF</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryButton, isExporting && styles.buttonDisabled]}
        onPress={onPrint}
        disabled={isExporting}
        activeOpacity={0.8}
      >
        <Text style={styles.secondaryButtonText}>Imprimir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0F172A', // Slate 900
    borderTopWidth: 1,
    borderTopColor: '#1E293B', // Slate 800
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#2563EB', // Blue 600
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#1E293B', // Slate 800
    borderWidth: 1,
    borderColor: '#334155', // Slate 700
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#F8FAFC', // Slate 50
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
