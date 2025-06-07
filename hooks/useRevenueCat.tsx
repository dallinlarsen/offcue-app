import { useEffect } from 'react';
import { presentPaywall, fetchCustomerInfo } from '@/lib/store/revenuecatSlice';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

export function useRevenueCat() {
  const dispatch = useAppDispatch();
  const customerInfo = useAppSelector((s) => s.revenueCat.customerInfo);
  const loading = useAppSelector((s) => s.revenueCat.loading);
  const error = useAppSelector((s) => s.revenueCat.error);
  const hasUnlimited = useAppSelector((s) => s.revenueCat.hasUnlimited);

  useEffect(() => {
    dispatch(fetchCustomerInfo());
  }, [dispatch]);

  return {
    customerInfo,
    hasUnlimited,
    loading,
    error,
    refetch: () => dispatch(fetchCustomerInfo()),
    presentPaywallIfNeeded: (identifier: string, callback = () => {}) =>
      dispatch(presentPaywall({ identifier, callback })),
  };
}
