import { IHymnRepository } from '../../domain/repositories/IHymnRepository';
import { WebLocalStorageHymnRepository } from './WebLocalStorageHymnRepository';

let repositoryInstance: IHymnRepository | null = null;

/**
 * Retorna a instância singleton do repositório para o ambiente Web (localStorage),
 * garantindo zero chamadas ou referências a módulos SQLite nativos no browser.
 */
export async function getHymnRepository(): Promise<IHymnRepository> {
  if (!repositoryInstance) {
    repositoryInstance = new WebLocalStorageHymnRepository();
  }
  return repositoryInstance;
}

export function setHymnRepository(repo: IHymnRepository | null): void {
  repositoryInstance = repo;
}
