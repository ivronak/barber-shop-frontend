import { get, post, put, del } from '../apiClient';

// Type definitions
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

interface CategoryListResponse {
  success: boolean;
  categories: ServiceCategory[];
  totalCount: number;
  pages: number;
}

interface CategoryResponse {
  success: boolean;
  category: ServiceCategory;
}

// Get all categories
export const getAllCategories = async (search = ''): Promise<CategoryListResponse> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  return get<CategoryListResponse>(`/service-categories?${params.toString()}`, { skipAuth: true });
};

// Create category
export const createCategory = async (data: Partial<ServiceCategory>): Promise<CategoryResponse> => {
  return post<CategoryResponse>('/service-categories', data);
};

// Update category
export const updateCategory = async (id: string, data: Partial<ServiceCategory>): Promise<CategoryResponse> => {
  return put<CategoryResponse>(`/service-categories/${id}`, data);
};

// Delete category
export const deleteCategory = async (id: string): Promise<{ success: boolean; message: string }> => {
  return del<{ success: boolean; message: string }>(`/service-categories/${id}`);
}; 