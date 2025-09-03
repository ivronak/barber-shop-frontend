import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { TOKEN_EXPIRED_EVENT } from '@/api/apiClient';
import { useAuth } from '@/lib/auth';

/**
 * Component that listens for authentication events globally
 * and handles redirects when token expires
 */
export const AuthListener = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();

  useEffect(() => {
    // Handler for token expiration events
    const handleTokenExpired = () => {
      console.log('Token expired event detected');
      
      // Log the user out
      logout();
      
      // Show a toast notification
      toast({
        title: 'Session Expired',
        description: 'Your session has expired. Please log in again.',
        variant: 'destructive',
      });
      
      // Redirect to login page
      navigate('/login', { 
        state: { tokenExpired: true },
        replace: true 
      });
    };

    // Add event listener
    window.addEventListener(TOKEN_EXPIRED_EVENT, handleTokenExpired);

    // Clean up
    return () => {
      window.removeEventListener(TOKEN_EXPIRED_EVENT, handleTokenExpired);
    };
  }, [navigate, toast, logout]);

  // This component doesn't render anything
  return null;
}; 