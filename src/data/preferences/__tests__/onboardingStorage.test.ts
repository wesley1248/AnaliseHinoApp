import {
  SQLiteOnboardingStorage,
  WebLocalStorageOnboardingStorage,
  ONBOARDING_STORAGE_KEY,
} from '../onboardingStorage';
import { MockSQLiteDatabase } from '../../database/__mocks__/MockSQLiteDatabase';

describe('OnboardingStorage', () => {
  describe('SQLiteOnboardingStorage (Mobile)', () => {
    let mockDb: MockSQLiteDatabase;
    let storage: SQLiteOnboardingStorage;

    beforeEach(() => {
      mockDb = new MockSQLiteDatabase();
      storage = new SQLiteOnboardingStorage(async () => mockDb);
    });

    it('deve retornar null se nenhuma versão foi salva anteriormente', async () => {
      const version = await storage.getLastSeenVersion();
      expect(version).toBeNull();
    });

    it('deve persistir e recuperar a versão no SQLite', async () => {
      await storage.saveLastSeenVersion('1.0.6');

      const version = await storage.getLastSeenVersion();
      expect(version).toBe('1.0.6');

      // Verifica se gravou no mock do SQLite
      expect(mockDb.getStoredPreferences().get(ONBOARDING_STORAGE_KEY)).toBe('1.0.6');
    });

    it('deve sobrescrever a versão quando uma nova versão for salva (ex: após atualização)', async () => {
      await storage.saveLastSeenVersion('1.0.6');
      expect(await storage.getLastSeenVersion()).toBe('1.0.6');

      await storage.saveLastSeenVersion('1.0.7');
      expect(await storage.getLastSeenVersion()).toBe('1.0.7');
      expect(mockDb.getStoredPreferences().get(ONBOARDING_STORAGE_KEY)).toBe('1.0.7');
    });

    it('deve remover a preferência ao chamar reset()', async () => {
      await storage.saveLastSeenVersion('1.0.6');
      expect(await storage.getLastSeenVersion()).toBe('1.0.6');

      await storage.reset();
      expect(await storage.getLastSeenVersion()).toBeNull();
      expect(mockDb.getStoredPreferences().has(ONBOARDING_STORAGE_KEY)).toBe(false);
    });

    it('deve retornar fallback em memória se o banco falhar sem lançar exceção', async () => {
      const failingDbStorage = new SQLiteOnboardingStorage(async () => {
        throw new Error('Database connection failed');
      });

      // Não deve estourar erro
      await expect(failingDbStorage.saveLastSeenVersion('1.0.6')).resolves.not.toThrow();
      const version = await failingDbStorage.getLastSeenVersion();
      expect(version).toBe('1.0.6'); // recupera do fallback em memória
    });
  });

  describe('WebLocalStorageOnboardingStorage (Web)', () => {
    let storage: WebLocalStorageOnboardingStorage;

    beforeEach(() => {
      storage = new WebLocalStorageOnboardingStorage();
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    });

    it('deve salvar e retornar a versão do LocalStorage', async () => {
      await storage.saveLastSeenVersion('1.0.6');
      const version = await storage.getLastSeenVersion();
      expect(version).toBe('1.0.6');
    });

    it('deve limpar a versão salva ao chamar reset()', async () => {
      await storage.saveLastSeenVersion('1.0.6');
      await storage.reset();
      const version = await storage.getLastSeenVersion();
      expect(version).toBeNull();
    });
  });
});
