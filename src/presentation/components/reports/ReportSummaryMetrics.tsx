/**
 * @file ReportSummaryMetrics.tsx
 * @description Cards de resumo com as 4 métricas principais calculadas para o relatório selecionado no Dark Theme.
 * Inclui ícone interativo (?) em cada card para explicação didática da regra e cálculo.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportMetricsData } from '../../../domain/services/reportHtmlGenerator';
import { MetricHelpModal, MetricHelpContent } from '../common/MetricHelpModal';

export interface ReportSummaryMetricsProps {
  metrics: ReportMetricsData;
}

const REPORT_HELP_TEXTS: Record<string, MetricHelpContent> = {
  repetidos: {
    title: 'Hinos Repetidos (2+)',
    meaning: 'Quantidade de hinos que foram cantados em 2 ou mais cultos no período selecionado.',
    calculation: 'Filtra os hinos que possuem pelo menos 2 datas distintas registradas. Hinos cantados 1 única vez não são repetidos.',
    importance: 'Permite à comissão de música e aos regentes verificar se o repertório está equilibrado ou viciado.',
  },
  cantados: {
    title: 'Hinos Cantados',
    meaning: 'Número total de hinos distintos já utilizados pela congregação no período.',
    calculation: 'Contagem de números de hinos únicos entoados.',
    importance: 'Mede a variedade geral do louvor da igreja.',
  },
  cultos: {
    title: 'Cultos / Dias',
    meaning: 'Total de reuniões/cultos que possuem lançamentos de hinos no período.',
    calculation: 'Contagem de datas únicas no calendário.',
    importance: 'Base para calcular as porcentagens de presença de cada hino.',
  },
  nuncaTocados: {
    title: 'Nunca Tocados',
    meaning: 'Quantidade de hinos do hinário oficial (total de 480) que ainda não foram cantados no período.',
    calculation: '480 menos a quantidade de hinos cantados.',
    importance: 'Incentiva a congregação a aprender e resgatar hinos pouco entoados.',
  },
};

export function ReportSummaryMetrics({ metrics }: ReportSummaryMetricsProps) {
  const [helpContent, setHelpContent] = useState<MetricHelpContent | null>(null);
  const repeatedCount = metrics.repeatedHymnsCount ?? 0;

  return (
    <>
      <View style={styles.container}>
        {/* Card 1: Repetidos (Destaque Principal) */}
        <View style={[styles.card, styles.repeatedHighlightCard]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.label, styles.repeatedHighlightLabel]}>Repetidos (2+)</Text>
            <TouchableOpacity
              onPress={() => setHelpContent(REPORT_HELP_TEXTS.repetidos)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityLabel="Ajuda sobre Hinos Repetidos no Relatório"
            >
              <Ionicons name="help-circle-outline" size={14} color="#F59E0B" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.value, styles.repeatedHighlightValue]}>{repeatedCount}</Text>
        </View>

        {/* Card 2: Cantados */}
        <View style={[styles.card, styles.highlightCard]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.label, styles.highlightLabel]}>Cantados</Text>
            <TouchableOpacity
              onPress={() => setHelpContent(REPORT_HELP_TEXTS.cantados)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityLabel="Ajuda sobre Hinos Cantados"
            >
              <Ionicons name="help-circle-outline" size={14} color="#60A5FA" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.value, styles.highlightValue]}>{metrics.distinctHymnsCount}</Text>
        </View>

        {/* Card 3: Cultos */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.label}>Cultos</Text>
            <TouchableOpacity
              onPress={() => setHelpContent(REPORT_HELP_TEXTS.cultos)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityLabel="Ajuda sobre Cultos"
            >
              <Ionicons name="help-circle-outline" size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <Text style={styles.value}>{metrics.distinctDaysCount}</Text>
        </View>

        {/* Card 4: Nunca Tocados */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.label}>Não Tocados</Text>
            <TouchableOpacity
              onPress={() => setHelpContent(REPORT_HELP_TEXTS.nuncaTocados)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityLabel="Ajuda sobre Hinos Não Tocados"
            >
              <Ionicons name="help-circle-outline" size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <Text style={styles.value}>{metrics.neverPlayedCount}</Text>
        </View>
      </View>

      <MetricHelpModal
        visible={helpContent !== null}
        onClose={() => setHelpContent(null)}
        content={helpContent}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155', // Slate 700
  },
  repeatedHighlightCard: {
    backgroundColor: '#271B08', // Amber Dark
    borderColor: '#D97706', // Amber 600
  },
  highlightCard: {
    backgroundColor: '#172554', // Blue 950
    borderColor: '#2563EB', // Blue 600
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8', // Slate 400
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  repeatedHighlightLabel: {
    color: '#FBBF24', // Amber 400
  },
  highlightLabel: {
    color: '#60A5FA', // Blue 400
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC', // Slate 50
  },
  repeatedHighlightValue: {
    color: '#F59E0B', // Amber 500
  },
  highlightValue: {
    color: '#60A5FA', // Blue 400
  },
});
