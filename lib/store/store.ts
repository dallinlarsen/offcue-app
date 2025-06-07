import { configureStore } from '@reduxjs/toolkit';
import revenueCatReducer from './revenuecatSlice';

export const store = configureStore({
  reducer: {
    revenueCat: revenueCatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
