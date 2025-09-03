import { useMemo } from 'react';
import { useSettings } from './useSettings';

/**
 * Returns the list of available payment methods based on current business settings.
 * Includes built-in methods (cash, card, mobile) if enabled and any custom methods.
 */
export const usePaymentMethods = () => {
  const { settings, isLoading, error, fetchSettings } = useSettings();

  const paymentMethods = useMemo(() => {
    if (!settings) return [] as string[];
    let methods: string[] = [];
    if (Array.isArray(settings.custom_payment_methods)) {
      methods = [...settings.custom_payment_methods];
    } else if (typeof settings.custom_payment_methods === 'string') {
      try {
        const parsed = JSON.parse(settings.custom_payment_methods);
        if (Array.isArray(parsed)) methods = parsed;
      } catch {
        // ignore
      }
    }
    // Optional fallback to legacy built-ins if no custom methods defined
    if (methods.length === 0) {
      methods = ['cash', 'card', 'mobile'];
    }
    return methods;
  }, [settings]);

  return {
    paymentMethods,
    isLoading,
    error,
    refresh: fetchSettings,
  };
}; 