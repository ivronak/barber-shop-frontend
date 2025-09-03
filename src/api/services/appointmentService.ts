import { get, post, put, del } from '../apiClient';

// Type definitions
export interface AppointmentService {
  service_id: string;
  service_name: string;
  price: number;
  duration: number;
  id?: string;
  appointment_id?: string;
  service?: {
    id: string;
    name: string;
    price: string | number;
    duration: number;
    category?: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  visit_count?: number;
  total_spent?: string | number;
  last_visit?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffMember {
  id: string;
  user_id?: string;
  position?: string;
  bio?: string;
  commission_percentage?: string | number;
  is_available?: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    image: string | null;
  };
}

export interface Appointment {
  id: string;
  customer_id: string;
  staff_id: string;
  date: string;
  time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  total_amount: number;
  notes?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  staff_name: string;
  services?: AppointmentService[];
  appointmentServices?: AppointmentService[];
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  customer?: Customer;
  staff?: StaffMember;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

// Response interfaces
interface AppointmentListResponse {
  success: boolean;
  appointments: Appointment[];
  totalCount: number;
  pages: number;
}

interface AppointmentResponse {
  success: boolean;
  appointment: Appointment;
}

interface AvailableSlotsResponse {
  success: boolean;
  slots: TimeSlot[];
}

// Staff interface
export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  avatar: string | null;
}

// Service interface
export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
}

// Admin dashboard response interface
export interface AdminAppointmentsResponse {
  success: boolean;
  appointments: Appointment[];
  staff: Staff[];
  services: Service[];
  totalCount: number;
  pages: number;
}

// Staff dashboard response interface
export interface StaffAppointmentsResponse {
  success: boolean;
  appointments: Appointment[];
  services: Service[];
  totalCount: number;
  pages: number;
}

/**
 * Get all appointments
 */
export const getAllAppointments = async (
  page = 1,
  limit = 10,
  sort = 'date_desc',
  date?: string,
  staffId?: string,
  customerId?: string,
  status?: string
): Promise<AppointmentListResponse> => {
  let url = `/appointments?page=${page}&limit=${limit}&sort=${sort}`;
  
  if (date) url += `&date=${date}`;
  if (staffId) url += `&staffId=${staffId}`;
  if (customerId) url += `&customerId=${customerId}`;
  if (status) url += `&status=${status}`;
  
  return get<AppointmentListResponse>(url);
};

/**
 * Get all data needed for admin appointments page in a single request
 */
export const getAdminAppointments = async (
  page = 1,
  limit = 100,
  sort = 'date_asc',
  startDate?: string,
  endDate?: string,
  staffId?: string,
  customerId?: string,
  status?: string,
  searchTerm?: string,
  timeOfDay?: string,
  serviceIds?: string[]
): Promise<AdminAppointmentsResponse> => {
  let url = `/appointments/admin-dashboard?page=${page}&limit=${limit}&sort=${sort}`;
  
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;
  if (staffId) url += `&staffId=${staffId}`;
  if (customerId) url += `&customerId=${customerId}`;
  if (status) url += `&status=${status}`;
  if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
  if (timeOfDay) url += `&timeOfDay=${timeOfDay}`;
  if (serviceIds && serviceIds.length > 0) {
    serviceIds.forEach(serviceId => {
      url += `&serviceId=${serviceId}`;
    });
  }
  
  return get<AdminAppointmentsResponse>(url);
};

/**
 * Get all data needed for staff appointments page in a single request
 */
export const getStaffAppointments = async (
  page = 1,
  limit = 100,
  sort = 'date_asc',
  startDate?: string,
  endDate?: string,
  customerId?: string,
  status?: string,
  searchTerm?: string,
  timeOfDay?: string,
  services?: string[]
): Promise<StaffAppointmentsResponse> => {
  let url = `/appointments/staff-dashboard?page=${page}&limit=${limit}&sort=${sort}`;
  
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;
  if (customerId) url += `&customerId=${customerId}`;
  if (status) url += `&status=${status}`;
  if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
  if (timeOfDay) url += `&timeOfDay=${timeOfDay}`;
  if (services && services.length > 0) {
    services.forEach(serviceId => {
      url += `&serviceId=${serviceId}`;
    });
  }
  
  return get<StaffAppointmentsResponse>(url);
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (id: string): Promise<AppointmentResponse> => {
  return get<AppointmentResponse>(`/appointments/${id}`);
};

/**
 * Create new appointment
 */
export const createAppointment = async (appointmentData: Partial<Appointment>): Promise<AppointmentResponse> => {
  return post<AppointmentResponse>('/appointments', appointmentData);
};

/**
 * Update appointment
 */
export const updateAppointment = async (
  id: string,
  appointmentData: Partial<Appointment>
): Promise<AppointmentResponse> => {
  return put<AppointmentResponse>(`/appointments/${id}`, appointmentData);
};

/**
 * Cancel appointment
 */
export const cancelAppointment = async (id: string): Promise<{ success: boolean; message: string }> => {
  return del<{ success: boolean; message: string }>(`/appointments/${id}`);
};

/**
 * Reschedule appointment
 */
export const rescheduleAppointment = async (
  id: string,
  date: string,
  time: string
): Promise<AppointmentResponse> => {
  return post<AppointmentResponse>(`/appointments/${id}/reschedule`, { date, time });
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (
  id: string,
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
): Promise<AppointmentResponse> => {
  return put<AppointmentResponse>(`/appointments/${id}`, { status });
};

/**
 * Update appointment status directly (for optimistic updates)
 * This bypasses the loading state in the useApi hook
 */
export const updateAppointmentStatusDirect = async (
  id: string,
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
): Promise<AppointmentResponse> => {
  return put<AppointmentResponse>(`/appointments/${id}`, { status });
};

/**
 * Get available time slots
 */
export const getAvailableSlots = async (
  date: string,
  staffId: string,
  serviceId: string
): Promise<AvailableSlotsResponse> => {
  return get<AvailableSlotsResponse>(
    `/appointments/available-slots?date=${date}&staffId=${staffId}&serviceId=${serviceId}`
  );
};

/**
 * Get available time slots for public booking
 */
export const getPublicAvailableTimeSlots = async (
  date: string,
  staffId: string,
  serviceId: string
): Promise<{ success: boolean; slots: { time: string; available: boolean }[] }> => {
  try {
    const response = await get<{ success: boolean; slots: { time: string; available: boolean }[] }>(
      `/public/available-slots?date=${date}&staffId=${staffId}&serviceId=${serviceId}`
    );
    return response;
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return { 
      success: false, 
      slots: [] 
    };
  }
};

/**
 * Get calendar appointments with date range
 */
export interface CalendarAppointmentsResponse {
  success: boolean;
  appointments: Appointment[];
  staff: Staff[];
  services: Service[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

/**
 * Get appointments for calendar view with date range support
 */
export const getCalendarAppointments = async (
  startDate: string,
  endDate: string
): Promise<CalendarAppointmentsResponse> => {
  const url = `/appointments/calendar?startDate=${startDate}&endDate=${endDate}`;
  
  return get<CalendarAppointmentsResponse>(url);
}; 