/**
 * Definição do Esquema e Migrations do Banco de Dados SQLite Local.
 * 
 * Centraliza os scripts DDL de criação de tabelas e índices para o aplicativo
 * AnaliseHinosApp, garantindo persistência local-first confiável.
 */

export const DATABASE_NAME = 'analise_hinos.db';

export const TABLE_HYMN_OCCURRENCES = 'hymn_occurrences';
export const TABLE_APP_PREFERENCES = 'app_preferences';

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
 * Script DDL para criação da tabela de preferências e configurações locais do app.
 * Armazena pares chave-valor persistentes (ex: última versão do tour/onboarding concluído).
 */
export const CREATE_TABLE_APP_PREFERENCES = `
  CREATE TABLE IF NOT EXISTS ${TABLE_APP_PREFERENCES} (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
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
 * Modelo de linha retornado diretamente pelo SQLite para ocorrências de hinos.
 */
export interface HymnOccurrenceRow {
  id: number;
  hymn_number: number;
  date: string;
  notes: string | null;
  created_at: string;
}

/**
 * Modelo de linha para chave-valor de preferências da aplicação no SQLite.
 */
export interface AppPreferenceRow {
  key: string;
  value: string;
  updated_at: string;
}
