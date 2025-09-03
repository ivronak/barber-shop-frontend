import React, { useState } from 'react';
import { PageHeader } from '@/components/layout';
import { appointmentData } from '@/mocks';
import { AppointmentDetailsDialog } from '@/features/appointments/AppointmentDetailsDialog';
import { CalendarLayout } from '@/features/admin/calendar/CalendarLayout';

export const BillingCalendar: React.FC = () => {
  // State for appointment details dialog
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);

  const handleViewAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowAppointmentDetails(true);
  };

  const handleSelectDate = (date: Date) => {
    // This could be used to focus the calendar on this date
    console.log('Selected date:', date);
  };

  const selectedAppointment = selectedAppointmentId 
    ? appointmentData.find(app => app.id === selectedAppointmentId) 
    : null;

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Calendar"
        description="View and manage all appointments in a calendar view"
      />
      
      <div className="bg-card border rounded-lg">
        <CalendarLayout 
          appointments={appointmentData}
          onSelectDate={handleSelectDate}
          onViewAppointment={handleViewAppointment}
        />
      </div>
      
      {selectedAppointment && (
        <AppointmentDetailsDialog 
          appointment={selectedAppointment}
          open={showAppointmentDetails}
          onOpenChange={setShowAppointmentDetails}
        />
      )}
    </div>
  );
}; 