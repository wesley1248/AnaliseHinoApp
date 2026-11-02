/**
 * @file useOnboardingTour.ts
 * @description Hook responsável pelo ciclo de vida do Tour Guiado Interativo.
 * Detecta se é a primeira instalação do app ou se uma nova versão foi instalada,
 * exibindo o convite para o tour e permitindo revisita a qualquer momento.
 */

import { useState, useEffect, useCallback } from 'react';
import Constants from 'expo-constants';
import { IOnboardingStorage, defaultOnboardingStorage } from '@/data/preferences/onboardingStorage';

export const APP_CURRENT_VERSION =
  Constants.expoConfig?.version || '1.0.5';

export interface UseOnboardingTourOptions {
  storage?: IOnboardingStorage;
  currentVersion?: string;
  autoCheck?: boolean;
}

export function useOnboardingTour(options?: UseOnboardingTourOptions) {
  const storage = options?.storage ?? defaultOnboardingStorage;
  const currentVersion = options?.currentVersion ?? APP_CURRENT_VERSION;
  const autoCheck = options?.autoCheck ?? true;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);

  /**
   * Verifica se o tour deve ser oferecido ao usuário ao abrir o app.
   */
  const checkTourEligibility = useCallback(async () => {
    setIsLoading(true);
    try {
      const lastSeen = await storage.getLastSeenVersion();

      if (!lastSeen) {
        // Primeira instalação
        setIsUpdate(false);
        setShowPrompt(true);
      } else if (lastSeen !== currentVersion) {
        // Atualização de versão
        setIsUpdate(true);
        setShowPrompt(true);
      } else {
        // Já viu esta versão
        setShowPrompt(false);
      }
    } catch {
      setShowPrompt(false);
    } finally {
      setIsLoading(false);
    }
  }, [storage, currentVersion]);

  useEffect(() => {
    if (autoCheck) {
      checkTourEligibility();
    }
  }, [autoCheck, checkTourEligibility]);

  /**
   * Usuário aceita fazer o tour: abre o passo a passo guiado.
   */
  const startTour = useCallback(() => {
    setShowPrompt(false);
    setCurrentStep(0);
    setIsTourActive(true);
  }, []);

  /**
   * Usuário recusa o tour ("Agora não"): marca como visto e fecha.
   */
  const dismissPrompt = useCallback(async () => {
    setShowPrompt(false);
    await storage.saveLastSeenVersion(currentVersion);
  }, [storage, currentVersion]);

  /**
   * Avança para o próximo slide do tour.
   */
  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  }, []);

  /**
   * Volta para o slide anterior do tour.
   */
  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  /**
   * Finaliza o tour com sucesso e persiste a versão.
   */
  const finishTour = useCallback(async () => {
    setIsTourActive(false);
    await storage.saveLastSeenVersion(currentVersion);
  }, [storage, currentVersion]);

  /**
   * Permite reabrir o tour manualmente a qualquer momento via atalho/botão.
   */
  const reopenTour = useCallback(() => {
    setShowPrompt(false);
    setCurrentStep(0);
    setIsTourActive(true);
  }, []);

  return {
    isLoading,
    showPrompt,
    isTourActive,
    currentStep,
    isUpdate,
    currentVersion,
    startTour,
    dismissPrompt,
    nextStep,
    prevStep,
    finishTour,
    reopenTour,
  };
}
