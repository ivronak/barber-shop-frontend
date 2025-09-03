import { get } from '../apiClient';

export interface BillingMetricsResponse {
  success: boolean;
  totalInvoicesToday: number;
  revenueToday: number;
  newTransactionsToday: number;
}

export const getBillingMetrics = async (): Promise<BillingMetricsResponse> => {
  return get<BillingMetricsResponse>('/dashboard/billing');
}; 