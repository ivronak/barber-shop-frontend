import { get, post } from '../apiClient';

// Type definitions
export interface DashboardStats {
  appointmentStats: Array<{
    date: string;
    count: number;
  }>;
  revenueStats: Array<{
    date: string;
    revenue: number;
    tips: number;
    discounts: number;
  }>;
  customerCount: number;
  topServices: Array<{
    service_id: string;
    service_name: string;
    bookings: number;
    revenue: number;
  }>;
  topStaff: Array<{
    staff_id: string;
    staff_name: string;
    appointments: number;
    revenue: number;
  }>;
  upcomingAppointments: Array<Record<string, unknown>>; // Simplified for brevity
  tipsDiscountsSummary: {
    totalTips: number;
    totalDiscounts: number;
    avgTipPercentage: number;
    invoicesWithTip: number;
    invoicesWithDiscount: number;
  };
}

export interface RevenueData {
  revenue: Array<{
    date: string;
    subtotal: string | number;
    discounts: string | number;
    taxes: string | number;
    tips: string | number;
    total: string | number;
  }>;
  paymentMethods: Array<{
    payment_method: string;
    amount: string | number;
    count: string | number;
  }>;
}

export interface ServicePerformance {
  service_id: string;
  service_name: string;
  bookings: string | number;
  revenue: string | number;
  tips?: string | number;
  discounts?: string | number;
  avgPrice?: string | number;
}

export interface StaffPerformance {
  staff_id: string;
  staff_name: string;
  appointments: string | number;
  revenue: string | number;
  tips?: string | number;
  discounts?: string | number;
  commission: string | number;
  commissionPercentage?: string | number;
  commissionEarned?: string | number; // Add support for the advanced metrics field name
}

export interface TipsDiscountsData {
  summary: {
    totalTips: string | number;
    totalDiscounts: string | number;
    totalSubtotal: string | number;
    totalSales: string | number;
    avgTipPercentage: string | number;
    avgDiscountPercentage: string | number;
    totalInvoices: string | number;
    invoicesWithTip: string | number;
    invoicesWithDiscount: string | number;
  };
  timeSeriesData: Array<{
    date: string;
    tips: string | number;
    discounts: string | number;
    totalSales: string | number;
    tipPercentage: string | number;
    discountPercentage: string | number;
    invoiceCount: string | number;
  }>;
  staffBreakdown: Array<{
    staff_id: string;
    staff_name: string;
    totalTips: string | number;
    totalDiscounts: string | number;
    totalSales: string | number;
    tipPercentage: string | number;
    discountPercentage: string | number;
    invoiceCount: string | number;
  }>;
  discountTypeBreakdown: Array<{
    discount_type: string;
    totalDiscount: string | number;
    count: string | number;
    avgDiscountValue: string | number;
  }>;
}

export interface DayOfWeekRevenue {
  day_of_week: string;
  numeric_day_of_week: number;
  day_name: string;
  revenue: string | number;
  transactions: string | number;
  avg_transaction: string | number;
  change_percentage: number;
}

// New interfaces for advanced metrics
export interface AdvancedRevenueMetrics {
  current: {
    monthly: {
      total: number;
      percentChange: number;
      projection: number;
    };
    daily: {
      average: number;
      percentChange: number;
    };
    revenuePerVisit: number;
  };
  previous: {
    monthly: {
      total: number;
    };
    daily: {
      average: number;
    };
  };
}

export interface AdvancedStaffMetrics {
  staff_id: string;
  name: string;
  position: string;
  bio: string;
  image: string | null;
  appointments: number;
  revenue: number;
  commissionPercentage: number;
  commissionEarned: number;
  commissionFromServices: number;
  commissionFromProducts: number;
  utilization: number;
  topServices: Array<{
    service_id: string;
    name: string;
    count: number;
    tip: string | number;
    discounts: string | number;
  }>;
  averageServiceTime: number;
  rebookRate: number;
  busyDays: string[];
}

export interface AdvancedServiceMetrics {
  service_id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  bookings: number;
  revenue: number;
  averageRevenue: number;
  estimatedCost: number;
  profitMargin: number;
  growthRate: string;
  preferredByStaff: string[];
  avgDuration?: number;
  appointmentCompletionRate?: number;
  utilization?: number;
  customerSatisfaction?: string;
  averageServiceTime?: number;
  topServices?: Array<{
    name: string;
    count: number;
  }>;
}

// Define interface for staff performance metrics
export interface StaffPerformanceMetrics {
  appointments: number;
  revenue: number;
  commission: number;
  commissionPercentage: number;
  services: Array<{
    service_id: string;
    service_name: string;
    bookings: number;
    revenue: number;
    tip: string | number;
    serviceCommission: string | number;
  }>;
  dateRange: {
    from: string;
    to: string;
  };
}

// Response interfaces
interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}

interface RevenueResponse {
  success: boolean;
  data: RevenueData;
}

interface ServicesReportResponse {
  success: boolean;
  data: ServicePerformance[];
}

interface StaffReportResponse {
  success: boolean;
  data: StaffPerformance[];
}

interface TipsDiscountsResponse {
  success: boolean;
  data: TipsDiscountsData;
}

interface DayOfWeekRevenueResponse {
  success: boolean;
  data: DayOfWeekRevenue[];
}

// New response interfaces for advanced metrics
interface AdvancedRevenueResponse {
  success: boolean;
  data: AdvancedRevenueMetrics;
}

interface AdvancedStaffResponse {
  success: boolean;
  data: AdvancedStaffMetrics[];
}

interface AdvancedServiceResponse {
  success: boolean;
  data: AdvancedServiceMetrics[];
}

interface StaffPerformanceMetricsResponse {
  success: boolean;
  data: StaffPerformanceMetrics;
}

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (period = 'weekly'): Promise<DashboardResponse> => {
  return get<DashboardResponse>(`/reports/dashboard?period=${period}`);
};

/**
 * Get revenue report
 */
export const getRevenueReport = async (
  dateFrom: string,
  dateTo: string,
  groupBy = 'day'
): Promise<RevenueResponse> => {
  return get<RevenueResponse>(
    `/reports/revenue?dateFrom=${dateFrom}&dateTo=${dateTo}&groupBy=${groupBy}`
  );
};

export interface StaffBreakResponse {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
}

export const useStaffApi = ({
  id = "",
  name = "",
  start_time = "",
  end_time = "",
  day_of_week = 0
}) => {
  return post<StaffBreakResponse>(`/staff/${id}/breaks`, {
    name,
    start_time,
    end_time,
    day_of_week
  });
};

/**
 * Get services performance report
 */
export const getServicesReport = async (
  dateFrom: string,
  dateTo: string,
  sort = 'revenue_desc'
): Promise<ServicesReportResponse> => {
  return get<ServicesReportResponse>(
    `/reports/services?dateFrom=${dateFrom}&dateTo=${dateTo}&sort=${sort}`
  );
};

/**
 * Get staff performance report
 */
export const getStaffReport = async (
  dateFrom: string,
  dateTo: string,
  sort = 'revenue_desc'
): Promise<StaffReportResponse> => {
  return get<StaffReportResponse>(
    `/reports/staff?dateFrom=${dateFrom}&dateTo=${dateTo}&sort=${sort}`
  );
};

/**
 * Get tips and discounts report
 */
export const getTipsDiscountsReport = async (
  dateFrom: string,
  dateTo: string,
  groupBy = 'day',
  staffId?: string
): Promise<TipsDiscountsResponse> => {
  let url = `/reports/tips-discounts?dateFrom=${dateFrom}&dateTo=${dateTo}&groupBy=${groupBy}`;

  if (staffId) {
    url += `&staffId=${staffId}`;
  }

  return get<TipsDiscountsResponse>(url);
};

/**
 * Get revenue breakdown by day of week
 */
export const getRevenueByDayOfWeek = async (
  dateFrom: string,
  dateTo: string
): Promise<DayOfWeekRevenueResponse> => {
  return get<DayOfWeekRevenueResponse>(
    `/reports/revenue-by-day?dateFrom=${dateFrom}&dateTo=${dateTo}`
  );
};

/**
 * Get advanced revenue metrics (total, daily avg, monthly projection, etc)
 */
export const getAdvancedRevenueMetrics = async (
  dateFrom?: string,
  dateTo?: string
): Promise<AdvancedRevenueResponse> => {
  let url = '/reports/advanced-revenue';

  if (dateFrom && dateTo) {
    url += `?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  }

  return get<AdvancedRevenueResponse>(url);
};

/**
 * Get advanced staff metrics (utilization, satisfaction, etc)
 */
export const getAdvancedStaffMetrics = async (
  dateFrom?: string,
  dateTo?: string,
  staffId?: string
): Promise<AdvancedStaffResponse> => {
  let url = '/reports/advanced-staff';

  if (dateFrom && dateTo) {
    url += `?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    if (staffId) {
      url += `&staffId=${staffId}`;
    }
  } else if (staffId) {
    url += `?staffId=${staffId}`;
  }

  return get<AdvancedStaffResponse>(url);
};

/**
 * Get advanced service metrics (detailed analysis, profitability, etc)
 */
export const getAdvancedServiceMetrics = async (
  dateFrom?: string,
  dateTo?: string,
  serviceId?: string
): Promise<AdvancedServiceResponse> => {
  let url = '/reports/advanced-services';

  if (dateFrom && dateTo) {
    url += `?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    if (serviceId) {
      url += `&serviceId=${serviceId}`;
    }
  } else if (serviceId) {
    url += `?serviceId=${serviceId}`;
  }

  return get<AdvancedServiceResponse>(url);
};

/**
 * Get staff performance metrics for the specified staff member
 */
export const getStaffPerformanceMetrics = async (
  dateFrom: string,
  dateTo: string,
  staffId: string
): Promise<StaffPerformanceMetricsResponse> => {
  return get<StaffPerformanceMetricsResponse>(
    `/reports/staff-performance-metrics?dateFrom=${dateFrom}&dateTo=${dateTo}&staffId=${staffId}`
  );
}; 