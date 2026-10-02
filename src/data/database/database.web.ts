import { ISQLiteDatabase } from './types';

/**
 * Implementação Web No-Op de conexão com banco de dados para evitar carregamento
 * do módulo nativo expo-sqlite no ambiente do navegador (Web).
 */
export async function initDatabase(_db: ISQLiteDatabase): Promise<void> {
  // No-op no ambiente Web
}

export async function getDatabase(): Promise<ISQLiteDatabase> {
  return {
    execAsync: async () => {},
    runAsync: async () => ({ lastInsertRowId: 0, changes: 0 }),
    getFirstAsync: async () => null,
    getAllAsync: async () => [],
    withTransactionAsync: async (action) => { await action(); },
  };
}

export function resetDatabaseCache(): void {
  // No-op
}
