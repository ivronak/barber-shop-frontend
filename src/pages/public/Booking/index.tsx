import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookingProvider, useBooking } from './BookingContext';
import { ServiceStaffTabs } from './steps/ServiceStaffTabs';
import { SecondSelectionStep } from './steps/SecondSelectionStep';
import { DateTimeSelection } from './steps/DateTimeSelection';
import { CustomerDetails } from './steps/CustomerDetails';
import { BookingConfirmation } from './steps/BookingConfirmation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, Info, Scissors, Users } from 'lucide-react';
import { formatCurrency } from '@/utils';
import { useLocation } from 'react-router-dom';
import { Service } from '@/types';

const BookingContent: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { 
    selectedServices, 
    totalPrice, 
    bookingFlow, 
    setBookingFlow,
    selectedStaffId,
    selectedDate,
    selectedTime,
    customerDetails,
    setSelectedStaffId,
    setSelectedStaffName,
    setSelectedStaffPosition,
    setSelectedServices,
    setFirstSelection
  } = useBooking();

  // Access router state to preselect staff (if coming from Barbers page)
  const location = useLocation();

  useEffect(() => {
    if (!selectedStaffId && location.state && typeof location.state === 'object') {
      const { staffId, staffName, staffPosition } = location.state as Record<string, string>;
      if (staffId) {
        setSelectedStaffId(staffId);
        if (staffName) setSelectedStaffName(staffName);
        if (staffPosition) setSelectedStaffPosition(staffPosition);
        setFirstSelection('staff');
        setBookingFlow('staff-first');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, selectedStaffId]);

  // Preselect services if coming from Services page
  useEffect(() => {
    if (selectedServices.length === 0 && location.state && typeof location.state === 'object') {
      const { services } = location.state as { services?: Service[] };
      if (services && services.length > 0) {
        setSelectedServices(services);
        setFirstSelection('service');
        setBookingFlow('service-first');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, selectedServices.length]);

  // Scroll to top when step changes (all viewports)
  useEffect(() => {
    // Give the DOM a moment to render the next step before scrolling
    const id = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
    return () => clearTimeout(id);
  }, [currentStep]);

  const steps = [
    { 
      id: 'selection', 
      title: 'Choose Booking Method', 
      icon: Scissors, 
      component: ServiceStaffTabs
    },
    { 
      id: 'second-selection', 
      title: bookingFlow === 'service-first' ? 'Choose Staff' : 'Choose Services',
      icon: Users, 
      component: SecondSelectionStep 
    },
    { 
      id: 'datetime', 
      title: 'Pick Date & Time', 
      icon: Calendar, 
      component: DateTimeSelection 
    },
    { 
      id: 'details', 
      title: 'Your Details', 
      icon: Info, 
      component: CustomerDetails 
    },
    { 
      id: 'confirm', 
      title: 'Confirm', 
      icon: CheckCircle2, 
      component: BookingConfirmation 
    },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    // On the customer details step we need to ensure we validate using the *latest* input values,
    // even if React state has not yet re-rendered. We grab the values straight from the DOM.
    const immediateValidation = () => {
      if (currentStep !== 3) {
        return canProceed();
      }

      const phoneInput = document.getElementById('phone') as HTMLInputElement | null;
      const nameInput = document.getElementById('name') as HTMLInputElement | null;
      const emailInput = document.getElementById('email') as HTMLInputElement | null;

      const name = nameInput?.value.trim() || '';
      const phoneDigits = (phoneInput?.value || '').replace(/\D/g, '');
      const email = emailInput?.value.trim() || '';

      const nameValid = name !== '';
      const phoneValid = phoneDigits.length === 10;
      const emailValid = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      return nameValid && phoneValid && emailValid;
    };

    setTimeout(() => {
      if (currentStep < steps.length - 1 && immediateValidation()) {
        setCurrentStep((prev) => prev + 1);
      }
    }, 0);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      if (currentStep === 1) {
        setBookingFlow(null);
      }
      setCurrentStep(currentStep - 1);
    }
  };

  // Determine if we can proceed to next step based on current step
  const canProceed = () => {
    switch(currentStep) {
      case 0: // ServiceStaffTabs
        return (bookingFlow === 'service-first' && selectedServices.length > 0) ||
               (bookingFlow === 'staff-first' && selectedStaffId);
      case 1: // SecondSelectionStep
        return (bookingFlow === 'service-first' && selectedStaffId) ||
               (bookingFlow === 'staff-first' && selectedServices.length > 0);
      case 2: // DateTimeSelection
        return selectedDate && selectedTime;
      case 3: // CustomerDetails
        {
          const nameValid = customerDetails.name.trim() !== '';
          // Allow only numeric digits and require exactly 10
          const phoneDigits = customerDetails.phone.replace(/\D/g, '');
          const phoneValid = phoneDigits.length === 10;
          // Email is optional but if provided must be valid
          const emailTrimmed = customerDetails.email.trim();
          const emailValid = emailTrimmed === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
          return nameValid && phoneValid && emailValid;
        }
      case 4: // BookingConfirmation
        return true;
      default:
        return false;
    }
  };

  // Get summary text for selected booking details
  const getBookingSummary = () => {
    const summary = [];
    
    if (selectedServices.length > 0) {
      summary.push(`${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''}`);
    }
    
    if (selectedStaffId) {
      summary.push('1 staff');
    }
    
    if (selectedDate && selectedTime) {
      summary.push('appointment time');
    }
    
    if (summary.length === 0) {
      return "No selections yet";
    }
    
    return summary.join(', ') + (totalPrice > 0 ? ` · ${formatCurrency(totalPrice)}` : '');
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 md:py-8 px-4 md:px-6 pb-24">
      <section className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">Book an Appointment</h1>
          <p className="text-muted-foreground text-lg">
            Schedule your next visit with us
          </p>
        </div>

        {/* Desktop Step Indicators */}
        <div className="hidden md:block relative mb-8">
          <div className="absolute left-0 top-[38px] w-full">
            <div className="h-1 bg-muted w-full absolute"></div>
            <motion.div 
              className="h-1 bg-primary absolute"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            ></motion.div>
          </div>
          
          <div className="flex items-center justify-between relative w-full">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isClickable = index <= currentStep;
              
              return (
                <motion.div
                  key={step.id}
                  className={`flex flex-col items-center relative z-10 ${
                    isActive ? 'text-primary' :
                    isCompleted ? 'text-primary' :
                    'text-muted-foreground'
                  }`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => isClickable && setCurrentStep(index)}
                  style={{ cursor: isClickable ? 'pointer' : 'default' }}
                >
                  <div className="mb-2 px-1.5 py-1 rounded-full bg-background">
                    <motion.div
                      className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-sm ${
                        isActive
                          ? 'border-primary bg-primary/10 text-primary'
                          : isCompleted
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted bg-muted/20'
                      }`}
                      whileHover={isClickable ? { scale: 1.05, boxShadow: '0 0 0 4px rgba(var(--primary), 0.2)' } : {}}
                      whileTap={isClickable ? { scale: 0.98 } : {}}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <>
                          <StepIcon className="h-6 w-6" />
                          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                            {index + 1}
                          </span>
                        </>
                      )}
                    </motion.div>
                  </div>
                  
                  <div className="text-center space-y-1">
                    <span className="text-sm font-medium block">{step.title}</span>
                    <span className="text-xs text-muted-foreground block">
                      {index === 0 ? 'Start' :
                        index === steps.length - 1 ? 'Finish' :
                        `Step ${index + 1}`}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile Step Indicator */}
        <div className="md:hidden mb-6 px-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {currentStep + 1}
              </div>
              <span className="font-medium">{steps[currentStep].title}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        <div className="relative">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-card border rounded-lg p-4 sm:p-5 md:p-6"
          >
            <div className="space-y-6">
              <CurrentStepComponent />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sticky Navigation Footer */}
      {currentStep < steps.length - 1 && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4 z-50"
        >
          <div className="container max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
              <div className="w-full sm:flex-1">
                <div className="text-sm font-medium">Booking Summary</div>
                <p className="text-muted-foreground text-sm">{getBookingSummary()}</p>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 sm:flex-initial"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                
                <Button 
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 sm:flex-initial"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export const Booking: React.FC = () => {
  const location = useLocation();
  return (
    <BookingProvider key={location.key}>
      <BookingContent />
    </BookingProvider>
  );
};