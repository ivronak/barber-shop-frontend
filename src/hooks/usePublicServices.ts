import { useEffect } from 'react';
import { getPublicServices } from '@/api/services/publicService';
import { useApi } from './useApi';

/**
 * Hook to retrieve public services grouped by category
 * @param category Optional category filter
 */
export const usePublicServices = (category?: string) => {
  const {
    data,
    loading,
    error,
    execute,
    setData
  } = useApi(getPublicServices);

  // Fetch services on mount / when category changes
  useEffect(() => {
    execute(category);
  }, [execute, category]);

  return {
    groupedServices: data?.services ?? undefined,
    loading,
    error,
    refetch: execute,
    setData,
  };
}; 