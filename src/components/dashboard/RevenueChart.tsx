import React from 'react';
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueData } from '@/types';
import { formatCurrency } from '@/utils';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface RevenueChartProps {
  data: RevenueData[];
  title: string;
  className?: string;
  loading?: boolean;
  // Optional formatters so this chart can be reused for non-currency series (e.g., appointment counts)
  yAxisFormatter?: (value: number) => string;
  valueFormatter?: (value: number) => string;
  tooltipName?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ 
  data, 
  title,
  className,
  loading = false,
  yAxisFormatter = (value) => `$${value}`,
  valueFormatter = (value) => formatCurrency(Number(value)),
  tooltipName = 'Revenue'
}) => {
  return (
    <Card className={cn('relative', className)}>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#000000" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#000000" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => {
                const d = new Date(date);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }} 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => yAxisFormatter(Number(value))} 
              tick={{ fontSize: 12 }}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip 
              formatter={(value) => [valueFormatter(Number(value)), tooltipName]}
              labelFormatter={(date) => {
                const d = new Date(date);
                return d.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                });
              }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#000000" 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              isAnimationActive={true}
              animationDuration={700}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
      {loading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-xl">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </Card>
  );
};