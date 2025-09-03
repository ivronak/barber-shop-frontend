import React, { useEffect, useState } from 'react';
import { Calendar, DollarSign, Clock, Users, BarChart } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AppointmentList, SimpleAppointment } from '@/components/dashboard/AppointmentList';
import { getStaffDashboardData, StaffDashboardData, UpcomingAppointment } from '@/api/services/dashboardService';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/**
 * Mobile-optimised staff dashboard, similar in spirit to admin MobileDashboard but
 * trimmed down for individual staff needs.
 */
export const StaffMobileDashboard: React.FC = () => {
  type DashboardPeriod = 'weekly' | 'monthly' | 'yearly';

  const { toast } = useToast();
  const [period, setPeriod] = useState<DashboardPeriod>('weekly');
  const [data, setData] = useState<StaffDashboardData | null>(null);
  const [cachedData, setCachedData] = useState<StaffDashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  // Bottom-nav state (stats vs appointments) – declare early to honour hook order
  type Section = 'stats' | 'appointments';
  const [section, setSection] = useState<Section>('appointments');

  /** Fetch dashboard payload */
  const fetchData = async () => {
    try {
      setLoading(true);
      const resp = await getStaffDashboardData(period);
      if (resp.success && resp.data) {
        setData(resp.data);
      } else {
        toast({
          title: 'Error',
          description: resp.message || 'Failed to load dashboard data',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Mobile staff dashboard error', err);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // cache latest good data
  useEffect(() => {
    if (!loading && data) {
      setCachedData(data);
    }
  }, [loading, data]);

  const dashboardData = data || cachedData;

  // Early loading indicator
  if (loading && !dashboardData) {
    return (
      <div className="flex justify-center items-center h-96">
        <Skeleton className="h-8 w-8 rounded-full" />
        <span className="ml-3">Loading dashboard…</span>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-96 text-muted-foreground">
        Failed to load dashboard data.
      </div>
    );
  }

  const { staffInfo, performanceSummary } = dashboardData;

  // Map today & upcoming appointments to SimpleAppointment format
  const convert = (apt: UpcomingAppointment): SimpleAppointment => ({
    id: apt.id,
    customerId: apt.customer.id,
    customerName: apt.customer.name,
    customerPhone: apt.customer.phone || '',
    customerEmail: apt.customer.email || '',
    staffId: staffInfo.id,
    staffName: staffInfo.name,
    date: apt.date,
    time: apt.time,
    endTime: apt.time,
    status: apt.status as SimpleAppointment['status'],
    services: apt.appointmentServices.map((s) => ({
      serviceId: s.service_id,
      serviceName: s.service_name,
      price: s.price,
      duration: s.duration,
    })),
    totalAmount: apt.appointmentServices.reduce((sum, s) => sum + s.price, 0),
    notes: '',
  });

  const todayAppts = dashboardData.todayAppointments?.map(convert) ?? [];
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const upcomingAppts = dashboardData.upcomingAppointments
    ?.filter((a) => a.date !== todayStr)
    .map(convert) ?? [];

  return (
    <div className="space-y-4 pb-20">
      <PageHeader title={`Welcome, ${staffInfo.name}`} description="Quick glance at your day" />

      {/* Switchable sections */}
      {section === 'stats' && (
        <>
          {/* Period selector */}
          <Tabs
            defaultValue={period}
            onValueChange={(val) => setPeriod(val as DashboardPeriod)}
          >
            <TabsList className="grid grid-cols-3 w-full mb-2">
              <TabsTrigger value="weekly">Week</TabsTrigger>
              <TabsTrigger value="monthly">Month</TabsTrigger>
              <TabsTrigger value="yearly">Year</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Stats content */}
          <div className="space-y-4">
            {/* Horizontal stats */}
            <div className="flex space-x-3 overflow-x-auto pb-2">
              <StatsCard
                title="Today Appts"
                value={`${todayAppts.length}`}
                icon={<Calendar className="h-4 w-4" />}
                className="min-w-[120px]"
              />
              <StatsCard
                title="Total Appts"
                value={`${performanceSummary.totalAppointments}`}
                icon={<Users className="h-4 w-4" />}
                className="min-w-[120px]"
              />
              <StatsCard
                title="Commission"
                value={`${staffInfo.commissionPercentage}%`}
                icon={<Clock className="h-4 w-4" />}
                className="min-w-[120px]"
              />
              <StatsCard
                title="Earnings"
                value={formatCurrency(performanceSummary.totalCommission)}
                icon={<DollarSign className="h-4 w-4" />}
                className="min-w-[120px]"
              />
            </div>

            {/* Top Services */}
            <Card>
              <CardHeader>
                <CardTitle>Top Services</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.serviceBreakdown.length > 0 ? (
                  <ul className="space-y-3">
                    {dashboardData.serviceBreakdown.map((svc) => (
                      <li key={svc.service_id} className="flex justify-between border-b pb-1">
                        <span>{svc.service_name}</span>
                        <span className="text-muted-foreground text-sm">{svc.bookings} bookings</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-muted-foreground py-2">No data</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.staffReviews.length > 0 ? (
                  <ul className="space-y-3">
                    {dashboardData.staffReviews.map((rev) => (
                      <li key={rev.id} className="border-b pb-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{rev.customer.name}</span>
                          <span className="text-yellow-500">★ {rev.rating}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{rev.comment}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-muted-foreground py-2">No reviews</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {section === 'appointments' && (
        <div className="space-y-4">
          <AppointmentList
            title="Today"
            appointments={todayAppts}
            showActions
            allowCompletion={true}
            onRefresh={fetchData}
          />
          <AppointmentList
            title="Upcoming"
            appointments={upcomingAppts}
            showActions
            allowCompletion={false}
            onRefresh={fetchData}
          />
        </div>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg flex justify-around py-2 z-50">
        <button
          className={`flex flex-col items-center text-xs ${section === 'appointments' ? 'text-foreground' : 'text-muted-foreground'}`}
          onClick={() => setSection('appointments')}
        >
          <Calendar className="h-4 w-4" />
          Appts
        </button>
        <button
          className={`flex flex-col items-center text-xs ${section === 'stats' ? 'text-foreground' : 'text-muted-foreground'}`}
          onClick={() => setSection('stats')}
        >
          <BarChart className="h-4 w-4" />
          Stats
        </button>
      </nav>
      <div className="h-14" />
    </div>
  );
};

export default StaffMobileDashboard; 