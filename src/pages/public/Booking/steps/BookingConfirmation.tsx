import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, CheckCircle, Clock, Scissors, User, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils';
import { useBooking } from '../BookingContext';
import { useToast } from '@/hooks/use-toast';
import { createBooking, BookingRequest, BookingResponse } from '@/api/services/bookingService';
import { useNavigate } from 'react-router-dom';

export const BookingConfirmation: React.FC = () => {
  const { toast } = useToast();
  const { 
    selectedStaffId, 
    selectedServices, 
    selectedDate, 
    selectedTime, 
    customerDetails, 
    totalDuration, 
    totalPrice,
    selectedStaffName,
    selectedStaffPosition
  } = useBooking();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null);

  // Get client timezone
  const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const navigate = useNavigate();

  // Scroll to top when success screen becomes visible
  useEffect(() => {
    if (isSuccess) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isSuccess]);

  const handleSubmitBooking = async () => {
    if (!selectedStaffId || !selectedServices.length || !selectedDate || !selectedTime || !customerDetails) {
      toast({
        title: "Missing information",
        description: "Please complete all required fields before confirming your booking.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format date for API
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      // Create booking request with multi-service support
      const bookingRequest: BookingRequest = {
        customer_name: customerDetails.name,
        customer_phone: customerDetails.phone,
        // Send all service IDs as comma-separated string
        service_id: selectedServices.map(service => service.id).join(','),
        staff_id: selectedStaffId,
        date: formattedDate,
        time: selectedTime,
        timezone: clientTimezone
      };

      // Only add email if it's provided and valid
      if (customerDetails.email && customerDetails.email.includes('@')) {
        bookingRequest.customer_email = customerDetails.email;
      }

      // Add notes if provided
      if (customerDetails.notes) {
        bookingRequest.notes = customerDetails.notes;
      }

      // Submit booking to API
      const response = await createBooking(bookingRequest);

      if (response.success) {
        setIsSuccess(true);
        setBookingId(response.appointment.id);
        setBookingResponse(response);
        toast({
          title: "Booking confirmed!",
          description: "Your appointment has been successfully booked.",
        });
      } else {
        throw new Error("Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Booking failed",
        description: "There was a problem creating your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartOver = () => {
    // Soft reset: navigate to booking root and scroll to top without full page reload
    navigate(`/booking?reset=${Date.now()}`, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format time for display in 12-hour format
  const formatDisplayTime = (timeString: string) => {
    try {
      // Create a date object with the time string
      const dateWithTime = new Date(`2000-01-01T${timeString}`);
      // Format it in 12-hour format
      return format(dateWithTime, 'h:mm a');
    } catch (err) {
      console.error('Error formatting time:', err);
      return timeString.substring(0, 5); // Fallback to just showing HH:MM
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center py-10 space-y-8 text-center"
      >
        {/* Success Icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-primary/70 opacity-30 blur-lg" />
          <div className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <CheckCircle className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>

        {/* Heading & ID */}
        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight">Booking Confirmed!</h2>
          <p className="text-muted-foreground max-w-xs sm:max-w-md mx-auto">
            Thank you for choosing us. We look forward to serving you!
          </p>
          {bookingId && (
            <p className="text-sm font-medium text-primary/80">Reference ID: <span className="text-foreground">{bookingId}</span></p>
          )}
        </div>

        {/* Summary Card */}
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-primary/40 bg-card shadow-lg overflow-hidden">
            <div className="p-6 space-y-4 divide-y divide-muted/40">
              {/* Date & Time */}
              <div className="flex justify-between items-start pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">{format(selectedDate!, 'MMM d, yyyy')}</span>
                </div>
                <span className="font-medium">
                  {bookingResponse?.appointment?.display_time || bookingResponse?.appointment?.displayTime || formatDisplayTime(selectedTime!)}
                </span>
              </div>

              {/* Services */}
              <div className="pt-4 pb-4 space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2"><Scissors className="h-3 w-3 text-primary" /> Services</h4>
                <div className="space-y-1">
                  {selectedServices.map((service) => (
                    <div key={service.id} className="flex justify-between text-sm">
                      <span>{service.name}</span>
                      <span>{formatCurrency(service.price)}</span>
                    </div>
                  ))}
                </div>
                {selectedServices.length > 1 && (
                  <div className="flex justify-between font-semibold pt-2 border-t border-muted/30 text-sm">
                    <span>Total</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                )}
              </div>

              {/* Staff & Duration */}
              <div className="pt-4 pb-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2"><User className="h-3 w-3 text-primary" /> Staff</span>
                  <span>{selectedStaffName || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2"><Clock className="h-3 w-3 text-primary" /> Duration</span>
                  <span>{totalDuration} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Details Card */}
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-muted/40 bg-card shadow-md overflow-hidden">
            <div className="p-6 space-y-3">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><User className="h-4 w-4 text-primary"/> Customer Details</h4>
              <div className="grid grid-cols-[100px_1fr] gap-y-1 text-sm">
                <span className="text-muted-foreground">Name:</span>
                <span>{customerDetails.name || 'N/A'}</span>
                <span className="text-muted-foreground">Phone:</span>
                <span>{customerDetails.phone || 'N/A'}</span>
                {customerDetails.email && (
                  <>
                    <span className="text-muted-foreground">Email:</span>
                    <span>{customerDetails.email}</span>
                  </>
                )}
                {customerDetails.notes && (
                  <>
                    <span className="text-muted-foreground">Notes:</span>
                    <span>{customerDetails.notes}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleStartOver}
          className="mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md"
        >
          Book Another Appointment
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Confirm Your Booking</h2>
        <p className="text-muted-foreground">
          Please review your booking details before confirming
        </p>
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg p-4 space-y-4 bg-card/50 shadow-sm">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Date & Time</h3>
              <p className="text-sm text-muted-foreground">
                {selectedDate && format(selectedDate, 'MMMM d, yyyy')} at {selectedTime && formatDisplayTime(selectedTime)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Duration</h3>
              <p className="text-sm text-muted-foreground">{totalDuration} minutes</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4 bg-card/50 shadow-sm">
          <div className="flex items-center gap-4">
            <Scissors className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Services</h3>
            </div>
          </div>
          
          <div className="pl-9 space-y-3">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{service.duration} min</span>
                  </div>
                </div>
                <span className="font-medium">{formatCurrency(service.price)}</span>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="font-bold text-lg">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Staff Card */}
        <div className="border rounded-lg p-4 bg-card/50 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <User className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Staff</h3>
            </div>
          </div>
          
          {selectedStaffName ? (
            <div className="pl-9">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedStaffName?.charAt(0) || <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedStaffName}</p>
                  {selectedStaffPosition && (
                    <p className="text-sm text-muted-foreground">{selectedStaffPosition}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="pl-9 text-muted-foreground">No staff selected</div>
          )}
        </div>

        <div className="border rounded-lg p-4 space-y-4 bg-card/50 shadow-sm">
          <div className="flex items-center gap-4">
            <User className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Customer Details</h3>
            </div>
          </div>
          
          <div className="pl-9 space-y-2">
            <div className="grid grid-cols-[100px_1fr]">
              <span className="text-muted-foreground">Name:</span>
              <span>{customerDetails.name || 'N/A'}</span>
            </div>
            {customerDetails.email && (
              <div className="grid grid-cols-[100px_1fr]">
                <span className="text-muted-foreground">Email:</span>
                <span>{customerDetails.email}</span>
              </div>
            )}
            <div className="grid grid-cols-[100px_1fr]">
              <span className="text-muted-foreground">Phone:</span>
              <span>{customerDetails.phone || 'N/A'}</span>
            </div>
            {customerDetails.notes && (
              <div className="grid grid-cols-[100px_1fr]">
                <span className="text-muted-foreground">Notes:</span>
                <span>{customerDetails.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button 
          onClick={handleSubmitBooking} 
          disabled={isSubmitting} 
          className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Processing...
            </>
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </div>
    </motion.div>
  );
};