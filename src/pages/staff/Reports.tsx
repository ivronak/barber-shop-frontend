import React, { useState, useEffect, useCallback } from "react";
import { format, subDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  Download,
  RefreshCcw,
  Scissors,
  DollarSign,
  TrendingUp,
  Users,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/lib/auth";
import {
  getRevenueReport,
  getServicesReport,
  getAdvancedStaffMetrics,
  getStaffPerformanceMetrics,
  useStaffApi,
} from "@/api/services/reportService";
import { useToast } from "@/hooks/use-toast";

// Date range presets
const DATE_PRESETS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 days" },
  { value: "last30days", label: "Last 30 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "custom", label: "Custom" },
];

// Combined service interface for display
interface DisplayService {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
}

export const StaffReports: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const staffId = user?.id;

  // API hooks for the new staff performance metrics endpoint
  const {
    data: staffPerformanceData,
    loading: staffPerformanceLoading,
    error: staffPerformanceError,
    execute: fetchStaffPerformanceMetrics,
  } = useApi(getStaffPerformanceMetrics);

  // Other API hooks (kept for backward compatibility)
  const {
    loading: revenueLoading,
    error: revenueError,
    execute: fetchRevenueReport,
  } = useApi(getRevenueReport);

  const {
    data: servicesData,
    loading: servicesLoading,
    error: servicesError,
    execute: fetchServicesReport,
  } = useApi(getServicesReport);

  const {
    data: advancedStaffData,
    loading: advancedStaffLoading,
    error: advancedStaffError,
    execute: fetchAdvancedStaffMetrics,
  } = useApi(getAdvancedStaffMetrics);

  const {
    data: staffData,
    loading: staffLoading,
    error: staffError,
  } = useApi(useStaffApi);

  // State for date selection
  const [dateRange, setDateRange] = useState<string>("last7days");
  const [fromDate, setFromDate] = useState<Date>(subDays(new Date(), 7));
  const [toDate, setToDate] = useState<Date>(new Date());

  // Fetch initial data - memoized to avoid dependency cycles
  const fetchInitialData = useCallback(() => {
    if (!staffId) return;

    // Format dates for API calls
    const dateFrom = format(fromDate, "yyyy-MM-dd");
    const dateTo = format(toDate, "yyyy-MM-dd");

    // Fetch staff performance metrics from our new endpoint
    // The endpoint will extract staffId from JWT token if needed
    fetchStaffPerformanceMetrics(dateFrom, dateTo, user?.staff?.id || staffId);

    // Keep these calls for backward compatibility and additional data
    fetchRevenueReport(dateFrom, dateTo, "day");
    fetchServicesReport(dateFrom, dateTo, "revenue_desc");
    fetchAdvancedStaffMetrics(dateFrom, dateTo, staffId);
  }, [
    fromDate,
    toDate,
    staffId,
    fetchStaffPerformanceMetrics,
    fetchRevenueReport,
    fetchServicesReport,
    fetchAdvancedStaffMetrics,
  ]);

  // Load data on component mount
  useEffect(() => {
    if (staffId) {
      fetchInitialData();
    }
  }, [staffId, fetchInitialData]);

  // Handle date range changes
  const handleDateRangeChange = (preset: string) => {
    const today = new Date();

    switch (preset) {
      case "today":
        setFromDate(today);
        setToDate(today);
        break;
      case "yesterday": {
        const yesterday = subDays(today, 1);
        setFromDate(yesterday);
        setToDate(yesterday);
        break;
      }
      case "last7days":
        setFromDate(subDays(today, 7));
        setToDate(today);
        break;
      case "last30days":
        setFromDate(subDays(today, 30));
        setToDate(today);
        break;
      case "thisMonth":
        setFromDate(new Date(today.getFullYear(), today.getMonth(), 1));
        setToDate(today);
        break;
      case "lastMonth":
        setFromDate(new Date(today.getFullYear(), today.getMonth() - 1, 1));
        setToDate(new Date(today.getFullYear(), today.getMonth(), 0));
        break;
      case "custom":
        // alert(1)
        // setFromDate(new Date(today.getFullYear(), today.getMonth() - 1, 1));
        // setToDate(new Date(today.getFullYear(), today.getMonth(), 0));
        break;
    }

    setDateRange(preset);
    if (preset == "custom") {
      return;
    }

    // Refresh data when date range changes
    setTimeout(() => {
      fetchInitialData();
    }, 0);
  };

  // Format date range for display
  const getDisplayDateRange = () => {
    if (dateRange !== "custom") {
      return (
        DATE_PRESETS.find((preset) => preset.value === dateRange)?.label || ""
      );
    }
    return `${format(fromDate, "MMM dd, yyyy")} - ${format(
      toDate,
      "MMM dd, yyyy"
    )}`;
  };

  // Handle errors
  useEffect(() => {
    if (revenueError) {
      toast({
        title: "Error loading revenue data",
        description: revenueError.message,
        variant: "destructive",
      });
    }

    if (staffError) {
      toast({
        title: "Error loading staff data",
        description: staffError.message,
        variant: "destructive",
      });
    }

    if (servicesError) {
      toast({
        title: "Error loading services data",
        description: servicesError.message,
        variant: "destructive",
      });
    }

    if (advancedStaffError) {
      toast({
        title: "Error loading advanced staff metrics",
        description: advancedStaffError.message,
        variant: "destructive",
      });
    }

    if (staffPerformanceError) {
      toast({
        title: "Error loading staff performance metrics",
        description: staffPerformanceError.message,
        variant: "destructive",
      });
    }
  }, [
    revenueError,
    staffError,
    servicesError,
    advancedStaffError,
    staffPerformanceError,
    toast,
  ]);

  // Get data for the UI
  // First try to get data from the new endpoint, fall back to other sources if needed
  const performanceData = staffPerformanceData?.data;
  //  console.log(staffPerformanceData,"performanceData.services >> 3")
  const currentStaffData = staffData?.data?.find(
    (staff) => staff.staff_id === staffId
  );
  const currentAdvancedStaffData = advancedStaffData?.data?.find(
    (staff) => staff.staff_id === staffId
  );

  // Appointments count
  const appointmentCount =
    performanceData?.appointments ??
    (typeof currentStaffData?.appointments === "number"
      ? currentStaffData.appointments
      : typeof currentStaffData?.appointments === "string"
      ? parseInt(currentStaffData.appointments, 10) || 0
      : currentAdvancedStaffData?.appointments || 0);

  // Revenue
  const revenue =
    performanceData?.revenue ??
    (typeof currentStaffData?.revenue === "number"
      ? currentStaffData.revenue
      : typeof currentStaffData?.revenue === "string"
      ? parseFloat(currentStaffData.revenue) || 0
      : currentAdvancedStaffData?.revenue || 0);

  // Commission
  const commission =
    performanceData?.commission ??
    (typeof currentStaffData?.commission === "number"
      ? currentStaffData.commission
      : typeof currentStaffData?.commission === "string"
      ? parseFloat(currentStaffData.commission) || 0
      : typeof currentStaffData?.commissionEarned === "number"
      ? currentStaffData.commissionEarned
      : typeof currentStaffData?.commissionEarned === "string"
      ? parseFloat(currentStaffData.commissionEarned) || 0
      : currentAdvancedStaffData?.commissionEarned || 0);

  // Commission percentage
  const commissionPercentage =
    performanceData?.commissionPercentage ??
    (typeof currentStaffData?.commissionPercentage === "number"
      ? currentStaffData.commissionPercentage
      : typeof currentStaffData?.commissionPercentage === "string"
      ? parseFloat(currentStaffData.commissionPercentage) || 0
      : currentAdvancedStaffData?.commissionPercentage || 0);

  // If still loading or no staff ID
  if (
    !staffId ||
    ((staffLoading || staffPerformanceLoading) && !performanceData)
  ) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prepare services list for display
  const displayServices = (() => {
    // First try to get from the new performance metrics endpoint
    if (servicesData?.data && servicesData.data.length > 0) {
      return servicesData.data.map((service) => ({
        id: service.service_id,
        name: service.service_name,
        bookings: service.bookings,
        revenue: service.revenue,
        tip: service.tips,
        serviceCommission: service.total_service_commision,
        totalPayOut: service.total_payout,
      }));
    }

    // If we have advanced staff data with top services
    if (
      currentAdvancedStaffData?.topServices &&
      currentAdvancedStaffData.topServices.length > 0
    ) {
      return currentAdvancedStaffData.topServices.map((service) => {
        // Try to find revenue data for this service
        const serviceData = servicesData?.data?.find(
          (s) => s.service_id === service.service_id
        );

        const serviceRevenue = serviceData
          ? typeof serviceData.revenue === "number"
            ? serviceData.revenue
            : typeof serviceData.revenue === "string"
            ? parseFloat(serviceData.revenue) || 0
            : 0
          : 0;

        return {
          id: service.service_id,
          name: service.name,
          bookings: service.count,
          revenue: serviceRevenue,
          tip: service.tip,
          discounts: service.discounts,
        };
      });
    }

    // Or use all services data if available
    if (servicesData?.data && servicesData.data.length > 0) {
      return servicesData.data.map((service) => {
        const bookings =
          typeof service.bookings === "number"
            ? service.bookings
            : typeof service.bookings === "string"
            ? parseInt(service.bookings, 10) || 0
            : 0;

        const serviceRevenue =
          typeof service.revenue === "number"
            ? service.revenue
            : typeof service.revenue === "string"
            ? parseFloat(service.revenue) || 0
            : 0;

        return {
          id: service.service_id,
          name: service.service_name,
          bookings: bookings,
          revenue: serviceRevenue,
        };
      });
    }

    // Default to empty array if no data
    return [];
  })();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Performance Reports"
        description="View your performance metrics and earnings"
      />

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left w-full md:w-auto",
                !fromDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDisplayDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b">
              <div className="grid grid-cols-2 gap-2">
                {DATE_PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={dateRange === preset.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDateRangeChange(preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <Calendar
              mode="range"
              selected={{
                from: fromDate,
                to: toDate,
              }}
              onSelect={(range) => {
                if (range?.from) {
                  setFromDate(range.from);
                  setDateRange("custom");
                }
                if (range?.to) {
                  setToDate(range.to);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={fetchInitialData}
            disabled={
              staffLoading ||
              revenueLoading ||
              servicesLoading ||
              advancedStaffLoading ||
              staffPerformanceLoading
            }
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{appointmentCount}</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              During selected period
            </div>
            <div className="mt-4">
              <Progress
                value={Math.min((appointmentCount / 100) * 100, 100)}
                className="h-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {formatCurrency(revenue)}
              </div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              During selected period
            </div>
            <div className="mt-4">
              <Progress
                value={Math.min((revenue / 5000) * 100, 100)}
                className="h-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Commission Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {formatCurrency(commission)}
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {commissionPercentage}% commission rate
            </div>
            <div className="mt-4">
              <Progress
                value={Math.min((commission / 1000) * 100, 100)}
                className="h-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {currentAdvancedStaffData
                ? "Utilization Rate"
                : "Average Per Appointment"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {currentAdvancedStaffData ? (
                <div className="text-2xl font-bold">
                  {currentAdvancedStaffData.utilization || 0}%
                </div>
              ) : (
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    appointmentCount > 0 ? revenue / appointmentCount : 0
                  )}
                </div>
              )}
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {currentAdvancedStaffData
                ? "Working hours utilization"
                : "Average revenue per appointment"}
            </div>
            {currentAdvancedStaffData && (
              <div className="mt-4">
                <Progress
                  value={currentAdvancedStaffData.utilization || 0}
                  className="h-1"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Services Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>My Services Performance</CardTitle>
          <CardDescription>
            Services provided during the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {staffPerformanceLoading || servicesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : staffPerformanceError || servicesError ? (
            <div className="text-center py-8 text-destructive">
              <p>Error loading services data</p>
            </div>
          ) : displayServices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">Tips</TableHead>
                  <TableHead className="text-right">
                    Service Commission
                  </TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Avg. Price</TableHead>
                  <TableHead className="text-right">Total Payout</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayServices.map((service) => {
                  // console.log(service, "service")
                  console.log(service, "performanceData.services >> 2");
                  return (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        {service.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {service.bookings}
                      </TableCell>
                      <TableCell className="text-right">
                        ${service.tip}
                      </TableCell>
                      <TableCell className="text-right">
                        ${service.serviceCommission}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(service.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          service.bookings > 0
                            ? service.revenue / service.bookings
                            : 0
                        )}
                      </TableCell>
                       <TableCell className="text-right">
                        ${service.totalPayOut}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No services data available for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional metrics from advanced staff data */}
      {currentAdvancedStaffData && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Additional Performance Metrics</CardTitle>
            <CardDescription>
              Advanced insights into your performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="overflow-hidden rounded-lg bg-muted px-4 py-5 shadow sm:p-6">
                <dt className="truncate text-sm font-medium text-muted-foreground">
                  Average Service Time
                </dt>
                <dd className="mt-1 text-2xl font-semibold tracking-tight">
                  {currentAdvancedStaffData.averageServiceTime} minutes
                </dd>
              </div>
              <div className="overflow-hidden rounded-lg bg-muted px-4 py-5 shadow sm:p-6">
                <dt className="truncate text-sm font-medium text-muted-foreground">
                  Rebook Rate
                </dt>
                <dd className="mt-1 text-2xl font-semibold tracking-tight">
                  {currentAdvancedStaffData.rebookRate}%
                </dd>
              </div>
              <div className="overflow-hidden rounded-lg bg-muted px-4 py-5 shadow sm:p-6">
                <dt className="truncate text-sm font-medium text-muted-foreground">
                  Busiest Days
                </dt>
                <dd className="mt-1 text-lg font-semibold tracking-tight">
                  {currentAdvancedStaffData.busyDays.join(", ")}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StaffReports;
