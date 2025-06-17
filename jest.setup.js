// OPTIONAL: silence that “you should be using a development build” warning
const realWarn = console.warn;
console.warn = (msg, ...args) => {
  if (typeof msg === 'string' && (
        msg.includes('development build') || msg.includes('process.env.EXPO_OS is not defined')
    )) {
    return;
  }
  realWarn(msg, ...args);
};

// Mock the dev‑client APIs your app consumes
jest.mock('expo-dev-client', () => ({
  registerRootComponent: (App) => App,
  addMenuItem: jest.fn(),
}));

// If you also use expo-dev-launcher, mock it too
jest.mock('expo-dev-launcher', () => ({
  // e.g. if you call DevLauncherInternal.someFunction(), mock it here
  someFunction: jest.fn(),
}));

// Mock react-native-purchases to prevent Native module errors in tests
jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    setLogLevel: jest.fn(),
    getCustomerInfo: jest.fn(() => Promise.resolve({ entitlements: { active: {} } })),
    addCustomerInfoUpdateListener: jest.fn(),
  },
  LOG_LEVEL: { ERROR: 'ERROR' },
}));

// Mock react-native-purchases-ui as well
jest.mock('react-native-purchases-ui', () => ({
  __esModule: true,
  default: {
    presentPaywallIfNeeded: jest.fn(() => Promise.resolve('NOT_PRESENTED')),
  },
  PAYWALL_RESULT: {
    NOT_PRESENTED: 'NOT_PRESENTED',
    ERROR: 'ERROR',
    CANCELLED: 'CANCELLED',
    PURCHASED: 'PURCHASED',
    RESTORED: 'RESTORED',
  },
}));
// Mock expo-sqlite with custom implementation
jest.mock('expo-sqlite');
