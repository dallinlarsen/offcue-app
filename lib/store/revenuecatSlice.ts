import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { presentPaywallIfNeeded } from '@/lib/utils/paywall';
import type { RootState } from './store';

export interface RevenueCatState {
  customerInfo: CustomerInfo | null;
  loading: boolean;
  error: unknown | null;
  /** Whether the Unlimited entitlement is active */
  hasUnlimited: boolean;
}

const initialState: RevenueCatState = {
  customerInfo: null,
  loading: false,
  error: null,
  hasUnlimited: false,
};

export const fetchCustomerInfo = createAsyncThunk<CustomerInfo>(
  'revenueCat/fetchCustomerInfo',
  async () => {
    const info = await Purchases.getCustomerInfo();
    return info;
  }
);

export const presentPaywall = createAsyncThunk<
  CustomerInfo | undefined,
  { identifier: string; callback?: () => void }
>('revenueCat/presentPaywall', async ({ identifier, callback }) => {
  const purchased = await presentPaywallIfNeeded(identifier, callback);
  if (purchased) {
    const info = await Purchases.getCustomerInfo();
    return info;
  }
  return undefined;
});

const revenuecatSlice = createSlice({
  name: 'revenueCat',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.customerInfo = action.payload;
        state.hasUnlimited = !!action.payload.entitlements.active['Unlimited'];
      })
      .addCase(fetchCustomerInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      })
      .addCase(presentPaywall.fulfilled, (state, action) => {
        if (action.payload) {
          state.customerInfo = action.payload;
          state.hasUnlimited = !!action.payload.entitlements.active['Unlimited'];
        }
      });
  },
});

export default revenuecatSlice.reducer;

export const selectHasUnlimited = (state: RootState) =>
  state.revenueCat.hasUnlimited;
