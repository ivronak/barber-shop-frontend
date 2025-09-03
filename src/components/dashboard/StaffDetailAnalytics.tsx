import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PieChartDataPoint, PieChartCard } from './PieChartCard';
import { formatCurrency } from '@/utils/formatters';

interface TopServiceData {
  name: string;
  count: number;
}

interface StaffAnalyticsProps {
  id: string;
  name: string;
  image?: string;
  position: string;
  appointments: number;
  revenue: number;
  commissionEarned: number;
  appointmentCompletionRate: number;
  customerSatisfaction: string | number;
  utilization: number;
  averageServicesPerAppointment: string | number;
  topServices: TopServiceData[];
  className?: string;
}

export const StaffDetailAnalytics: React.FC<StaffAnalyticsProps> = ({
  name,
  image,
  position,
  appointments,
  revenue,
  commissionEarned,
  appointmentCompletionRate,
  customerSatisfaction,
  utilization,
  averageServicesPerAppointment,
  topServices,
  className
}) => {
  // Convert top services to pie chart data
  const topServicesChartData: PieChartDataPoint[] = topServices.map(service => ({
    name: service.name,
    value: service.count
  }));

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ${className}`}>
      {/* Staff overview card */}
      <Card className="md:col-span-2 xl:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={image} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>{position}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="font-normal">
            {appointments} appointments
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Revenue Generated</p>
              <p className="text-2xl font-semibold">{formatCurrency(revenue)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Commission Earned</p>
              <p className="text-2xl font-semibold">{formatCurrency(commissionEarned)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Utilization Rate</p>
              <p className="text-2xl font-semibold">{utilization}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Appointment Completion</span>
              <span className="font-medium">{appointmentCompletionRate}%</span>
            </div>
            <Progress value={appointmentCompletionRate} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Customer Satisfaction</span>
              <span className="font-medium">{customerSatisfaction}/5.0</span>
            </div>
            <Progress value={Number(customerSatisfaction) * 20} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Schedule Utilization</span>
              <span className="font-medium">{utilization}%</span>
            </div>
            <Progress value={utilization} className="h-2" />
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm">Services Per Appointment</span>
              <span className="text-xl font-medium">{averageServicesPerAppointment}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top services pie chart */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Service Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <PieChartCard
              data={topServicesChartData}
              title=""
              showLegend={true}
              innerRadius={60}
              outerRadius={90}
              colors={['#000000', '#333333', '#666666']}
              className="border-none shadow-none"
            />
          </div>
          <div className="space-y-2 mt-2">
            {topServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>
                  {index === 0 && '🥇 '}
                  {index === 1 && '🥈 '}
                  {index === 2 && '🥉 '}
                  {service.name}
                </span>
                <span className="font-medium">{service.count} bookings</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};