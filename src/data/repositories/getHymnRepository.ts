import { Platform } from 'react-native';
import { IHymnRepository } from '../../domain/repositories/IHymnRepository';
import { WebLocalStorageHymnRepository } from './WebLocalStorageHymnRepository';

let repositoryInstance: IHymnRepository | null = null;

/**
 * Obtém a instância singleton do repositório de hinos:
 * - No ambiente Web / Navegador: utiliza WebLocalStorageHymnRepository (localStorage)
 *   evitando a dependência do módulo nativo ExpoSQLite que não existe no browser.
 * - No ambiente Mobile (Android / iOS): utiliza SQLiteHymnRepository conectado ao SQLite nativo.
 * 
 * @returns Repositório de hinos pronto para operações assíncronas
 */
export async function getHymnRepository(): Promise<IHymnRepository> {
  if (repositoryInstance) {
    return repositoryInstance;
  }

  if (Platform.OS === 'web') {
    repositoryInstance = new WebLocalStorageHymnRepository();
    return repositoryInstance;
  }

  const { getDatabase } = require('../database/database');
  const { SQLiteHymnRepository } = require('./SQLiteHymnRepository');
  const db = await getDatabase();
  const repo = new SQLiteHymnRepository(db);
  repositoryInstance = repo;
  return repo;
}

/**
 * Permite injetar ou redefinir a instância de repositório (útil para testes ou mocks).
 * 
 * @param repo Instância do repositório ou null para resetar
 */
export function setHymnRepository(repo: IHymnRepository | null): void {
  repositoryInstance = repo;
}
