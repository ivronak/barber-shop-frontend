import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout';
import { CalendarLayout } from '@/features/admin/calendar/CalendarLayout';
import { AppointmentDetailsDialog } from '@/features/appointments/AppointmentDetailsDialog';
import { NewAppointmentDialog } from '@/features/appointments/NewAppointmentDialog';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getStaffAppointments, updateAppointmentStatus } from '@/api/services/appointmentService';
import { Appointment as ApiAppointment, Service, Staff as ApiStaff } from '@/api/services/appointmentService';
import { getBookingStaff } from '@/api/services/bookingService';
import { useAuth } from '@/lib/auth';
import { Appointment as UIAppointment } from '@/types';
import { Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export const StaffCalendar: React.FC = () => {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [newAppointmentDate, setNewAppointmentDate] = useState<Date | undefined>();
  const monthKey = format(currentDate, 'yyyy-MM');
  const [appointmentsCache, setAppointmentsCache] = useState<Record<string, UIAppointment[]>>({});
  const [staffAppointments, setStaffAppointments] = useState<UIAppointment[]>([]);
  const [staffData, setStaffData] = useState<{
    appointments: ApiAppointment[];
    services: Service[];
    totalCount: number;
  } | null>(null);
  const [staffList, setStaffList] = useState<ApiStaff[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch all appointments for the staff member
  const fetchStaffAppointments = async (forceRefresh = false) => {
    // check cache first unless forced
    if (!forceRefresh && appointmentsCache[monthKey]) {
      setStaffAppointments(appointmentsCache[monthKey]);
      return;
    }

    try {
      setIsLoading(true);
      const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      const response = await getStaffAppointments(1, 1000, 'date_asc', startDate, endDate);
      
      if (response.success) {
        setStaffData({
          appointments: response.appointments,
          services: response.services,
          totalCount: response.totalCount
        });
        // convert and cache
        const converted = response.appointments.map(convertApiToUIAppointment);
        setStaffAppointments(converted);
         setAppointmentsCache(prev => ({ ...prev, [monthKey]: converted }));
      } else {
        toast({
          title: 'Error',
        description: 'Failed to load appointments',
          variant: 'destructive'
        });
      }
    } catch (error) {
       console.error('Error fetching staff appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointments. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when month changes
  useEffect(() => {
    fetchStaffAppointments();
  }, [monthKey]);

  // Fetch staff list for NewAppointment dialog
  useEffect(() => {
    (async () => {
      try {
        const res = await getBookingStaff();
        if (res.success) {
          const mapped: ApiStaff[] = res.staff.map((s) => ({
            id: s.id,
            name: s.name,
            email: '',
            phone: '',
            position: s.position || '',
            avatar: null,
          }));
          setStaffList(mapped);
        }
      } catch (e) {
        // ignore silently; dialog can still fetch filtered staff on service change
      }
    })();
  }, []);

  const handleViewAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setIsDetailsOpen(true);
  };

  const handleSelectDate = (date: Date) => {
    setCurrentDate(date);
  };

  const handleAddAppointment = (date: Date) => {
    setNewAppointmentDate(date);
    setShowNewAppointmentDialog(true);
  };

  // Handle appointment status change
  const handleStatusChange = async (appointmentId: string, newStatus: UIAppointment['status']) => {
    try {
      // Optimistically update the UI first
      if (staffData) {
        const updatedAppointments = staffData.appointments.map(app => {
          if (app.id === appointmentId) {
            return { ...app, status: newStatus };
          }
          return app;
        });
        
        // Update the UI immediately
        setStaffData({
          ...staffData,
          appointments: updatedAppointments
        });
      }
      
      // Then make the API call
      await updateAppointmentStatus(appointmentId, newStatus);
      
      toast({
        title: 'Status Updated',
        description: `Appointment status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      
      // If there was an error, refresh the data to get back to a consistent state
      fetchStaffAppointments();
      
      toast({
        title: 'Error',
        description: 'Failed to update appointment status. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Convert API appointments to UI format for the appointment list
  const convertApiToUIAppointment = (apiAppointment: ApiAppointment): UIAppointment => {
    return {
      id: apiAppointment.id,
      customerId: apiAppointment.customer_id,
      customerName: apiAppointment.customer_name,
      customerPhone: apiAppointment.customer_phone,
      customerEmail: apiAppointment.customer_email || '',
      staffId: apiAppointment.staff_id,
      staffName: apiAppointment.staff_name,
      date: apiAppointment.date,
      time: apiAppointment.time,
      endTime: apiAppointment.end_time || calculateEndTime(apiAppointment),
      status: apiAppointment.status,
      services: apiAppointment.appointmentServices ? apiAppointment.appointmentServices.map(service => ({
        serviceId: service.service_id,
        serviceName: service.service_name,
        price: service.price,
        duration: service.duration
      })) : [],
      totalAmount: apiAppointment.total_amount,
      notes: apiAppointment.notes || '',
      createdAt: apiAppointment.created_at || new Date().toISOString(),
      updatedAt: apiAppointment.updated_at || new Date().toISOString()
    };
  };

  // Helper to calculate end time if not provided by API
  const calculateEndTime = (appointment: ApiAppointment): string => {
    const services = appointment.appointmentServices || appointment.services || [];
    const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
    const [hours, minutes] = appointment.time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + totalDuration;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  const selectedAppointment = selectedAppointmentId 
    ? staffAppointments.find(app => app.id === selectedAppointmentId) 
    : null;

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="My Calendar"
        description="View and manage your schedule"
      />

      <Card className="p-0">
        <div className="relative">
          <CalendarLayout
            appointments={staffAppointments}
            onSelectDate={handleSelectDate}
            onViewAppointment={handleViewAppointment}
            onAddAppointment={handleAddAppointment}
          />

          {isLoading && (
            <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center rounded-xl">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
              <span className="text-xs text-muted-foreground">Loading…</span>
            </div>
          )}
        </div>
      </Card>

      {selectedAppointment && (
        <AppointmentDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          appointment={selectedAppointment}
          isStaffView={true}
          onStatusChange={handleStatusChange}
        />
      )}

      <NewAppointmentDialog
        open={showNewAppointmentDialog}
        onOpenChange={setShowNewAppointmentDialog}
        selectedDate={newAppointmentDate}
        staffList={staffList}
        serviceList={staffData?.services ?? []}
        disableStaffSelection={true}
        lockedStaffId={user?.staff?.id}
        onAppointmentCreated={() => {
          setShowNewAppointmentDialog(false);
          // Invalidate cache for current month and force refetch to reflect the new appointment
          setAppointmentsCache(prev => {
            const copy = { ...prev };
            delete copy[monthKey];
            return copy;
          });
          fetchStaffAppointments(true);
        }}
      />
    </div>
  );
}; 