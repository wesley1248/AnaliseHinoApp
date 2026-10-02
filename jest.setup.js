// Jest setup file for AnaliseHinosApp

// Extended matchers for React Native Testing Library
import '@testing-library/react-native/extend-expect';

// Mock do expo-font e vector icons para evitar loadedNativeFonts.forEach
jest.mock('@expo/vector-icons/Ionicons', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => React.createElement(View, { ...props, testID: props.testID || 'mock-ionicons' });
});

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Ionicons: (props) => React.createElement(View, { ...props, testID: props.testID || 'mock-ionicons' }),
  };
});

// Mock do expo-haptics para testes limpos
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Silence expected warnings in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('useNativeDriver'))
  ) {
    return;
  }
  originalConsoleError(...args);
};
