import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDailyLaunch } from '@/presentation/hooks/useDailyLaunch';
import {
  HeaderDateSelector,
  HymnInputDisplay,
  NumericKeypad,
  DailyHymnList,
  DatePickerModal,
  DeleteRangeModal,
} from '@/presentation/components/launch';

export default function LancamentoScreen() {
  const {
    selectedDate,
    setSelectedDate,
    currentNumber,
    hymnsToday,
    isLoading,
    error,
    typeDigit,
    backspace,
    clear,
    addHymn,
    removeHymn,
    deleteHymnsByRange,
    goToPreviousDay,
    goToNextDay,
  } = useDailyLaunch();

  const [isCalendarVisible, setIsCalendarVisible] = useState<boolean>(false);
  const [isDeleteRangeVisible, setIsDeleteRangeVisible] = useState<boolean>(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <HeaderDateSelector
          selectedDate={selectedDate}
          onPrevious={goToPreviousDay}
          onNext={goToNextDay}
          onOpenCalendar={() => setIsCalendarVisible(true)}
          onOpenDeleteRange={() => setIsDeleteRangeVisible(true)}
        />

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <HymnInputDisplay
          value={currentNumber}
          onBackspace={backspace}
        />

        <NumericKeypad
          onDigitPress={typeDigit}
          onClear={clear}
          onAddPress={addHymn}
          canAdd={currentNumber.length > 0 && !isLoading}
        />

        <DailyHymnList
          hymns={hymnsToday}
          onRemove={removeHymn}
          isLoading={isLoading}
        />
      </ScrollView>

      {/* Modal de Calendário Interativo */}
      <DatePickerModal
        visible={isCalendarVisible}
        currentDate={selectedDate}
        onSelectDate={(newDate) => {
          setSelectedDate(newDate);
          setIsCalendarVisible(false);
        }}
        onClose={() => setIsCalendarVisible(false)}
      />

      {/* Modal de Exclusão por Intervalo */}
      <DeleteRangeModal
        visible={isDeleteRangeVisible}
        onClose={() => setIsDeleteRangeVisible(false)}
        onConfirmDelete={deleteHymnsByRange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate-900 Dark Modern
  },
  scrollContent: {
    paddingBottom: 40,
  },
  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
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
});
