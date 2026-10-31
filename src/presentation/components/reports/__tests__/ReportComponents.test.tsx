import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ReportFilterAndSortBar } from '../ReportFilterAndSortBar';
import { ReportSummaryMetrics } from '../ReportSummaryMetrics';
import { ReportActionButtons } from '../ReportActionButtons';
import { ReportPreviewTable } from '../ReportPreviewTable';

describe('Componentes da Tela de Relatório', () => {
  describe('ReportFilterAndSortBar', () => {
    it('deve chamar onSelectSort quando um botão de ordenação for pressionado', () => {
      const onSelectSort = jest.fn();
      const onSelectFilter = jest.fn();

      const { getByText } = render(
        <ReportFilterAndSortBar
          selectedSort="mais_tocados"
          onSelectSort={onSelectSort}
          selectedFilter="apenas_tocados"
          onSelectFilter={onSelectFilter}
        />
      );

      fireEvent.press(getByText('Menos Tocados'));
      expect(onSelectSort).toHaveBeenCalledWith('menos_tocados');

      fireEvent.press(getByText('Nunca Tocados'));
      expect(onSelectFilter).toHaveBeenCalledWith('nunca_tocados');
    });
  });

  describe('ReportSummaryMetrics', () => {
    it('deve renderizar os 4 cards de métricas', () => {
      const { getByText } = render(
        <ReportSummaryMetrics
          metrics={{
            distinctDaysCount: 12,
            totalExecutions: 36,
            distinctHymnsCount: 25,
            neverPlayedCount: 455,
          }}
        />
      );

      expect(getByText('12')).toBeTruthy();
      expect(getByText('36')).toBeTruthy();
      expect(getByText('25')).toBeTruthy();
      expect(getByText('455')).toBeTruthy();
      expect(getByText('Cultos')).toBeTruthy();
      expect(getByText('Nunca Tocados')).toBeTruthy();
    });
  });

  describe('ReportActionButtons', () => {
    it('deve disparar onExportPdf e onPrint', () => {
      const onExportPdf = jest.fn();
      const onPrint = jest.fn();

      const { getByText } = render(
        <ReportActionButtons
          onExportPdf={onExportPdf}
          onPrint={onPrint}
          isExporting={false}
        />
      );

      fireEvent.press(getByText('Exportar PDF'));
      expect(onExportPdf).toHaveBeenCalled();

      fireEvent.press(getByText('Imprimir'));
      expect(onPrint).toHaveBeenCalled();
    });
  });

  describe('ReportPreviewTable', () => {
    it('deve renderizar linhas da tabela com os hinos', () => {
      const items = [
        { hymnNumber: 43, distinctDaysCount: 5, totalExecutions: 6, percentageOfDays: 41.7 },
        { hymnNumber: 15, distinctDaysCount: 3, totalExecutions: 3, percentageOfDays: 25.0 },
      ];

      const { getByText } = render(
        <ReportPreviewTable items={items} />
      );

      expect(getByText('Hino 43')).toBeTruthy();
      expect(getByText('Hino 15')).toBeTruthy();
      expect(getByText('41.7%')).toBeTruthy();
      expect(getByText('25.0%')).toBeTruthy();
    });
  });
});
