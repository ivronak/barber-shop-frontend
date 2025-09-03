import { get, post, put, del } from '../apiClient';

// Type definitions
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
  is_active?: boolean;
  imageUrl?: string;
  created_at?: string;
  updated_at?: string;
}

// Response interfaces
interface ServiceListResponse {
  success: boolean;
  services: Service[];
  totalCount: number;
  pages: number;
}

interface ServiceResponse {
  success: boolean;
  service: Service;
}

/**
 * Get all services
 */
export const getAllServices = async (
  page = 1,
  limit = 10,
  sort = 'name_asc',
  extraParams: Record<string, string | number | undefined> = {}
): Promise<ServiceListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  params.append('sort', sort);

  // Dynamically append any provided extra parameters
  Object.entries(extraParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  return get<ServiceListResponse>(`/services?${params.toString()}`, { skipAuth: true });
};

/**
 * Get service by ID
 */
export const getServiceById = async (id: string): Promise<ServiceResponse> => {
  return get<ServiceResponse>(`/services/${id}`, { skipAuth: true });
};

/**
 * Create new service
 */
export const createService = async (serviceData: Partial<Service>): Promise<ServiceResponse> => {
  return post<ServiceResponse>('/services', serviceData);
};

/**
 * Update service
 */
export const updateService = async (id: string, serviceData: Partial<Service>): Promise<ServiceResponse> => {
  return put<ServiceResponse>(`/services/${id}`, serviceData);
};

/**
 * Delete service
 */
export const deleteService = async (id: string): Promise<{ success: boolean; message: string }> => {
  return del<{ success: boolean; message: string }>(`/services/${id}`);
}; 