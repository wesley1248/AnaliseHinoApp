/**
 * @file MetricHelpModal.tsx
 * @description Modal didático contextual aberto ao tocar no ícone (?) de cada card de métrica.
 * Explica de forma acessível e transparente o significado, a fórmula/cálculo e a utilidade prática
 * da informação estatística para líderes de louvor e regentes.
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

export interface MetricHelpContent {
  title: string;
  meaning: string;
  calculation: string;
  importance: string;
}

export interface MetricHelpModalProps {
  visible: boolean;
  onClose: () => void;
  content: MetricHelpContent | null;
}

export function MetricHelpModal({ visible, onClose, content }: MetricHelpModalProps) {
  if (!content) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Cabeçalho do Modal */}
              <View style={styles.header}>
                <View style={styles.titleContainer}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="help-circle" size={24} color="#60A5FA" />
                  </View>
                  <Text style={styles.title} numberOfLines={2}>
                    {content.title}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessibilityLabel="Fechar ajuda"
                >
                  <Ionicons name="close" size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Seção 1: O que significa */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>💡 O que significa?</Text>
                  <Text style={styles.sectionText}>{content.meaning}</Text>
                </View>

                {/* Seção 2: Como é calculado */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>📐 Como é calculado?</Text>
                  <Text style={styles.sectionText}>{content.calculation}</Text>
                </View>

                {/* Seção 3: Importância prática */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>🎯 Por que é importante?</Text>
                  <Text style={styles.sectionText}>{content.importance}</Text>
                </View>
              </ScrollView>

              {/* Botão de Fechamento */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)', // Slate 900 com transparência
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155', // Slate 700
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#172554', // Blue 950
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingVertical: 4,
    gap: 16,
  },
  section: {
    backgroundColor: '#0F172A', // Slate 900
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#60A5FA', // Blue 400
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    color: '#CBD5E1', // Slate 300
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#2563EB', // Blue 600
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
