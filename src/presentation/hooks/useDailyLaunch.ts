import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { IHymnRepository } from '../../domain/repositories/IHymnRepository';
import { HymnOccurrence } from '../../domain/entities/HymnOccurrence';
import { getHymnRepository } from '../../data/repositories/getHymnRepository';
import { dataSyncNotifier } from '../../domain/events/dataSyncEvents';

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

  // Sincronização automática entre abas em tempo real
  useEffect(() => {
    const unsubscribe = dataSyncNotifier.subscribe(() => {
      loadHymnsForDate(selectedDate);
    });
    return unsubscribe;
  }, [selectedDate, loadHymnsForDate]);

  /**
   * Adiciona um dígito numérico ao buffer atual respeitando o limite oficial do hinário (1 a 480).
   */
  const typeDigit = useCallback((digit: string) => {
    if (!/^\d$/.test(digit)) return;

    setCurrentNumber(prev => {
      // Impede 0 como primeiro dígito
      if (prev.length === 0 && digit === '0') return prev;

      const nextCandidate = prev + digit;
      const numCandidate = parseInt(nextCandidate, 10);

      // Trava estrita no limite oficial do hinário (1 a 480)
      if (numCandidate > 480) return prev;

      setError(null);
      triggerHapticFeedback();
      return nextCandidate;
    });
  }, []);

  /**
   * Apaga o último dígito inserido no buffer.
   */
  const backspace = useCallback(() => {
    setError(null);
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
    setError(null);
    setCurrentNumber('');
    triggerHapticFeedback();
  }, []);

  /**
   * Salva o hino digitado no banco local e atualiza a listagem.
   */
  const addHymn = useCallback(async () => {
    if (!currentNumber) return;

    const num = parseInt(currentNumber, 10);
    if (isNaN(num) || num < 1 || num > 480) {
      setError('O hinário possui apenas os hinos de 1 a 480.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const repo = await resolveRepository();
      await repo.addOccurrence({
        hymnNumber: num,
        date: selectedDate,
      });

      setCurrentNumber('');
      triggerHapticFeedback();
      await loadHymnsForDate(selectedDate);
      dataSyncNotifier.notify();
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
      dataSyncNotifier.notify();
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

  /**
   * Remove em lote todas as ocorrências de hinos dentro de um intervalo de datas.
   * Recarrega a listagem diária caso a data selecionada esteja dentro do intervalo.
   * 
   * @param startDate Data inicial no formato YYYY-MM-DD
   * @param endDate Data final no formato YYYY-MM-DD
   * @returns Quantidade total de registros excluídos
   */
  const deleteHymnsByRange = useCallback(async (startDate: string, endDate: string): Promise<number> => {
    setIsLoading(true);
    setError(null);
    try {
      const repo = await resolveRepository();
      const count = await repo.deleteOccurrencesByDateRange(startDate, endDate);
      triggerHapticFeedback();
      if (selectedDate >= startDate && selectedDate <= endDate) {
        await loadHymnsForDate(selectedDate);
      }
      dataSyncNotifier.notify();
      return count;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir hinos por intervalo';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, resolveRepository, loadHymnsForDate]);

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
    deleteHymnsByRange,
    goToPreviousDay,
    goToNextDay,
    refresh: useCallback(async () => {
      await loadHymnsForDate(selectedDate);
    }, [loadHymnsForDate, selectedDate]),
  };
}
