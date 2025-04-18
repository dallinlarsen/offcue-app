module.exports = {
    preset: 'jest-expo',
    setupFiles: ['<rootDir>/jest.setup.js'],
    transformIgnorePatterns: [
      'node_modules/(?!(jest-)?expo|@expo|react-native|@react-native|expo-constants|expo-modules-core|expo-dev-client|expo-dev-launcher|expo-image)/'
    ],
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest'
    },
    testEnvironment: 'node',
    moduleFileExtensions: ['ts','tsx','js','jsx','json','node'],
  };