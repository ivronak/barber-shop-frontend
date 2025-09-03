import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, startOfDay } from 'date-fns';
import { Clock, Loader2, AlertCircle, Calendar as CalendarIcon, X } from 'lucide-react';
import { Calendar } from './Fullcalendar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBooking } from '../BookingContext';
import { getBookingSlots, BookingSlot } from '@/api/services/bookingService';

export const DateTimeSelection: React.FC = () => {
  const { 
    selectedDate, 
    setSelectedDate, 
    selectedTime, 
    setSelectedTime, 
    totalDuration,
    selectedStaffId,
    selectedServices 
  } = useBooking();

  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slotDuration, setSlotDuration] = useState<number | null>(null);
  
  // Format date for API
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  
  // Memoize the time selection handler
  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
  }, [setSelectedTime]);

  // Clear error message
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Fetch available time slots when date or staff changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDate || !selectedStaffId || !selectedServices.length) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Send all selected service IDs to support multi-service bookings
        const serviceIds = selectedServices.map(service => service.id);
        
        const response = await getBookingSlots(
          formattedDate,
          selectedStaffId,
          serviceIds
        );

        if (response.success) {
          console.log('Available slots:', response.slots);
          
          // Store slot duration if provided
          if (response.slotDuration) {
            setSlotDuration(response.slotDuration);
          }
          
          // If the API returns a message, display it
          if (response.message) {
            setError(response.message);
          }
          
          // If the API returns no slots but has a message, we still want to display the message
          if (response.slots.length === 0 && !response.message) {
            setError('No available time slots for the selected date');
          }
          
          setAvailableSlots(response.slots);
          
          // If the currently selected time is no longer available, clear it
          if (selectedTime && !response.slots.find(slot => slot.time === selectedTime && slot.available)) {
            setSelectedTime(null);
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
        setIsLoading(false);
      }
    };

    fetchAvailableSlots();
    // Remove selectedTime from dependency array to prevent reloading when selecting a time slot
  }, [selectedDate, selectedStaffId, selectedServices, formattedDate]);

  // Check if a date should be disabled in the calendar
  const isDateDisabled = useCallback((date: Date) => {
    // Disable dates in the past
    if (date < startOfDay(new Date())) {
      return true;
    }
    
    // Disable dates too far in the future (30 days)
    if (date > addDays(new Date(), 30)) {
      return true;
    }
    
    return false;
  }, []);

  // Format time for display, considering timezone
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

  // Display time in business timezone
  const getDisplayTimeInBusinessTimezone = useCallback((slot: BookingSlot) => {
    // If the API provides formatted display times, use those
    if (slot.displayTime) {
      return slot.displayTime;
    }
    
    // Otherwise format the time ourselves
    return formatDisplayTime(slot.time);
  }, [formatDisplayTime]);

  // Set default date to today when entering this step if none selected yet
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(startOfDay(new Date()));
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Choose Date & Time</h2>
        <p className="text-muted-foreground">
          Select your preferred appointment date and time
        </p>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          {/* Timezone info removed as per new requirement */}
          {slotDuration && (
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Slot duration: {slotDuration} minutes</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          variants={{
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 }
          }}
          initial="initial"
          animate="animate"
          className="w-full"
        >
          <div className="space-y-2">
            <h3 className="font-medium">Select Date</h3>
            <div className="p-4 border rounded-lg bg-card w-full">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
                disabled={isDateDisabled}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={{
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 }
          }}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-2">
            <h3 className="font-medium">Select Time</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Duration: {totalDuration} minutes
            </p>
            {/* Enhanced error message design */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 relative"
              >
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 pr-10 shadow-sm">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Availability Notice</h3>
                      <div className="mt-1 text-sm text-red-700">
                        {error}
                      </div>
                      {selectedDate && (
                        <div className="mt-2 flex items-center text-xs text-red-600">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          <span>Selected date: {format(selectedDate, 'MMMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    type="button"
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600"
                    onClick={clearError}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading available time slots...</span>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <TooltipProvider key={`slot-${slot.time}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileHover={{ scale: slot.available ? 1.05 : 1 }}
                          whileTap={{ scale: slot.available ? 0.95 : 1 }}
                        >
                          <Button
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            className={`w-full ${!slot.available && "opacity-50 cursor-not-allowed"} ${
                              selectedTime === slot.time ? "bg-gradient-to-r from-primary to-primary/90 shadow-md" : ""
                            }`}
                            onClick={() => slot.available && handleTimeSelect(slot.time)}
                            disabled={!slot.available}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            {getDisplayTimeInBusinessTimezone(slot)}
                          </Button>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent className="text-sm">
                        <div className="font-medium">
                          {getDisplayTimeInBusinessTimezone(slot)}
                        </div>
                        <div className="text-xs mt-0.5">
                          {slot.available ? 'Available' : slot.unavailableReason || 'Not available'}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ) : !error ? (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground">
                  No available time slots for the selected date.
                  Please select a different date.
                </p>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};