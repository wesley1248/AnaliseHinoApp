/**
 * @file onboardingStorage.ts
 * @description Mecanismo Local-First de persistência da versão do tour/onboarding concluído.
 * Permite detectar primeira instalação ou atualização de versão sem dependência de nuvem.
 */

export interface IOnboardingStorage {
  getLastSeenVersion(): Promise<string | null>;
  saveLastSeenVersion(version: string): Promise<void>;
  reset(): Promise<void>;
}

const STORAGE_KEY = '@analise_hinos_tour_last_version';

// Armazenamento em memória para ambientes de teste e fallback
let inMemoryVersion: string | null = null;

export class LocalOnboardingStorage implements IOnboardingStorage {
  public async getLastSeenVersion(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(STORAGE_KEY);
      }
    } catch {
      // Fallback em caso de erro no storage
    }
    return inMemoryVersion;
  }

  public async saveLastSeenVersion(version: string): Promise<void> {
    inMemoryVersion = version;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, version);
      }
    } catch {
      // Fallback em caso de erro no storage
    }
  }

  public async reset(): Promise<void> {
    inMemoryVersion = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Fallback
    }
  }
}

export const defaultOnboardingStorage = new LocalOnboardingStorage();
