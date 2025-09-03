import { get } from '../apiClient';
import { Appointment } from './appointmentService';
import { Customer as CustomerModel } from './customerService';
import { Review } from './reviewService';

// Type definitions for dashboard data
export interface DashboardSummary {
  customerCount: number;
  appointmentCount: number;
  staffCount: number;
  serviceCount: number;
  totalRevenue: string;
  totalTips: string;
  totalDiscounts: string;
  avgTipPercentage: number;
  paidInvoices: number;
  pendingInvoices: number;
}

export interface AdminAppointmentStat {
  date: string;
  count: number;
}

export interface AdminRevenueStat {
  date: string;
  revenue: string;
  tips: string;
  discounts: string;
}

export interface TopService {
  service_id: string;
  service_name: string;
  bookings: number;
  revenue: string;
}

export interface TopStaff {
  staff_id: string;
  staff_name: string;
  appointments: number;
  revenue: string;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export interface AdminDashboardResponse {
  success: boolean;
  data: {
    appointmentStats: AdminAppointmentStat[];
    revenueStats: AdminRevenueStat[];
    summary: DashboardSummary;
    topServices: TopService[];
    topStaff: TopStaff[];
    upcomingAppointments: Appointment[];
    recentCustomers: CustomerModel[];
    latestReviews: Review[];
    appointmentStatusDistribution: StatusDistribution[];
    recentActivity: ActivityLog[];
  };
  message?: string;
}

// API function
export const getAdminDashboardData = async (
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'weekly'
): Promise<AdminDashboardResponse> => {
  return get<AdminDashboardResponse>(`/dashboard/admin?period=${period}`);
};

// Types for staff dashboard data
export interface StaffInfo {
  id: string;
  name: string;
  position: string;
  commissionPercentage: number;
  isAvailable: boolean;
}

export interface StaffAppointmentStat {
  date: string;
  count: number;
}

export interface StaffRevenueStat {
  date: string;
  revenue: number;
  tips: number;
}

export interface PerformanceSummary {
  totalRevenue: number;
  totalTips: number;
  totalAppointments: number;
  avgTipPercentage: number;
  commissionPercentage: number;
  totalCommission: number;
}

export interface ServiceBreakdown {
  service_id: string;
  service_name: string;
  bookings: number;
  revenue: number;
}

export interface AppointmentService {
  service_id: string;
  service_name: string;
  price: number;
  duration: number;
}

export interface StaffDashboardCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface UpcomingAppointment {
  id: string;
  date: string;
  time: string;
  status: string;
  customer: StaffDashboardCustomer;
  appointmentServices: AppointmentService[];
}

export interface ReturnCustomer {
  customer_id: string;
  customer_name: string;
  visits: number;
  spent: number;
}

export interface StaffReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
  };
}

export interface CommissionData {
  date: string;
  revenue: number;
  commission: number;
}

export interface AppointmentStatusDistribution {
  status: string;
  count: number;
}

export interface StaffDashboardData {
  staffInfo: StaffInfo;
  appointmentStats: StaffAppointmentStat[];
  revenueStats: StaffRevenueStat[];
  performanceSummary: PerformanceSummary;
  serviceBreakdown: ServiceBreakdown[];
  upcomingAppointments: UpcomingAppointment[];
  todayAppointments: UpcomingAppointment[];
  returnCustomers: ReturnCustomer[];
  staffReviews: StaffReview[];
  commissionData: CommissionData[];
  appointmentStatusDistribution: AppointmentStatusDistribution[];
}

export interface StaffDashboardResponse {
  success: boolean;
  data?: StaffDashboardData;
  message?: string;
}

/**
 * Get staff dashboard data
 * @param period - Time period for data aggregation: 'weekly', 'monthly', 'yearly'
 */
export const getStaffDashboardData = async (period: 'weekly' | 'monthly' | 'yearly' = 'weekly'): Promise<StaffDashboardResponse> => {
  return get<StaffDashboardResponse>(`/dashboard/staff?period=${period}`);
}; 