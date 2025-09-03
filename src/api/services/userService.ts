import { get, post, put, del } from '../apiClient';
import { User } from '@/types';
// User interface is imported from global types

// Response interface when fetching a list of users
interface UserListResponse {
  success: boolean;
  users: User[];
  totalCount?: number;
  pages?: number;
  currentPage?: number;
  itemsPerPage?: number;
}

// Response interface when fetching a single user or after create/update
interface UserResponse {
  success: boolean;
  user: User;
}

/**
 * Get all users (optionally paginated)
 * @param page Current page number (default 1)
 * @param limit Items per page (default 10)
 */
export const getAllUsers = async (
  page = 1,
  limit = 10,
  searchQuery?: string,
  role?: string,
): Promise<UserListResponse> => {
  let url = `/users?page=${page}&limit=${limit}`;

  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }

  if (role) {
    url += `&role=${encodeURIComponent(role)}`;
  }

  return get<UserListResponse>(url);
};

/**
 * Get a single user by ID
 */
export const getUserById = async (id: string): Promise<UserResponse> => {
  return get<UserResponse>(`/users/${id}`);
};

/**
 * Create a new user (admin only)
 */
export const createUser = async (userData: Partial<User> & { password: string }): Promise<UserResponse> => {
  return post<UserResponse>('/users', userData);
};

/**
 * Update an existing user (admin only)
 */
export const updateUser = async (
  id: string,
  userData: Partial<User> & { password?: string }
): Promise<UserResponse> => {
  return put<UserResponse>(`/users/${id}`, userData);
};

/**
 * Delete a user (admin only)
 */
export const deleteUser = async (id: string): Promise<{ success: boolean; message: string }> => {
  return del<{ success: boolean; message: string }>(`/users/${id}`);
}; 