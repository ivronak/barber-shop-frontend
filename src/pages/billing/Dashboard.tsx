import React, { useEffect } from 'react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, DollarSign, ReceiptText, Loader2 } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { getBillingMetrics, BillingMetricsResponse } from '@/api/services/billingService';

export const BillingDashboard: React.FC = () => {
  const { data, loading, error, execute } = useApi<BillingMetricsResponse, []>(getBillingMetrics);

  useEffect(() => {
    execute();
  }, [execute]);

  const metrics = data || { totalInvoicesToday: 0, revenueToday: 0, newTransactionsToday: 0 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing Dashboard"
        description="Welcome to the billing portal"
      />

      {error && <p className="text-destructive">{error.message}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: 'Total Invoices Today',
            value: metrics.totalInvoicesToday.toString(),
            icon: <ReceiptText className="h-4 w-4 text-muted-foreground" />,
          },
          {
            label: 'Revenue Today',
            value: `$${Number(metrics.revenueToday).toFixed(2)}`,
            icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
          },
          {
            label: 'New POS Transactions',
            value: metrics.newTransactionsToday.toString(),
            icon: <CreditCard className="h-4 w-4 text-muted-foreground" />,
          },
        ].map((card) => (
          <Card key={card.label} className="relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Create New Invoice</h4>
            <p className="text-sm text-muted-foreground">
              Go to the POS page to create a new invoice for walk-in customers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 