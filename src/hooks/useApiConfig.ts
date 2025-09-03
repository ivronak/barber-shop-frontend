import { useState, useEffect } from 'react';

// Default API base URL (can be overridden with environment variables)
const DEFAULT_API_URL = 'https://barber-shop-api-eight.vercel.app/api';
// For local development
const DEV_API_URL = 'https://barber-shop-api-eight.vercel.app/api';

/**
 * Hook to manage API configuration
 * This can be extended with more configuration options as needed
 */
export function useApiConfig() {
  const [apiBaseUrl, setApiBaseUrl] = useState(() => {
    // Try to get the API URL from environment variables or use default
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    // Check if we're in development mode
    const isDev = import.meta.env.MODE === 'development';
    
    // Log the API URL configuration
    console.log('API Config - Environment:', import.meta.env.MODE);
    console.log('API Config - Environment URL:', envUrl);
    console.log('API Config - Is Development:', isDev);
    
    // Use environment variable if set, otherwise use appropriate default
    return envUrl || (isDev ? DEV_API_URL : DEFAULT_API_URL);
  });

  // Monitor for any environment changes (unlikely in production, but useful in development)
  useEffect(() => {
    const envApiUrl = import.meta.env.VITE_API_BASE_URL;
    if (envApiUrl && envApiUrl !== apiBaseUrl) {
      console.log('API Config - Updating API URL:', envApiUrl);
      setApiBaseUrl(envApiUrl);
    }
  }, [apiBaseUrl]);

  return { 
    apiBaseUrl,
    setApiBaseUrl
  };
}

/**
 * Helper function to get the current API base URL
 * Useful for places where you don't want to use the hook
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const isDev = import.meta.env.MODE === 'development';
  const url = envUrl || (isDev ? DEV_API_URL : DEFAULT_API_URL);
  
  console.log('getApiBaseUrl - Using API URL:', url);
  return url;
} 