import { post, get } from './apiClient';
import { User } from '../types/user';

// Token storage keys
const TOKEN_KEY = 'barber_shop_token';
const USER_KEY = 'barber_shop_user';

// Response types
interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

interface UserResponse {
  success: boolean;
  user: User;
}

/**
 * Store authentication token in localStorage
 */
export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Retrieve authentication token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove authentication token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Store user data in localStorage
 */
export const saveUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Retrieve user data from localStorage
 */
export const getUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Login user
 */
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const data = await post<AuthResponse>('/auth/login', { email, password });
    
    if (data.success && data.token) {
      // Make sure we're saving the complete user object including staff details
      const userWithDetails = data.user;
      saveToken(data.token);
      saveUser(userWithDetails);
      
      // If staff user but no staff details, try to fetch them
      if (userWithDetails.role === 'staff' && !userWithDetails.staff) {
        try {
          const userResponse = await get<UserResponse>('/auth/me');
          if (userResponse.success && userResponse.user.staff) {
            saveUser(userResponse.user);
            return userResponse.user;
          }
        } catch (profileError) {
          console.error('Error fetching staff details:', profileError);
          // Continue with login even if we can't get staff details
        }
      }
      
      return userWithDetails;
    }
    
    throw new Error('Login failed');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = (): void => {
  removeToken();
  // Don't redirect here, let the calling code handle navigation
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const data = await get<UserResponse>('/auth/me');
    
    if (data.success) {
      saveUser(data.user);
      return data.user;
    }
    
    throw new Error('Failed to get user profile');
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

/**
 * Check if user has specific role
 */
export const hasRole = (role: string): boolean => {
  const user = getUser();
  return user ? user.role === role : false;
};

/**
 * Check if user is admin
 */
export const isAdmin = (): boolean => {
  return hasRole('admin');
}; 