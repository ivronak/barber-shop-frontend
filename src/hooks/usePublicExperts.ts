import { useEffect } from 'react';
import { getPublicExperts } from '@/api/services/expertService';
import { useApi } from './useApi';

export const usePublicExperts = () => {
  const { data, loading, error, execute } = useApi(getPublicExperts);
  useEffect(() => { execute(); }, [execute]);
  return { experts: data?.experts ?? [], loading, error };
}; 