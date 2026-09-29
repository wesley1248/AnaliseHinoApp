import * as SQLite from 'expo-sqlite';
import {
  DATABASE_NAME,
  CREATE_TABLE_HYMN_OCCURRENCES,
  CREATE_INDEXES,
} from './schema';
import { ISQLiteDatabase } from './types';

let cachedDb: ISQLiteDatabase | null = null;

/**
 * Inicializa a estrutura do banco de dados SQLite aplicando as migrations e índices necessários.
 * 
 * @param db Instância de banco de dados compatível com ISQLiteDatabase
 */
export async function initDatabase(db: ISQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    ${CREATE_TABLE_HYMN_OCCURRENCES}
    ${CREATE_INDEXES}
  `);
}

/**
 * Obtém a conexão singleton do banco de dados local da aplicação,
 * garantindo que as tabelas estejam criadas e prontas para uso.
 * 
 * @returns Instância ativa e inicializada do banco de dados
 */
export async function getDatabase(): Promise<ISQLiteDatabase> {
  if (cachedDb) {
    return cachedDb;
  }

  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await initDatabase(db);
  cachedDb = db;
  return cachedDb;
}

/**
 * Redefine o cache da conexão de banco de dados (útil para testes unitários ou reinicialização).
 */
export function resetDatabaseCache(): void {
  cachedDb = null;
}
