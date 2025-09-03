import React, { useEffect, useState } from 'react';
import { Calendar, Clock, DollarSign, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils';
import { getStaffDashboardData, StaffDashboardData, UpcomingAppointment } from '@/api/services/dashboardService';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { AppointmentList, SimpleAppointment } from '@/components/dashboard/AppointmentList';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { RescheduleAppointmentDialog } from '@/features/appointments/RescheduleAppointmentDialog';
import { CompleteAppointmentDialog } from '@/features/appointments/CompleteAppointmentDialog';
import { Appointment } from '@/types';
import { Appointment as ApiAppointment } from '@/api/services/appointmentService';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { StaffMobileDashboard } from './StaffMobileDashboard';

const StaffDashboardDesktop: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<StaffDashboardData | null>(null);
  const [cachedData, setCachedData] = useState<StaffDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State for reschedule dialog
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<Appointment | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [appointmentToComplete, setAppointmentToComplete] = useState<ApiAppointment | null>(null);

  // Local copies of simplified appointments for instant UI updates
  const [todaySimpleAppts, setTodaySimpleAppts] = useState<SimpleAppointment[]>([]);
  const [upcomingSimpleAppts, setUpcomingSimpleAppts] = useState<SimpleAppointment[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getStaffDashboardData(period);
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        setError(response.message || 'Failed to load dashboard data');
        toast({
          title: "Error",
          description: response.message || "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error('Error fetching dashboard data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data. Please try again later.';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);
  
  // Cache the last successful payload to avoid UI blink on refresh actions
  useEffect(() => {
    if (!loading && dashboardData) {
      setCachedData(dashboardData);
    }
  }, [loading, dashboardData]);

  // Sync simplified appointment arrays whenever fresh dashboard data arrives
  useEffect(() => {
    if (!dashboardData) return;
    const convert = convertToSimpleAppointment; // alias
    const todaySimples = (dashboardData.todayAppointments || []).map(convert);

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const upcomingSimples = (dashboardData.upcomingAppointments || [])
      .filter(a => a.date !== todayStr)
      .map(convert);

    setTodaySimpleAppts(todaySimples);
    setUpcomingSimpleAppts(upcomingSimples);
  }, [dashboardData]);

  // Handle reschedule appointment
  const handleRescheduleAppointment = (appointment: SimpleAppointment) => {
    // Convert SimpleAppointment to Appointment
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
      updatedAt: appointment.updatedAt || new Date().toISOString()
    };
    
    setAppointmentToReschedule(fullAppointment);
    setShowRescheduleDialog(true);
  };

  // Handle reschedule complete
  const handleRescheduleComplete = (updatedAppointment: ApiAppointment) => {
    // Refresh data after rescheduling
    fetchDashboardData();
    
    toast({
      title: 'Appointment Rescheduled',
      description: `Appointment for ${updatedAppointment.customer_name} has been rescheduled.`
    });
  };

  // Handle complete done
  const handleCompleteDone = (updated: ApiAppointment) => {
    // Patch local states to reflect completed status instantly
    const patch = (arr: SimpleAppointment[]) => arr.map(a => a.id === updated.id ? { ...a, status: updated.status as SimpleAppointment['status'] } : a);
    setTodaySimpleAppts(prev => patch(prev));
    setUpcomingSimpleAppts(prev => patch(prev));

    // Update cachedData so future renders preserve state
    setCachedData(prev => {
      if (!prev) return prev;
      const patchApi = (list: UpcomingAppointment[]|undefined) => (list||[]).map(a => a.id === updated.id ? { ...a, status: updated.status } : a);
      return {
        ...prev,
        todayAppointments: patchApi(prev.todayAppointments),
        upcomingAppointments: patchApi(prev.upcomingAppointments)
      } as StaffDashboardData;
    });

    setShowCompleteDialog(false);
    setAppointmentToComplete(null);
  };

  // Handle complete appointment open
  const handleCompleteAppointment = (appointment: SimpleAppointment) => {
    // Find full appointment if available
    const source = dashboardData?.todayAppointments.concat(dashboardData?.upcomingAppointments || []) || [];
    const found = source.find(a => a.id === appointment.id);
    if (found) {
      setAppointmentToComplete(found as unknown as ApiAppointment);
    } else {
      setAppointmentToComplete({ id: appointment.id } as unknown as ApiAppointment);
    }
    setShowCompleteDialog(true);
  };

  if (loading && !cachedData) {
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
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Dashboard Error"
          description="There was a problem loading your dashboard data"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            {error === 'Staff ID not found for current user' && (
              <>
                <br />
                <br />
                This could be because your user account is not properly linked to a staff profile.
                Please contact an administrator to fix this issue.
              </>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const dataToShow = dashboardData || cachedData;

  if (!dataToShow) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Dashboard Error"
          description="Could not load dashboard data. Please try again later."
        />
      </div>
    );
  }

  const { staffInfo, performanceSummary } = dataToShow;
  
  // Get today's appointments count for stats card
  const todayAppointmentsCount = todaySimpleAppts.length;

  // Convert API appointments to the format expected by AppointmentList component
  const convertToSimpleAppointment = (appointment: UpcomingAppointment): SimpleAppointment => {
    return {
      id: appointment.id,
      customerId: appointment.customer.id,
      customerName: appointment.customer.name,
      customerPhone: appointment.customer.phone || '',
      customerEmail: appointment.customer.email || '',
      staffId: staffInfo.id,
      staffName: staffInfo.name,
      date: appointment.date,
      time: appointment.time,
      endTime: appointment.time, // Using time as endTime if not available
      status: appointment.status as 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show',
      services: appointment.appointmentServices.map(service => ({
        serviceId: service.service_id,
        serviceName: service.service_name,
        price: service.price,
        duration: service.duration
      })),
      totalAmount: appointment.appointmentServices.reduce((sum, service) => sum + service.price, 0),
      notes: ''
    };
  };

  const handleViewAllAppointments = () => {
    navigate('/staff/appointments');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader 
          title={`Welcome, ${staffInfo.name}`}
          description="Overview of your performance"
        />
        <div className="flex items-center gap-2">
          <Tabs defaultValue={period} onValueChange={(value) => setPeriod(value as 'weekly' | 'monthly' | 'yearly')}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="weekly">Week</TabsTrigger>
              <TabsTrigger value="monthly">Month</TabsTrigger>
              <TabsTrigger value="yearly">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Appointments Sections - moved above stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div>
          <AppointmentList 
            title="Today's Appointments"
            appointments={todaySimpleAppts}
            className=""
            showActions={true}
            allowCompletion={true}
            onStatusPatched={(id, status) => {
              setTodaySimpleAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            }}
            onReschedule={handleRescheduleAppointment}
            onCompleteAppointment={handleCompleteAppointment}
          />
          {todaySimpleAppts.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleViewAllAppointments}>
                View All Appointments
              </Button>
            </div>
          )}
        </div>
        
        {/* Upcoming Appointments */}
        <div>
          <AppointmentList 
            title="Upcoming Appointments"
            appointments={upcomingSimpleAppts}
            className=""
            showActions={true}
            allowCompletion={false}
            onReschedule={handleRescheduleAppointment}
            onStatusPatched={(id, status) => {
              setUpcomingSimpleAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            }}
          />
          {upcomingSimpleAppts.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleViewAllAppointments}>
                View All Appointments
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Appointments"
          value={todayAppointmentsCount.toString()}
          icon={<Calendar className="h-4 w-4" />}
          description="Scheduled for today"
        />
        <StatsCard
          title="Total Appointments"
          value={performanceSummary.totalAppointments.toString()}
          icon={<Users className="h-4 w-4" />}
          description={`For ${period} period`}
        />
        <StatsCard
          title="Commission Rate"
          value={`${staffInfo.commissionPercentage}%`}
          icon={<Clock className="h-4 w-4" />}
          description="Current rate"
        />
        <StatsCard
          title="Total Earnings"
          value={formatCurrency(performanceSummary.totalCommission)}
          icon={<DollarSign className="h-4 w-4" />}
          description={`For ${period} period`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
          </CardHeader>
          <CardContent>
            {dataToShow.serviceBreakdown.length > 0 ? (
              <ul className="space-y-4">
                {dataToShow.serviceBreakdown.map((service) => (
                  <li key={service.service_id} className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">{service.service_name}</span>
                    <div className="flex gap-4">
                      <span className="text-muted-foreground">{service.bookings} bookings</span>
                      <span className="font-semibold">{formatCurrency(service.revenue)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No service data available
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {dataToShow.staffReviews.length > 0 ? (
              <ul className="space-y-4">
                {dataToShow.staffReviews.map((review) => (
                  <li key={review.id} className="border-b pb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{review.customer.name}</span>
                      <div className="flex items-center">
                        <span className="font-bold mr-1">{review.rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No reviews available
              </p>
            )}
          </CardContent>
        </Card>
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

      {appointmentToComplete && (
        <CompleteAppointmentDialog
          appointment={appointmentToComplete}
          open={showCompleteDialog}
          onOpenChange={setShowCompleteDialog}
          onCompleted={handleCompleteDone}
        />
      )}
    </div>
  );
};

export const StaffDashboard: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  return isMobile ? <StaffMobileDashboard /> : <StaffDashboardDesktop />;
};

export default StaffDashboard;