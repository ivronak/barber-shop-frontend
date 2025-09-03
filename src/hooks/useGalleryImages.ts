import { useEffect } from 'react';
import { getGalleryImages } from '@/api/services/publicService';
import { useApi } from './useApi';

export const useGalleryImages = () => {
  const { data, loading, error, execute, setData } = useApi(getGalleryImages);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    images: data?.images ?? [],
    loading,
    error,
    refetch: execute,
    setData,
  };
}; 