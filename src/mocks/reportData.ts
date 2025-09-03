import { format, subDays, subMonths } from 'date-fns';
import { ComparisonDataPoint } from '@/components/dashboard/ComparisonChart';
import { staffPerformanceData, servicePerformanceData } from './businessData';
import { staffData } from './staffData';

// Generate revenue data with comparison data for previous period
export const revenueComparisonData: ComparisonDataPoint[] = Array.from({ length: 14 }, (_, i) => {
  const date = format(subDays(new Date(), 13 - i), 'yyyy-MM-dd');
  // Generate current period data
  const baseRevenue = 500;
  const variation = Math.random() * 300 - 150; // -150 to +150
  const weekend = [5, 6].includes(new Date(date).getDay()); // Higher revenue on weekends
  const current = Math.round((baseRevenue + variation + (weekend ? 200 : 0)) * 100) / 100;
  
  // Generate previous period data (slightly lower on average)
  const prevVariation = Math.random() * 280 - 140; // -140 to +140
  const previous = Math.round((baseRevenue * 0.85 + prevVariation + (weekend ? 180 : 0)) * 100) / 100;
  
  return {
    date,
    current,
    previous
  };
});

// Advanced revenue metrics
export const advancedRevenueMetrics = {
  current: {
    daily: {
      average: 245.75,
      highest: 487.50,
      lowest: 125.25,
      trend: 'up', // 'up', 'down', or 'stable'
      percentChange: 12.5
    },
    weekly: {
      total: 1720.25,
      trend: 'up',
      percentChange: 5.2
    },
    monthly: {
      total: 7450.00,
      trend: 'up',
      percentChange: 8.1,
      projection: 7850.00
    }
  },
  previous: {
    daily: {
      average: 218.45,
      highest: 432.10,
      lowest: 110.75
    },
    weekly: {
      total: 1635.25
    },
    monthly: {
      total: 6890.75
    }
  }
};

// Appointment metrics
export const appointmentMetrics = {
  total: 87,
  completed: 80,
  cancelled: 4,
  noShow: 3,
  completionRate: 92,
  cancellationRate: 5,
  noShowRate: 3,
  previousPeriod: {
    total: 82,
    completed: 74,
    cancelled: 5,
    noShow: 3,
    completionRate: 90,
    cancellationRate: 6,
    noShowRate: 4
  },
  // Distribution by day of week (0 = Sunday, 6 = Saturday)
  distributionByDay: [
    { day: 'Sun', appointments: 5, utilization: 42 },
    { day: 'Mon', appointments: 10, utilization: 65 },
    { day: 'Tue', appointments: 14, utilization: 78 },
    { day: 'Wed', appointments: 12, utilization: 72 },
    { day: 'Thu', appointments: 15, utilization: 83 },
    { day: 'Fri', appointments: 16, utilization: 87 },
    { day: 'Sat', appointments: 15, utilization: 91 },
  ],
  // Distribution by time of day
  distributionByTime: [
    { time: '9-10', appointments: 8, utilization: 60 },
    { time: '10-11', appointments: 11, utilization: 85 },
    { time: '11-12', appointments: 14, utilization: 95 },
    { time: '12-1', appointments: 7, utilization: 55 },
    { time: '1-2', appointments: 6, utilization: 45 },
    { time: '2-3', appointments: 10, utilization: 75 },
    { time: '3-4', appointments: 12, utilization: 90 },
    { time: '4-5', appointments: 14, utilization: 98 },
    { time: '5-6', appointments: 5, utilization: 40 },
  ]
};

// Customer metrics
export const customerMetrics = {
  total: 350,
  new: 24,
  returning: 326,
  returningRate: 68,
  averageSpend: 45.50,
  satisfactionScore: 4.8,
  growth: Array.from({ length: 6 }, (_, i) => {
    const month = format(subMonths(new Date(), 5 - i), 'MMM');
    const newCustomers = Math.floor(Math.random() * 15) + 15;
    return {
      month,
      newCustomers,
      totalCustomers: 260 + (i * 18) + Math.floor(Math.random() * 10)
    };
  }),
  segments: [
    { name: 'New', count: 24, percentage: 7 },
    { name: 'Occasional', count: 162, percentage: 46 },
    { name: 'Regular', count: 126, percentage: 36 },
    { name: 'VIP', count: 38, percentage: 11 }
  ]
};

// Staff performance with more metrics
export const advancedStaffPerformance = staffPerformanceData.map(staff => ({
  ...staff,
  appointmentCompletionRate: 90 + Math.floor(Math.random() * 9),
  customerSatisfaction: (4.5 + Math.random() * 0.5).toFixed(1),
  utilization: 65 + Math.floor(Math.random() * 25), // percentage of available time utilized
  averageServicesPerAppointment: (1 + Math.random()).toFixed(1),
  topServices: Array(3).fill(null).map((_, i) => ({
    name: ['Classic Haircut', 'Beard Trim', 'Hair & Beard Combo', 'Fade Haircut', 'Hot Towel Shave'][Math.floor(Math.random() * 5)],
    count: 15 - (i * 5) + Math.floor(Math.random() * 5)
  }))
}));

// Service performance with more metrics
export const advancedServicePerformance = servicePerformanceData.map(service => ({
  ...service,
  profitMargin: Math.floor(60 + Math.random() * 25), // percentage
  avgDuration: 20 + Math.floor(Math.random() * 40), // minutes
  popularity: Math.floor(50 + Math.random() * 50), // score out of 100
  growthRate: (Math.random() * 20 - 5).toFixed(1), // percentage growth
  customerSatisfaction: (4.2 + Math.random() * 0.8).toFixed(1),
  preferredByStaff: Array(2).fill(null).map(() => 
    staffData[Math.floor(Math.random() * staffData.length)].name
  )
}));

// Payment method analytics
export const paymentMethodAnalytics = {
  methods: [
    { method: 'Cash', count: 32, percentage: 35, amount: 1480.50, trend: 'down', changePercent: -3.5 },
    { method: 'Card', count: 48, percentage: 55, amount: 2750.75, trend: 'up', changePercent: 5.2 },
    { method: 'Mobile', count: 7, percentage: 10, amount: 450.25, trend: 'up', changePercent: 15.8 }
  ],
  history: Array.from({ length: 12 }, (_, i) => {
    const month = format(subMonths(new Date(), 11 - i), 'MMM');
    const totalTransactions = 65 + (i * 2) + Math.floor(Math.random() * 10);
    const cashPercentage = Math.max(20, 40 - (i * 0.5) + Math.floor(Math.random() * 5));
    const cardPercentage = Math.min(70, 50 + (i * 0.5) + Math.floor(Math.random() * 5));
    const mobilePercentage = 100 - cashPercentage - cardPercentage;
    
    return {
      month,
      totalTransactions,
      cash: Math.floor(totalTransactions * cashPercentage / 100),
      card: Math.floor(totalTransactions * cardPercentage / 100),
      mobile: Math.floor(totalTransactions * mobilePercentage / 100)
    };
  })
}; 