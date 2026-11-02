import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { TourProvider, useTour } from '../TourContext';

function DummyConsumer() {
  const { openTour } = useTour();
  return (
    <TouchableOpacity onPress={openTour}>
      <Text>Abrir Tour Manualmente</Text>
    </TouchableOpacity>
  );
}

describe('TourContext and TourProvider', () => {
  it('deve prover a função openTour para os componentes filhos', async () => {
    const { getByText } = render(
      <TourProvider>
        <DummyConsumer />
      </TourProvider>
    );

    await waitFor(() => {
      expect(getByText('Abrir Tour Manualmente')).toBeTruthy();
    });

    act(() => {
      fireEvent.press(getByText('Abrir Tour Manualmente'));
    });

    await waitFor(() => {
      expect(getByText('Passo 1 de 4')).toBeTruthy();
    });
  });
});
