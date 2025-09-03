import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';
import { login as apiLogin, logout as apiLogout, getUser, isAuthenticated as checkIsAuthenticated, getCurrentUser } from '@/api';

export type UserRole = 'admin' | 'staff' | 'billing' | null;

interface AuthState {
  isAuthenticated: boolean;
  userRole: UserRole;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
  hasStaffDetails: () => boolean;
  refreshUserProfile: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: checkIsAuthenticated(),
      userRole: getUser()?.role || null,
      user: getUser(),
      
      login: async (email, password) => {
        try {
          console.log('Auth - Attempting login for:', email);
          const user = await apiLogin(email, password);
          console.log('Auth - Login successful, user:', user);
          
          // If staff user but no staff details, try to fetch them
          if (user.role === 'staff' && !user.staff) {
            try {
              console.log('Auth - Staff user detected but no staff details, fetching profile...');
              const profileUser = await getCurrentUser();
              console.log('Auth - Staff profile fetched:', profileUser);
              
              if (profileUser.staff) {
                console.log('Auth - Staff details found in profile');
              } else {
                console.warn('Auth - No staff details found in profile');
              }
              
              set({ 
                isAuthenticated: true, 
                userRole: profileUser.role as UserRole,
                user: profileUser
              });
              return;
            } catch (profileError) {
              console.error('Auth - Error fetching staff profile:', profileError);
              // Continue with login even if we can't get staff details
              
              // Set authenticated state with the user we have
              set({ 
                isAuthenticated: true, 
                userRole: user.role as UserRole,
                user
              });
              return;
            }
          }
          
          set({ 
            isAuthenticated: true, 
            userRole: user.role as UserRole,
            user
          });
        } catch (error) {
          console.error('Auth - Login error:', error);
          
          // Make sure we're not authenticated on error
          set({ 
            isAuthenticated: false, 
            userRole: null,
            user: null
          });
          
          throw error;
        }
      },
      
      logout: () => {
        apiLogout();
        set({ 
          isAuthenticated: false, 
          userRole: null,
          user: null
        });
        // Let the calling code handle navigation instead of doing it here
      },
      
      checkAuth: () => {
        const isAuth = checkIsAuthenticated();
        const currentUser = getUser();
        
        if (isAuth && currentUser && !get().isAuthenticated) {
          set({ 
            isAuthenticated: true, 
            userRole: currentUser.role as UserRole,
            user: currentUser
          });
        }
        
        return isAuth;
      },
      
      hasStaffDetails: () => {
        const user = get().user;
        return !!(user && user.role === 'staff' && user.staff);
      },
      
      refreshUserProfile: async () => {
        try {
          const user = await getCurrentUser();
          set({ user });
          return;
        } catch (error) {
          console.error('Error refreshing user profile:', error);
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);