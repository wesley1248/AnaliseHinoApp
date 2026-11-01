/**
 * @file dataSyncEvents.ts
 * @description Notificador de eventos de sincronização de dados entre abas do aplicativo.
 * Permite que inserções, exclusões e importações de hinos atualizem instantaneamente
 * os estados de Dashboard, Relatórios e Lançamento sem delay e sem necessidade de refresh manual.
 */

export type DataChangeListener = () => void;

export class DataSyncNotifier {
  private listeners: Set<DataChangeListener> = new Set();

  /**
   * Registra um listener para ser notificado sempre que houver modificações na base de hinos.
   * 
   * @param listener Função de callback disparada na alteração de dados
   * @returns Função de unsubscribe para desvincular o listener
   */
  public subscribe(listener: DataChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifica todos os ouvintes inscritos de que os dados de hinos foram modificados.
   */
  public notify(): void {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        // Previne que falhas em um listener quebrem as demais abas
      }
    });
  }

  /**
   * Retorna a quantidade de ouvintes inscritos atualmente (útil para testes).
   */
  public getListenerCount(): number {
    return this.listeners.size;
  }

  /**
   * Limpa todos os ouvintes registrados (útil para isolamento de testes unitários).
   */
  public clearListeners(): void {
    this.listeners.clear();
  }
}

export const dataSyncNotifier = new DataSyncNotifier();
