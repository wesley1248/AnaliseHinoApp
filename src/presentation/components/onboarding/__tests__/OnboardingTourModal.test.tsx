import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OnboardingTourModal } from '../OnboardingTourModal';

describe('OnboardingTourModal Component', () => {
  const defaultProps = {
    showPrompt: true,
    isTourActive: false,
    currentStep: 0,
    isUpdate: false,
    currentVersion: '1.0.4',
    onStartTour: jest.fn(),
    onDismissPrompt: jest.fn(),
    onNextStep: jest.fn(),
    onPrevStep: jest.fn(),
    onFinishTour: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o diálogo de boas-vindas na primeira instalação', () => {
    const { getByText } = render(<OnboardingTourModal {...defaultProps} />);

    expect(getByText('Bem-vindo ao Análise de Hinos!')).toBeTruthy();
    expect(
      getByText('Deseja fazer um tour guiado de 1 minuto para conhecer todos os recursos?')
    ).toBeTruthy();
    expect(getByText('Sim, iniciar tour')).toBeTruthy();
    expect(getByText('Agora não / Pular')).toBeTruthy();
  });

  it('deve renderizar o diálogo de atualização quando isUpdate for true', () => {
    const { getByText } = render(
      <OnboardingTourModal {...defaultProps} isUpdate={true} />
    );

    expect(getByText('Nova Versão 1.0.4 Instalada!')).toBeTruthy();
  });

  it('deve chamar onStartTour ao clicar em "Sim, iniciar tour"', () => {
    const { getByText } = render(<OnboardingTourModal {...defaultProps} />);

    fireEvent.press(getByText('Sim, iniciar tour'));
    expect(defaultProps.onStartTour).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onDismissPrompt ao clicar em "Agora não / Pular"', () => {
    const { getByText } = render(<OnboardingTourModal {...defaultProps} />);

    fireEvent.press(getByText('Agora não / Pular'));
    expect(defaultProps.onDismissPrompt).toHaveBeenCalledTimes(1);
  });

  it('deve renderizar o tour guiado quando isTourActive for true', () => {
    const { getByText } = render(
      <OnboardingTourModal
        {...defaultProps}
        showPrompt={false}
        isTourActive={true}
        currentStep={0}
      />
    );

    expect(getByText('Passo 1 de 4')).toBeTruthy();
    expect(getByText('Lançamento Rápido Diário')).toBeTruthy();
    expect(getByText('Próximo')).toBeTruthy();
  });

  it('deve navegar entre os passos e exibir "Concluir Tour" no último passo', () => {
    const { getByText } = render(
      <OnboardingTourModal
        {...defaultProps}
        showPrompt={false}
        isTourActive={true}
        currentStep={3}
      />
    );

    expect(getByText('Passo 4 de 4')).toBeTruthy();
    expect(getByText('Importação de Planilhas')).toBeTruthy();
    expect(getByText('Voltar')).toBeTruthy();
    expect(getByText('Concluir Tour')).toBeTruthy();

    fireEvent.press(getByText('Concluir Tour'));
    expect(defaultProps.onFinishTour).toHaveBeenCalledTimes(1);
  });
});
