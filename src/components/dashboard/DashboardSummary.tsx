import { DashboardSummary as SummaryType } from '@/api/services/dashboardService';
import { Users, Calendar, Scissors, DollarSign, Wallet, Percent } from 'lucide-react';
import { formatCurrency } from '@/utils';

interface Props {
  summary: SummaryType;
}

export const DashboardSummary = ({ summary }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">Customers</p>
            <p className="text-2xl font-semibold">{summary.customerCount}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="bg-green-100 p-3 rounded-full">
            <Calendar className="h-6 w-6 text-green-500" />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">Appointments</p>
            <p className="text-2xl font-semibold">{summary.appointmentCount}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="bg-purple-100 p-3 rounded-full">
            <Scissors className="h-6 w-6 text-purple-500" />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">Services</p>
            <p className="text-2xl font-semibold">{summary.serviceCount}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="bg-yellow-100 p-3 rounded-full">
            <DollarSign className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">Revenue</p>
            <p className="text-2xl font-semibold">{formatCurrency(parseFloat(summary.totalRevenue))}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="bg-green-100 p-3 rounded-full">
            <Wallet className="h-6 w-6 text-green-500" />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">Tips</p>
            <p className="text-2xl font-semibold">{formatCurrency(parseFloat(summary.totalTips))}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="bg-red-100 p-3 rounded-full">
            <DollarSign className="h-6 w-6 text-red-500" />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">Discounts</p>
            <p className="text-2xl font-semibold">{formatCurrency(parseFloat(summary.totalDiscounts))}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <Percent className="h-6 w-6 text-blue-500" />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">Avg. Tip %</p>
            <p className="text-2xl font-semibold">{summary.avgTipPercentage?.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-indigo-500" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Invoices</p>
              <p className="text-2xl font-semibold">{summary.paidInvoices} <span className="text-sm text-gray-500">paid</span></p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{summary.pendingInvoices} pending</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 