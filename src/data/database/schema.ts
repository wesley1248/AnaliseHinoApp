/**
 * Definição do Esquema e Migrations do Banco de Dados SQLite Local.
 * 
 * Centraliza os scripts DDL de criação de tabelas e índices para o aplicativo
 * AnaliseHinosApp, garantindo persistência local-first confiável.
 */

export const DATABASE_NAME = 'analise_hinos.db';

export const TABLE_HYMN_OCCURRENCES = 'hymn_occurrences';

/**
 * Script DDL para criação da tabela principal de ocorrências de hinos.
 */
export const CREATE_TABLE_HYMN_OCCURRENCES = `
  CREATE TABLE IF NOT EXISTS ${TABLE_HYMN_OCCURRENCES} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hymn_number INTEGER NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`;

/**
 * Índices para otimização de consultas por data e por número de hino.
 */
export const CREATE_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_hymn_occurrences_date ON ${TABLE_HYMN_OCCURRENCES} (date);
  CREATE INDEX IF NOT EXISTS idx_hymn_occurrences_hymn_number ON ${TABLE_HYMN_OCCURRENCES} (hymn_number);
`;

/**
 * Modelo de linha retornado diretamente pelo SQLite.
 */
export interface HymnOccurrenceRow {
  id: number;
  hymn_number: number;
  date: string;
  notes: string | null;
  created_at: string;
}
