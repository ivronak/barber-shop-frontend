import React, { useState, useEffect } from 'react';
import {
  Calendar,
  DollarSign,
  BarChart,
  Activity,
} from 'lucide-react';

import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { AppointmentList } from '@/components/dashboard/AppointmentList';
import { PerformanceTable } from '@/components/dashboard/PerformanceTable';
import { PageHeader } from '@/components/layout';
import { formatCurrency } from '@/utils';
import { useToast } from '@/hooks/use-toast';
import { ServicePerformance, StaffPerformance, RevenueData, Appointment } from '@/types';
import { useDashboard, DashboardPeriod } from '@/hooks/useDashboard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { getAdminAppointments } from '@/api/services/appointmentService';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * MobileDashboard
 * A slimmed-down version of the admin dashboard optimised for small screens.
 */
export const MobileDashboard: React.FC = () => {
  const { toast } = useToast();
  const [period, setPeriod] = useState<DashboardPeriod>('weekly');
  const { dashboardData, isLoading, error } = useDashboard(period);
  const [cachedData, setCachedData] = useState<typeof dashboardData | null>(null);

  // State for today's appointments
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loadingTodayAppointments, setLoadingTodayAppointments] = useState(false);

  // bottom nav section control
  type Section = 'charts' | 'performance' | 'appointments';
  const [section, setSection] = useState<Section>('charts');

  // Handle error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: `Failed to load dashboard data: ${error.message}`,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Fetch today's appointments
  const fetchTodayAppointments = async () => {
    try {
      setLoadingTodayAppointments(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const response = await getAdminAppointments(1, 100, 'time_asc', today);

      // Convert API response into AppointmentList-friendly format
      const mappedAppointments: Appointment[] = response.appointments.map((apt) => ({
        id: apt.id,
        customerId: apt.customer?.id || '',
        customerName: apt.customer?.name || 'Unknown Customer',
        customerPhone: apt.customer?.phone || '',
        customerEmail: apt.customer?.email || undefined,
        staffId: apt.staff?.id || '',
        staffName: apt.staff?.user?.name || 'Unknown Staff',
        date: apt.date,
        time: apt.time,
        endTime: apt.end_time || '',
        services:
          apt.appointmentServices?.map((s) => ({
            serviceId: s.service?.id || '',
            serviceName: s.service?.name || '',
            price: s.price || 0,
            duration: s.duration || 0,
          })) || [],
        status: (apt.status || 'scheduled') as Appointment['status'],
        totalAmount: apt.total_amount || 0,
        notes: apt.notes,
        createdAt: apt.createdAt || new Date().toISOString(),
        updatedAt: apt.updatedAt || apt.createdAt || new Date().toISOString(),
      }));

      setTodayAppointments(mappedAppointments);
    } catch (err) {
      console.error('Error fetching today\'s appointments:', err);
      toast({
        title: 'Error',
        description: 'Failed to load today\'s appointments',
        variant: 'destructive',
      });
    } finally {
      setLoadingTodayAppointments(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  // retain last good data to avoid UI blink
  useEffect(() => {
    if (!isLoading && dashboardData) {
      setCachedData(dashboardData);
    }
  }, [isLoading, dashboardData]);

  const dataToShow = cachedData ?? dashboardData;

  // Mapping helpers (same as desktop but simplified)
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const appointmentStats = dataToShow?.appointmentStats ?? [];
  const revenueStats = dataToShow?.revenueStats ?? [];

  const appointmentChartData: RevenueData[] = (appointmentStats.length ? appointmentStats : [{ date: todayStr, count: 0 }]).map((stat) => ({
    date: stat.date,
    revenue: stat.count,
  }));

  const revenueChartData: RevenueData[] = (revenueStats.length ? revenueStats : [{ date: todayStr, revenue: '0' }]).map((stat: {date:string; revenue?: string}) => ({
    date: stat.date,
    revenue: parseFloat(stat.revenue ?? '0'),
  }));

  const servicePerformanceData: ServicePerformance[] =
    dataToShow?.topServices?.map((service) => ({
      id: service.service_id || `service-${service.service_name}`,
      name: service.service_name,
      bookings: service.bookings,
      revenue: parseFloat(service.revenue || '0'),
    })) || [];

  const staffPerformanceData: StaffPerformance[] =
    dataToShow?.topStaff?.map((staff) => ({
      id: staff.staff_id || `staff-${staff.staff_name}`,
      name: staff.staff_name,
      appointments: staff.appointments,
      revenue: parseFloat(staff.revenue || '0'),
      commissionEarned: 0,
    })) || [];

  // Loading state
  if (isLoading && !dataToShow) {
    return (
      <div className="flex justify-center items-center h-96">
        <Skeleton className="h-8 w-8 rounded-full" />
        <span className="ml-3">Loading dashboard…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <PageHeader title="Dashboard" description="Quick overview of your shop" />

      {/* Period Tabs */}
      <Tabs defaultValue={period} onValueChange={(val) => setPeriod(val as DashboardPeriod)}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="daily">Day</TabsTrigger>
          <TabsTrigger value="weekly">Week</TabsTrigger>
          <TabsTrigger value="monthly">Month</TabsTrigger>
          <TabsTrigger value="yearly">Year</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats summary – horizontally scrollable */}
      {dataToShow && (
        (() => {
          const tipPercentage = dataToShow.summary?.avgTipPercentage;
          const formattedTipPercentage = typeof tipPercentage === 'number'
            ? tipPercentage.toFixed(1)
            : typeof tipPercentage === 'string'
              ? Number(parseFloat(tipPercentage)).toFixed(1)
              : '0.0';

          return (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              <StatsCard
                title="Revenue"
                value={formatCurrency(parseFloat(dataToShow.summary?.totalRevenue || '0'))}
                icon={<DollarSign className="h-4 w-4" />}
                className="min-w-[140px]"
              />
              <StatsCard
                title="Appointments"
                value={(dataToShow.summary?.appointmentCount || 0).toString()}
                icon={<Calendar className="h-4 w-4" />}
                className="min-w-[140px]"
              />
              <StatsCard
                title="Customers"
                value={(dataToShow.summary?.customerCount || 0).toString()}
                icon={<BarChart className="h-4 w-4" />}
                className="min-w-[140px]"
              />
              <StatsCard
                title="Tips"
                value={`${formattedTipPercentage}%`}
                icon={<DollarSign className="h-4 w-4" />}
                className="min-w-[140px]"
              />
            </div>
          );
        })()
      )}

      {/* Dynamic Section Rendering */}
      {section === 'charts' && (
        <div className="space-y-4">
          {revenueChartData.length > 0 ? (
            <RevenueChart data={revenueChartData} title="Revenue" loading={isLoading && !!cachedData} />
          ) : (
            <Skeleton className="h-[300px] w-full" />
          )}
          {appointmentChartData.length > 0 ? (
            <RevenueChart data={appointmentChartData} title="Appointments" loading={isLoading && !!cachedData} />
          ) : (
            <Skeleton className="h-[300px] w-full" />
          )}
        </div>
      )}

      {section === 'performance' && (
        <div className="space-y-4">
          {servicePerformanceData.length > 0 ? (
            <PerformanceTable data={servicePerformanceData} title="Top Services" type="service" loading={isLoading && !!cachedData} />
          ) : (
            <Skeleton className="h-40 w-full" />
          )}
          {staffPerformanceData.length > 0 ? (
            <PerformanceTable data={staffPerformanceData} title="Top Staff" type="staff" loading={isLoading && !!cachedData} />
          ) : (
            <Skeleton className="h-40 w-full" />
          )}
        </div>
      )}

      {section === 'appointments' && (
        <div>
          <AppointmentList
            title="Today"
            appointments={todayAppointments}
            showActions
            onRefresh={fetchTodayAppointments}
          />
          {loadingTodayAppointments && <Skeleton className="h-20 w-full mt-2" />}
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg flex justify-around py-2 z-50">
        <button
          className={`flex flex-col items-center text-xs ${section === 'charts' ? 'text-foreground' : 'text-muted-foreground'}`}
          onClick={() => setSection('charts')}
        >
          <BarChart className="h-4 w-4" />
          Charts
        </button>
        <button
          className={`flex flex-col items-center text-xs ${section === 'performance' ? 'text-foreground' : 'text-muted-foreground'}`}
          onClick={() => setSection('performance')}
        >
          <Activity size={20} />
          Perf
        </button>
        <button
          className={`flex flex-col items-center text-xs ${section === 'appointments' ? 'text-foreground' : 'text-muted-foreground'}`}
          onClick={() => setSection('appointments')}
        >
          <Calendar className="h-4 w-4" />
          Appts
        </button>
      </nav>
      <div className="h-16" /> {/* spacer for nav */}
    </div>
  );
}; 