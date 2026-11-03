/**
 * @file onboardingStorage.web.ts
 * @description Implementação de persistência de preferências para o ambiente Web (localStorage).
 * Garante zero chamadas ou referências a módulos SQLite nativos no browser.
 */

export interface IOnboardingStorage {
  getLastSeenVersion(): Promise<string | null>;
  saveLastSeenVersion(version: string): Promise<void>;
  reset(): Promise<void>;
}

export const ONBOARDING_STORAGE_KEY = '@analise_hinos_tour_last_version';

let inMemoryVersion: string | null = null;

export class WebLocalStorageOnboardingStorage implements IOnboardingStorage {
  public async getLastSeenVersion(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
      }
    } catch {
      // Fallback
    }
    return inMemoryVersion;
  }

  public async saveLastSeenVersion(version: string): Promise<void> {
    inMemoryVersion = version;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(ONBOARDING_STORAGE_KEY, version);
      }
    } catch {
      // Fallback
    }
  }

  public async reset(): Promise<void> {
    inMemoryVersion = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      }
    } catch {
      // Fallback
    }
  }
}

export const defaultOnboardingStorage: IOnboardingStorage = new WebLocalStorageOnboardingStorage();
