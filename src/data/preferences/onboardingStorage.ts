/**
 * @file onboardingStorage.ts
 * @description Mecanismo Local-First de persistência da versão do tour/onboarding concluído.
 * Utiliza o SQLite nativo local (tabela app_preferences) no ambiente mobile (Android / iOS)
 * e LocalStorage no ambiente web, garantindo que o status de visualização do tour persista
 * confiavelmente entre aberturas e reinicializações do aplicativo sem depender de nuvem.
 */

import { Platform } from 'react-native';
import { TABLE_APP_PREFERENCES } from '../database/schema';
import { ISQLiteDatabase } from '../database/types';

export interface IOnboardingStorage {
  getLastSeenVersion(): Promise<string | null>;
  saveLastSeenVersion(version: string): Promise<void>;
  reset(): Promise<void>;
}

export const ONBOARDING_STORAGE_KEY = '@analise_hinos_tour_last_version';

// Fallback em memória para testes ou caso o storage falhe
let inMemoryVersion: string | null = null;

/**
 * Armazenamento de preferências via LocalStorage para ambiente Web.
 */
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

/**
 * Armazenamento de preferências via SQLite Local para ambiente Mobile nativo (Android / iOS).
 * Persiste na tabela `app_preferences` sem necessidade de bibliotecas extras.
 */
export class SQLiteOnboardingStorage implements IOnboardingStorage {
  constructor(
    private readonly getDatabaseFn: () => Promise<ISQLiteDatabase> = async () => {
      const { getDatabase } = require('../database/database');
      return getDatabase();
    }
  ) {}

  public async getLastSeenVersion(): Promise<string | null> {
    try {
      const db = await this.getDatabaseFn();
      const row = await db.getFirstAsync<{ value: string }>(
        `SELECT value FROM ${TABLE_APP_PREFERENCES} WHERE key = ?`,
        ONBOARDING_STORAGE_KEY
      );
      if (row && typeof row.value === 'string') {
        return row.value;
      }
    } catch {
      // Em caso de falha de I/O, recorre ao fallback em memória
    }
    return inMemoryVersion;
  }

  public async saveLastSeenVersion(version: string): Promise<void> {
    inMemoryVersion = version;
    try {
      const db = await this.getDatabaseFn();
      await db.runAsync(
        `INSERT OR REPLACE INTO ${TABLE_APP_PREFERENCES} (key, value, updated_at) VALUES (?, ?, datetime('now', 'localtime'))`,
        ONBOARDING_STORAGE_KEY,
        version
      );
    } catch {
      // Em caso de falha de I/O, preserva ao menos em memória na sessão
    }
  }

  public async reset(): Promise<void> {
    inMemoryVersion = null;
    try {
      const db = await this.getDatabaseFn();
      await db.runAsync(
        `DELETE FROM ${TABLE_APP_PREFERENCES} WHERE key = ?`,
        ONBOARDING_STORAGE_KEY
      );
    } catch {
      // Fallback
    }
  }
}

/**
 * Instância padrão de armazenamento de preferências, resolvida conforme a plataforma de execução.
 */
export const defaultOnboardingStorage: IOnboardingStorage =
  Platform.OS === 'web'
    ? new WebLocalStorageOnboardingStorage()
    : new SQLiteOnboardingStorage();
