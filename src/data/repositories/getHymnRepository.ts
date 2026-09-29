import { getDatabase } from '../database/database';
import { SQLiteHymnRepository } from './SQLiteHymnRepository';
import { IHymnRepository } from '../../domain/repositories/IHymnRepository';

let repositoryInstance: IHymnRepository | null = null;

/**
 * Obtém a instância singleton do repositório de hinos inicializado com o banco SQLite.
 * 
 * @returns Repositório de hinos pronto para operações assíncronas
 */
export async function getHymnRepository(): Promise<IHymnRepository> {
  if (!repositoryInstance) {
    const db = await getDatabase();
    repositoryInstance = new SQLiteHymnRepository(db);
  }
  return repositoryInstance;
}

/**
 * Permite injetar ou redefinir a instância de repositório (útil para testes ou mocks).
 * 
 * @param repo Instância do repositório ou null para resetar
 */
export function setHymnRepository(repo: IHymnRepository | null): void {
  repositoryInstance = repo;
}
