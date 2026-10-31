/**
 * @file spreadsheetParser.ts
 * @description Serviço de domínio responsável pela extração, validação e sanitização
 * de dados de planilhas Excel (.xlsx) e arquivos .csv contendo registros históricos de hinos.
 */

import { CreateOccurrenceInput } from '../repositories/IHymnRepository';

export interface SpreadsheetParseResult {
  validRecords: CreateOccurrenceInput[];
  invalidRecordsCount: number;
  totalRows: number;
  distinctDatesCount: number;
  sampleRecords: CreateOccurrenceInput[];
  errors: string[];
}

/**
 * Converte um valor genérico de data para o formato ISO YYYY-MM-DD.
 * Suporta strings ISO (YYYY-MM-DD), strings BR (DD/MM/YYYY) e números seriais do Excel.
 */
export function normalizeExcelDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // Número serial do Excel (ex: 45596)
  if (typeof value === 'number') {
    // No Excel: dia 1 = 1900-01-01 (com o bug de bissexto de 1900 compensado em 1899-12-30)
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const millis = excelEpoch.getTime() + value * 86400000;
    const d = new Date(millis);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  }

  const str = String(value).trim();

  // Formato ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Formato Brasileiro: DD/MM/YYYY ou D/M/YYYY
  const brMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (brMatch) {
    const day = brMatch[1].padStart(2, '0');
    const month = brMatch[2].padStart(2, '0');
    const year = brMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Tentativa com Date.parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return null;
}

/**
 * Valida se um número de hino está dentro do limite oficial do hinário (1 a 480).
 */
export function isValidHymnNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const num = typeof value === 'number' ? value : parseInt(String(value).trim(), 10);
  if (isNaN(num) || !Number.isInteger(num)) {
    return null;
  }

  if (num < 1 || num > 480) {
    return null;
  }

  return num;
}

/**
 * Analisa e extrai ocorrências de hinos a partir de linhas cruas obtidas de uma planilha.
 *
 * @param rows Lista de objetos representando as linhas da planilha.
 * @returns Objeto SpreadsheetParseResult contendo registros válidos, contagens e amostras.
 */
export function parseSpreadsheetData(rows: Array<Record<string, unknown>>): SpreadsheetParseResult {
  const validRecords: CreateOccurrenceInput[] = [];
  let invalidRecordsCount = 0;
  const errors: string[] = [];
  const distinctDates = new Set<string>();

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const keys = Object.keys(row);

    // 1. Identificar coluna de data
    const dateKey = keys.find((k) => {
      const lower = k.toLowerCase().trim();
      return (
        lower === 'data' ||
        lower === 'date' ||
        lower === 'dia' ||
        lower === 'dt' ||
        lower.startsWith('data')
      );
    });

    const rawDate = dateKey ? row[dateKey] : null;
    const normalizedDate = normalizeExcelDate(rawDate);

    if (!normalizedDate) {
      // Linha sem data válida é considerada inválida
      invalidRecordsCount++;
      continue;
    }

    // Identificar observações opcionais
    const notesKey = keys.find((k) => {
      const lower = k.toLowerCase().trim();
      return (
        lower === 'observacao' ||
        lower === 'observação' ||
        lower === 'obs' ||
        lower === 'notas' ||
        lower === 'culto'
      );
    });
    const notes = notesKey && row[notesKey] ? String(row[notesKey]).trim() : undefined;

    // 2. Verificar se o formato é matriz ("Hino 1", "Hino 2", "Hino 3", etc.)
    const hymnMatrixKeys = keys.filter((k) => {
      const lower = k.toLowerCase().trim();
      return (
        lower.startsWith('hino ') ||
        lower.startsWith('hino_') ||
        lower.startsWith('hymn ') ||
        lower.startsWith('hymn_')
      );
    });

    if (hymnMatrixKeys.length > 0) {
      for (const hKey of hymnMatrixKeys) {
        const rawHymn = row[hKey];
        if (rawHymn === undefined || rawHymn === null || rawHymn === '') {
          continue;
        }

        const hymnNumber = isValidHymnNumber(rawHymn);
        if (hymnNumber !== null) {
          validRecords.push({
            hymnNumber,
            date: normalizedDate,
            notes,
          });
          distinctDates.add(normalizedDate);
        } else {
          invalidRecordsCount++;
        }
      }
    } else {
      // 3. Formato tabular tradicional ("Hino" ou "Numero" ou "Hymn")
      const hymnKey = keys.find((k) => {
        const lower = k.toLowerCase().trim();
        return (
          lower === 'hino' ||
          lower === 'hinos' ||
          lower === 'numero' ||
          lower === 'número' ||
          lower === 'num' ||
          lower === 'hymn' ||
          lower === 'cantado'
        );
      });

      const rawHymn = hymnKey ? row[hymnKey] : null;
      const hymnNumber = isValidHymnNumber(rawHymn);

      if (hymnNumber !== null) {
        validRecords.push({
          hymnNumber,
          date: normalizedDate,
          notes,
        });
        distinctDates.add(normalizedDate);
      } else {
        invalidRecordsCount++;
      }
    }
  }

  return {
    validRecords,
    invalidRecordsCount,
    totalRows: rows.length,
    distinctDatesCount: distinctDates.size,
    sampleRecords: validRecords.slice(0, 10),
    errors,
  };
}
