/**
 * Interface abstrata que encapsula as operações do banco de dados SQLite.
 * 
 * Permite desacoplar a camada de repositórios do módulo nativo expo-sqlite,
 * viabilizando injeção de dependência e testes unitários/integrados rápidos no Jest.
 */
export interface ISQLiteDatabase {
  /**
   * Executa uma ou mais instruções SQL em lote (DDL/DML).
   * 
   * @param source String com instruções SQL
   */
  execAsync(source: string): Promise<void>;

  /**
   * Executa uma consulta de escrita com parâmetros vinculados (INSERT, UPDATE, DELETE).
   * 
   * @param source Consulta SQL
   * @param params Parâmetros vinculados
   */
  runAsync(
    source: string,
    ...params: any[]
  ): Promise<{ lastInsertRowId: number; changes: number }>;

  /**
   * Executa uma consulta de leitura e retorna todas as linhas resultantes.
   * 
   * @param source Consulta SQL
   * @param params Parâmetros vinculados
   */
  getAllAsync<T>(source: string, ...params: any[]): Promise<T[]>;

  /**
   * Executa uma consulta de leitura e retorna a primeira linha ou null.
   * 
   * @param source Consulta SQL
   * @param params Parâmetros vinculados
   */
  getFirstAsync<T>(source: string, ...params: any[]): Promise<T | null>;

  /**
   * Executa uma função dentro de uma transação com commit/rollback automático.
   * 
   * @param task Função assíncrona contendo as operações da transação
   */
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}
