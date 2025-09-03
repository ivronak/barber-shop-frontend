import React, { useState, useEffect } from 'react';
import { 
  Clock,
  Plus,
  Trash,
  Edit,
  Loader2,
  AlertCircle,
  Coffee
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TimeSlot, WorkingHours, Break } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// API imports
import { useAuth } from '@/lib/auth';
import { 
  getStaffById, 
  updateStaffAvailability, 
  WorkingHour,
  getStaffBreaks,
  createStaffBreak,
  updateStaffBreak,
  deleteStaffBreak
} from '@/api/services/staffService';
import { useApi } from '@/hooks/useApi';

export const StaffWorkingHours: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get staff ID from auth context
  const staffId = user?.staff?.id;
  
  // API hooks
  const {
    data: staffData,
    loading: staffLoading,
    error: staffError,
    execute: fetchStaff
  } = useApi(getStaffById);

  const {
    error: updateError,
    execute: saveWorkingHours
  } = useApi(updateStaffAvailability);

  const {
    data: breaksData,
    error: breaksError,
    execute: fetchBreaks
  } = useApi(getStaffBreaks);

  const {
    loading: creatingBreak,
    error: createBreakError,
    execute: saveBreak
  } = useApi(createStaffBreak);

  const {
    loading: updatingBreak,
    error: updateBreakError,
    execute: updateBreak
  } = useApi(updateStaffBreak);

  const {
    loading: deletingBreak,
    error: deleteBreakError,
    execute: removeBreak
  } = useApi(deleteStaffBreak);
  
  // Initialize working hours state
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: [], tuesday: [], wednesday: [], thursday: [],
    friday: [], saturday: [], sunday: []
  });

  // Initialize breaks state
  const [breaks, setBreaks] = useState<Break[]>([]);
  
  // Time slot management dialog states
  const [isWorkingHoursDialogOpen, setIsWorkingHoursDialogOpen] = useState(false);
  const [isBreakDialogOpen, setIsBreakDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<keyof WorkingHours>('monday');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedBreak, setSelectedBreak] = useState<Break | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [timeSlotForm, setTimeSlotForm] = useState<TimeSlot>({
    start: '09:00',
    end: '17:00',
  });
  const [breakForm, setBreakForm] = useState<Omit<Break, 'id'>>({
    name: 'Lunch Break',
    day_of_week: 1, // Monday
    start_time: '12:00:00',
    end_time: '13:00:00'
  });
  
  // Loading states
  const [addingSlot, setAddingSlot] = useState(false);
  const [deletingSlot, setDeletingSlot] = useState<string | null>(null);

  // Common time slots for quick selection
  const quickTimeSlots = [
    { label: 'Morning (9:00 AM - 1:00 PM)', start: '09:00', end: '13:00' },
    { label: 'Afternoon (1:00 PM - 5:00 PM)', start: '13:00', end: '17:00' },
    { label: 'Evening (5:00 PM - 9:00 PM)', start: '17:00', end: '21:00' },
    { label: 'Full Day (9:00 AM - 5:00 PM)', start: '09:00', end: '17:00' },
  ];

  // Common breaks for quick selection
  const quickBreaks = [
    { name: 'Lunch Break', start_time: '12:00:00', end_time: '13:00:00' },
    { name: 'Coffee Break', start_time: '15:00:00', end_time: '15:30:00' },
    { name: 'Morning Break', start_time: '10:30:00', end_time: '11:00:00' },
  ];

  // Day names for iteration
  const dayNames: Array<keyof WorkingHours> = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  // Day of week mapping (string to number)
  const dayOfWeekMap: Record<string, number> = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  };

  // Day of week mapping (number to string)
  const dayOfWeekNumberToString: Record<number, string> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
  };

  // Fetch staff data and breaks on component mount
  useEffect(() => {
    if (staffId) {
      fetchStaff(staffId);
      fetchBreaks(staffId);
    }
  }, [staffId, fetchStaff, fetchBreaks]);

  // Update state when API data is loaded
  useEffect(() => {
    if (staffData?.staff?.workingHours) {
      // Convert API format to our frontend format
      const apiWorkingHours = staffData.staff.workingHours;
      const formattedHours: WorkingHours = {
        monday: [], tuesday: [], wednesday: [], thursday: [],
        friday: [], saturday: [], sunday: []
      };

      apiWorkingHours.forEach((hour: WorkingHour) => {
        const day = hour.day_of_week as keyof WorkingHours;
        // Format time from "HH:MM:SS" to "HH:MM"
        const start = hour.start_time.slice(0, 5);
        const end = hour.end_time.slice(0, 5);
        
        formattedHours[day].push({
          start,
          end,
          isBreak: hour.is_break
        });
      });

      setWorkingHours(formattedHours);
    }

    if (staffData?.staff?.breaks) {
      setBreaks(staffData.staff.breaks);
    }
  }, [staffData]);

  // Update breaks state when breaksData is loaded
  useEffect(() => {
    if (breaksData?.breaks) {
      setBreaks(breaksData.breaks);
    }
  }, [breaksData]);

  // Handle API errors
  useEffect(() => {
    if (staffError) {
      toast({
        title: 'Error loading working hours',
        description: staffError.message,
        variant: 'destructive',
      });
    }

    if (updateError) {
      toast({
        title: 'Error saving working hours',
        description: updateError.message,
        variant: 'destructive',
      });
    }

    if (breaksError) {
      toast({
        title: 'Error loading breaks',
        description: breaksError.message,
        variant: 'destructive',
      });
    }

    if (createBreakError) {
      toast({
        title: 'Error creating break',
        description: createBreakError.message,
        variant: 'destructive',
      });
    }

    if (updateBreakError) {
      toast({
        title: 'Error updating break',
        description: updateBreakError.message,
        variant: 'destructive',
      });
    }

    if (deleteBreakError) {
      toast({
        title: 'Error deleting break',
        description: deleteBreakError.message,
        variant: 'destructive',
      });
    }
  }, [staffError, updateError, breaksError, createBreakError, updateBreakError, deleteBreakError, toast]);

  const handleAddTimeSlot = async () => {
    if (timeSlotForm.start >= timeSlotForm.end) {
      toast({
        title: 'Invalid time range',
        description: 'End time must be after start time.',
        variant: 'destructive',
      });
      return;
    }

    // Check for overlapping slots
    const hasOverlap = workingHours[selectedDay].some((slot: TimeSlot) => {
      return (timeSlotForm.start < slot.end && timeSlotForm.end > slot.start);
    });

    if (hasOverlap && !isEditMode) {
      toast({
        title: 'Time slot overlap',
        description: 'This time slot overlaps with existing slots.',
        variant: 'destructive',
      });
      return;
    }

    const updatedHours = { ...workingHours };
    
    if (isEditMode && selectedSlot) {
      // Update existing slot
      updatedHours[selectedDay] = workingHours[selectedDay].map((slot: TimeSlot) => 
        slot === selectedSlot ? timeSlotForm : slot
      );
    } else {
      // Add new slot
      updatedHours[selectedDay] = [...workingHours[selectedDay], timeSlotForm];
    }

    setWorkingHours(updatedHours);
    setIsWorkingHoursDialogOpen(false);
    setIsEditMode(false);
    setSelectedSlot(null);
    
    // Save changes to backend
    if (staffId) {
      try {
        setAddingSlot(true);
        // Convert our frontend format to API format
        const apiWorkingHours: WorkingHour[] = [];
        
        Object.entries(updatedHours).forEach(([day, slots]) => {
          slots.forEach((slot: TimeSlot) => {
            apiWorkingHours.push({
              day_of_week: day,
              start_time: `${slot.start}:00`,
              end_time: `${slot.end}:00`,
              is_break: !!slot.isBreak
            });
          });
        });

        // Save to API - pass current breaks to maintain them
        await saveWorkingHours(staffId, apiWorkingHours, breaks);
        
        toast({
          title: isEditMode ? 'Time slot updated' : 'Time slot added',
          description: `Your availability on ${selectedDay} has been ${isEditMode ? 'updated' : 'added'}.`,
        });
        
        // Refresh data
        fetchStaff(staffId);
      } catch (error) {
        console.error('Error saving working hours:', error);
        toast({
          title: 'Error saving changes',
          description: 'There was a problem saving your changes. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setAddingSlot(false);
      }
    } else {
      toast({
        title: isEditMode ? 'Time slot updated' : 'Time slot added',
        description: `Your availability on ${selectedDay} has been ${isEditMode ? 'updated' : 'added'}.`,
      });
    }
  };

  const handleDeleteTimeSlot = async (day: keyof WorkingHours, slotToDelete: TimeSlot) => {
    const slotId = `${day}-${slotToDelete.start}-${slotToDelete.end}`;
    const updatedHours = { ...workingHours };
    updatedHours[day] = workingHours[day].filter(slot => slot !== slotToDelete);
    setWorkingHours(updatedHours);
    
    // Save changes to backend
    if (staffId) {
      try {
        setDeletingSlot(slotId);
        // Convert our frontend format to API format
        const apiWorkingHours: WorkingHour[] = [];
        
        Object.entries(updatedHours).forEach(([day, slots]) => {
          slots.forEach((slot: TimeSlot) => {
            apiWorkingHours.push({
              day_of_week: day,
              start_time: `${slot.start}:00`,
              end_time: `${slot.end}:00`,
              is_break: !!slot.isBreak
            });
          });
        });

        // Save to API - pass current breaks to maintain them
        await saveWorkingHours(staffId, apiWorkingHours, breaks);
        
        toast({
          title: 'Time slot removed',
          description: `Your availability on ${day} has been updated.`,
        });
        
        // Refresh data
        fetchStaff(staffId);
      } catch (error) {
        console.error('Error saving working hours:', error);
        toast({
          title: 'Error saving changes',
          description: 'There was a problem saving your changes. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setDeletingSlot(null);
      }
    } else {
      toast({
        title: 'Time slot removed',
        description: `Your availability on ${day} has been updated.`,
      });
    }
  };

  // Break management functions
  const handleAddBreak = async () => {
    // Validate form
    if (!breakForm.name || !breakForm.start_time || !breakForm.end_time) {
      toast({
        title: 'Missing information',
        description: 'Please provide a name, start time, and end time for the break.',
        variant: 'destructive',
      });
      return;
    }

    // Ensure start time is before end time
    if (breakForm.start_time >= breakForm.end_time) {
      toast({
        title: 'Invalid time range',
        description: 'End time must be after start time.',
        variant: 'destructive',
      });
      return;
    }

    // Make sure day_of_week is a number (API expects numeric value)
    const breakFormData = {
      ...breakForm,
      day_of_week: typeof breakForm.day_of_week === 'string' 
        ? dayOfWeekMap[breakForm.day_of_week as string] || 1 
        : breakForm.day_of_week
    };

    try {
      if (isEditMode && selectedBreak?.id) {
        // Update existing break
        await updateBreak(staffId!, selectedBreak.id, breakFormData);
        
        toast({
          title: 'Break updated',
          description: `Your ${breakForm.name} break has been updated.`,
        });
      } else {
        // Create new break
        await saveBreak(staffId!, breakFormData);
        
        toast({
          title: 'Break added',
          description: `Your ${breakForm.name} break has been added.`,
        });
      }
      
      // Close dialog and reset form
      setIsBreakDialogOpen(false);
      setSelectedBreak(null);
      setIsEditMode(false);
      
      // Refresh data
      fetchBreaks(staffId!);
    } catch (error) {
      console.error('Error saving break:', error);
      toast({
        title: 'Error saving break',
        description: 'There was a problem saving your break. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBreak = async (breakId: number) => {
    try {
      await removeBreak(staffId!, breakId);
      
      toast({
        title: 'Break deleted',
        description: 'Your break has been deleted.',
      });
      
      // Refresh data
      fetchBreaks(staffId!);
    } catch (error) {
      console.error('Error deleting break:', error);
      toast({
        title: 'Error deleting break',
        description: 'There was a problem deleting your break. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openAddBreakDialog = (day: string | number) => {
    setIsBreakDialogOpen(true);
    setIsEditMode(false);
    setSelectedBreak(null);
    
    // If day is a string, convert to number
    const numericDay = typeof day === 'string' ? dayOfWeekMap[day] : day;
    
    setBreakForm({
      name: 'Lunch Break',
      day_of_week: numericDay,
      start_time: '12:00:00',
      end_time: '13:00:00'
    });
  };

  const openEditBreakDialog = (breakItem: Break) => {
    setIsBreakDialogOpen(true);
    setIsEditMode(true);
    setSelectedBreak(breakItem);
    
    setBreakForm({
      name: breakItem.name,
      day_of_week: breakItem.day_of_week,
      start_time: breakItem.start_time,
      end_time: breakItem.end_time
    });
  };

  const handleQuickBreakSelect = (preset: Partial<Break>) => {
    setBreakForm({
      ...breakForm,
      ...preset
    });
  };

  const openAddDialog = (day: keyof WorkingHours) => {
    setSelectedDay(day);
    setIsEditMode(false);
    setSelectedSlot(null);
    setTimeSlotForm({
      start: '09:00',
      end: '17:00',
    });
    setIsWorkingHoursDialogOpen(true);
  };

  const openEditDialog = (day: keyof WorkingHours, slot: TimeSlot) => {
    setSelectedDay(day);
    setIsEditMode(true);
    setSelectedSlot(slot);
    setTimeSlotForm({
      start: slot.start,
      end: slot.end,
      isBreak: slot.isBreak,
    });
    setIsWorkingHoursDialogOpen(true);
  };

  const handleQuickTimeSlotSelect = (preset: TimeSlot) => {
    setTimeSlotForm(preset);
  };

  // Format functions
  const formatTimeSlotDisplay = (slot: TimeSlot) => {
    // Convert 24h time to AM/PM format
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const h = parseInt(hours, 10);
      return `${h % 12 || 12}:${minutes} ${h < 12 ? 'AM' : 'PM'}`;
    };
    
    return `${formatTime(slot.start)} - ${formatTime(slot.end)}`;
  };

  const formatBreakTimeDisplay = (breakItem: Break) => {
    // Convert 24h time to AM/PM format
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const h = parseInt(hours, 10);
      return `${h % 12 || 12}:${minutes} ${h < 12 ? 'AM' : 'PM'}`;
    };
    
    return `${formatTime(breakItem.start_time.slice(0, 5))} - ${formatTime(breakItem.end_time.slice(0, 5))}`;
  };

  const calculateDayTotalHours = (day: keyof WorkingHours) => {
    let totalMinutes = 0;
    
    workingHours[day].forEach((slot: TimeSlot) => {
      if (!slot.isBreak) {
        const [startHours, startMinutes] = slot.start.split(':').map(Number);
        const [endHours, endMinutes] = slot.end.split(':').map(Number);
        
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        
        totalMinutes += (endTotalMinutes - startTotalMinutes);
      }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return hours + (minutes > 0 ? ` hours ${minutes} min` : ` hours`);
  };

  // Show loading state
  if (staffLoading && !staffData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading working hours...</p>
        </div>
      </div>
    );
  }

  // Show error state if no staff ID
  if (!staffId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Could not load staff information. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  // Group breaks by day of week
  const breaksByDay: Record<string, Break[]> = {};
  breaks.forEach(breakItem => {
    const dayNumber = typeof breakItem.day_of_week === 'string'
      ? dayOfWeekMap[(breakItem.day_of_week as unknown as string).toLowerCase()] ?? 0
      : breakItem.day_of_week;
    
    const dayKey = dayOfWeekNumberToString[dayNumber];
    
    if (!breaksByDay[dayKey]) {
      breaksByDay[dayKey] = [];
    }
    breaksByDay[dayKey].push(breakItem);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Working Hours"
        description="Manage your availability and breaks for appointments. Changes are saved automatically."
      />

      {(staffError || updateError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {staffError?.message || updateError?.message || "There was an error with your request."}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="font-medium text-sm text-muted-foreground">Day</div>
                <div className="col-span-2 font-medium text-sm text-muted-foreground">Working Hours</div>
                
                {dayNames.map((day) => (
                  <React.Fragment key={day}>
                    <div className="capitalize font-medium">{day}</div>
                    <div className="col-span-2">
                      {workingHours[day].length > 0 ? (
                        calculateDayTotalHours(day)
                      ) : (
                        <Badge variant="outline">Day Off</Badge>
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-semibold">Total Weekly Hours</div>
                  <div className="col-span-2 font-semibold">
                    {Object.keys(workingHours).reduce((total, day) => {
                      const dayHours = workingHours[day as keyof WorkingHours];
                      const dayMinutes = dayHours.reduce((sum, slot) => {
                        if (slot.isBreak) return sum;
                        const [startHours, startMinutes] = slot.start.split(':').map(Number);
                        const [endHours, endMinutes] = slot.end.split(':').map(Number);
                        const startTotalMinutes = startHours * 60 + startMinutes;
                        const endTotalMinutes = endHours * 60 + endMinutes;
                        return sum + (endTotalMinutes - startTotalMinutes);
                      }, 0);
                      return total + dayMinutes;
                    }, 0) / 60} hours
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workingHours" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workingHours">Working Hours</TabsTrigger>
          <TabsTrigger value="breaks">Breaks</TabsTrigger>
        </TabsList>

        <TabsContent value="workingHours">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dayNames.map((day) => (
              <Card key={day} className="border shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/40 p-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base capitalize">{day}</CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openAddDialog(day as keyof WorkingHours)}
                            className="h-8 px-2"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add new time slot</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {workingHours[day as keyof WorkingHours].length > 0 && 
                   !workingHours[day as keyof WorkingHours].every(slot => slot.isBreak) && (
                    <CardDescription className="mt-1">
                      Total: {calculateDayTotalHours(day as keyof WorkingHours)}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-3 max-h-[200px] overflow-y-auto">
                  {workingHours[day as keyof WorkingHours].length > 0 ? (
                    <div className="space-y-2">
                      {workingHours[day as keyof WorkingHours].map((slot, index) => (
                        <div 
                          key={index} 
                          className={`flex items-center justify-between p-2 rounded-md border ${slot.isBreak ? 'bg-muted/30' : 'bg-card'}`}
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            <Clock className={`h-4 w-4 mr-2 ${slot.isBreak ? 'text-muted-foreground' : 'text-primary'}`} />
                            <span className="text-sm truncate">
                              {formatTimeSlotDisplay(slot)}
                              {slot.isBreak && <Badge variant="outline" className="ml-2 text-xs">Break</Badge>}
                            </span>
                          </div>
                          <div className="flex items-center ml-2 flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openEditDialog(day as keyof WorkingHours, slot)}
                              className="h-7 w-7"
                              disabled={deletingSlot === `${day}-${slot.start}-${slot.end}`}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-7 w-7"
                                  disabled={deletingSlot === `${day}-${slot.start}-${slot.end}`}
                                >
                                  {deletingSlot === `${day}-${slot.start}-${slot.end}` ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-destructive" />
                                  ) : (
                                    <Trash className="h-3.5 w-3.5 text-destructive" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="w-[90%] rounded-lg">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Time Slot</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this time slot? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-2">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteTimeSlot(day as keyof WorkingHours, slot)}
                                    disabled={deletingSlot === `${day}-${slot.start}-${slot.end}`}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-2 text-center bg-muted/20 rounded-md">
                      No hours set (day off)
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="breaks">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-medium">Manage Your Breaks</h3>
            <Button onClick={() => openAddBreakDialog(1)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Break
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {dayNames.map((day) => {
              const dayBreaks = breaksByDay[day] || [];
              if (dayBreaks.length === 0) return null;
              
              return (
              <Card key={day} className="border shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/40 p-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base capitalize">{day}</CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm" 
                        onClick={() => openAddBreakDialog(day)}
                            className="h-8 px-2"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                  </div>
                    <CardDescription className="mt-1">
                      {dayBreaks.length} {dayBreaks.length === 1 ? 'break' : 'breaks'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-3 max-h-[200px] overflow-y-auto">
                    <div className="space-y-2">
                      {dayBreaks.map((breakItem) => (
                        <div 
                          key={breakItem.id} 
                          className="flex items-center justify-between p-2 rounded-md border bg-muted/30"
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            <Coffee className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">{breakItem.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatBreakTimeDisplay(breakItem)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center ml-2 flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openEditBreakDialog(breakItem)}
                              className="h-7 w-7"
                              disabled={deletingBreak}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-7 w-7"
                                  disabled={deletingBreak}
                                >
                                    <Trash className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="w-[90%] rounded-lg">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Break</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this break? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-2">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteBreak(breakItem.id!)}
                                    disabled={deletingBreak}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
          
          {Object.keys(breaksByDay).length === 0 && (
            <div className="text-center p-8 bg-muted/20 rounded-lg">
              <Coffee className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">No Breaks Added</h3>
              <p className="text-muted-foreground mb-4">
                Add breaks to your schedule to block off time for lunch, meetings, or personal time.
              </p>
              <Button onClick={() => openAddBreakDialog(1)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Break
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Working Hours Dialog */}
      <Dialog open={isWorkingHoursDialogOpen} onOpenChange={setIsWorkingHoursDialogOpen}>
        <DialogContent className="sm:max-w-md w-[90%] rounded-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Time Slot" : "Add Time Slot"}
            </DialogTitle>
            <DialogDescription>
              Set your working hours for <span className="capitalize font-medium">{selectedDay}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Quick select:</Label>
              <div className="grid grid-cols-1 gap-2">
                {quickTimeSlots.map((preset, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className={`justify-start h-auto py-2 px-3 text-left ${
                      timeSlotForm.start === preset.start && 
                      timeSlotForm.end === preset.end
                        ? 'border-primary' 
                        : ''
                    }`}
                    onClick={() => handleQuickTimeSlotSelect(preset)}
                  >
                    <div>
                      <div className="font-medium">{preset.label}</div>
                      <div className="text-xs text-muted-foreground">
                        Working Hours
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Custom time:</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time" className="text-xs">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={timeSlotForm.start}
                    onChange={(e) => setTimeSlotForm({ ...timeSlotForm, start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time" className="text-xs">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={timeSlotForm.end}
                    onChange={(e) => setTimeSlotForm({ ...timeSlotForm, end: e.target.value })}
                  />
                </div>
                </div>
              </div>
            </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsWorkingHoursDialogOpen(false)} disabled={addingSlot}>
              Cancel
            </Button>
            <Button onClick={handleAddTimeSlot} disabled={addingSlot}>
              {addingSlot ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                isEditMode ? 'Update' : 'Add'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Break Dialog */}
      <Dialog open={isBreakDialogOpen} onOpenChange={setIsBreakDialogOpen}>
        <DialogContent className="sm:max-w-md w-[90%] rounded-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Break" : "Add Break"}
            </DialogTitle>
            <DialogDescription>
              Set your break details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="break-name">Break Name</Label>
              <Input
                id="break-name"
                value={breakForm.name}
                onChange={(e) => setBreakForm({ ...breakForm, name: e.target.value })}
                placeholder="e.g., Lunch Break"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="break-day">Day</Label>
              <select
                id="break-day"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={typeof breakForm.day_of_week === 'number' ? breakForm.day_of_week : dayOfWeekMap[breakForm.day_of_week as string]}
                onChange={(e) => setBreakForm({ ...breakForm, day_of_week: parseInt(e.target.value) })}
              >
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Quick select:</Label>
              <div className="grid grid-cols-1 gap-2">
                {quickBreaks.map((preset, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className={`justify-start h-auto py-2 px-3 text-left ${
                      breakForm.name === preset.name && 
                      breakForm.start_time === preset.start_time && 
                      breakForm.end_time === preset.end_time
                        ? 'border-primary' 
                        : ''
                    }`}
                    onClick={() => handleQuickBreakSelect(preset)}
                  >
                    <div>
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatBreakTimeDisplay({...preset, id: 0, day_of_week: 0})}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Custom time:</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="break-start-time" className="text-xs">Start Time</Label>
                  <Input
                    id="break-start-time"
                    type="time"
                    value={breakForm.start_time.slice(0, 5)}
                    onChange={(e) => setBreakForm({ ...breakForm, start_time: `${e.target.value}:00` })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="break-end-time" className="text-xs">End Time</Label>
                  <Input
                    id="break-end-time"
                    type="time"
                    value={breakForm.end_time.slice(0, 5)}
                    onChange={(e) => setBreakForm({ ...breakForm, end_time: `${e.target.value}:00` })}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsBreakDialogOpen(false)} disabled={creatingBreak || updatingBreak}>
              Cancel
            </Button>
            <Button onClick={handleAddBreak} disabled={creatingBreak || updatingBreak}>
              {(creatingBreak || updatingBreak) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                isEditMode ? 'Update' : 'Add'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 