import { useEffect, useState } from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";

export function useCustomerInfo() {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const fetchCustomerInfo = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    

    fetchCustomerInfo();
  }, []);

  return { customerInfo, loading, error, refetch: fetchCustomerInfo };
}
