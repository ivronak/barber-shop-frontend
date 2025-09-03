import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format, addDays } from 'date-fns';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FullWidthCalendar } from './FullWidthCalendar';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types';
import { useApi } from '@/hooks/useApi';
import { rescheduleAppointment, Appointment as ApiAppointment } from '@/api/services/appointmentService';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getBookingSlots, BookingSlot } from '@/api/services/bookingService';

// Add direct function for reschedule
import { post } from '@/api/apiClient';

// Direct function for rescheduling without loading state
const rescheduleAppointmentDirect = async (
  id: string,
  date: string,
  time: string
) => {
  return post(`/appointments/${id}/reschedule`, { date, time });
};

interface RescheduleAppointmentDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRescheduleComplete?: (updatedAppointment: ApiAppointment) => void;
}

export const RescheduleAppointmentDialog: React.FC<RescheduleAppointmentDialogProps> = ({
  appointment,
  open,
  onOpenChange,
  onRescheduleComplete,
}) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(appointment.date));
  const [selectedTime, setSelectedTime] = useState<string>(appointment.time);
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // API hook for rescheduling
  const {
    loading: isRescheduling
  } = useApi(rescheduleAppointment);
  
  // Format date for API
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
  // Fetch available time slots when date changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDate || !open) {
        return;
      }

      setIsLoadingSlots(true);
      setError(null);

      try {
        // Gather all service IDs for multi-service appointments
        const serviceIds = appointment.services.map(service => service.serviceId);
        
        // Get available slots from the booking API
        const response = await getBookingSlots(
          formattedDate,
          appointment.staffId,
          serviceIds
        );

        if (response.success) {
          console.log('Available slots:', response.slots);
          
          setAvailableSlots(response.slots);
          
          // If the API returns a message, display it
          if (response.message) {
            setError(response.message);
          }
          
          // If there are no available slots, show an error
          if (response.slots.filter(slot => slot.available).length === 0 && !response.message) {
            setError('No available time slots for the selected date. Please choose another date.');
          }
          
          // Only clear the selected time if we're changing dates
          // and the currently selected time is no longer available
          if (selectedTime && formattedDate !== format(new Date(appointment.date), 'yyyy-MM-dd')) {
            const isTimeAvailable = response.slots.some(
              slot => slot.time === selectedTime && slot.available
            );
            
            if (!isTimeAvailable) {
              setSelectedTime('');
            }
          }
        } else {
          setError(response.message || 'Failed to fetch available time slots');
          setAvailableSlots([]);
        }
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setError('Failed to fetch available time slots');
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, appointment.staffId, appointment.services, formattedDate, open]);
  
  // Format time for display
  const formatDisplayTime = useCallback((timeString: string) => {
    try {
      // Create a date object with the time string
      const dateWithTime = new Date(`2000-01-01T${timeString}`);
      // Format it in 12-hour format
      return format(dateWithTime, 'h:mm a');
    } catch (err) {
      console.error('Error formatting time:', err);
      return timeString.substring(0, 5); // Fallback to just showing HH:MM
    }
  }, []);
  
  const handleReschedule = async () => {
    try {
      setIsProcessing(true);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Create an optimistic update of the appointment
      const optimisticAppointment = {
        id: appointment.id,
        date: formattedDate,
        time: selectedTime,
        // Add missing properties required by ApiAppointment
        customer_id: appointment.customerId,
        staff_id: appointment.staffId,
        end_time: appointment.endTime,
        total_amount: appointment.totalAmount,
        customer_name: appointment.customerName,
        customer_phone: appointment.customerPhone,
        customer_email: appointment.customerEmail,
        staff_name: appointment.staffName,
        status: appointment.status,
        // Convert services to API format
        appointmentServices: appointment.services.map(service => ({
          service_id: service.serviceId,
          service_name: service.serviceName,
          price: service.price,
          duration: service.duration
        }))
      } as ApiAppointment;
      
      // Make the actual API call using the direct function
      await rescheduleAppointmentDirect(appointment.id, formattedDate, selectedTime);
      
      // Call the parent's callback with the optimistic update after successful API call
      if (onRescheduleComplete) {
        onRescheduleComplete(optimisticAppointment);
      }
      
      // Close the dialog after successful API call
      onOpenChange(false);
      
      toast({
        title: 'Appointment Rescheduled',
        description: `Appointment rescheduled to ${format(selectedDate, 'MMMM d, yyyy')} at ${formatDisplayTime(selectedTime)}`,
      });
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      setIsProcessing(false);
      
      // Check if the error is due to unavailable time slot
      const errorResponse = error as { response?: { data?: { message?: string } } };
      const errorMessage = errorResponse.response?.data?.message || 'Failed to reschedule appointment. Please try again.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // If the error is about unavailable time, refresh the slots
      if (errorMessage.includes('time slot is not available')) {
        refreshTimeSlots();
      }
    }
  };

  // Function to refresh time slots
  const refreshTimeSlots = async () => {
    if (!selectedDate) return;
    
    setIsLoadingSlots(true);
    try {
      const serviceIds = appointment.services.map(service => service.serviceId);
      const response = await getBookingSlots(
        formattedDate,
        appointment.staffId,
        serviceIds
      );
      
      if (response.success) {
        setAvailableSlots(response.slots);
        setSelectedTime('');
      }
    } catch (error) {
      console.error('Error refreshing time slots:', error);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Reset processing state when dialog is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsProcessing(false);
      setError(null);
    } else {
      // When opening the dialog, fetch available slots for the current date
      // but only if we don't already have slots for the current date
      if (availableSlots.length === 0) {
        const fetchInitialSlots = async () => {
          setIsLoadingSlots(true);
          try {
            const serviceIds = appointment.services.map(service => service.serviceId);
            const response = await getBookingSlots(
              formattedDate,
              appointment.staffId,
              serviceIds
            );
            
            if (response.success) {
              setAvailableSlots(response.slots);
              
              // If no available slots, show error
              const availableSlots = response.slots.filter(slot => slot.available);
              if (availableSlots.length === 0) {
                setError('No available time slots for the selected date. Please choose another date.');
              }
            } else {
              setError(response.message || 'Failed to fetch available time slots');
            }
          } catch (error) {
            console.error('Error fetching initial time slots:', error);
            setError('Failed to fetch available time slots. Please try again.');
          } finally {
            setIsLoadingSlots(false);
          }
        };
        
        fetchInitialSlots();
      }
    }
    onOpenChange(open);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new date and time for this appointment.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[65vh] pr-2">
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Current Appointment</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(appointment.date), 'MMMM d, yyyy')} at {formatDisplayTime(appointment.time)}
              </p>
            </div>
            
            {isProcessing && (
              <div className="flex items-center justify-center py-2 bg-muted/30 rounded-md">
                <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                <span className="text-sm">Processing rescheduling...</span>
              </div>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Select New Date</h3>
              <div className="border rounded-lg w-full overflow-hidden bg-card p-2">
                <FullWidthCalendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date < new Date() || date > addDays(new Date(), 60) || isProcessing}
                  initialFocus
                />
              </div>
            </div>
            
            <div className="space-y-2 pb-4">
              <h3 className="text-sm font-medium">Select New Time</h3>
              {/* Memoize the time slot buttons to prevent re-renders */}
              {useMemo(() => {
                // Render loading state
                if (isLoadingSlots) {
                  return (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                      <span className="text-sm">Loading available times...</span>
                    </div>
                  );
                }
                
                // Render time slots
                return (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        type="button"
                        variant={selectedTime === slot.time ? "default" : slot.available ? "outline" : "ghost"}
                        className={cn(
                          "text-center text-sm px-1 h-9",
                          selectedTime === slot.time && "font-semibold",
                          !slot.available && "bg-muted/20 text-muted-foreground line-through hover:bg-muted/30"
                        )}
                        onClick={() => {
                          if (slot.available && slot.time !== selectedTime) {
                            setSelectedTime(slot.time);
                          }
                        }}
                        disabled={isProcessing || !slot.available}
                        title={!slot.available ? (slot.unavailableReason || "Not available") : ""}
                      >
                        {formatDisplayTime(slot.time)}
                      </Button>
                    ))}
                  </div>
                );
              }, [availableSlots, selectedTime, formatDisplayTime, isProcessing, isLoadingSlots])}
              
              {!isLoadingSlots && availableSlots.filter(slot => slot.available).length === 0 && (
                <p className="text-sm text-muted-foreground py-2">
                  No available time slots for this date. Please select another date.
                </p>
              )}
              
              {!isLoadingSlots && availableSlots.length > 0 && (
                <div className="flex items-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-muted/20"></div>
                    <span>Blocked</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button 
            variant="outline" 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenChange(false);
            }}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={isProcessing || isRescheduling || !selectedDate || !selectedTime || availableSlots.filter(slot => slot.available).length === 0}
            className="w-full sm:w-auto"
          >
            {isProcessing ? 'Rescheduling...' : 'Reschedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 