import { get, post, put, del } from '../apiClient';

// Type definitions for API data structures
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'billing';
}

export interface Staff {
  id: string;
  user: User;
}

export interface Review {
  id: string;
  customer_id: string;
  staff_id: string;
  customer_name?: string;
  staff_name?: string;
  rating: number;
  text: string | null;
  date: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  
  // Include related entities
  customer?: Customer;
  staff?: Staff;
}

// Response interface definitions
export interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
  totalCount: number;
  pages: number;
}

export interface ReviewResponse {
  success: boolean;
  review: Review;
}

export interface ReviewActionResponse {
  success: boolean;
  message: string;
  review?: Review;
}

// Request interface for creating a review
export interface CreateReviewRequest {
  customer_id?: string;
  staff_id?: string;
  customer_name?: string;
  staff_name?: string;
  rating: number;
  text?: string;
  date: string;
  is_approved?: boolean;
}

// API functions

/**
 * Get all reviews with pagination and filtering
 */
export const getAllReviews = async (
  page = 1,
  limit = 10,
  approved?: boolean,
  staffId?: string,
  sort = 'date_desc',
  query?: string
): Promise<ReviewsResponse> => {
  let url = `/reviews?page=${page}&limit=${limit}&sort=${sort}`;
  
  if (approved !== undefined) url += `&approved=${approved}`;
  if (staffId) url += `&staffId=${staffId}`;
  if (query) url += `&q=${encodeURIComponent(query)}`;
  
  return get<ReviewsResponse>(url);
};

/**
 * Get a review by ID
 */
export const getReviewById = async (
  id: string
): Promise<ReviewResponse> => {
  return get<ReviewResponse>(`/reviews/${id}`);
};

/**
 * Create a new review
 */
export const createReview = async (
  reviewData: CreateReviewRequest
): Promise<ReviewResponse> => {
  return post<ReviewResponse>('/reviews', reviewData);
};

/**
 * Approve a review
 */
export const approveReview = async (
  id: string
): Promise<ReviewActionResponse> => {
  return put<ReviewActionResponse>(`/reviews/${id}/approve`, {});
};

/**
 * Delete a review
 */
export const deleteReview = async (
  id: string
): Promise<ReviewActionResponse> => {
  return del<ReviewActionResponse>(`/reviews/${id}`);
};

/**
 * Get latest approved reviews for public display
 */
export const getPublicReviews = async (
  page = 1,
  limit = 6
): Promise<ReviewsResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    approved: 'true', // ensure only approved reviews
    sort: 'date_desc'
  });
  return get<ReviewsResponse>(`/reviews?${params.toString()}`);
};

/**
 * Submit a review from public site (unauthenticated). Review will be created as pending.
 */
export const createPublicReview = async (data: {
  customerName: string;
  rating: number;
  reviewText: string;
}): Promise<ReviewActionResponse> => {
  return post<ReviewActionResponse>('/public/reviews', {
    customer_name: data.customerName,
    rating: data.rating,
    text: data.reviewText,
  }, { skipAuth: true });
}; 