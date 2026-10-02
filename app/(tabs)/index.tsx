import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDailyLaunch } from '@/presentation/hooks/useDailyLaunch';
import {
  HeaderDateSelector,
  HymnInputDisplay,
  NumericKeypad,
  DailyHymnList,
} from '@/presentation/components/launch';

export default function LancamentoScreen() {
  const {
    selectedDate,
    currentNumber,
    hymnsToday,
    isLoading,
    error,
    typeDigit,
    backspace,
    clear,
    addHymn,
    removeHymn,
    goToPreviousDay,
    goToNextDay,
  } = useDailyLaunch();

  return (
    <SafeAreaView style={styles.safeArea}>
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
