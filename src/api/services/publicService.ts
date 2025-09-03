import { get, post } from '../apiClient';
import { Service } from './serviceService';

// Type definitions
export interface BusinessHour {
  day_of_week: string;
  open_time: string | null;
  close_time: string | null;
}

export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  /** Optional social media URLs */
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  logo?: string;
  // For compatibility we support both keys but strongly type 'hours'
  hours?: BusinessHour[];
  business_hours?: BusinessHour[];
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  category?: string;
}

export type PublicService = Omit<Service, 'created_at' | 'updated_at'>;

export interface PublicStaff {
  id: string;
  name: string;
  position?: string;
  role?: string;
  bio?: string;
  image?: string;
  phone?: string;
  email?: string;
  services: { id: string; name: string }[];
  user?: { name?: string; email?: string; image?: string };
  isAvailable?: boolean;
  is_available?: boolean;
}

export interface Review {
  id: string;
  customer_name: string;
  staff_name: string;
  rating: number;
  text?: string;
  date: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface BookingRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_id: string;
  staff_id: string;
  date: string;
  time: string;
  notes?: string;
}

// Response interfaces
interface BusinessResponse {
  success: boolean;
  business: BusinessInfo;
}

interface GalleryResponse {
  success: boolean;
  images: GalleryImage[];
}

interface ServicesResponse {
  success: boolean;
  services: Record<string, PublicService[]>;
}

interface StaffResponse {
  success: boolean;
  staff: PublicStaff[];
}

interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
}

interface ContactResponse {
  success: boolean;
  message: string;
}

interface BookingResponse {
  success: boolean;
  appointment: unknown; // We don't need the full type for public API
}

/**
 * Get public business information
 */
export const getBusinessInfo = async (): Promise<BusinessResponse> => {
  return get<BusinessResponse>('/public/business', { skipAuth: true });
};

/**
 * Get gallery images
 */
export const getGalleryImages = async (): Promise<GalleryResponse> => {
  return get<GalleryResponse>('/public/gallery', { skipAuth: true });
};

/**
 * Get public services
 */
export const getPublicServices = async (category?: string): Promise<ServicesResponse> => {
  let url = '/public/services';
  
  if (category) {
    url += `?category=${category}`;
  }
  
  return get<ServicesResponse>(url, { skipAuth: true });
};

/**
 * Get public staff information
 */
export const getPublicStaff = async (): Promise<StaffResponse> => {
  return get<StaffResponse>('/public/staff', { skipAuth: true });
};

/**
 * Get public barbers
 */
export const getPublicBarbers = async (): Promise<StaffResponse> => {
  // Alias to staff endpoint for compatibility
  return get<StaffResponse>('/public/staff', { skipAuth: true });
};

/**
 * Get public reviews
 */
export const getPublicReviews = async (): Promise<ReviewsResponse> => {
  return get<ReviewsResponse>('/public/reviews', { skipAuth: true });
};

/**
 * Submit contact form
 */
export const submitContactForm = async (formData: ContactForm): Promise<ContactResponse> => {
  return post<ContactResponse>('/public/contact', formData, { skipAuth: true });
};

/**
 * Create public booking
 */
export const createPublicBooking = async (bookingData: BookingRequest): Promise<BookingResponse> => {
  return post<BookingResponse>('/public/booking', bookingData, { skipAuth: true });
}; 