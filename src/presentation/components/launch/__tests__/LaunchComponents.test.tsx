import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import {
  HeaderDateSelector,
  HymnInputDisplay,
  NumericKeypad,
  DailyHymnList,
} from '../index';
import { HymnOccurrence } from '../../../../domain/entities/HymnOccurrence';

describe('Launch Screen UI Components', () => {
  describe('HeaderDateSelector', () => {
    it('deve renderizar a data formatada e disparar callbacks de navegação', () => {
      const onPrevious = jest.fn();
      const onNext = jest.fn();

      const { getByText, getByTestId } = render(
        <HeaderDateSelector
          selectedDate="2026-10-02"
          onPrevious={onPrevious}
          onNext={onNext}
        />
      );

      expect(getByText('Lançar Hinos')).toBeTruthy();
      expect(getByText(/02 Out 2026/)).toBeTruthy();

      fireEvent.press(getByTestId('btn-previous-date'));
      expect(onPrevious).toHaveBeenCalledTimes(1);

      fireEvent.press(getByTestId('btn-next-date'));
      expect(onNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('HymnInputDisplay', () => {
    it('deve exibir placeholder quando vazio e omitir backspace', () => {
      const onBackspace = jest.fn();
      const { getByText, queryByTestId } = render(
        <HymnInputDisplay value="" onBackspace={onBackspace} />
      );

      expect(getByText('Número do Hino')).toBeTruthy();
      expect(queryByTestId('btn-backspace')).toBeNull();
    });

    it('deve exibir o número digitado e disparar callback ao pressionar backspace', () => {
      const onBackspace = jest.fn();
      const { getByText, getByTestId } = render(
        <HymnInputDisplay value="452" onBackspace={onBackspace} />
      );

      expect(getByText('452')).toBeTruthy();
      fireEvent.press(getByTestId('btn-backspace'));
      expect(onBackspace).toHaveBeenCalledTimes(1);
    });
  });

  describe('NumericKeypad', () => {
    it('deve renderizar teclas e disparar eventos corretos', () => {
      const onDigitPress = jest.fn();
      const onClear = jest.fn();
      const onAddPress = jest.fn();

      const { getByTestId, getByText } = render(
        <NumericKeypad
          onDigitPress={onDigitPress}
          onClear={onClear}
          onAddPress={onAddPress}
          canAdd={true}
        />
      );

      fireEvent.press(getByTestId('btn-digit-4'));
      expect(onDigitPress).toHaveBeenCalledWith('4');

      fireEvent.press(getByTestId('btn-digit-0'));
      expect(onDigitPress).toHaveBeenCalledWith('0');

      fireEvent.press(getByTestId('btn-clear'));
      expect(onClear).toHaveBeenCalledTimes(1);

      fireEvent.press(getByTestId('btn-add-hymn'));
      expect(onAddPress).toHaveBeenCalledTimes(1);
    });

    it('deve desabilitar o botão adicionar quando canAdd for false', () => {
      const onAddPress = jest.fn();
      const { getByTestId } = render(
        <NumericKeypad
          onDigitPress={jest.fn()}
          onClear={jest.fn()}
          onAddPress={onAddPress}
          canAdd={false}
        />
      );

      fireEvent.press(getByTestId('btn-add-hymn'));
      expect(onAddPress).not.toHaveBeenCalled();
    });
  });

  describe('DailyHymnList', () => {
    it('deve exibir estado vazio quando não houver hinos registrados', () => {
      const { getByTestId } = render(
        <DailyHymnList hymns={[]} onRemove={jest.fn()} />
      );

      expect(getByTestId('empty-hymn-list')).toBeTruthy();
    });

    it('deve exibir lista de hinos e disparar remoção com id correspondente', () => {
      const onRemove = jest.fn();
      const hymns: HymnOccurrence[] = [
        { id: 10, hymnNumber: 15, date: '2026-10-02', createdAt: '2026-10-02T10:00:00Z' },
        { id: 11, hymnNumber: 232, date: '2026-10-02', createdAt: '2026-10-02T10:05:00Z' },
      ];

      const { getByText, getByTestId } = render(
        <DailyHymnList hymns={hymns} onRemove={onRemove} />
      );

      expect(getByText('Hinos Tocados (2)')).toBeTruthy();
      expect(getByText('Hino 15')).toBeTruthy();
      expect(getByText('Hino 232')).toBeTruthy();

      fireEvent.press(getByTestId('btn-remove-10'));
      expect(onRemove).toHaveBeenCalledWith(10);
    });
  });
});
