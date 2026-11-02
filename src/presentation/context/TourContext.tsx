/**
 * @file TourContext.tsx
 * @description Contexto global para orquestração do Tour Guiado e Boas-Vindas.
 * Permite que qualquer tela reabra o tour interativo a qualquer momento através de atalhos.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useOnboardingTour } from '../hooks/useOnboardingTour';
import { OnboardingTourModal } from '../components/onboarding/OnboardingTourModal';

interface TourContextValue {
  openTour: () => void;
}

const TourContext = createContext<TourContextValue>({
  openTour: () => {},
});

export interface TourProviderProps {
  children: ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const {
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
  } = useOnboardingTour();

  return (
    <TourContext.Provider value={{ openTour: reopenTour }}>
      {children}
      <OnboardingTourModal
        showPrompt={showPrompt}
        isTourActive={isTourActive}
        currentStep={currentStep}
        isUpdate={isUpdate}
        currentVersion={currentVersion}
        onStartTour={startTour}
        onDismissPrompt={dismissPrompt}
        onNextStep={nextStep}
        onPrevStep={prevStep}
        onFinishTour={finishTour}
      />
    </TourContext.Provider>
  );
}

export function useTour(): TourContextValue {
  return useContext(TourContext);
}
