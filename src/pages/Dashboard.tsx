import React, { useState, useEffect } from "react";
import { Calendar, DollarSign, BarChart, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import {
  AppointmentList,
  SimpleAppointment,
} from "@/components/dashboard/AppointmentList";
import { PerformanceTable } from "@/components/dashboard/PerformanceTable";
import { PageHeader } from "@/components/layout";
import { formatCurrency } from "@/utils";
import { useToast } from "@/hooks/use-toast";
import {
  ServicePerformance,
  StaffPerformance,
  RevenueData,
  Appointment,
} from "@/types";
import { useDashboard, DashboardPeriod } from "@/hooks/useDashboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { RescheduleAppointmentDialog } from "@/features/appointments/RescheduleAppointmentDialog";
import {
  getAdminAppointments,
  Appointment as ApiAppointment,
} from "@/api/services/appointmentService";
import { CompleteAppointmentDialog } from "@/features/appointments/CompleteAppointmentDialog";

export const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [period, setPeriod] = useState<DashboardPeriod>("weekly");
  const { dashboardData, isLoading, error, refetch } = useDashboard(period);
  const [cachedData, setCachedData] = useState<typeof dashboardData | null>(
    null
  );

  // State for today's appointments
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loadingTodayAppointments, setLoadingTodayAppointments] =
    useState(false);

  // State for upcoming appointments (to allow local patching without refetch)
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);

  // State for reschedule dialog
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] =
    useState<Appointment | null>(null);

  // State for complete dialog
  const [appointmentToComplete, setAppointmentToComplete] =
    useState<ApiAppointment | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  // Handle error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: `Failed to load dashboard data: ${error.message}`,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Handle period change
  const handlePeriodChange = (newPeriod: DashboardPeriod) => {
    setPeriod(newPeriod);
  };

  // Fetch today's appointments
  const fetchTodayAppointments = async () => {
    try {
      setLoadingTodayAppointments(true);
      const today = format(new Date(), "yyyy-MM-dd");
      const response = await getAdminAppointments(1, 100, "time_asc", today);

      // Convert API appointments to the format expected by AppointmentList
      const mappedAppointments: Appointment[] = response.appointments.map(
        (apt) => ({
          id: apt.id,
          customerId: apt.customer?.id || "",
          customerName: apt.customer?.name || "Unknown Customer",
          customerPhone: apt.customer?.phone || "",
          customerEmail: apt.customer?.email || undefined,
          staffId: apt.staff?.id || "",
          staffName: apt.staff?.user?.name || "Unknown Staff",
          date: apt.date,
          time: apt.time,
          endTime: apt.end_time || "",
          services:
            apt.appointmentServices?.map((s) => ({
              serviceId: s.service?.id || "",
              serviceName: s.service?.name || "",
              price: s.price || 0,
              duration: s.duration || 0,
            })) || [],
          status: (apt.status || "scheduled") as Appointment["status"],
          totalAmount: apt.total_amount || 0,
          notes: apt.notes,
          createdAt: apt.createdAt || new Date().toISOString(),
          updatedAt: apt.updatedAt || apt.createdAt || new Date().toISOString(),
        })
      );

      setTodayAppointments(mappedAppointments);
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load today's appointments",
        variant: "destructive",
      });
    } finally {
      setLoadingTodayAppointments(false);
    }
  };

  // Fetch today's appointments on initial load
  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  // Handle reschedule appointment
  const handleRescheduleAppointment = (appointment: SimpleAppointment) => {
    // Convert SimpleAppointment to Appointment if needed
    const fullAppointment: Appointment = {
      id: appointment.id,
      customerId: appointment.customerId,
      customerName: appointment.customerName,
      customerPhone: appointment.customerPhone,
      customerEmail: appointment.customerEmail,
      staffId: appointment.staffId,
      staffName: appointment.staffName,
      date: appointment.date,
      time: appointment.time,
      endTime: appointment.endTime,
      services: appointment.services,
      status: appointment.status,
      totalAmount: appointment.totalAmount,
      notes: appointment.notes,
      createdAt: appointment.createdAt || new Date().toISOString(),
      updatedAt: appointment.updatedAt || new Date().toISOString(),
    };

    setAppointmentToReschedule(fullAppointment);
    setShowRescheduleDialog(true);
  };

  // Handle reschedule complete
  const handleRescheduleComplete = (updatedAppointment: ApiAppointment) => {
    // Refresh data after rescheduling
    Promise.all([refetch(), fetchTodayAppointments()]);

    toast({
      title: "Appointment Rescheduled",
      description: `Appointment for ${updatedAppointment.customer_name} has been rescheduled.`,
    });
  };

  // Handle complete done
  const handleCompleteDone = (updatedAppt: ApiAppointment) => {
    // Transform API appointment into UI format matching todayAppointments
    const transformed: Appointment = {
      id: updatedAppt.id,
      customerId: updatedAppt.customer_id || updatedAppt.customer?.id || "",
      customerName:
        updatedAppt.customer_name ||
        updatedAppt.customer?.name ||
        "Unknown Customer",
      customerPhone:
        updatedAppt.customer_phone || updatedAppt.customer?.phone || "",
      customerEmail:
        updatedAppt.customer_email || updatedAppt.customer?.email || undefined,
      staffId: updatedAppt.staff_id || updatedAppt.staff?.id || "",
      staffName:
        updatedAppt.staff_name ||
        updatedAppt.staff?.user?.name ||
        "Unknown Staff",
      date: updatedAppt.date,
      time: updatedAppt.time,
      endTime: updatedAppt.end_time || "",
      services: (updatedAppt.appointmentServices || []).map((s) => ({
        serviceId: s.service_id,
        serviceName: s.service_name,
        price: s.price,
        duration: s.duration,
      })),
      status: updatedAppt.status as Appointment["status"],
      totalAmount: updatedAppt.total_amount || 0,
      notes: updatedAppt.notes,
      createdAt:
        updatedAppt.created_at ||
        updatedAppt.createdAt ||
        new Date().toISOString(),
      updatedAt:
        updatedAppt.updated_at ||
        updatedAppt.updatedAt ||
        new Date().toISOString(),
    };

    // Update todayAppointments state (and any other local lists in future)
    setTodayAppointments((prev) =>
      prev.map((appt) => (appt.id === transformed.id ? transformed : appt))
    );

    // TODO: If the appointment belongs to upcoming list, we could patch cachedData too.

    setShowCompleteDialog(false);
    setAppointmentToComplete(null);
  };

  // keep last successful payload to avoid UI blink
  useEffect(() => {
    if (!isLoading && dashboardData) {
      setCachedData(dashboardData);
    }
  }, [isLoading, dashboardData]);

  const dataToShow = cachedData ?? dashboardData;

  // Build chart data with fallback zero point to keep chart visible
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const appointmentStats = dataToShow?.appointmentStats ?? [];
  const revenueStats = dataToShow?.revenueStats ?? [];

  const appointmentChartData: RevenueData[] = (
    appointmentStats.length ? appointmentStats : [{ date: todayStr, count: 0 }]
  ).map((stat) => ({
    date: stat.date,
    revenue: stat.count, // Using revenue field to store appointment count
  }));

  const revenueChartData: RevenueData[] = (
    revenueStats.length ? revenueStats : [{ date: todayStr, revenue: "0" }]
  ).map((stat: { date: string; revenue?: string }) => ({
    date: stat.date,
    revenue: parseFloat(stat.revenue ?? "0"),
  }));

  // Map top services for the performance table
  const servicePerformanceData: ServicePerformance[] =
    dataToShow?.topServices?.map((service) => ({
      id: service.service_id || `service-${service.service_name}`,
      name: service.service_name,
      bookings: service.bookings,
      revenue: parseFloat(service.revenue || "0"),
    })) || [];

  // Map top staff for the performance table
  const staffPerformanceData: StaffPerformance[] =
    dataToShow?.topStaff?.map((staff) => ({
      id: staff.staff_id || `staff-${staff.staff_name}`,
      name: staff.staff_name,
      appointments: staff.appointments,
      revenue: parseFloat(staff.revenue || "0"),
      commissionEarned: 0, // Not provided in API, could be calculated if needed
    })) || [];

  // Convert API appointments to the format expected by AppointmentList
  const mappedAppointments: Appointment[] =
    dataToShow?.upcomingAppointments?.map((apt) => ({
      id: apt.id,
      customerId: apt.customer?.id || "",
      customerName: apt.customer?.name || "Unknown Customer",
      customerPhone: apt.customer?.phone || "",
      customerEmail: apt.customer?.email || undefined,
      staffId: apt.staff?.id || "",
      staffName: apt.staff?.user?.name || "Unknown Staff",
      date: apt.date,
      time: apt.time,
      endTime: apt.end_time || "",
      services:
        apt.appointmentServices?.map((s) => ({
          serviceId: s.service?.id || "",
          serviceName: s.service?.name || "",
          price: s.price || 0,
          duration: s.duration || 0,
        })) || [],
      status: (apt.status || "scheduled") as Appointment["status"],
      totalAmount: apt.total_amount || 0,
      notes: apt.notes,
      createdAt: apt.createdAt || new Date().toISOString(),
      updatedAt: apt.updatedAt || apt.createdAt || new Date().toISOString(),
    })) || [];

  // Keep upcomingAppointments in sync when server data changes
  useEffect(() => {
    setUpcomingAppointments(mappedAppointments);
  }, []);

  if (isLoading && !dataToShow) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Loading dashboard..."
          description="Please wait while we load your dashboard data"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-6 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, idx) => (
            <Card key={idx}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((__, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your barber shop business"
      />

      {dataToShow && (
        <>
          {/* Appointments Sections - Moved to the top */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Appointments */}
            <div>
              <AppointmentList
                title="Today's Appointments"
                appointments={todayAppointments}
                showActions={true}
                allowCompletion={true}
                onRefresh={fetchTodayAppointments}
                onReschedule={handleRescheduleAppointment}
                onCompleteAppointment={(appt) => {
                  setAppointmentToComplete(appt as unknown as ApiAppointment);
                  setShowCompleteDialog(true);
                }}
              />
              {loadingTodayAppointments && (
                <div className="flex justify-center items-center h-20">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Upcoming Appointments */}
            <div>
              <AppointmentList
                title="Upcoming Appointments"
                appointments={upcomingAppointments}
                showActions={true}
                allowCompletion={false}
                onRefresh={refetch}
                onReschedule={handleRescheduleAppointment}
                onStatusPatched={(id, status) => {
                  setUpcomingAppointments((prev) =>
                    prev.map((a) => (a.id === id ? { ...a, status } : a))
                  );

                  // Also update cached dashboard data so later re-renders keep the new status
                  setCachedData((prev) => {
                    if (!prev) return prev;
                    const updatedUpcoming =
                      prev.upcomingAppointments?.map((a) =>
                        a.id === id ? { ...a, status } : a
                      ) || [];
                    return {
                      ...prev,
                      upcomingAppointments: updatedUpcoming,
                    } as typeof prev;
                  });
                }}
                onCompleteAppointment={(appt) => {
                  setAppointmentToComplete(appt as unknown as ApiAppointment);
                  setShowCompleteDialog(true);
                }}
              />
            </div>
          </div>

          {/* Calculate tip percentage with proper type handling */}
          {(() => {
            const tipPercentage = dataToShow.summary?.avgTipPercentage;
            const formattedTipPercentage =
              typeof tipPercentage === "number"
                ? tipPercentage.toFixed(1)
                : typeof tipPercentage === "string"
                ? Number(parseFloat(tipPercentage)).toFixed(1)
                : "0.0";

            return (
              /* Stats Cards Row */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <StatsCard
                  title="Total Revenue"
                  value={formatCurrency(
                    parseFloat(dataToShow.summary.totalRevenue || "0")
                  )}
                  icon={<DollarSign className="h-4 w-4" />}
                  description="period revenue"
                  trend={{ value: 0, positive: true }}
                />
                <StatsCard
                  title="Appointments"
                  value={(dataToShow.summary.appointmentCount || 0).toString()}
                  icon={<Calendar className="h-4 w-4" />}
                  description="total appointments"
                  trend={{ value: 0, positive: true }}
                />
                <StatsCard
                  title="Customers"
                  value={(dataToShow.summary.customerCount || 0).toString()}
                  icon={<DollarSign className="h-4 w-4" />}
                  description="total customers"
                  trend={{ value: 0, positive: true }}
                />
                <StatsCard
                  title="Tips Received"
                  value={formatCurrency(
                    parseFloat(dataToShow.summary.totalTips || "0")
                  )}
                  icon={<DollarSign className="h-4 w-4" />}
                  description={`${formattedTipPercentage}% average`}
                  trend={{ value: 0, positive: true }}
                />
              </div>
            );
          })()}

          {/* Period selection */}
          <Tabs
            defaultValue={period}
            onValueChange={(value) =>
              handlePeriodChange(value as DashboardPeriod)
            }
            className="mt-6"
          >
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Charts Row (rendered once, driven by selected period) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <RevenueChart
              title="Appointments Over Time"
              data={appointmentChartData}
              className="col-span-1"
              loading={isLoading && !!cachedData}
              yAxisFormatter={(v) => `${v}`}
              valueFormatter={(v) => `${v}`}
              tooltipName="Appointments"
            />
            <RevenueChart
              title="Revenue Over Time"
              data={revenueChartData}
              className="col-span-1"
              loading={isLoading && !!cachedData}
            />
          </div>

          {/* Performance Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            <PerformanceTable
              title="Top Services"
              data={servicePerformanceData.slice(0, 5)}
              type="service"
              className="lg:col-span-6"
              loading={isLoading && !!cachedData}
            />
            <PerformanceTable
              title="Top Staff"
              data={staffPerformanceData.slice(0, 5)}
              type="staff"
              className="lg:col-span-6"
              loading={isLoading && !!cachedData}
            />
          </div>

          {/* Status Distribution */}
          <div className="mt-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">
                Appointment Status Distribution
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {dataToShow.appointmentStatusDistribution.map((status) => (
                  <StatsCard
                    key={status.status}
                    title={
                      status.status.charAt(0).toUpperCase() +
                      status.status.slice(1)
                    }
                    value={status.count.toString()}
                    icon={<BarChart className="h-4 w-4" />}
                    description="appointments"
                    trend={{ value: 0, positive: true }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Reschedule Dialog */}
          {appointmentToReschedule && (
            <RescheduleAppointmentDialog
              appointment={appointmentToReschedule}
              open={showRescheduleDialog}
              onOpenChange={setShowRescheduleDialog}
              onRescheduleComplete={handleRescheduleComplete}
            />
          )}

          {/* Complete Dialog */}
          {appointmentToComplete && (
            <CompleteAppointmentDialog
              appointment={appointmentToComplete}
              open={showCompleteDialog}
              onOpenChange={setShowCompleteDialog}
              onCompleted={handleCompleteDone}
            />
          )}
        </>
      )}
    </div>
  );
};
