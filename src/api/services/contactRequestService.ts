import { get } from '../apiClient';

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  created_at: string;
}

interface ContactRequestListResponse {
  success: boolean;
  requests: ContactRequest[];
}

export const getAllContactRequests = async (): Promise<ContactRequestListResponse> => {
  return get<ContactRequestListResponse>('/contact-requests');
}; 