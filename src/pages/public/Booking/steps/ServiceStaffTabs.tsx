import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ServiceSelection } from './ServiceSelection';
import { StaffSelection } from './StaffSelection';
import { useBooking } from '../BookingContext';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ServiceStaffTabs: React.FC = () => {
  const { 
    selectedServices, 
    selectedStaffId, 
    setFirstSelection,
    setBookingFlow,
    setSelectedServices,
    setSelectedStaffId
  } = useBooking();
  const [activeTab, setActiveTab] = useState<string>("services");
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Handle tab selection
  const handleTabChange = (value: string) => {
    // Don't do anything if we're already on this tab
    if (value === activeTab) return;
    
    // If we have selections and are changing tabs, show confirmation
    if ((value === 'services' && selectedStaffId) || 
        (value === 'staff' && selectedServices.length > 0)) {
      setPendingTab(value);
      setShowConfirmation(true);
    } else {
      completeTabChange(value);
    }
  };

  // Completes the tab change after confirmation or when no confirmation is needed
  const completeTabChange = (value: string) => {
    if (value === 'services') {
      setFirstSelection('service');
      setSelectedStaffId(null); // Clear selected staff when switching to services tab
    } else if (value === 'staff') {
      setFirstSelection('staff');
      setSelectedServices([]); // Clear selected services when switching to staff tab
    }
    
    setActiveTab(value);
    setPendingTab(null);
    setShowConfirmation(false);
  };

  // Handle cancellation of tab change
  const handleCancelTabChange = () => {
    setPendingTab(null);
    setShowConfirmation(false);
  };

  // Set the booking flow when appropriate
  useEffect(() => {
    if (activeTab === 'services' && selectedServices.length > 0) {
      setBookingFlow('service-first');
    } else if (activeTab === 'staff' && selectedStaffId) {
      setBookingFlow('staff-first');
    }
  }, [activeTab, selectedServices, selectedStaffId, setBookingFlow]);

  // When there is a pre-selected staff or services (e.g., from navigation state), make sure the correct tab is active
  useEffect(() => {
    if (selectedStaffId && activeTab !== 'staff') {
      setActiveTab('staff');
    } else if (!selectedStaffId && selectedServices.length > 0 && activeTab !== 'services') {
      setActiveTab('services');
    }
    // We intentionally omit activeTab from deps to avoid infinite loop; only switch when selections change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStaffId, selectedServices.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Choose Your Booking Method</h2>
        <p className="text-muted-foreground">
          Select a service or choose your preferred staff member to start
        </p>
      </div>

      {showConfirmation && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Changing tabs will clear your current selections. Are you sure?
          </AlertDescription>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelTabChange}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => pendingTab && completeTabChange(pendingTab)}
            >
              Continue
            </Button>
          </div>
        </Alert>
      )}

      <div className="w-full">
        <div className="grid w-full grid-cols-2 rounded-lg border p-1 gap-1">
          <Button 
            variant={activeTab === "services" ? "default" : "ghost"} 
            onClick={() => handleTabChange("services")}
            className="w-full"
          >
            By Service {selectedServices.length > 0 && `(${selectedServices.length})`}
          </Button>
          <Button 
            variant={activeTab === "staff" ? "default" : "ghost"} 
            onClick={() => handleTabChange("staff")}
            className="w-full"
          >
            By Staff {selectedStaffId && '(1)'}
          </Button>
        </div>
        
        <div className="mt-6">
          {activeTab === "services" && <ServiceSelection />}
          {activeTab === "staff" && <StaffSelection />}
        </div>
      </div>
    </motion.div>
  );
}; 