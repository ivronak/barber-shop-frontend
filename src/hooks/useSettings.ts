import { useState, useEffect } from 'react';
import { 
  getBusinessSettings, 
  updateBusinessSettings,
  BusinessSettings
} from '../api/services/settingsService';
import { useToast } from '../components/ui/use-toast';

export const useSettings = () => {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch settings
  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const settingsResponse = await getBusinessSettings();
      setSettings(settingsResponse.settings);
    } catch (err) {
      setError('Failed to load settings. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load settings. Please try again.',
        variant: 'destructive',
      });
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update business settings
  const saveBusinessSettings = async (updatedSettings: BusinessSettings) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const response = await updateBusinessSettings(updatedSettings);
      setSettings(response.settings);
      toast({
        title: 'Success',
        description: 'Business settings updated successfully.',
      });
      return true;
    } catch (err) {
      setError('Failed to update settings. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating settings:', err);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    isUpdating,
    error,
    fetchSettings,
    saveBusinessSettings
  };
}; 