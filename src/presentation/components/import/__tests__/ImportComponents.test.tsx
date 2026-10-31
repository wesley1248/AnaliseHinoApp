import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilePickerDropzone } from '../FilePickerDropzone';
import { ImportSummaryCard } from '../ImportSummaryCard';
import { ImportPreviewList } from '../ImportPreviewList';
import { ImportSuccessBanner } from '../ImportSuccessBanner';

describe('Componentes da Tela de Importação', () => {
  describe('FilePickerDropzone', () => {
    it('deve disparar onPickFile ao pressionar a área de seleção', () => {
      const onPickFile = jest.fn();
      const { getByText } = render(
        <FilePickerDropzone onPickFile={onPickFile} isParsing={false} />
      );

      fireEvent.press(getByText('Selecionar Arquivo'));
      expect(onPickFile).toHaveBeenCalled();
    });
  });

  describe('ImportSummaryCard', () => {
    it('deve renderizar as métricas do arquivo analisado', () => {
      const { getByText } = render(
        <ImportSummaryCard
          fileName="historico_2026.xlsx"
          totalRows={40}
          validRecordsCount={38}
          invalidRecordsCount={2}
          distinctDatesCount={12}
        />
      );

      expect(getByText('historico_2026.xlsx')).toBeTruthy();
      expect(getByText('38')).toBeTruthy();
      expect(getByText('2')).toBeTruthy();
      expect(getByText('12')).toBeTruthy();
    });
  });

  describe('ImportPreviewList', () => {
    it('deve renderizar a amostra dos registros para importação', () => {
      const samples = [
        { hymnNumber: 43, date: '2026-10-01', notes: 'Culto Oficial' },
        { hymnNumber: 100, date: '2026-10-05' },
      ];

      const { getByText } = render(
        <ImportPreviewList samples={samples} />
      );

      expect(getByText('Hino 43')).toBeTruthy();
      expect(getByText('Hino 100')).toBeTruthy();
      expect(getByText('01/10/2026')).toBeTruthy();
      expect(getByText('Culto Oficial')).toBeTruthy();
    });
  });

  describe('ImportSuccessBanner', () => {
    it('deve exibir mensagem de sucesso e botão de nova importação', () => {
      const onReset = jest.fn();
      const { getByText } = render(
        <ImportSuccessBanner count={45} onReset={onReset} />
      );

      expect(getByText(/45 hinos importados/i)).toBeTruthy();
      fireEvent.press(getByText('Importar Outro Arquivo'));
      expect(onReset).toHaveBeenCalled();
    });
  });
});
