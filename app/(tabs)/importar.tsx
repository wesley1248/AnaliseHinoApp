/**
 * @file importar.tsx
 * @description Tela de Importação de Planilhas Excel (.xlsx) e CSV no Dark Theme.
 * Permite aos líderes e músicos migrar dados históricos de hinos existentes
 * para o banco de dados local-first (SQLite / LocalStorage) com validação de limites (1 a 480).
 */

import React from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSpreadsheetImport } from '@/presentation/hooks/useSpreadsheetImport';
import {
  FilePickerDropzone,
  ImportSummaryCard,
  ImportPreviewList,
  ImportSuccessBanner,
} from '@/presentation/components/import';

export default function ImportarScreen() {
  const {
    fileInfo,
    parseResult,
    isParsing,
    isImporting,
    importedCount,
    error,
    pickAndParseFile,
    confirmImport,
    reset,
  } = useSpreadsheetImport();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho da Tela */}
        <View style={styles.header}>
          <Text style={styles.title}>Importação de Planilhas</Text>
          <Text style={styles.subtitle}>
            Migração de arquivos legados (.xlsx, .csv) para o banco local
          </Text>
        </View>

        {/* Banner de Erro */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Estado 1: Importação Concluída com Sucesso */}
        {importedCount !== null && (
          <ImportSuccessBanner count={importedCount} onReset={reset} />
        )}

        {/* Estado 2: Planilha Selecionada e Analisada (Pré-visualização) */}
        {importedCount === null && parseResult && fileInfo && (
          <View>
            <ImportSummaryCard
              fileName={fileInfo.name}
              totalRows={parseResult.totalRows}
              validRecordsCount={parseResult.validRecords.length}
              invalidRecordsCount={parseResult.invalidRecordsCount}
              distinctDatesCount={parseResult.distinctDatesCount}
            />

            <ImportPreviewList samples={parseResult.sampleRecords} />

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (isImporting || parseResult.validRecords.length === 0) && styles.buttonDisabled,
                ]}
                onPress={confirmImport}
                disabled={isImporting || parseResult.validRecords.length === 0}
                activeOpacity={0.8}
              >
                {isImporting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    Confirmar Importação ({parseResult.validRecords.length})
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={reset}
                disabled={isImporting}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Escolher Outro Arquivo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Estado 3: Nenhum arquivo selecionado ainda */}
        {importedCount === null && !parseResult && (
          <View>
            <FilePickerDropzone
              onPickFile={pickAndParseFile}
              isParsing={isParsing}
            />

            {/* Dicas de Formato de Planilha */}
            <View style={styles.instructionsCard}>
              <View style={styles.instructionHeader}>
                <Ionicons name="information-circle-outline" size={20} color="#60A5FA" />
                <Text style={styles.instructionTitle}>Formatos Suportados</Text>
              </View>

              <Text style={styles.instructionText}>
                • <Text style={styles.boldText}>Formato em Lista:</Text> Colunas &quot;Data&quot; (DD/MM/AAAA) e &quot;Hino&quot; (1 a 480).
              </Text>
              <Text style={styles.instructionText}>
                • <Text style={styles.boldText}>Formato Matriz:</Text> Coluna &quot;Data&quot; e colunas &quot;Hino 1&quot;, &quot;Hino 2&quot;, &quot;Hino 3&quot;.
              </Text>
              <Text style={styles.instructionText}>
                • <Text style={styles.boldText}>Desduplicação:</Text> Caso o mesmo hino esteja repetido no mesmo dia na planilha, será computado 1 culto distinto.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
      },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  errorContainer: {
    backgroundColor: '#7F1D1D',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#FEE2E2',
    fontSize: 13,
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  confirmButton: {
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
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#1E293B', // Slate 800
    borderWidth: 1,
    borderColor: '#334155', // Slate 700
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  instructionsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 18,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  instructionText: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 6,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: '#E2E8F0',
  },
});
