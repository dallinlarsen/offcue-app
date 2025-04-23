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