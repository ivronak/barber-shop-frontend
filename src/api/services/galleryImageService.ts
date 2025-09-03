import { get, post, put, del } from '../apiClient';

// Types
export interface GalleryImage {
  id: string;
  title: string;
  description?: string;
  url: string;
  category?: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ListResponse {
  success: boolean;
  images: GalleryImage[];
}

interface SingleResponse {
  success: boolean;
  image: GalleryImage;
  message?: string;
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

export const getAllGalleryImages = async (): Promise<ListResponse> => {
  return get<ListResponse>('/gallery-images');
};

export const createGalleryImage = async (data: Omit<GalleryImage, 'id' | 'created_at' | 'updated_at'>): Promise<SingleResponse> => {
  return post<SingleResponse>('/gallery-images', data);
};

export const updateGalleryImage = async (id: string, data: Partial<Omit<GalleryImage, 'id' | 'created_at' | 'updated_at'>>): Promise<SingleResponse> => {
  return put<SingleResponse>(`/gallery-images/${id}`, data);
};

export const deleteGalleryImage = async (id: string): Promise<DeleteResponse> => {
  return del<DeleteResponse>(`/gallery-images/${id}`);
}; 