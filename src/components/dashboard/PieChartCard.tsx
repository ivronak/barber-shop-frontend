import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

export interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

// Define interface for chart label props
interface ChartLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}

interface PieChartCardProps {
  data: PieChartDataPoint[];
  title: string;
  description?: string;
  className?: string;
  showLegend?: boolean;
  showLabels?: boolean;
  formatValue?: (value: number) => string;
  valueType?: 'currency' | 'percentage' | 'number';
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
}

export const PieChartCard: React.FC<PieChartCardProps> = ({ 
  data, 
  title,
  description,
  className,
  showLegend = true,
  showLabels = false,
  formatValue,
  valueType = 'number',
  colors = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'],
  innerRadius = 0,
  outerRadius = 80
}) => {
  // Format the value based on valueType
  const formatter = formatValue || (valueType === 'currency' 
    ? formatCurrency 
    : valueType === 'percentage' 
      ? formatPercentage 
      : (val: number) => val.toString());

  const renderCustomizedLabel = ({ 
    cx, 
    cy, 
    midAngle, 
    innerRadius, 
    outerRadius, 
    percent, 
    name 
  }: ChartLabelProps) => {
    if (!showLabels) return null;
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#fff" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {name} ({(percent * 100).toFixed(0)}%)
      </text>
    );
  };

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={showLabels}
                label={renderCustomizedLabel}
                outerRadius={outerRadius}
                innerRadius={innerRadius}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || colors[index % colors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatter(value), 'Value']}
              />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 