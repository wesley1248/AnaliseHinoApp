import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import {
  HeaderDateSelector,
  HymnInputDisplay,
  NumericKeypad,
  DailyHymnList,
  DatePickerModal,
  DeleteRangeModal,
  applyDateMask,
  parsePtBrDate,
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

    it('deve disparar callbacks de abrir calendário e excluir período quando fornecidos', () => {
      const onOpenCalendar = jest.fn();
      const onOpenDeleteRange = jest.fn();

      const { getByTestId, getByText } = render(
        <HeaderDateSelector
          selectedDate="2026-10-02"
          onPrevious={jest.fn()}
          onNext={jest.fn()}
          onOpenCalendar={onOpenCalendar}
          onOpenDeleteRange={onOpenDeleteRange}
        />
      );

      expect(getByText('Excluir Período')).toBeTruthy();
      fireEvent.press(getByTestId('btn-open-delete-range'));
      expect(onOpenDeleteRange).toHaveBeenCalledTimes(1);

      fireEvent.press(getByTestId('btn-open-calendar'));
      expect(onOpenCalendar).toHaveBeenCalledTimes(1);
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

      const { getByTestId } = render(
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

  describe('DatePickerModal', () => {
    it('deve renderizar o calendário e permitir selecionar dia e confirmar', () => {
      const onSelectDate = jest.fn();
      const onClose = jest.fn();

      const { getByText, getByTestId } = render(
        <DatePickerModal
          visible={true}
          currentDate="2026-10-15"
          onSelectDate={onSelectDate}
          onClose={onClose}
        />
      );

      expect(getByText('Selecionar Data')).toBeTruthy();
      expect(getByText(/Outubro de 2026/)).toBeTruthy();

      // Clica no dia 20 de outubro
      const day20Btn = getByTestId('btn-cal-day-2026-10-20');
      fireEvent.press(day20Btn);

      // Clica em confirmar
      fireEvent.press(getByTestId('btn-cal-confirm'));
      expect(onSelectDate).toHaveBeenCalledWith('2026-10-20');
      expect(onClose).toHaveBeenCalled();
    });

    it('deve permitir navegar meses para frente e para trás', () => {
      const { getByText, getByTestId } = render(
        <DatePickerModal
          visible={true}
          currentDate="2026-10-15"
          onSelectDate={jest.fn()}
          onClose={jest.fn()}
        />
      );

      expect(getByText(/Outubro de 2026/)).toBeTruthy();

      // Avança para novembro
      fireEvent.press(getByTestId('btn-cal-next-month'));
      expect(getByText(/Novembro de 2026/)).toBeTruthy();

      // Volta para outubro
      fireEvent.press(getByTestId('btn-cal-prev-month'));
      expect(getByText(/Outubro de 2026/)).toBeTruthy();
    });

    it('deve fechar ao pressionar cancelar', () => {
      const onClose = jest.fn();
      const { getByTestId } = render(
        <DatePickerModal
          visible={true}
          currentDate="2026-10-15"
          onSelectDate={jest.fn()}
          onClose={onClose}
        />
      );

      fireEvent.press(getByTestId('btn-cal-cancel'));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Date Helpers', () => {
    it('applyDateMask deve formatar apenas dígitos numéricos com barras automáticas', () => {
      expect(applyDateMask('')).toBe('');
      expect(applyDateMask('abc')).toBe('');
      expect(applyDateMask('01')).toBe('01');
      expect(applyDateMask('010')).toBe('01/0');
      expect(applyDateMask('0101')).toBe('01/01');
      expect(applyDateMask('01012026')).toBe('01/01/2026');
      expect(applyDateMask('01012026999')).toBe('01/01/2026');
      expect(applyDateMask('01/05/2026')).toBe('01/05/2026');
    });

    it('parsePtBrDate deve validar e converter datas corretas para ISO', () => {
      expect(parsePtBrDate('01/01/2026')).toBe('2026-01-01');
      expect(parsePtBrDate('31/12/2026')).toBe('2026-12-31');
      expect(parsePtBrDate('29/02/2024')).toBe('2024-02-29'); // Ano bissexto
    });

    it('parsePtBrDate deve rejeitar datas inexistentes ou incompletas', () => {
      expect(parsePtBrDate('')).toBeNull();
      expect(parsePtBrDate('01/01/20')).toBeNull();
      expect(parsePtBrDate('31/02/2026')).toBeNull(); // Fevereiro não tem 31 dias
      expect(parsePtBrDate('29/02/2026')).toBeNull(); // 2026 não é bissexto
      expect(parsePtBrDate('31/04/2026')).toBeNull(); // Abril tem 30 dias
      expect(parsePtBrDate('00/05/2026')).toBeNull(); // Dia 00 inválido
      expect(parsePtBrDate('15/13/2026')).toBeNull(); // Mês 13 inválido
      expect(parsePtBrDate('15/05/1850')).toBeNull(); // Ano fora do limite
    });
  });

  describe('DeleteRangeModal', () => {
    it('deve permitir selecionar intervalo de datas e executar exclusão na confirmação', async () => {
      const onConfirmDelete = jest.fn().mockResolvedValue(5);
      const onClose = jest.fn();

      const { getByText, getByTestId } = render(
        <DeleteRangeModal
          visible={true}
          onClose={onClose}
          onConfirmDelete={onConfirmDelete}
        />
      );

      expect(getByText('Exclusão por Intervalo')).toBeTruthy();

      // Avança para tela de confirmação
      fireEvent.press(getByTestId('btn-advance-delete'));
      expect(getByText('Atenção: Ação Irreversível')).toBeTruthy();

      // Confirma a exclusão
      await act(async () => {
        fireEvent.press(getByTestId('btn-execute-delete'));
      });

      expect(onConfirmDelete).toHaveBeenCalledTimes(1);
      expect(getByText('5 hinos foram excluídos com sucesso!')).toBeTruthy();

      // Clica em OK
      fireEvent.press(getByTestId('btn-feedback-ok'));
      expect(onClose).toHaveBeenCalled();
    });

    it('deve permitir digitar a data inicial e final diretamente nos campos de texto', async () => {
      const onConfirmDelete = jest.fn().mockResolvedValue(25);
      const onClose = jest.fn();

      const { getByTestId, getByText } = render(
        <DeleteRangeModal
          visible={true}
          onClose={onClose}
          onConfirmDelete={onConfirmDelete}
        />
      );

      const startInput = getByTestId('input-start-date');
      const endInput = getByTestId('input-end-date');

      // Digita data inicial: 01/01/2026
      fireEvent.changeText(startInput, '01012026');
      expect(startInput.props.value).toBe('01/01/2026');

      // Digita data final: 31/12/2026
      fireEvent.changeText(endInput, '31122026');
      expect(endInput.props.value).toBe('31/12/2026');

      // Avança para confirmação
      fireEvent.press(getByTestId('btn-advance-delete'));
      expect(getByText('Atenção: Ação Irreversível')).toBeTruthy();
      expect(getByText(/01\/01\/2026/)).toBeTruthy();
      expect(getByText(/31\/12\/2026/)).toBeTruthy();

      // Executa exclusão
      await act(async () => {
        fireEvent.press(getByTestId('btn-execute-delete'));
      });

      expect(onConfirmDelete).toHaveBeenCalledWith('2026-01-01', '2026-12-31');
      expect(getByText('25 hinos foram excluídos com sucesso!')).toBeTruthy();
    });

    it('deve validar e impedir avanço com datas incompletas', () => {
      const { getByTestId, getByText } = render(
        <DeleteRangeModal
          visible={true}
          onClose={jest.fn()}
          onConfirmDelete={jest.fn()}
        />
      );

      const startInput = getByTestId('input-start-date');
      fireEvent.changeText(startInput, '0105'); // Incompleto

      fireEvent.press(getByTestId('btn-advance-delete'));
      expect(getByText('Informe a data inicial completa no formato DD/MM/AAAA.')).toBeTruthy();
    });

    it('deve validar e impedir avanço com datas inexistentes no calendário', () => {
      const { getByTestId, getByText } = render(
        <DeleteRangeModal
          visible={true}
          onClose={jest.fn()}
          onConfirmDelete={jest.fn()}
        />
      );

      const startInput = getByTestId('input-start-date');
      fireEvent.changeText(startInput, '31022026'); // 31 de fevereiro não existe

      fireEvent.press(getByTestId('btn-advance-delete'));
      expect(getByText('A data inicial é inválida. Verifique o dia, mês e ano.')).toBeTruthy();
    });

    it('deve validar e impedir avanço quando data inicial for maior que a data final', () => {
      const { getByTestId, getByText } = render(
        <DeleteRangeModal
          visible={true}
          onClose={jest.fn()}
          onConfirmDelete={jest.fn()}
        />
      );

      fireEvent.changeText(getByTestId('input-start-date'), '20102026');
      fireEvent.changeText(getByTestId('input-end-date'), '10102026');

      fireEvent.press(getByTestId('btn-advance-delete'));
      expect(getByText('A data inicial não pode ser maior que a data final.')).toBeTruthy();
    });

    it('deve atualizar o input de texto ao navegar pelos botões de incremento/decremento', () => {
      const { getByTestId } = render(
        <DeleteRangeModal
          visible={true}
          onClose={jest.fn()}
          onConfirmDelete={jest.fn()}
        />
      );

      const startInput = getByTestId('input-start-date');
      fireEvent.changeText(startInput, '15052026');
      expect(startInput.props.value).toBe('15/05/2026');

      // Avança um dia
      fireEvent.press(getByTestId('btn-start-next-day'));
      expect(startInput.props.value).toBe('16/05/2026');

      // Retrocede um dia
      fireEvent.press(getByTestId('btn-start-prev-day'));
      expect(startInput.props.value).toBe('15/05/2026');
    });

    it('deve permitir usar atalhos rápidos e fechar', () => {
      const onClose = jest.fn();
      const { getByTestId } = render(
        <DeleteRangeModal
          visible={true}
          onClose={onClose}
          onConfirmDelete={jest.fn()}
        />
      );

      fireEvent.press(getByTestId('btn-shortcut-last-7'));
      fireEvent.press(getByTestId('btn-shortcut-month'));
      fireEvent.press(getByTestId('btn-shortcut-today'));

      fireEvent.press(getByTestId('btn-close-delete-modal'));
      expect(onClose).toHaveBeenCalled();
    });
  });
});
