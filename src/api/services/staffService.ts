import { get, post, put, del } from '../apiClient';
import { Service } from './serviceService';

// Type definitions
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Staff {
  id: string;
  user_id: string;
  bio?: string;
  commission_percentage: number | string;
  is_available: boolean;
  image?: string;
  services?: string[];
  created_at?: string;
  updated_at?: string;
  user?: User;
  workingHours?: WorkingHour[];
  breaks?: Break[];
  totalAppointments?: number;
  totalEarnings?: number;
}

export interface WorkingHour {
  id?: string;
  staff_id?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_break: boolean;
}

export interface Break {
  id?: number;
  staff_id?: string;
  day_of_week: number;
  name: string;
  start_time: string;
  end_time: string;
  business_hour_id?: number | null;
}

// Interface for creating a new staff member (includes password)
export interface CreateStaffRequest extends Omit<Partial<Staff>, 'id' | 'user_id' | 'user'> {
  password: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
}

// Interface for updating staff profile
export interface UpdateProfileRequest {
  email?: string;
  phone?: string;
  bio?: string;
  image?: string;
}

// Response interfaces
interface StaffListResponse {
  success: boolean;
  staff: Staff[];
  totalCount: number;
  pages: number;
  currentPage?: number;
  itemsPerPage?: number;
  services?: Service[];
}

interface StaffResponse {
  success: boolean;
  staff: Staff;
}

interface WorkingHoursResponse {
  success: boolean;
  workingHours: WorkingHour[];
  breaks?: Break[];
}

// New interfaces for breaks
interface BreaksResponse {
  success: boolean;
  breaks: Break[];
}

/**
 * Get all staff members with filtering options
 */
export const getAllStaff = async (
  page = 1,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _limit = 10, // Kept for backward compatibility but not used
  sort = 'name_asc',
  searchQuery?: string,
  availability?: 'all' | 'available' | 'unavailable',
  services?: string[],
  commissionRange?: [number, number],
  searchFields?: string[],
  includeServices = true
): Promise<StaffListResponse> => {
  // Map frontend sort fields to actual database fields
  let sortParam = sort;
  
  // Handle special sort cases that don't exist as direct database columns
  if (sort.startsWith('appointments_') || sort.startsWith('earnings_')) {
    // Default to name sorting for fields that need to be handled in the frontend
    sortParam = sort.includes('_asc') ? 'name_asc' : 'name_desc';
  }
  
  // Always use 10 items per page
  const fixedLimit = 10;
  
  let url = `/staff?page=${page}&limit=${fixedLimit}&sort=${sortParam}`;
  
  // Add search query parameter
  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
    
    // Add specific fields to search in if provided
    if (searchFields && searchFields.length > 0) {
      url += `&searchFields=${searchFields.join(',')}`;
    }
  }
  
  // Add availability filter
  if (availability && availability !== 'all') {
    url += `&isAvailable=${availability === 'available' ? 'true' : 'false'}`;
  }
  
  // Add services filter
  if (services && services.length > 0) {
    url += `&services=${services.join(',')}`;
  }
  
  // Add commission range filter
  if (commissionRange && (commissionRange[0] > 0 || commissionRange[1] < 100)) {
    url += `&minCommission=${commissionRange[0]}&maxCommission=${commissionRange[1]}`;
  }
  
  // Add includeServices parameter to get services data
  if (includeServices) {
    url += '&includeServices=true';
  }
  
  return get<StaffListResponse>(url);
};

/**
 * Get staff member by ID
 */
export const getStaffById = async (id: string): Promise<StaffResponse> => {
  return get<StaffResponse>(`/staff/${id}`);
};

/**
 * Create new staff member
 */
export const createStaff = async (staffData: CreateStaffRequest): Promise<StaffResponse> => {
  return post<StaffResponse>('/staff', staffData);
};

/**
 * Update staff member (admin only)
 */
export const updateStaff = async (
  id: string,
  staffData: Partial<Staff> & { password?: string }
): Promise<StaffResponse> => {
  return put<StaffResponse>(`/staff/${id}`, staffData);
};

/**
 * Update staff member's own profile (staff can update their own profile)
 */
export const updateStaffProfile = async (id: string, profileData: UpdateProfileRequest): Promise<StaffResponse> => {
  return put<StaffResponse>(`/staff/${id}/profile`, profileData);
};

/**
 * Delete staff member
 */
export const deleteStaff = async (id: string): Promise<{ success: boolean; message: string }> => {
  return del<{ success: boolean; message: string }>(`/staff/${id}`);
};

/**
 * Update staff availability (working hours and breaks)
 */
export const updateStaffAvailability = async (
  id: string,
  workingHours: WorkingHour[],
  breaks?: Break[]
): Promise<WorkingHoursResponse> => {
  return put<WorkingHoursResponse>(`/staff/${id}/availability`, { workingHours, breaks });
};

/**
 * Get staff breaks
 */
export const getStaffBreaks = async (id: string): Promise<BreaksResponse> => {
  return get<BreaksResponse>(`/staff/${id}/breaks`);
};

/**
 * Create staff break
 */
export const createStaffBreak = async (id: string, breakData: Omit<Break, 'id' | 'staff_id'>): Promise<{ success: boolean; break: Break }> => {
  return post<{ success: boolean; break: Break }>(`/staff/${id}/breaks`, breakData);
};

/**
 * Update staff break
 */
export const updateStaffBreak = async (staffId: string, breakId: number, breakData: Partial<Break>): Promise<{ success: boolean; break: Break }> => {
  return put<{ success: boolean; break: Break }>(`/staff/${staffId}/breaks/${breakId}`, breakData);
};

/**
 * Delete staff break
 */
export const deleteStaffBreak = async (staffId: string, breakId: number): Promise<{ success: boolean; message: string }> => {
  return del<{ success: boolean; message: string }>(`/staff/${staffId}/breaks/${breakId}`);
};