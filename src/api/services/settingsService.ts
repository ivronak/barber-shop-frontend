import { getGeneric as get, putGeneric as put, delGeneric as del } from '../apiClient';

// Type definitions
export interface BusinessSettings {
  id?: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  slot_duration: number;
  tax_rate: number;
  allow_discounts: boolean;
  allow_tips: boolean;
  default_commission: number;
  currency: string;
  timezone: string;
  accept_cash: boolean;
  accept_card: boolean;
  accept_mobile: boolean;
  // Optional social media URLs
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  custom_payment_methods?: string[];
  updated_at?: string;
}

export interface GSTComponent {
  id?: string;
  name: string;
  rate: number;
}

export interface GSTRate {
  id?: string;
  name: string;
  is_active: boolean;
  total_rate: number;
  components: GSTComponent[];
}

// Response interfaces
export interface SettingsResponse {
  success: boolean;
  settings: BusinessSettings;
}

export interface GSTRatesResponse {
  success: boolean;
  gstRates: GSTRate[];
}

/**
 * Fetches the business settings from the API
 */
export const getBusinessSettings = async (): Promise<SettingsResponse> => {
  return get<SettingsResponse>('/settings');
};

/**
 * Updates the business settings
 * @param settings - The updated business settings
 */
export const updateBusinessSettings = async (settings: BusinessSettings): Promise<SettingsResponse> => {
  return put<SettingsResponse, BusinessSettings>('/settings', settings);
};

/**
 * Fetches the GST rates from the API
 */
export const getGSTRates = async (): Promise<GSTRatesResponse> => {
  return get<GSTRatesResponse>('/settings/gst-rates');
};

/**
 * Updates the GST rates
 * @param gstRates - The updated GST rates
 */
export const updateGSTRates = async (gstRates: GSTRate[]): Promise<GSTRatesResponse> => {
  return put<GSTRatesResponse, { gstRates: GSTRate[] }>('/settings/gst-rates', { gstRates });
};

/**
 * Delete a specific GST rate
 */
export const deleteGSTRate = async (id: string): Promise<{ success: boolean; message: string }> => {
  if (!id) {
    throw new Error('GST rate ID is required');
  }
  
  console.log(`Deleting GST rate with ID: ${id}`);
  
  try {
    return await del<{ success: boolean; message: string }>(`/settings/gst-rates/${id}`);
  } catch (error) {
    console.error('API error in deleteGSTRate:', error);
    throw error;
  }
}; 