import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { IHymnRepository } from '../../domain/repositories/IHymnRepository';
import { HymnOccurrence } from '../../domain/entities/HymnOccurrence';
import { getHymnRepository } from '../../data/repositories/getHymnRepository';

/**
 * Opções de configuração para o hook useDailyLaunch.
 */
export interface UseDailyLaunchOptions {
  /**
   * Instância customizada do repositório (útil para testes ou mocks).
   */
  repository?: IHymnRepository;

  /**
   * Data inicial no formato ISO YYYY-MM-DD. Se omitida, utiliza a data de hoje.
   */
  initialDate?: string;
}

/**
 * Retorna a data atual do dispositivo no formato ISO 'YYYY-MM-DD'.
 */
function getTodayIsoString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adiciona ou subtrai dias de uma string no formato 'YYYY-MM-DD'.
 */
function shiftDate(isoDate: string, daysDelta: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + daysDelta);

  const resYear = d.getFullYear();
  const resMonth = String(d.getMonth() + 1).padStart(2, '0');
  const resDay = String(d.getDate()).padStart(2, '0');
  return `${resYear}-${resMonth}-${resDay}`;
}

/**
 * Dispara um feedback tátil suave no dispositivo móvel de forma segura.
 */
async function triggerHapticFeedback(): Promise<void> {
  if (Platform.OS !== 'web') {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignora falhas em emuladores ou dispositivos sem motor háptico
    }
  }
}

/**
 * Hook de apresentação responsável por gerenciar a digitação de hinos,
 * o seletor de data e a sincronização com o repositório local SQLite.
 */
export function useDailyLaunch(options?: UseDailyLaunchOptions) {
  const [selectedDate, setSelectedDate] = useState<string>(
    options?.initialDate || getTodayIsoString()
  );
  const [currentNumber, setCurrentNumber] = useState<string>('');
  const [hymnsToday, setHymnsToday] = useState<HymnOccurrence[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtém a instância ativa do repositório.
   */
  const resolveRepository = useCallback(async (): Promise<IHymnRepository> => {
    if (options?.repository) {
      return options.repository;
    }
    return await getHymnRepository();
  }, [options?.repository]);

  /**
   * Carrega os hinos registrados para a data selecionada.
   */
  const loadHymnsForDate = useCallback(async (dateToLoad: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const repo = await resolveRepository();
      const list = await repo.getByDate(dateToLoad);
      setHymnsToday(list);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar hinos';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [resolveRepository]);

  // Carrega ao montar ou alterar a data
  useEffect(() => {
    loadHymnsForDate(selectedDate);
  }, [selectedDate, loadHymnsForDate]);

  /**
   * Adiciona um dígito numérico ao buffer atual (máximo 4 dígitos).
   */
  const typeDigit = useCallback((digit: string) => {
    if (!/^\d$/.test(digit)) return;

    setCurrentNumber(prev => {
      // Impede 0 como primeiro dígito
      if (prev.length === 0 && digit === '0') return prev;
      // Limite de 4 dígitos (hinos vão até ~480 / 1000)
      if (prev.length >= 4) return prev;
      triggerHapticFeedback();
      return prev + digit;
    });
  }, []);

  /**
   * Apaga o último dígito inserido no buffer.
   */
  const backspace = useCallback(() => {
    setCurrentNumber(prev => {
      if (prev.length === 0) return prev;
      triggerHapticFeedback();
      return prev.slice(0, -1);
    });
  }, []);

  /**
   * Limpa o buffer de digitação.
   */
  const clear = useCallback(() => {
    setCurrentNumber('');
    triggerHapticFeedback();
  }, []);

  /**
   * Salva o hino digitado no banco local e atualiza a listagem.
   */
  const addHymn = useCallback(async () => {
    if (!currentNumber) return;

    const num = parseInt(currentNumber, 10);
    if (isNaN(num) || num <= 0) return;

    setIsLoading(true);
    try {
      const repo = await resolveRepository();
      await repo.addOccurrence({
        hymnNumber: num,
        date: selectedDate,
      });

      setCurrentNumber('');
      triggerHapticFeedback();
      await loadHymnsForDate(selectedDate);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar hino';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentNumber, selectedDate, resolveRepository, loadHymnsForDate]);

  /**
   * Remove um hino registrado pelo ID.
   */
  const removeHymn = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const repo = await resolveRepository();
      await repo.deleteOccurrence(id);
      triggerHapticFeedback();
      await loadHymnsForDate(selectedDate);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao remover hino';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, resolveRepository, loadHymnsForDate]);

  /**
   * Retrocede 1 dia no seletor de data.
   */
  const goToPreviousDay = useCallback(async () => {
    const prev = shiftDate(selectedDate, -1);
    setSelectedDate(prev);
    triggerHapticFeedback();
  }, [selectedDate]);

  /**
   * Avança 1 dia no seletor de data.
   */
  const goToNextDay = useCallback(async () => {
    const next = shiftDate(selectedDate, 1);
    setSelectedDate(next);
    triggerHapticFeedback();
  }, [selectedDate]);

  return {
    selectedDate,
    setSelectedDate,
    currentNumber,
    hymnsToday,
    isLoading,
    error,
    typeDigit,
    backspace,
    clear,
    addHymn,
    removeHymn,
    goToPreviousDay,
    goToNextDay,
    refresh: () => loadHymnsForDate(selectedDate),
  };
}
