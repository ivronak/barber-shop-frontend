import { useEffect } from 'react';
import { getPublicBarbers } from '@/api/services/publicService';
import { useApi } from './useApi';

export const usePublicStaff = () => {
  const { data, loading, error, execute, setData } = useApi(getPublicBarbers);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    staff: data?.staff ?? [],
    loading,
    error,
    refetch: execute,
    setData,
  };
}; 