/**
 * @file OnboardingTourModal.tsx
 * @description Modal interativo de Onboarding e Tour Guiado do Análise de Hinos.
 * Apresenta diálogo inicial de convite na instalação/atualização e conduz o usuário
 * por um passo a passo visual detalhando os 4 pilares do aplicativo.
 */

import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface TourStep {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  badge: string;
  description: string;
  tip: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    icon: 'keypad-outline',
    badge: 'Passo 1 de 4',
    title: 'Lançamento Rápido Diário',
    description:
      'Lance os hinos entoados no culto usando o teclado virtual com feedback tátil. Acompanhe a lista em tempo real e use o botão "Excluir Período" para correções seguras por intervalo.',
    tip: '💡 Dica: Toque no card de data para navegar rapidamente pelo calendário.',
  },
  {
    icon: 'repeat-outline',
    badge: 'Passo 2 de 4',
    title: 'Detecção de Hinos Repetidos',
    description:
      'O propósito central do app! Um hino é considerado repetido quando cantado em 2 ou mais cultos distintos (≥2). Múltiplos cultos no mesmo dia contam apenas 1 presença diária para análises justas.',
    tip: '💡 Dica: Toque no ícone (?) em qualquer card para ver a explicação e cálculo da métrica.',
  },
  {
    icon: 'document-text-outline',
    badge: 'Passo 3 de 4',
    title: 'Relatórios & Exportação em PDF',
    description:
      'Gere relatórios oficiais filtrados por hinos repetidos, veja as datas de cada culto e analise a cobertura de todo o hinário (480 hinos). Compartilhe no WhatsApp ou imprima.',
    tip: '💡 Dica: Use o filtro "Repetidos (2+)" para foco direto no que precisa ser equilibrado.',
  },
  {
    icon: 'cloud-upload-outline',
    badge: 'Passo 4 de 4',
    title: 'Importação de Planilhas',
    description:
      'Migre histórico antigo do Excel (.xlsx) ou CSV de forma 100% offline. O sistema desduplica as linhas automaticamente e armazena os dados com total privacidade no seu aparelho.',
    tip: '💡 Dica: Seus dados nunca saem do celular. Segurança Local-First garantida.',
  },
];

export interface OnboardingTourModalProps {
  showPrompt: boolean;
  isTourActive: boolean;
  currentStep: number;
  isUpdate: boolean;
  currentVersion: string;
  onStartTour: () => void;
  onDismissPrompt: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onFinishTour: () => void;
}

export function OnboardingTourModal({
  showPrompt,
  isTourActive,
  currentStep,
  isUpdate,
  currentVersion,
  onStartTour,
  onDismissPrompt,
  onNextStep,
  onPrevStep,
  onFinishTour,
}: OnboardingTourModalProps) {
  // Modal 1: Convite Inicial (Instalação ou Atualização)
  if (showPrompt) {
    return (
      <Modal visible transparent animationType="fade" onRequestClose={onDismissPrompt}>
        <TouchableWithoutFeedback onPress={onDismissPrompt}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.promptCard}>
                <View style={styles.promptIconContainer}>
                  <Ionicons name="sparkles" size={32} color="#F59E0B" />
                </View>

                <Text style={styles.promptTitle}>
                  {isUpdate
                    ? `Nova Versão ${currentVersion} Instalada!`
                    : 'Bem-vindo ao Análise de Hinos!'}
                </Text>

                <Text style={styles.promptMessage}>
                  {isUpdate
                    ? 'Atualizamos o aplicativo com novas ferramentas para monitorar repetições de hinos e explicações didáticas.'
                    : 'Auxiliamos líderes e regentes a equilibrarem o repertório congregacional e identificarem repetições de hinos.'}
                </Text>

                <Text style={styles.promptQuestion}>
                  Deseja fazer um tour guiado de 1 minuto para conhecer todos os recursos?
                </Text>

                <View style={styles.promptActions}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={onStartTour}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="compass-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Sim, iniciar tour</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={onDismissPrompt}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.secondaryButtonText}>Agora não / Pular</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  // Modal 2: Tour Guiado Interativo (Passo a Passo)
  if (isTourActive) {
    const step = TOUR_STEPS[currentStep] || TOUR_STEPS[0];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === TOUR_STEPS.length - 1;

    return (
      <Modal visible transparent animationType="fade" onRequestClose={onFinishTour}>
        <View style={styles.overlay}>
          <View style={styles.tourCard}>
            {/* Cabeçalho do Card */}
            <View style={styles.tourHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{step.badge}</Text>
              </View>
              <TouchableOpacity
                onPress={onFinishTour}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Fechar tour"
              >
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Conteúdo do Passo */}
            <ScrollView
              contentContainerStyle={styles.tourScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.tourIconCircle}>
                <Ionicons name={step.icon} size={40} color="#60A5FA" />
              </View>

              <Text style={styles.tourTitle}>{step.title}</Text>
              <Text style={styles.tourDescription}>{step.description}</Text>

              <View style={styles.tipBox}>
                <Text style={styles.tipText}>{step.tip}</Text>
              </View>
            </ScrollView>

            {/* Indicadores de Página (Pontinhos) */}
            <View style={styles.dotsContainer}>
              {TOUR_STEPS.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    idx === currentStep ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>

            {/* Rodapé com Botões de Ação */}
            <View style={styles.tourFooter}>
              {!isFirstStep ? (
                <TouchableOpacity
                  style={styles.navButtonSecondary}
                  onPress={onPrevStep}
                  activeOpacity={0.7}
                >
                  <Text style={styles.navButtonSecondaryText}>Voltar</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flex: 1 }} />
              )}

              <TouchableOpacity
                style={[
                  styles.navButtonPrimary,
                  isLastStep && styles.navButtonFinish,
                ]}
                onPress={isLastStep ? onFinishTour : onNextStep}
                activeOpacity={0.8}
              >
                <Text style={styles.navButtonPrimaryText}>
                  {isLastStep ? 'Concluir Tour' : 'Próximo'}
                </Text>
                <Ionicons
                  name={isLastStep ? 'checkmark' : 'arrow-forward'}
                  size={16}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.88)', // Slate 900 escuro
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  promptCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  promptIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#271B08',
    borderWidth: 1,
    borderColor: '#D97706',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 8,
  },
  promptMessage: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  promptQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 20,
  },
  promptActions: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  tourCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '82%',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
  },
  tourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepBadge: {
    backgroundColor: '#172554',
    borderWidth: 1,
    borderColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stepBadgeText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  tourScrollContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  tourIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tourTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 10,
  },
  tourDescription: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  tipBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
  },
  tipText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginVertical: 16,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#2563EB',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#475569',
  },
  tourFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#334155',
  },
  navButtonSecondaryText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
  },
  navButtonPrimary: {
    flex: 2,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  navButtonFinish: {
    backgroundColor: '#16A34A', // Green 600
  },
  navButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
