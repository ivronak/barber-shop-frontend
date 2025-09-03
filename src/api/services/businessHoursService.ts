import { get, put, post, del } from '../apiClient';

// Type definitions
export interface BusinessHour {
  id?: number;
  day_of_week: string;
  open_time: string | null;
  close_time: string | null;
  breaks?: Break[];
}

export interface Break {
  id?: number;
  business_hour_id?: number;
  staff_id?: string | null;
  day_of_week?: string | null;
  name: string;
  start_time: string;
  end_time: string;
  // Frontend properties
  start?: string;
  end?: string;
  created_at?: string;
  updated_at?: string;
}

// Response interfaces
export interface BusinessHoursResponse {
  success: boolean;
  hours: BusinessHour[];
}

export interface UpdateBusinessHoursRequest {
  hours: BusinessHour[];
}

export interface BreaksResponse {
  success: boolean;
  breaks: Break[];
}

export interface BreakResponse {
  success: boolean;
  break: Break;
}

export interface CreateBreakRequest {
  name: string;
  start_time: string;
  end_time: string;
}

export interface UpdateBreakRequest {
  name?: string;
  start_time?: string;
  end_time?: string;
}

export interface BreakChanges {
  create: { dayId: number, break: Omit<Break, 'id'> }[];
  update: { id: number, data: Partial<Break> }[];
  delete: number[];
}

/**
 * Get business hours
 */
export const getBusinessHours = async (): Promise<BusinessHoursResponse> => {
  return get<BusinessHoursResponse>('/settings/business-hours');
};

/**
 * Update business hours
 */
export const updateBusinessHours = async (
  data: UpdateBusinessHoursRequest
): Promise<BusinessHoursResponse> => {
  return put<BusinessHoursResponse>('/settings/business-hours', data);
};

/**
 * Batch update business hours and breaks
 */
export const batchUpdateBusinessHoursAndBreaks = async (
  data: { hours: BusinessHour[], breakChanges: BreakChanges }
): Promise<BusinessHoursResponse> => {
  return put<BusinessHoursResponse>('/settings/business-hours-batch', data);
};

/**
 * Get breaks for a business hour
 */
export const getBreaks = async (businessHourId: number): Promise<BreaksResponse> => {
  return get<BreaksResponse>(`/settings/business-hours/${businessHourId}/breaks`);
};

/**
 * Create a new break
 */
export const createBreak = async (
  businessHourId: number,
  data: CreateBreakRequest
): Promise<BreakResponse> => {
  return post<BreakResponse>(`/settings/business-hours/${businessHourId}/breaks`, data);
};

/**
 * Update a break
 */
export const updateBreak = async (
  breakId: number,
  data: UpdateBreakRequest
): Promise<BreakResponse> => {
  return put<BreakResponse>(`/settings/breaks/${breakId}`, data);
};

/**
 * Delete a break
 */
export const deleteBreak = async (breakId: number): Promise<{ success: boolean; message: string }> => {
  return del<{ success: boolean; message: string }>(`/settings/breaks/${breakId}`);
}; 