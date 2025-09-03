import { BusinessHours, DashboardStats, Log, RevenueData, ServicePerformance, StaffPerformance } from '@/types';
import { format, subDays, addDays } from 'date-fns';

// Business hours and configuration
export const businessHoursData: BusinessHours = {
  openingTime: '09:00',
  closingTime: '20:00',
  slotDuration: 15, // minutes
  breaks: [
    {
      name: 'Lunch Break',
      start: '12:00',
      end: '13:00',
    },
    {
      name: 'Cleaning Break',
      start: '16:00',
      end: '16:30',
    },
  ],
  daysOff: [0], // Sunday
  shopClosures: [
    {
      id: 'closure-1',
      date: format(addDays(new Date(), 5), 'yyyy-MM-dd'), // 5 days from now
      reason: 'Staff Training Day',
      isFullDay: true
    },
    {
      id: 'closure-2',
      date: format(addDays(new Date(), 15), 'yyyy-MM-dd'), // 15 days from now
      reason: 'Public Holiday',
      isFullDay: true
    },
    {
      id: 'closure-3',
      date: format(addDays(new Date(), 22), 'yyyy-MM-dd'), // 22 days from now
      reason: 'Renovation Work',
      isFullDay: false,
      startTime: '14:00',
      endTime: '20:00'
    }
  ]
};

// Dashboard statistics
export const dashboardStatsData: DashboardStats = {
  dailyRevenue: 245.75,
  weeklyRevenue: 1780.50,
  monthlyRevenue: 7320.25,
  appointmentsToday: 8,
  appointmentsWeek: 42,
  totalCustomers: 350,
  topService: {
    name: 'Classic Haircut',
    count: 124,
  },
  topStaff: {
    name: 'James Wilson',
    appointments: 86,
    revenue: 2580.50,
  },
};

// Revenue data for charts (last 14 days)
export const revenueData: RevenueData[] = Array.from({ length: 14 }, (_, i) => {
  const date = format(subDays(new Date(), 13 - i), 'yyyy-MM-dd');
  // Generate some variation in revenue
  const baseRevenue = 500;
  const variation = Math.random() * 300 - 150; // -150 to +150
  const weekend = [5, 6].includes(new Date(date).getDay()); // Higher revenue on weekends
  const revenue = Math.round((baseRevenue + variation + (weekend ? 200 : 0)) * 100) / 100;
  
  return {
    date,
    revenue,
  };
});

// Service performance data
export const servicePerformanceData: ServicePerformance[] = [
  {
    name: 'Classic Haircut',
    bookings: 124,
    revenue: 3100,
  },
  {
    name: 'Fade Haircut',
    bookings: 98,
    revenue: 2940,
  },
  {
    name: 'Hair & Beard Combo',
    bookings: 87,
    revenue: 3480,
  },
  {
    name: 'Beard Trim',
    bookings: 76,
    revenue: 1140,
  },
  {
    name: 'Hot Towel Shave',
    bookings: 65,
    revenue: 2275,
  },
  {
    name: 'Kids Haircut',
    bookings: 54,
    revenue: 1080,
  },
  {
    name: 'Hair Coloring',
    bookings: 43,
    revenue: 2580,
  },
  {
    name: 'Deluxe Package',
    bookings: 32,
    revenue: 2400,
  },
  {
    name: 'Hair Treatment',
    bookings: 21,
    revenue: 945,
  },
];

// Staff performance data
export const staffPerformanceData: StaffPerformance[] = [
  {
    name: 'James Wilson',
    appointments: 86,
    revenue: 2580.50,
    commissionEarned: 1290.25,
  },
  {
    name: 'Miguel Rodriguez',
    appointments: 74,
    revenue: 2220.75,
    commissionEarned: 999.34,
  },
  {
    name: 'Sarah Johnson',
    appointments: 68,
    revenue: 2040.25,
    commissionEarned: 816.10,
  },
  {
    name: 'David Lee',
    appointments: 52,
    revenue: 1560.50,
    commissionEarned: 546.18,
  },
  {
    name: 'Olivia Brown',
    appointments: 70,
    revenue: 2100.75,
    commissionEarned: 945.34,
  },
];

// Activity logs
export const logsData: Log[] = [
  {
    id: 'log-1',
    userId: 'admin-1',
    userName: 'Alex Morgan',
    userRole: 'admin',
    action: 'Created appointment',
    details: 'Appointment #apt-5 for James Miller',
    timestamp: format(subDays(new Date(), 2), "yyyy-MM-dd'T'14:30:00"),
  },
  {
    id: 'log-2',
    userId: 'staff-1',
    userName: 'James Wilson',
    userRole: 'staff',
    action: 'Completed appointment',
    details: 'Marked appointment #apt-4 as completed',
    timestamp: format(new Date(), "yyyy-MM-dd'T'13:45:00"),
  },
  {
    id: 'log-3',
    userId: 'admin-1',
    userName: 'Alex Morgan',
    userRole: 'admin',
    action: 'Added staff',
    details: 'Added new barber: David Lee',
    timestamp: format(subDays(new Date(), 30), "yyyy-MM-dd'T'10:15:00"),
  },
  {
    id: 'log-4',
    userId: 'staff-3',
    userName: 'Sarah Johnson',
    userRole: 'staff',
    action: 'Created invoice',
    details: 'Created invoice #inv-6 for Kevin Walker',
    timestamp: format(new Date(), "yyyy-MM-dd'T'11:00:00"),
  },
  {
    id: 'log-5',
    userId: 'admin-1',
    userName: 'Alex Morgan',
    userRole: 'admin',
    action: 'Updated service',
    details: 'Updated price for "Hair Coloring" to $60',
    timestamp: format(subDays(new Date(), 10), "yyyy-MM-dd'T'16:20:00"),
  },
  {
    id: 'log-6',
    userId: 'staff-2',
    userName: 'Miguel Rodriguez',
    userRole: 'staff',
    action: 'Cancelled appointment',
    details: 'Cancelled appointment #apt-14 for Joshua Campbell',
    timestamp: format(subDays(new Date(), 3), "yyyy-MM-dd'T'09:30:00"),
  },
  {
    id: 'log-7',
    userId: 'admin-1',
    userName: 'Alex Morgan',
    userRole: 'admin',
    action: 'Changed business hours',
    details: 'Updated Saturday closing time to 18:00',
    timestamp: format(subDays(new Date(), 15), "yyyy-MM-dd'T'17:45:00"),
  },
  {
    id: 'log-8',
    userId: 'staff-5',
    userName: 'Olivia Brown',
    userRole: 'staff',
    action: 'Added customer note',
    details: 'Added note for Matthew Harris',
    timestamp: format(subDays(new Date(), 1), "yyyy-MM-dd'T'16:50:00"),
  },
  {
    id: 'log-9',
    userId: 'staff-4',
    userName: 'David Lee',
    userRole: 'staff',
    action: 'Applied discount',
    details: 'Applied 10% discount to invoice #inv-3',
    timestamp: format(subDays(new Date(), 1), "yyyy-MM-dd'T'15:10:00"),
  },
  {
    id: 'log-10',
    userId: 'admin-1',
    userName: 'Alex Morgan',
    userRole: 'admin',
    action: 'Generated report',
    details: 'Generated monthly revenue report',
    timestamp: format(subDays(new Date(), 5), "yyyy-MM-dd'T'18:00:00"),
  },
];