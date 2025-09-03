import { useState, useCallback } from 'react';

/**
 * Custom hook for handling API calls with loading and error states
 */
export function useApi<T, P extends unknown[]>(
  apiFunction: (...args: P) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      try {
        // Begin request – show loader and clear out any stale data so that old content doesn't flash
        setLoading(true);
        setData(null);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorObject = err instanceof Error ? err : new Error('Unknown error occurred');
        
        // Set the error state
        setError(errorObject);
        
        // Let the error propagate to be caught by the global handler
        // if it's an authentication error
        throw errorObject;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return {
    data,
    loading,
    error,
    execute,
    setData
  };
}

/**
 * Example usage:
 * 
 * const {
 *   data: staffData,
 *   loading: staffLoading,
 *   error: staffError,
 *   execute: fetchStaff
 * } = useApi(getAllStaff);
 * 
 * useEffect(() => {
 *   fetchStaff();
 * }, [fetchStaff]);
 */ 