import { get, post } from '../apiClient';
import { Service } from '@/types';

// Type definitions
export type BookingService = Service;

export interface BookingStaff {
  id: string;
  name: string;
  position: string;
  bio?: string;
  image?: string;
  services: string[];
}

export interface BookingSlot {
  time: string;
  end_time: string;
  available: boolean;
  unavailableReason?: string;
  timezone?: string;
  timezoneOffset?: number;
  displayTime?: string;
  displayEndTime?: string;
}

export interface BookingRequest {
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  service_id: string; // Can be a single ID or comma-separated list of IDs
  staff_id: string;
  date: string;
  time: string;
  notes?: string;
  timezone?: string;
}

// Response interfaces
interface ServicesResponse {
  success: boolean;
  services: Record<string, BookingService[]>;
}

interface StaffResponse {
  success: boolean;
  staff: BookingStaff[];
}

interface StaffDetailsResponse {
  success: boolean;
  staff: BookingStaff;
}

interface SlotsResponse {
  success: boolean;
  slots: BookingSlot[];
  message?: string;
  timezone?: string;
  clientTimezone?: string;
  businessTimezone?: string;
  slotDuration?: number;
  serverTime?: string;
}

export interface BookingResponse {
  success: boolean;
  appointment: {
    id: string;
    date: string;
    time: string;
    display_time?: string;
    displayTime?: string;
    staff_name: string;
    service_name: string;
    timezone?: string;
    client_timezone?: string;
  };
  message?: string;
}

/**
 * Get all services for booking
 */
export const getBookingServices = async (): Promise<ServicesResponse> => {
  return get<ServicesResponse>('/booking/services');
};

/**
 * Get all staff available for booking
 */
export const getBookingStaff = async (serviceId?: string | string[]): Promise<StaffResponse> => {
  let url = '/booking/staff';
  if (serviceId) {
    // Handle both single string and array of service IDs
    const serviceParam = Array.isArray(serviceId) ? serviceId.join(',') : serviceId;
    url += `?serviceId=${serviceParam}`;
  }
  return get<StaffResponse>(url);
};

/**
 * Get details for a specific staff member
 */
export const getStaffDetails = async (staffId: string): Promise<StaffDetailsResponse> => {
  return get<StaffDetailsResponse>(`/booking/staff/${staffId}`);
};

/**
 * Get available time slots for booking
 */
export const getBookingSlots = async (
  date: string,
  staffId: string,
  serviceId: string | string[]
): Promise<SlotsResponse> => {
  // Include client timezone in the request
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Handle multiple service IDs
  const serviceParam = Array.isArray(serviceId) ? serviceId.join(',') : serviceId;

  return get<SlotsResponse>(
    `/booking/slots?date=${date}&staff_id=${staffId}&service_id=${serviceParam}&timezone=${encodeURIComponent(timezone)}`
  );
};

/**
 * Create a new booking
 */
export const createBooking = async (bookingData: BookingRequest): Promise<BookingResponse> => {
  // Include client timezone in the request
  const dataWithTimezone = {
    ...bookingData,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
  return post<BookingResponse>('/booking/create', dataWithTimezone);
};

/**
 * Get services offered by a specific staff member
 */
export const getStaffServices = async (staffId: string): Promise<ServicesResponse> => {
  return get<ServicesResponse>(`/booking/staff/${staffId}/services`);
};

/**
 * Get staff who can perform a specific service
 */
export const getServiceStaff = async (serviceId: string): Promise<StaffResponse> => {
  return get<StaffResponse>(`/booking/service/${serviceId}/staff`);
};

export const getAllStaff = async (): Promise<any> => {
  return get<any>(`/staff`);
}; 