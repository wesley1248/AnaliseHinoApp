import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface DeleteRangeModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmDelete: (startDate: string, endDate: string) => Promise<number>;
}

/**
 * Retorna a data no formato ISO YYYY-MM-DD.
 */
function toIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Desloca uma string ISO por delta dias.
 */
function shiftIso(iso: string, deltaDays: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + deltaDays);
  return toIsoDate(date);
}

/**
 * Converte data ISO YYYY-MM-DD para formato brasileiro DD/MM/YYYY.
 */
function formatPtBr(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Modal de Exclusão de Hinos por Intervalo de Datas.
 * 
 * Implementa trava de segurança em duas etapas para impedir exclusões acidentais,
 * permitindo ao usuário expurgar dados em lote com confirmação explícita.
 */
export function DeleteRangeModal({
  visible,
  onClose,
  onConfirmDelete,
}: DeleteRangeModalProps) {
  const todayIso = toIsoDate(new Date());

  const [startDate, setStartDate] = useState<string>(todayIso);
  const [endDate, setEndDate] = useState<string>(todayIso);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetModalState = () => {
    setIsConfirming(false);
    setIsLoading(false);
    setFeedbackMessage(null);
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  // Atalhos rápidos
  const handleShortcutToday = () => {
    setStartDate(todayIso);
    setEndDate(todayIso);
    setErrorMessage(null);
  };

  const handleShortcutLast7Days = () => {
    setStartDate(shiftIso(todayIso, -6));
    setEndDate(todayIso);
    setErrorMessage(null);
  };

  const handleShortcutCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(toIsoDate(firstDay));
    setEndDate(toIsoDate(lastDay));
    setErrorMessage(null);
  };

  const handleAdvanceToConfirm = () => {
    if (startDate > endDate) {
      setErrorMessage('A data inicial não pode ser maior que a data final.');
      return;
    }
    setErrorMessage(null);
    setIsConfirming(true);
  };

  const handleExecuteDelete = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const deletedCount = await onConfirmDelete(startDate, endDate);
      setIsConfirming(false);
      setFeedbackMessage(
        deletedCount === 1
          ? '1 hino foi excluído com sucesso!'
          : `${deletedCount} hinos foram excluídos com sucesso!`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar exclusão';
      setErrorMessage(msg);
      setIsConfirming(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      testID="delete-range-modal"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.dangerIconBadge}>
                <Ionicons name="trash" size={20} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.title}>Exclusão por Intervalo</Text>
                <Text style={styles.subtitle}>Remoção em lote de hinos</Text>
              </View>
            </View>

            <TouchableOpacity
              testID="btn-close-delete-modal"
              onPress={handleClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Mensagem de Feedback de Sucesso */}
          {feedbackMessage ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={36} color="#10B981" />
              <Text style={styles.successTitle}>Exclusão Concluída</Text>
              <Text style={styles.successText}>{feedbackMessage}</Text>
              <TouchableOpacity
                testID="btn-feedback-ok"
                onPress={handleClose}
                style={styles.okButton}
              >
                <Text style={styles.okButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          ) : isConfirming ? (
            /* ETAPA 2: Confirmação de Segurança */
            <View style={styles.confirmBox}>
              <View style={styles.warningAlert}>
                <Ionicons name="warning" size={28} color="#F59E0B" style={{ marginBottom: 8 }} />
                <Text style={styles.warningTitle}>Atenção: Ação Irreversível</Text>
                <Text style={styles.warningMessage}>
                  Esta ação excluirá permanentemente todos os hinos cadastrados entre{' '}
                  <Text style={styles.boldWhite}>{formatPtBr(startDate)}</Text> e{' '}
                  <Text style={styles.boldWhite}>{formatPtBr(endDate)}</Text>.
                </Text>
                <Text style={styles.warningSubMessage}>
                  Deseja realmente continuar?
                </Text>
              </View>

              {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}

              <View style={styles.confirmActionsRow}>
                <TouchableOpacity
                  testID="btn-cancel-confirmation"
                  onPress={() => setIsConfirming(false)}
                  style={styles.backButton}
                  disabled={isLoading}
                >
                  <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID="btn-execute-delete"
                  onPress={handleExecuteDelete}
                  style={styles.dangerDeleteButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="trash" size={16} color="#FFFFFF" />
                      <Text style={styles.dangerDeleteButtonText}>Confirmar Exclusão</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* ETAPA 1: Seleção de Período */
            <View>
              {errorMessage && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Atalhos Rápidos */}
              <Text style={styles.sectionLabel}>Atalhos Rápidos</Text>
              <View style={styles.shortcutsRow}>
                <TouchableOpacity
                  testID="btn-shortcut-today"
                  onPress={handleShortcutToday}
                  style={styles.shortcutChip}
                >
                  <Text style={styles.shortcutChipText}>Hoje</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID="btn-shortcut-last-7"
                  onPress={handleShortcutLast7Days}
                  style={styles.shortcutChip}
                >
                  <Text style={styles.shortcutChipText}>Últimos 7 dias</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID="btn-shortcut-month"
                  onPress={handleShortcutCurrentMonth}
                  style={styles.shortcutChip}
                >
                  <Text style={styles.shortcutChipText}>Mês Atual</Text>
                </TouchableOpacity>
              </View>

              {/* Seletor Data Inicial */}
              <View style={styles.dateSelectorField}>
                <Text style={styles.fieldLabel}>Data Inicial (De):</Text>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    testID="btn-start-prev-day"
                    onPress={() => setStartDate(prev => shiftIso(prev, -1))}
                    style={styles.stepperBtn}
                  >
                    <Ionicons name="chevron-back" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                  <Text style={styles.stepperDateText}>{formatPtBr(startDate)}</Text>
                  <TouchableOpacity
                    testID="btn-start-next-day"
                    onPress={() => setStartDate(prev => shiftIso(prev, 1))}
                    style={styles.stepperBtn}
                  >
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Seletor Data Final */}
              <View style={styles.dateSelectorField}>
                <Text style={styles.fieldLabel}>Data Final (Até):</Text>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    testID="btn-end-prev-day"
                    onPress={() => setEndDate(prev => shiftIso(prev, -1))}
                    style={styles.stepperBtn}
                  >
                    <Ionicons name="chevron-back" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                  <Text style={styles.stepperDateText}>{formatPtBr(endDate)}</Text>
                  <TouchableOpacity
                    testID="btn-end-next-day"
                    onPress={() => setEndDate(prev => shiftIso(prev, 1))}
                    style={styles.stepperBtn}
                  >
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Rodapé com botão de avançar */}
              <View style={styles.actionsFooter}>
                <TouchableOpacity
                  testID="btn-cancel-delete-modal"
                  onPress={handleClose}
                  style={styles.cancelLink}
                >
                  <Text style={styles.cancelLinkText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID="btn-advance-delete"
                  onPress={handleAdvanceToConfirm}
                  style={styles.advanceButton}
                >
                  <Text style={styles.advanceButtonText}>Avançar para Exclusão</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dangerIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  closeButton: {
    padding: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  shortcutChip: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  shortcutChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#60A5FA',
  },
  dateSelectorField: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepperBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  stepperDateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  actionsFooter: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  cancelLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelLinkText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  advanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  advanceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmBox: {
    paddingVertical: 8,
  },
  warningAlert: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  warningTitle: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  warningMessage: {
    color: '#E2E8F0',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  warningSubMessage: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  boldWhite: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  confirmActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  backButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  dangerDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  dangerDeleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 12,
    marginBottom: 4,
  },
  successText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
  },
  okButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  okButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#7F1D1D',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#FEE2E2',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
});
