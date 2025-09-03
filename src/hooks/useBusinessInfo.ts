import { useEffect } from 'react';
import { getBusinessInfo, BusinessInfo } from '@/api/services/publicService';
import { useApi } from './useApi';

/**
 * Hook to retrieve public business information (address, phone, email, hours, etc.)
 * from the backend without requiring authentication.
 */
export const useBusinessInfo = () => {
  const { data, loading, error, execute, setData } = useApi(getBusinessInfo);

  // Fetch data on mount
  useEffect(() => {
    execute();
  }, [execute]);

  return {
    businessInfo: (data?.business ?? null) as BusinessInfo | null,
    loading,
    error,
    refetch: execute,
    setData,
  };
}; 