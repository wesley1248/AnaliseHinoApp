/**
 * @file ReportSummaryMetrics.tsx
 * @description Cards de resumo com as 4 métricas principais calculadas para o relatório selecionado no Dark Theme.
 * Organizado em grid 2x2 espaçoso com botões (?) fixos em posição absoluta simétrica.
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
      <View style={styles.gridContainer}>
        {/* Linha 1 */}
        <View style={styles.row}>
          {/* Card 1: Repetidos (Destaque Principal Âmbar) */}
          <View style={[styles.card, styles.repeatedHighlightCard]}>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => setHelpContent(REPORT_HELP_TEXTS.repetidos)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Ajuda sobre Hinos Repetidos no Relatório"
            >
              <Ionicons name="help-circle-outline" size={16} color="#F59E0B" />
            </TouchableOpacity>
            <Text style={[styles.cardTitle, styles.repeatedHighlightTitle]} numberOfLines={1}>
              Repetidos (2+)
            </Text>
            <Text style={[styles.cardValue, styles.repeatedHighlightValue]}>{repeatedCount}</Text>
            <Text style={[styles.cardSubtitle, styles.repeatedHighlightSubtitle]}>
              Cantados ≥ 2 cultos
            </Text>
          </View>

          {/* Card 2: Cantados (Destaque Azul) */}
          <View style={[styles.card, styles.highlightCard]}>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => setHelpContent(REPORT_HELP_TEXTS.cantados)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Ajuda sobre Hinos Cantados"
            >
              <Ionicons name="help-circle-outline" size={16} color="#60A5FA" />
            </TouchableOpacity>
            <Text style={[styles.cardTitle, styles.highlightTitle]} numberOfLines={1}>
              Cantados
            </Text>
            <Text style={[styles.cardValue, styles.highlightValue]}>
              {metrics.distinctHymnsCount}
            </Text>
            <Text style={styles.cardSubtitle}>Hinos distintos</Text>
          </View>
        </View>

        {/* Linha 2 */}
        <View style={styles.row}>
          {/* Card 3: Cultos */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => setHelpContent(REPORT_HELP_TEXTS.cultos)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Ajuda sobre Cultos"
            >
              <Ionicons name="help-circle-outline" size={16} color="#94A3B8" />
            </TouchableOpacity>
            <Text style={styles.cardTitle} numberOfLines={1}>
              Cultos
            </Text>
            <Text style={styles.cardValue}>{metrics.distinctDaysCount}</Text>
            <Text style={styles.cardSubtitle}>Dias com louvor</Text>
          </View>

          {/* Card 4: Não Tocados */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => setHelpContent(REPORT_HELP_TEXTS.nuncaTocados)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Ajuda sobre Hinos Não Tocados"
            >
              <Ionicons name="help-circle-outline" size={16} color="#94A3B8" />
            </TouchableOpacity>
            <Text style={styles.cardTitle} numberOfLines={1}>
              Não Tocados
            </Text>
            <Text style={styles.cardValue}>{metrics.neverPlayedCount}</Text>
            <Text style={styles.cardSubtitle}>De 480 do hinário</Text>
          </View>
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
  gridContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  card: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 4,
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
  helpButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 3,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8', // Slate 400
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    paddingRight: 20,
    marginBottom: 3,
  },
  repeatedHighlightTitle: {
    color: '#FBBF24', // Amber 400
  },
  highlightTitle: {
    color: '#60A5FA', // Blue 400
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC', // Slate 50
    marginBottom: 2,
  },
  repeatedHighlightValue: {
    color: '#F59E0B', // Amber 500
  },
  highlightValue: {
    color: '#60A5FA', // Blue 400
  },
  cardSubtitle: {
    fontSize: 10,
    color: '#64748B', // Slate 500
  },
  repeatedHighlightSubtitle: {
    color: '#FCD34D', // Amber 300
    fontWeight: '500',
  },
});
