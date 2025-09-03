import React, { useState, useEffect } from 'react';
import { Clock, Plus, Save, Loader2, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// API imports
import { useApi } from '@/hooks/useApi';
import { 
  getBusinessHours, 
  BusinessHour, 
  Break,
  batchUpdateBusinessHoursAndBreaks
} from '@/api/services/businessHoursService';
import { 
  getBusinessSettings
} from '@/api/services/settingsService';

const DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export const Slots: React.FC = () => {
  const { toast } = useToast();
  
  // API hooks
  const {
    data: hoursData,
    loading: hoursLoading,
    error: hoursError,
    execute: fetchHours
  } = useApi(getBusinessHours);

  const {
    loading: updateHoursLoading,
    error: updateHoursError,
    execute: saveHours
  } = useApi(batchUpdateBusinessHoursAndBreaks);

  const {
    data: settingsData,
    loading: settingsLoading,
    error: settingsError,
    execute: fetchSettings
  } = useApi(getBusinessSettings);

  // State
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [localBreaks, setLocalBreaks] = useState<{ [dayId: number]: Break[] }>({});
  const [pendingBreakChanges, setPendingBreakChanges] = useState<{
    create: { dayId: number, break: Omit<Break, 'id'> }[];
    update: { id: number, data: Partial<Break> }[];
    delete: number[];
  }>({
    create: [],
    update: [],
    delete: []
  });

  // -----------------------------
  // Real-time validation helpers
  // -----------------------------
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Convert a HH:MM:SS time string to minutes since midnight
  const timeToMinutes = (timeStr: string | null): number | null => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.slice(0, 5).split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  // Re-validate every time hours or breaks change
  useEffect(() => {
    const errors: string[] = [];

    businessHours.forEach(hour => {
      const dayLabel = hour.day_of_week.charAt(0).toUpperCase() + hour.day_of_week.slice(1);

      // Day off – skip further validation
      if (!hour.open_time && !hour.close_time) return;

      const openMinutes = timeToMinutes(hour.open_time);
      const closeMinutes = timeToMinutes(hour.close_time);

      if (openMinutes === null || closeMinutes === null) {
        errors.push(`${dayLabel}: Opening and closing time must be set.`);
        return;
      }

      if (openMinutes >= closeMinutes) {
        errors.push(`${dayLabel}: Opening time must be before closing time.`);
      }

      // Validate breaks for the current day
      if (hour.id !== undefined) {
        const breaks = (localBreaks[hour.id] || []).slice().sort((a, b) => {
          const aStart = timeToMinutes(a.start_time);
          const bStart = timeToMinutes(b.start_time);
          return (aStart ?? 0) - (bStart ?? 0);
        });

        breaks.forEach((br, idx) => {
          const start = timeToMinutes(br.start_time);
          const end = timeToMinutes(br.end_time);

          if (start === null || end === null) {
            errors.push(`${dayLabel} ${br.name}: Start and end time must be set.`);
            return;
          }

          if (start >= end) {
            errors.push(`${dayLabel} ${br.name}: Start time must be before end time.`);
          }

          if (start < openMinutes || end > closeMinutes) {
            errors.push(`${dayLabel} ${br.name}: Break must be within business hours.`);
          }

          if (idx > 0) {
            const prevEnd = timeToMinutes(breaks[idx - 1].end_time);
            if (prevEnd !== null && start < prevEnd) {
              errors.push(`${dayLabel}: Breaks must not overlap.`);
            }
          }
        });
      }
    });

    setValidationErrors(errors);
  }, [businessHours, localBreaks]);

  // Fetch data on component mount
  useEffect(() => {
    fetchHours();
    fetchSettings();
  }, [fetchHours, fetchSettings]);

  // Update state when API data is loaded
  useEffect(() => {
    if (hoursData?.hours) {
      setBusinessHours(hoursData.hours);
      
      // Initialize local breaks from API data
      const breaksMap: { [dayId: number]: Break[] } = {};
      hoursData.hours.forEach(hour => {
        if (hour.id !== undefined && hour.breaks) {
          breaksMap[hour.id] = [...hour.breaks];
        }
      });
      setLocalBreaks(breaksMap);
      
      // Reset pending changes
      setPendingBreakChanges({
        create: [],
        update: [],
        delete: []
      });
    }
  }, [hoursData]);

  // Handle API errors
  useEffect(() => {
    const errors = [
      { error: hoursError, message: 'Error loading business hours' },
      { error: updateHoursError, message: 'Error saving business hours' },
      { error: settingsError, message: 'Error loading settings' },
    ];

    errors.forEach(({ error, message }) => {
      if (error) {
        toast({
          title: message,
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  }, [
    hoursError, updateHoursError, settingsError, toast
  ]);

  // Helper function to get business hour for a specific day
  const getBusinessHour = (day: string): BusinessHour | undefined => {
    return businessHours.find(hour => hour.day_of_week === day);
  };

  // Handle time change for a specific day
  const handleTimeChange = (day: string, field: 'open_time' | 'close_time', value: string) => {
    setBusinessHours(prev => 
      prev.map(hour => 
        hour.day_of_week === day 
          ? { ...hour, [field]: value } 
          : hour
      )
    );
  };

  // Handle day off toggle
  const handleDayOffToggle = (day: string) => {
    setBusinessHours(prev => 
      prev.map(hour => 
        hour.day_of_week === day 
          ? { 
              ...hour, 
              open_time: hour.open_time ? null : '09:00:00', 
              close_time: hour.close_time ? null : '18:00:00' 
            } 
          : hour
      )
    );
  };

  // Handle save
  const handleSave = async () => {
    try {
      // Save business hours and breaks in a single API call
      await saveHours({ 
        hours: businessHours,
        breakChanges: pendingBreakChanges
      });
      
      toast({
        title: 'Settings saved',
        description: 'Business hours have been updated successfully.',
      });
      
      // Refresh data
      fetchHours();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Get breaks for a specific day
  const getBreaksForDay = (dayId: number | undefined): Break[] => {
    if (dayId === undefined) return [];
    // Special handling for dayId 0 (Sunday)
    return localBreaks[dayId] || [];
  };

  // Handle add break
  const handleAddBreak = (dayId: number) => {
    if (dayId === undefined) return;
    
    const businessHour = businessHours.find(hour => hour.id === dayId);
    if (!businessHour) return;
    
    // Use the string day_of_week directly instead of converting to number
    const dayName = businessHour.day_of_week.toLowerCase();
    
    console.log(`Creating break for ${businessHour.day_of_week} (day name: ${dayName})`);
    
    const newBreak: Omit<Break, 'id'> = {
      name: `Break ${getBreaksForDay(dayId).length + 1}`,
      start_time: '12:00:00',
      end_time: '13:00:00',
      business_hour_id: dayId,
      day_of_week: dayName, // Use string value directly
      staff_id: null
    };
    
    // Add to local state
    setLocalBreaks(prev => {
      const dayBreaks = prev[dayId] || [];
      // Create a temporary ID for UI purposes
      const tempId = -Date.now() - Math.floor(Math.random() * 1000);
      return {
        ...prev,
        [dayId]: [...dayBreaks, { ...newBreak, id: tempId }]
      };
    });
    
    // Add to pending changes
    setPendingBreakChanges(prev => ({
      ...prev,
      create: [...prev.create, { dayId, break: newBreak }]
    }));
  };

  // Handle remove break
  const handleRemoveBreak = (dayId: number, breakId: number) => {
    // Remove from local state
    setLocalBreaks(prev => {
      const dayBreaks = prev[dayId] || [];
      return {
        ...prev,
        [dayId]: dayBreaks.filter(b => b.id !== breakId)
      };
    });
    
    // If it's a temporary ID (negative), remove from pending creations
    if (breakId < 0) {
      setPendingBreakChanges(prev => ({
        ...prev,
        create: prev.create.filter(item => 
          !(item.dayId === dayId && item.break.name === `Break ${Math.abs(breakId)}`)
        )
      }));
    } else {
      // Otherwise, add to pending deletions
      setPendingBreakChanges(prev => ({
        ...prev,
        delete: [...prev.delete, breakId]
      }));
    }
  };

  // Check if a day is set as a day off
  const isDayOff = (day: string): boolean => {
    const hour = getBusinessHour(day);
    return hour ? !hour.open_time && !hour.close_time : false;
  };

  const isLoading = hoursLoading || settingsLoading || updateHoursLoading;

  // Count breaks for a day
  const getBreakCount = (hour: BusinessHour): number => {
    if (hour.id === undefined) return 0;
    return (localBreaks[hour.id] || []).length;
  };

  // Fix breaks with missing day_of_week values
  const fixBreaksWithMissingDayOfWeek = () => {
    // Create a copy of the local breaks
    const updatedBreaks = { ...localBreaks };
    const updatedPendingChanges = { ...pendingBreakChanges };
    let updatesNeeded = false;

    // For each business hour
    businessHours.forEach(hour => {
      if (!hour.id) return;

      // Get the day name directly
      const dayName = hour.day_of_week.toLowerCase();

      // Get the breaks for this day
      const dayBreaks = updatedBreaks[hour.id] || [];

      // Update breaks with missing day_of_week
      const updatedDayBreaks = dayBreaks.map(breakItem => {
        if (breakItem.day_of_week === null || breakItem.day_of_week === undefined) {
          updatesNeeded = true;
          
          // If it's a real break (not temporary)
          if (breakItem.id && breakItem.id > 0) {
            // Add to pending updates
            const existingUpdateIndex = updatedPendingChanges.update.findIndex(item => item.id === breakItem.id);
            
            if (existingUpdateIndex >= 0) {
              updatedPendingChanges.update[existingUpdateIndex].data = {
                ...updatedPendingChanges.update[existingUpdateIndex].data,
                day_of_week: dayName
              };
            } else {
              updatedPendingChanges.update.push({
                id: breakItem.id as number,
                data: { day_of_week: dayName }
              });
            }
          }
          
          // Update the break in local state
          return { ...breakItem, day_of_week: dayName };
        }
        return breakItem;
      });

      updatedBreaks[hour.id] = updatedDayBreaks;
    });

    // Update state if changes were made
    if (updatesNeeded) {
      setLocalBreaks(updatedBreaks);
      setPendingBreakChanges(updatedPendingChanges);
      
      toast({
        title: 'Breaks updated',
        description: 'Fixed breaks with missing day_of_week values. Save changes to apply.',
      });
    } else {
      toast({
        title: 'No updates needed',
        description: 'All breaks already have proper day_of_week values.',
      });
    }
  };

  // Handle break time change
  const handleBreakTimeChange = (
    dayId: number,
    breakItem: Break,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    if (!breakItem.id) return;
    
    // Update in local state
    setLocalBreaks(prev => {
      const dayBreaks = prev[dayId] || [];
      return {
        ...prev,
        [dayId]: dayBreaks.map(b => 
          b.id === breakItem.id 
            ? { ...b, [field]: `${value}:00` } 
            : b
        )
      };
    });
    
    // If it's a temporary ID (negative), update in pending creations
    if (breakItem.id < 0) {
      setPendingBreakChanges(prev => ({
        ...prev,
        create: prev.create.map(item => 
          item.dayId === dayId && item.break.name === breakItem.name
            ? { ...item, break: { ...item.break, [field]: `${value}:00` } }
            : item
        )
      }));
    } else {
      // Otherwise, add to or update in pending updates
      const existingUpdateIndex = pendingBreakChanges.update.findIndex(item => item.id === breakItem.id);
      
      if (existingUpdateIndex >= 0) {
        setPendingBreakChanges(prev => ({
          ...prev,
          update: prev.update.map((item, index) => 
            index === existingUpdateIndex
              ? { ...item, data: { ...item.data, [field]: `${value}:00` } }
              : item
          )
        }));
      } else {
        setPendingBreakChanges(prev => ({
          ...prev,
          update: [...prev.update, { id: breakItem.id as number, data: { [field]: `${value}:00` } }]
        }));
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Slot Configuration"
        description="Configure business hours and appointment slots"
        action={{
          label: "Save Changes",
          onClick: handleSave,
          icon: isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          ),
          disabled: isLoading || validationErrors.length > 0,
        }}
      />

      {(hoursError || settingsError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error loading the slot configuration. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Check for breaks with missing day_of_week */}
      {Object.values(localBreaks).some(breaks => 
        breaks.some(breakItem => breakItem.day_of_week === null || breakItem.day_of_week === undefined)
      ) && (
        <Alert>
          <div className="flex justify-between items-center">
            <div>
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Some breaks have missing day_of_week values. This may cause issues with the booking system.
              </AlertDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fixBreaksWithMissingDayOfWeek}
              disabled={isLoading}
            >
              Fix Breaks
            </Button>
          </div>
        </Alert>
      )}

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 space-y-1">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {isLoading && !hoursData && !settingsData ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Business Hours Card */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>Set your working hours for each day of the week</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div>
                <div className="divide-y">
                  {DAYS.map((day) => {
                    const businessHour = getBusinessHour(day.value);
                    const isOff = isDayOff(day.value);
                    const breakCount = businessHour ? getBreakCount(businessHour) : 0;
                    
                    return (
                      <div key={day.value} className="p-4 hover:bg-muted/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-base">{day.label}</h3>
                            {breakCount > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {breakCount} {breakCount === 1 ? 'break' : 'breaks'}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`day-off-${day.value}`} className="text-sm text-muted-foreground">
                              Day Off
                            </Label>
                            <Switch
                              id={`day-off-${day.value}`}
                              checked={isOff}
                              onCheckedChange={() => handleDayOffToggle(day.value)}
                            />
                          </div>
                        </div>
                        
                        {!isOff && businessHour && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Opening Time</Label>
                                <Input
                                  type="time"
                                  value={businessHour.open_time?.slice(0, 5) || ''}
                                  onChange={(e) => handleTimeChange(day.value, 'open_time', `${e.target.value}:00`)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Closing Time</Label>
                                <Input
                                  type="time"
                                  value={businessHour.close_time?.slice(0, 5) || ''}
                                  onChange={(e) => handleTimeChange(day.value, 'close_time', `${e.target.value}:00`)}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            
                            {/* Breaks section for each day */}
                            {businessHour.id !== undefined && (
                              <>
                                <div className="mt-3 pt-3 border-t border-dashed">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-medium">Breaks</h4>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => businessHour.id !== undefined && handleAddBreak(businessHour.id)}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add
                                    </Button>
                                  </div>
                                  
                                  {getBreaksForDay(businessHour.id).length > 0 ? (
                                    <div className="space-y-2">
                                      {getBreaksForDay(businessHour.id).map((breakItem) => (
                                        <div 
                                          key={breakItem.id} 
                                          className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/50 p-2 rounded text-sm gap-2"
                                        >
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <span className="font-medium cursor-help">{breakItem.name}</span>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Day of week: {breakItem.day_of_week !== null ? breakItem.day_of_week : 'Not set'}</p>
                                                <p>Business hour ID: {breakItem.business_hour_id}</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                          <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <div className="grid grid-cols-2 gap-1 flex-1">
                                              <Input
                                                type="time"
                                                value={breakItem.start_time?.slice(0, 5) || ''}
                                                onChange={(e) => handleBreakTimeChange(
                                                  businessHour.id as number,
                                                  breakItem,
                                                  'start_time',
                                                  e.target.value
                                                )}
                                                className="min-w-0 h-7 text-xs"
                                              />
                                              <Input
                                                type="time"
                                                value={breakItem.end_time?.slice(0, 5) || ''}
                                                onChange={(e) => handleBreakTimeChange(
                                                  businessHour.id as number,
                                                  breakItem,
                                                  'end_time',
                                                  e.target.value
                                                )}
                                                className="min-w-0 h-7 text-xs"
                                              />
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 flex-shrink-0"
                                              onClick={() => businessHour.id !== undefined && handleRemoveBreak(businessHour.id, breakItem.id as number)}
                                            >
                                              <Trash2 className="h-3 w-3 text-destructive" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full mt-2"
                                      onClick={() => businessHour.id !== undefined && handleAddBreak(businessHour.id)}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Break
                                    </Button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        
                        {isOff && (
                          <div className="flex items-center justify-center p-4 bg-muted/30 rounded-md">
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Clock className="h-4 w-4 mr-2 opacity-70" />
                              Closed
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};