import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { PageHeader } from "@/components/layout";
import { AppointmentDetailsDialog } from "@/features/appointments/AppointmentDetailsDialog";
import { CalendarLayout } from "@/features/admin/calendar/CalendarLayout";
import { getCalendarAppointments } from "@/api/services/appointmentService";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Appointment } from "@/types";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Staff as ApiStaff,
  Service as ApiService,
} from "@/api/services/appointmentService";
import { NewAppointmentDialog } from "@/features/appointments/NewAppointmentDialog";
import TimePicker from "@/components/ui/TimePicker";

export const AdminCalendar: React.FC = () => {
  // State for appointment details dialog
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  // simple cache: monthKey -> appointments array
  const [appointmentsCache, setAppointmentsCache] = useState<
    Record<string, Appointment[]>
  >({});
  const [staffList, setStaffList] = useState<ApiStaff[]>([]);
  const [serviceList, setServiceList] = useState<ApiService[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("all");
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] =
    useState(false);
  const [newAppointmentDate, setNewAppointmentDate] = useState<
    Date | undefined
  >();
  const [open, setOpen] = useState(false);

  // Memoized key representing the viewed month (YYYY-MM). When this changes we refetch.
  const monthKey = format(currentDate, "yyyy-MM");

  // Fetch appointments for the current month
  const fetchAppointments = async (force: boolean = false) => {
    // if we already have data cached for this month, use it immediately unless forced
    if (appointmentsCache[monthKey] && !force) {
      setAppointments(appointmentsCache[monthKey]);
      return; // optionally still fetch in background to refresh later
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get date range for the current month
      const startDate = format(startOfMonth(currentDate), "yyyy-MM-dd");
      const endDate = format(endOfMonth(currentDate), "yyyy-MM-dd");

      // Fetch appointments with date range filter using the new endpoint
      const response = await getCalendarAppointments(startDate, endDate);

      // Map the backend appointments to the frontend format
      const formattedAppointments: Appointment[] = response.appointments.map(
        (appointment) => ({
          id: appointment.id,
          customerId: appointment.customer_id,
          customerName: appointment.customer_name,
          customerPhone: appointment.customer_phone,
          customerEmail: appointment.customer_email,
          staffId: appointment.staff_id,
          staffName: appointment.staff_name,
          date: appointment.date,
          time: appointment.time,
          endTime: appointment.end_time,
          status: appointment.status,
          totalAmount: appointment.total_amount,
          notes: appointment.notes,
          createdAt: appointment.created_at || appointment.createdAt || "",
          updatedAt: appointment.updated_at || appointment.updatedAt || "",
          services:
            appointment.appointmentServices?.map((service) => ({
              serviceId: service.service_id,
              serviceName: service.service_name,
              price: service.price,
              duration: service.duration,
            })) || [],
            break: appointment.staff.breaks
        })
      );

      setAppointments(formattedAppointments);
      setStaffList(response.staff || []);
      setServiceList(response.services || []);
      // store in cache
      setAppointmentsCache((prev) => ({
        ...prev,
        [monthKey]: formattedAppointments,
      }));

      toast({
        title: "Appointments loaded",
        description: `${formattedAppointments.length
          } appointments found for ${format(currentDate, "MMMM yyyy")}`,
        variant: "default",
      });
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load appointments. Please try again.");
      toast({
        title: "Error loading appointments",
        description: "Could not fetch appointments from the server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch appointments when the component mounts or when the viewed month changes
  useEffect(() => {
    fetchAppointments();
  }, [monthKey]);

  const handleViewAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowAppointmentDetails(true);
  };

  const handleSelectDate = (date: Date) => {
    // Update the current date when a date is selected
    setCurrentDate(date);
    console.log("Selected date:", format(date, "yyyy-MM-dd"));
  };

  // Handle appointment status changes
  const handleAppointmentStatusChange = (
    appointmentId: string,
    newStatus: Appointment["status"]
  ) => {
    // Update the local state to reflect the status change
    setAppointments((prevAppointments) =>
      prevAppointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, status: newStatus }
          : appointment
      )
    );
  };

  const handleAddAppointment = (date: Date) => {
    setNewAppointmentDate(date);
    setShowNewAppointmentDialog(true);
  };

  const selectedAppointment = selectedAppointmentId
    ? appointments.find((app) => app.id === selectedAppointmentId)
    : null;

  const filteredAppointments =
    selectedStaffId === "all"
      ? appointments
      : appointments.filter((a) => a.staffId === selectedStaffId);


      

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="View and manage all appointments in a calendar view"
      />

      {error ? (
        <div className="bg-destructive/10 p-6 rounded-xl shadow-sm">
          <p className="text-destructive font-medium mb-3">{error}</p>
          <Button
            variant="outline"
            onClick={() => fetchAppointments(true)}
            className="rounded-md shadow-sm hover:shadow"
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="mb-6 relative">
          <div className="mb-4 overflow-x-auto pb-1 flex">
            <Tabs
              value={selectedStaffId}
              onValueChange={(value) => setSelectedStaffId(value)}
              className="w-full"
            >
              <TabsList className="inline-flex gap-1 bg-muted/20 p-1 rounded-xl shadow-sm min-w-max mx-auto">
                <TabsTrigger
                  value="all"
                  className="whitespace-nowrap px-4 py-2 text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-transparent hover:bg-primary/10 transition-colors"
                >
                  All Staff
                </TabsTrigger>
                {staffList.map((staff) => {
                  console.log('staff', staff)
                  return (<TabsTrigger
                    key={staff.id}
                    value={String(staff.id)}
                    className="whitespace-nowrap px-4 py-2 text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-transparent hover:bg-primary/10 transition-colors"
                  >
                    {staff.name}
                  </TabsTrigger>)
                })}
              </TabsList>
            </Tabs>
            <button
              onClick={() => setOpen(!open)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Break
            </button>

            <TimePicker
              staffId={selectedStaffId}
              open={open}
              onClose={() => setOpen(false)}
            />
          </div>
          {/* Calendar */}
          <CalendarLayout
            appointments={filteredAppointments}
            onSelectDate={handleSelectDate}
            onViewAppointment={handleViewAppointment}
            onAddAppointment={handleAddAppointment}
          />

          {/* Loading overlay - ensure it overlays calendar content correctly */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <div className="absolute inset-0 bg-background/60 rounded-xl" />
              <div className="relative z-50 flex flex-col items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                <span className="text-xs text-muted-foreground">Loading…</span>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          open={showAppointmentDetails}
          onOpenChange={(open) => {
            setShowAppointmentDetails(open);
            if (!open) {
              // After dialog actions, refresh to reflect changes in calendar cards
              fetchAppointments(true);
            }
          }}
          onStatusChange={(id, status) => {
            handleAppointmentStatusChange(id, status);
            // also refresh to ensure all derived views are in sync
            fetchAppointments(true);
          }}
          onAppointmentUpdated={() => fetchAppointments(true)}
        />
      )}

      <NewAppointmentDialog
        open={showNewAppointmentDialog}
        onOpenChange={setShowNewAppointmentDialog}
        selectedDate={newAppointmentDate}
        staffList={staffList}
        serviceList={serviceList}
        onAppointmentCreated={() => {
          setShowNewAppointmentDialog(false);
          fetchAppointments(true);
        }}
      />
    </div>
  );
};
