import { useEffect } from 'react';
import { useApi } from './useApi';
import { getAdminDashboardData } from '../api/services/dashboardService';

export type DashboardPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const useDashboard = (period: DashboardPeriod = 'weekly') => {
  const { data, loading, error, execute } = useApi(getAdminDashboardData);
  
  useEffect(() => {
    execute(period);
  }, [execute, period]);
  
  return {
    dashboardData: data?.data,
    isLoading: loading,
    error,
    refetch: () => execute(period)
  };
}; 