// Jest setup file for AnaliseHinosApp

// Extended matchers for React Native Testing Library
import '@testing-library/react-native/extend-expect';

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
