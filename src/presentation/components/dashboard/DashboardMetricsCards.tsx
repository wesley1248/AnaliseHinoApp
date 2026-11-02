import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardMetrics } from '@/presentation/hooks/useDashboard';
import { MetricHelpModal, MetricHelpContent } from '../common/MetricHelpModal';

interface DashboardMetricsCardsProps {
  /** Métricas consolidadas calculadas pelo hook */
  metrics: DashboardMetrics;
}

/**
 * Textos explicativos didáticos para cada métrica do Dashboard.
 */
const HELP_TEXTS: Record<string, MetricHelpContent> = {
  repetidos: {
    title: 'Hinos Repetidos (2+ Cultos)',
    meaning:
      'Indica quantos hinos foram cantados em 2 ou mais cultos distintos no período selecionado.',
    calculation:
      'Conta apenas os hinos que possuem pelo menos 2 presenças em datas diferentes. Hinos cantados apenas 1 vez não são considerados repetidos.',
    importance:
      'É o indicador central para identificar hinos reincidentes e auxiliar o ministério a equilibrar o repertório congregacional.',
  },
  repertorio: {
    title: 'Repertório Cantado',
    meaning:
      'Representa a quantidade de hinos diferentes que a congregação cantou no período.',
    calculation:
      'Contagem de hinos distintos já registrados (cada número de hino entra apenas uma vez).',
    importance:
      'Mostra a riqueza e variedade do hinário utilizado nos cultos, evitando a concentração em poucos números.',
  },
  maisCantado: {
    title: 'Hino Mais Cantado',
    meaning:
      'Identifica o hino que esteve presente no maior número de cultos no período.',
    calculation:
      'Ordenado pelo número de datas distintas em que o hino foi cantado (com desduplicação diária).',
    importance:
      'Alerta a liderança quando um hino específico está sendo cantado com excessiva frequência.',
  },
  cultos: {
    title: 'Cultos Realizados',
    meaning:
      'Total de dias de culto ou reuniões que possuem lançamentos de hinos no período.',
    calculation:
      'Contagem de datas únicas no calendário. Mesmo com múltiplos cultos no mesmo dia, conta como 1 dia de culto para base proporcional.',
    importance:
      'Serve de denominador base para medir a frequência real e a distribuição das músicas.',
  },
};

/**
 * Grid de cartões informativos com os principais KPIs de repertório de hinos:
 * Hinos Repetidos (destaque central), Repertório Cantado, Mais Cantado e Cultos Realizados.
 * Cada card possui um ícone interativo (?) posicionado de forma simétrica e absoluta no canto superior direito.
 */
export function DashboardMetricsCards({ metrics }: DashboardMetricsCardsProps) {
  const [helpContent, setHelpContent] = useState<MetricHelpContent | null>(null);

  const mostFrequentLabel = metrics.mostFrequentHymn
    ? `Hino ${metrics.mostFrequentHymn.hymnNumber}`
    : '-';

  const mostFrequentDetail = metrics.mostFrequentHymn
    ? `${metrics.mostFrequentHymn.distinctDaysCount} cultos`
    : 'Sem dados';

  const repetitionRateLabel =
    metrics.distinctHymnsCount > 0
      ? `${metrics.repetitionRate.toFixed(1)}% do repertório`
      : 'Sem repetições';

  return (
    <>
      <View style={styles.gridContainer}>
        {/* Linha 1 */}
        <View style={styles.row}>
          {/* Card 1 (Destaque Principal): Hinos Repetidos */}
          <View style={[styles.card, styles.repeatedHighlightCard]}>
            <TouchableOpacity
              onPress={() => setHelpContent(HELP_TEXTS.repetidos)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Ajuda sobre Hinos Repetidos"
              style={styles.helpButton}
            >
              <Ionicons name="help-circle-outline" size={17} color="#F59E0B" />
            </TouchableOpacity>
            <Text style={[styles.cardTitle, styles.repeatedHighlightTitle]} numberOfLines={1}>
              Hinos Repetidos
            </Text>
            <Text style={[styles.cardValue, styles.repeatedHighlightValue]}>
              {metrics.repeatedHymnsCount}
            </Text>
            <Text style={[styles.cardSubtitle, styles.repeatedHighlightSubtitle]}>
              {repetitionRateLabel}
            </Text>
          </View>

          {/* Card 2: Repertório Cantado */}
          <View style={styles.card}>
            <TouchableOpacity
              onPress={() => setHelpContent(HELP_TEXTS.repertorio)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Ajuda sobre Repertório"
              style={styles.helpButton}
            >
              <Ionicons name="help-circle-outline" size={17} color="#94A3B8" />
            </TouchableOpacity>
            <Text style={styles.cardTitle} numberOfLines={1}>
              Repertório
            </Text>
            <Text style={styles.cardValue}>{metrics.distinctHymnsCount}</Text>
            <Text style={styles.cardSubtitle}>Hinos distintos</Text>
          </View>
        </View>

        {/* Linha 2 */}
        <View style={styles.row}>
          {/* Card 3: Mais Cantado */}
          <View style={[styles.card, styles.highlightCard]}>
            <TouchableOpacity
              onPress={() => setHelpContent(HELP_TEXTS.maisCantado)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Ajuda sobre Hino Mais Cantado"
              style={styles.helpButton}
            >
              <Ionicons name="help-circle-outline" size={17} color="#60A5FA" />
            </TouchableOpacity>
            <Text style={styles.cardTitle} numberOfLines={1}>
              Mais Cantado
            </Text>
            <Text style={[styles.cardValue, styles.highlightValue]} numberOfLines={1}>
              {mostFrequentLabel}
            </Text>
            <Text style={styles.cardSubtitle}>{mostFrequentDetail}</Text>
          </View>

          {/* Card 4: Cultos Realizados */}
          <View style={styles.card}>
            <TouchableOpacity
              onPress={() => setHelpContent(HELP_TEXTS.cultos)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Ajuda sobre Cultos Realizados"
              style={styles.helpButton}
            >
              <Ionicons name="help-circle-outline" size={17} color="#94A3B8" />
            </TouchableOpacity>
            <Text style={styles.cardTitle} numberOfLines={1}>
              Cultos / Dias
            </Text>
            <Text style={styles.cardValue}>{metrics.distinctDaysCount}</Text>
            <Text style={styles.cardSubtitle}>Com registros</Text>
          </View>
        </View>
      </View>

      {/* Modal Didático */}
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
    marginHorizontal: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#334155', // Slate 700
  },
  repeatedHighlightCard: {
    borderColor: '#D97706', // Amber 600
    backgroundColor: '#271B08', // Amber Dark Tone
  },
  highlightCard: {
    borderColor: '#2563EB', // Blue 600
    backgroundColor: '#172554', // Blue 950 / Slate Dark
  },
  helpButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 3,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    paddingRight: 24, // Espaço reservado para o botão de ajuda sem colisão
    marginBottom: 4,
  },
  repeatedHighlightTitle: {
    color: '#FBBF24', // Amber 400
    fontWeight: '800',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  repeatedHighlightValue: {
    color: '#F59E0B', // Amber 500
  },
  highlightValue: {
    color: '#60A5FA', // Blue 400
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  repeatedHighlightSubtitle: {
    color: '#FCD34D', // Amber 300
    fontWeight: '600',
  },
});
