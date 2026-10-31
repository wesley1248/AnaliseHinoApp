/**
 * @file useSpreadsheetImport.ts
 * @description Hook responsável por orquestrar a seleção de arquivos Excel (.xlsx) e CSV,
 * análise de colunas (datas e números de hinos), pré-visualização dos dados e persistência
 * em lote transacional no repositório local.
 */

import { useState, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';
import { IHymnRepository } from '@/domain/repositories/IHymnRepository';
import { getHymnRepository } from '@/data/repositories/getHymnRepository';
import {
  parseSpreadsheetData,
  SpreadsheetParseResult,
} from '@/domain/services/spreadsheetParser';

export interface FileMetadata {
  name: string;
  size?: number;
  uri?: string;
}

export interface UseSpreadsheetImportOptions {
  repository?: IHymnRepository;
}

export function useSpreadsheetImport(options?: IHymnRepository | UseSpreadsheetImportOptions) {
  const resolvedOptions: UseSpreadsheetImportOptions = useMemo(() => {
    if (!options) return {};
    if ('addOccurrencesBatch' in options) {
      return { repository: options as IHymnRepository };
    }
    return options as UseSpreadsheetImportOptions;
  }, [options]);

  const [fileInfo, setFileInfo] = useState<FileMetadata | null>(null);
  const [parseResult, setParseResult] = useState<SpreadsheetParseResult | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resolveRepository = useCallback(async (): Promise<IHymnRepository> => {
    if (resolvedOptions.repository) {
      return resolvedOptions.repository;
    }
    return await getHymnRepository();
  }, [resolvedOptions.repository]);

  /**
   * Processa linhas cruas (útil para testes ou colagem manual).
   */
  const processRawRows = useCallback((fileName: string, rows: Array<Record<string, unknown>>) => {
    setError(null);
    setImportedCount(null);
    setFileInfo({ name: fileName });
    const result = parseSpreadsheetData(rows);
    setParseResult(result);
  }, []);

  /**
   * Abre o seletor de documentos nativo / web e processa o arquivo selecionado.
   */
  const pickAndParseFile = useCallback(async () => {
    setIsParsing(true);
    setError(null);
    setImportedCount(null);

    try {
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv',
          '*/*',
        ],
        copyToCacheDirectory: true,
      });

      if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
        setIsParsing(false);
        return;
      }

      const asset = pickerResult.assets[0];
      setFileInfo({
        name: asset.name,
        size: asset.size,
        uri: asset.uri,
      });

      let workbook: XLSX.WorkBook;

      if (Platform.OS === 'web' && (asset as unknown as { file?: File }).file) {
        const file = (asset as unknown as { file: File }).file;
        const arrayBuffer = await file.arrayBuffer();
        workbook = XLSX.read(arrayBuffer, { type: 'array' });
      } else {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const reader = new FileReader();

        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        workbook = XLSX.read(base64Data, { type: 'base64' });
      }

      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error('A planilha selecionada não possui abas de dados.');
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

      if (rows.length === 0) {
        throw new Error('A primeira aba da planilha está vazia.');
      }

      const result = parseSpreadsheetData(rows);
      setParseResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao processar arquivo.';
      setError(msg);
      setParseResult(null);
    } finally {
      setIsParsing(false);
    }
  }, []);

  /**
   * Confirma a persistência em lote dos registros válidos no banco local.
   */
  const confirmImport = useCallback(async () => {
    if (!parseResult || parseResult.validRecords.length === 0) {
      setError('Não há registros válidos para importar.');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const repo = await resolveRepository();
      const count = await repo.addOccurrencesBatch(parseResult.validRecords);
      setImportedCount(count);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar registros no banco.';
      setError(msg);
    } finally {
      setIsImporting(false);
    }
  }, [parseResult, resolveRepository]);

  /**
   * Reseta o estado para uma nova importação.
   */
  const reset = useCallback(() => {
    setFileInfo(null);
    setParseResult(null);
    setImportedCount(null);
    setError(null);
  }, []);

  return {
    fileInfo,
    parseResult,
    isParsing,
    isImporting,
    importedCount,
    error,
    pickAndParseFile,
    processRawRows,
    confirmImport,
    reset,
  };
}
