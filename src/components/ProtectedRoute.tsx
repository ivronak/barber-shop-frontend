import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff' | 'billing';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, userRole, user, refreshUserProfile } = useAuth();
  const location = useLocation();

  // Log information about the protected route
  // console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  // console.log('ProtectedRoute - userRole:', userRole);
  // console.log('ProtectedRoute - requiredRole:', requiredRole);
  // console.log('ProtectedRoute - user:', user);

  // For staff users, ensure we have their complete profile
  useEffect(() => {
    if (isAuthenticated && userRole === 'staff' && (!user?.staff)) {
      console.log('ProtectedRoute - Refreshing staff profile');
      refreshUserProfile().catch(err => {
        console.error('ProtectedRoute - Error refreshing profile:', err);
      });
    }
  }, [isAuthenticated, userRole, user, refreshUserProfile]);

  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required and user has a different role
  if (requiredRole && userRole !== requiredRole) {
    console.log(`ProtectedRoute - Role mismatch: required ${requiredRole}, user has ${userRole}`);
    
    // Redirect admins to admin dashboard
    if (userRole === 'admin') {
      console.log('ProtectedRoute - Redirecting admin to admin dashboard');
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Redirect billing users to their dashboard
    if (userRole === 'billing') {
      console.log('ProtectedRoute - Redirecting billing user to billing dashboard');
      return <Navigate to="/billing/dashboard" replace />;
    }
    // Redirect staff to staff dashboard
    if (userRole === 'staff') {
      console.log('ProtectedRoute - Redirecting staff to staff dashboard');
      return <Navigate to="/staff/dashboard" replace />;
    }
  }

  // console.log('ProtectedRoute - Access granted');
  return <>{children}</>;
};