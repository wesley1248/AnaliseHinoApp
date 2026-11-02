import React, { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDashboard } from '@/presentation/hooks/useDashboard';
import { useTour } from '@/presentation/context/TourContext';
import {
  PeriodFilterSelector,
  DashboardMetricsCards,
  HymnRankingList,
} from '@/presentation/components/dashboard';

/**
 * Tela de Dashboard: Visão analítica consolidada do repertório de hinos.
 * 
 * Exibe métricas de repetição, contagem de cultos distintos (desduplicação diária),
 * ranking ordenado de frequência e filtros temporais dinâmicos.
 */
export default function DashboardScreen() {
  const {
    period,
    setPeriod,
    rankingFilter,
    setRankingFilter,
    metrics,
    frequencies,
    isLoading,
    error,
    refresh,
  } = useDashboard();

  const { openTour } = useTour();

  // Sincronização automática estritamente ao entrar em foco na aba
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useFocusEffect(
    useCallback(() => {
      refreshRef.current();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor="#60A5FA"
            colors={['#2563EB']}
          />
        }
      >
        {/* Cabeçalho da Tela com Botão de Tour */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.titleColumn}>
              <Text style={styles.title}>Dashboard</Text>
              <Text style={styles.subtitle}>
                Frequência e métricas com foco em repetições
              </Text>
            </View>
            <TouchableOpacity
              style={styles.tourButton}
              onPress={openTour}
              activeOpacity={0.7}
              accessibilityLabel="Rever tour e guia do aplicativo"
            >
              <Ionicons name="compass-outline" size={16} color="#60A5FA" />
              <Text style={styles.tourButtonText}>Tour</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner de Erro caso ocorra falha */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Filtro Dinâmico de Período */}
        <PeriodFilterSelector
          selectedPeriod={period}
          onSelectPeriod={setPeriod}
        />

        {/* Indicador de Carregamento */}
        {isLoading && frequencies.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Calculando métricas do hinário...</Text>
          </View>
        ) : (
          <>
            {/* Cards de Métricas Consolidada */}
            <DashboardMetricsCards metrics={metrics} />

            {/* Listagem de Hinos Mais Tocados com Filtros de Repetição */}
            <HymnRankingList
              frequencies={frequencies}
              rankingFilter={rankingFilter}
              onSelectRankingFilter={setRankingFilter}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleColumn: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  tourButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tourButtonText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '700',
  },
  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#7F1D1D',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#FEE2E2',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
});
