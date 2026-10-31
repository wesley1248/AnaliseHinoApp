import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface DatePickerModalProps {
  visible: boolean;
  currentDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Retorna a data atual no formato YYYY-MM-DD.
 */
function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Modal de Seleção de Data com Calendário Interativo no tema Dark Modern.
 * 
 * Permite navegação livre por meses e anos para seleção precisa de datas retroativas,
 * oferecendo atalho rápido para a data de hoje e confirmação com feedback visual.
 */
export function DatePickerModal({
  visible,
  currentDate,
  onSelectDate,
  onClose,
}: DatePickerModalProps) {
  const [selectedIso, setSelectedIso] = useState<string>(currentDate || getTodayIso());
  const [viewYear, setViewYear] = useState<number>(() => {
    const parts = (currentDate || getTodayIso()).split('-').map(Number);
    return parts[0];
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    const parts = (currentDate || getTodayIso()).split('-').map(Number);
    return parts[1] - 1; // 0-based
  });

  // Sincroniza sempre que o modal for aberto com currentDate
  useEffect(() => {
    if (visible && currentDate) {
      setSelectedIso(currentDate);
      const [y, m] = currentDate.split('-').map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    }
  }, [visible, currentDate]);

  const todayIso = useMemo(() => getTodayIso(), []);

  // Calcula a matriz dos dias do mês corrente exibido
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const days: Array<{ day: number | null; iso: string | null }> = [];

    // Preenchimento vazio antes do 1º dia
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, iso: null });
    }

    // Dias do mês
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(viewMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      days.push({
        day: d,
        iso: `${viewYear}-${mStr}-${dStr}`,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const handlePreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleSelectToday = () => {
    const today = getTodayIso();
    const [y, m] = today.split('-').map(Number);
    setViewYear(y);
    setViewMonth(m - 1);
    setSelectedIso(today);
  };

  const handleConfirm = () => {
    onSelectDate(selectedIso);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID="date-picker-modal"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Cabeçalho do Calendário */}
          <View style={styles.header}>
            <View>
              <Text style={styles.modalTitle}>Selecionar Data</Text>
              <Text style={styles.monthYearText}>
                {MONTH_NAMES[viewMonth]} de {viewYear}
              </Text>
            </View>

            <View style={styles.navButtonsRow}>
              <TouchableOpacity
                testID="btn-cal-prev-month"
                onPress={handlePreviousMonth}
                style={styles.navButton}
                accessibilityLabel="Mês anterior"
              >
                <Ionicons name="chevron-back" size={20} color="#94A3B8" />
              </TouchableOpacity>
              <TouchableOpacity
                testID="btn-cal-next-month"
                onPress={handleNextMonth}
                style={styles.navButton}
                accessibilityLabel="Próximo mês"
              >
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Dias da semana */}
          <View style={styles.weekDaysRow}>
            {WEEK_DAYS.map((dayName, idx) => (
              <Text key={idx} style={styles.weekDayText}>
                {dayName}
              </Text>
            ))}
          </View>

          {/* Grade de dias */}
          <View style={styles.daysGrid}>
            {calendarDays.map((item, index) => {
              if (item.day === null || item.iso === null) {
                return <View key={`empty-${index}`} style={styles.dayCellPlaceholder} />;
              }

              const isSelected = item.iso === selectedIso;
              const isToday = item.iso === todayIso;

              return (
                <TouchableOpacity
                  key={item.iso}
                  testID={`btn-cal-day-${item.iso}`}
                  onPress={() => setSelectedIso(item.iso!)}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && !isSelected && styles.dayCellToday,
                  ]}
                  accessibilityLabel={`Dia ${item.day}`}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                      isToday && !isSelected && styles.dayTextToday,
                    ]}
                  >
                    {item.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Atalho Hoje e Ações */}
          <View style={styles.footer}>
            <TouchableOpacity
              testID="btn-cal-today"
              onPress={handleSelectToday}
              style={styles.todayButton}
            >
              <Ionicons name="today-outline" size={16} color="#60A5FA" />
              <Text style={styles.todayButtonText}>Hoje</Text>
            </TouchableOpacity>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                testID="btn-cal-cancel"
                onPress={onClose}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="btn-cal-confirm"
                onPress={handleConfirm}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#60A5FA',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  navButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  weekDayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellPlaceholder: {
    width: '14.28%',
    height: 40,
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: '#2563EB',
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: '#60A5FA',
  },
  dayText: {
    fontSize: 14,
    color: '#F1F5F9',
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dayTextToday: {
    color: '#60A5FA',
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 14,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  todayButtonText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
