import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { ThemedText } from '../ThemedText';

describe('ThemedText Component', () => {
  it('renders text content correctly using React Native Testing Library', () => {
    render(<ThemedText>Hino 1 - Cristo Meu Mestre</ThemedText>);

    expect(screen.getByText('Hino 1 - Cristo Meu Mestre')).toBeTruthy();
  });

  it('renders title type correctly', () => {
    render(<ThemedText type="title">Título do Hino</ThemedText>);

    expect(screen.getByText('Título do Hino')).toBeTruthy();
  });
});
