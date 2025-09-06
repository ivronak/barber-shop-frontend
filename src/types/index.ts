// Type definitions for the Barber Shop Management System

export type UserRole = 'admin' | 'staff' | 'billing';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  image?: string;
  password?: string;
}

export interface Staff extends User {
  /**
   * Job title or designation of the staff member (e.g., Senior Barber)
   */
  position?: string;
  bio?: string;
  services: string[];
  workingHours: WorkingHours;
  breaks: Break[];
  commissionPercentage: number;
  totalEarnings: number;
  totalAppointments: number;
  isAvailable: boolean;
  password?: string;
}

export interface WorkingHours {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // format: "HH:MM"
  end: string; // format: "HH:MM"
  isBreak?: boolean;
}

export interface Break {
  id?: number;
  name: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string; // format: "HH:MM:SS"
  end_time: string; // format: "HH:MM:SS"
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  staffId: string;
  staffName: string;
  date: string; // ISO date string
  time: string; // format: "HH:MM"
  endTime: string; // format: "HH:MM"
  services: AppointmentService[];
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  totalAmount: number;
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  break: any
}

export interface AppointmentService {
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
}

export interface InvoiceTaxComponent {
  name: string;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  appointmentId?: string;
  customerId: string;
  customerName: string;
  staffId: string;
  staffName: string;
  date: string; // ISO date string
  services: InvoiceService[];
  subtotal: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount: number;
  tipAmount?: number;
  tax: number; // Total tax rate
  taxAmount: number; // Total tax amount
  taxComponents?: InvoiceTaxComponent[]; // Individual tax components
  total: number;
  paymentMethod: string;
  status: 'paid' | 'pending' | 'cancelled';
  notes?: string;
  createdAt: string; // ISO date string
}

export interface InvoiceService {
  serviceId: string;
  serviceName: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  visitCount: number;
  totalSpent: number;
  lastVisit?: string; // ISO date string
  notes?: string;
  createdAt: string; // ISO date string
}

export interface ShopClosure {
  id: string;
  date: string; // ISO date string
  reason: string;
  isFullDay: boolean;
  startTime?: string; // format: "HH:MM", only if isFullDay is false
  endTime?: string; // format: "HH:MM", only if isFullDay is false
}

export interface BusinessHours {
  openingTime: string; // format: "HH:MM"
  closingTime: string; // format: "HH:MM"
  slotDuration: number; // in minutes
  breaks: {
    name: string;
    start: string; // format: "HH:MM"
    end: string; // format: "HH:MM"
  }[];
  daysOff: number[]; // 0 = Sunday, 6 = Saturday
  shopClosures: ShopClosure[]; // Special closure dates
}

export interface Log {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string; // ISO date string
}

export interface DashboardStats {
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  appointmentsToday: number;
  appointmentsWeek: number;
  totalCustomers: number;
  topService: {
    name: string;
    count: number;
  };
  topStaff: {
    name: string;
    appointments: number;
    revenue: number;
  };
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface ServicePerformance {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
}

export interface StaffPerformance {
  id: string;
  name: string;
  appointments: number;
  revenue: number;
  commissionEarned: number;
  /** Optional total tips earned in the selected period */
  tips?: number;
  /** Optional discounts attributed to this staff */
  discounts?: number;
}

export interface GSTComponent {
  id: string;
  name: string;
  rate: number;
}

export interface GSTRate {
  id: string;
  name: string;
  components: GSTComponent[];
  isActive: boolean;
  totalRate?: number; // Calculated total of all components
}