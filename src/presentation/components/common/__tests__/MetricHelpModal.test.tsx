import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MetricHelpModal } from '../MetricHelpModal';

describe('MetricHelpModal Component', () => {
  const sampleContent = {
    title: 'Hinos Repetidos',
    meaning: 'Hinos cantados em 2 ou mais cultos no período.',
    calculation: 'Filtra hinos com distinctDaysCount >= 2.',
    importance: 'Permite equilibrar o repertório congregacional.',
  };

  it('deve renderizar o conteúdo detalhado quando visible for true', () => {
    const mockOnClose = jest.fn();
    const { getByText } = render(
      <MetricHelpModal
        visible={true}
        onClose={mockOnClose}
        content={sampleContent}
      />
    );

    expect(getByText('Hinos Repetidos')).toBeTruthy();
    expect(getByText('Hinos cantados em 2 ou mais cultos no período.')).toBeTruthy();
    expect(getByText('Filtra hinos com distinctDaysCount >= 2.')).toBeTruthy();
    expect(getByText('Permite equilibrar o repertório congregacional.')).toBeTruthy();
    expect(getByText('Entendido')).toBeTruthy();
  });

  it('deve chamar onClose ao tocar no botão Entendido', () => {
    const mockOnClose = jest.fn();
    const { getByText } = render(
      <MetricHelpModal
        visible={true}
        onClose={mockOnClose}
        content={sampleContent}
      />
    );

    fireEvent.press(getByText('Entendido'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('não deve renderizar nada se content for null', () => {
    const { queryByText } = render(
      <MetricHelpModal
        visible={true}
        onClose={jest.fn()}
        content={null}
      />
    );

    expect(queryByText('Entendido')).toBeNull();
  });
});
