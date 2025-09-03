import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ServicePerformance, StaffPerformance } from '@/types';
import { formatCurrency } from '@/utils';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface PerformanceTableProps {
  data: ServicePerformance[] | StaffPerformance[];
  title: string;
  type: 'service' | 'staff';
  className?: string;
  loading?: boolean;
}

export const PerformanceTable: React.FC<PerformanceTableProps> = ({
  data,
  title,
  type,
  className,
  loading = false,
}) => {
  return (
    <Card className={cn('relative', className)}>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{type === 'service' ? 'Service' : 'Staff'}</TableHead>
              <TableHead className="text-right">
                {type === 'service' ? 'Bookings' : 'Appointments'}
              </TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              {type === 'staff' && (
                <TableHead className="text-right">Commission</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id || item.name}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right">
                  {type === 'service' 
                    ? (item as ServicePerformance).bookings
                    : (item as StaffPerformance).appointments}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.revenue)}
                </TableCell>
                {type === 'staff' && (
                  <TableCell className="text-right">
                    {formatCurrency((item as StaffPerformance).commissionEarned)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {loading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-xl">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </Card>
  );
};