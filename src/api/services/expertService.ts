import { get, post, put, del } from '../apiClient';

export interface Expert {
  id: string;
  name: string;
  position?: string;
  bio?: string;
  image?: string;
  is_active?: boolean;
  phone?: string;
  email?: string;
  services?: Array<{ id: string | number; name: string }>;
  user?: { image?: string; name?: string };
  isAvailable?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ListResponse { success: boolean; experts: Expert[]; }
interface SingleResponse { success: boolean; expert: Expert; message?: string; }
interface DeleteResponse { success: boolean; message: string; }

export const getAllExperts = async (): Promise<ListResponse> => get<ListResponse>('/experts');
export const createExpert = async (data: Omit<Expert,'id'|'created_at'|'updated_at'>): Promise<SingleResponse> => post<SingleResponse>('/experts', data);
export const updateExpert = async (id:string,data:Partial<Omit<Expert,'id'|'created_at'|'updated_at'>>): Promise<SingleResponse>=>put<SingleResponse>(`/experts/${id}`,data);
export const deleteExpert = async (id:string):Promise<DeleteResponse>=>del<DeleteResponse>(`/experts/${id}`);

// public
export const getPublicExperts = async (): Promise<ListResponse> => get<ListResponse>('/public/experts', { skipAuth: true }); 