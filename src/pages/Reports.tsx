import React, { useState, useEffect, useRef } from "react";
import { format, subDays, addDays } from "date-fns";
import {
  BarChart3,
  Calendar as CalendarIcon,
  ChevronDown,
  Clock,
  Coins,
  DollarSign,
  Loader2,
  RefreshCcw,
  Scissors,
  Star,
  TrendingUp,
  Users,
  X,
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
import { Badge } from "@/components/ui/badge";
// Select imports removed as they're no longer needed
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ComparisonChart } from "@/components/dashboard/ComparisonChart";
import { PieChartCard } from "@/components/dashboard/PieChartCard";

// API imports
import { useApi } from "@/hooks/useApi";
import {
  getRevenueReport,
  getServicesReport,
  getStaffReport,
  getTipsDiscountsReport,
  getRevenueByDayOfWeek,
  getAdvancedRevenueMetrics,
  getAdvancedStaffMetrics,
  getAdvancedServiceMetrics,
} from "@/api/services/reportService";
import { getAllStaff } from "@/api/services/staffService";
import { getAllServices } from "@/api/services/serviceService";
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

// Report type is fixed to daily since we removed the dropdown

// Comparison options
const COMPARISON_OPTIONS = [
  { value: "none", label: "No comparison" },
  { value: "previousPeriod", label: "Previous period" },
  { value: "samePeroidLastYear", label: "Same period last year" },
];

// Report type is fixed to daily since we removed the dropdown

export const Reports: React.FC = () => {
  const { toast } = useToast();

  // API hooks
  const {
    data: revenueData,
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
    data: staffData,
    loading: staffLoading,
    error: staffError,
    execute: fetchStaffReport,
  } = useApi(getStaffReport);

  const {
    data: tipsDiscountsData,
    loading: tipsDiscountsLoading,
    error: tipsDiscountsError,
    execute: fetchTipsDiscountsReport,
  } = useApi(getTipsDiscountsReport);

  const {
    data: dayOfWeekData,
    loading: dayOfWeekLoading,
    error: dayOfWeekError,
    execute: fetchDayOfWeekReport,
  } = useApi(getRevenueByDayOfWeek);

  const {
    data: staffListData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    loading: _staffListLoading,
    error: staffListError,
    execute: fetchStaffList,
  } = useApi(getAllStaff);

  const {
    data: servicesListData,
    loading: servicesListLoading,
    error: servicesListError,
    execute: fetchServicesList,
  } = useApi(getAllServices);

  // New advanced metrics API hooks
  const {
    data: advancedRevenueData,
    loading: advancedRevenueLoading,
    error: advancedRevenueError,
    execute: fetchAdvancedRevenue,
  } = useApi(getAdvancedRevenueMetrics);

  const {
    data: advancedStaffData,
    loading: advancedStaffLoading,
    error: advancedStaffError,
    execute: fetchAdvancedStaff,
  }: any = useApi(getAdvancedStaffMetrics);

  const {
    data: advancedServiceData,
    loading: advancedServiceLoading,
    error: advancedServiceError,
    execute: fetchAdvancedService,
  } = useApi(getAdvancedServiceMetrics);

  // Staff-specific Tips & Discounts API hook
  const {
    data: staffTipsDiscountsData,
    loading: staffTipsDiscountsLoading,
    error: staffTipsDiscountsError,
    execute: fetchStaffTipsDiscounts,
  } = useApi(getTipsDiscountsReport);

  // State management
  // Fixed report type since dropdown was removed
  const reportType: string = "daily";
  const [dateRange, setDateRange] = useState<
    | "today"
    | "yesterday"
    | "last7days"
    | "last30days"
    | "thisMonth"
    | "lastMonth"
    | "custom"
  >("last7days");
  const [fromDate, setFromDate] = useState<Date>(subDays(new Date(), 7));
  const [toDate, setToDate] = useState<Date>(new Date());
  // New state for temporary date values and calendar open state
  const [tempFromDate, setTempFromDate] = useState<Date>(subDays(new Date(), 7));
  const [tempToDate, setTempToDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("revenue");
  const [compareWith, setCompareWith] = useState("none");
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string[]>([
    "cash",
    "card",
    "mobile",
  ]);
  const [selectedServiceCategories, setSelectedServiceCategories] = useState<
    string[]
  >([]);

  // Dialog state
  const [selectedStaffMember, setSelectedStaffMember] = useState<string | null>(
    null,
  );
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  // Add new state for selected staff details
  const [selectedStaffDetails, setSelectedStaffDetails] = useState<any | null>(null);

  // Fetch staff-specific tips & discounts when dialog opens or date changes
  useEffect(() => {
    if (showStaffDialog && selectedStaffMember) {
      const dateFromStr = format(fromDate, 'yyyy-MM-dd');
      const dateToStr = format(addDays(toDate, 1), 'yyyy-MM-dd');
      // Pass groupBy explicitly to ensure staffId is the 4th argument
      fetchStaffTipsDiscounts(dateFromStr, dateToStr, 'day', selectedStaffMember);
    }
  }, [showStaffDialog, selectedStaffMember, fromDate, toDate, fetchStaffTipsDiscounts]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);


  // Load data on component mount
  useEffect(() => {
    // Fetch initial data
    fetchInitialData();
  }, []);

  // Add effect to refetch data when date or report type changes
  useEffect(() => {
    // Only refetch if we have previously loaded data (don't duplicate initial load)
    if (revenueData || servicesData || staffData || tipsDiscountsData) {
      fetchReportsData();
    }
  }, [
    reportType,
    fromDate,
    toDate,
    // Remove data dependencies that cause infinite loop
  ]);

  // Handle API errors
  useEffect(() => {
    const errors = [
      { error: revenueError, source: "revenue" },
      { error: servicesError, source: "services" },
      { error: staffError, source: "staff" },
      { error: staffListError, source: "staff list" },
      { error: servicesListError, source: "services list" },
      { error: tipsDiscountsError, source: "tips and discounts" },
      { error: dayOfWeekError, source: "day of week" },
      { error: advancedRevenueError, source: "advanced revenue" },
      { error: advancedStaffError, source: "advanced staff" },
      { error: advancedServiceError, source: "advanced service" },
      { error: staffTipsDiscountsError, source: "staff tips & discounts" }
    ];

    errors.forEach(({ error, source }) => {
      if (error) {
        toast({
          title: `Error loading ${source} data`,
          description: error.message,
          variant: "destructive",
        });
      }
    });
  }, [
    revenueError,
    servicesError,
    staffError,
    staffListError,
    servicesListError,
    tipsDiscountsError,
    dayOfWeekError,
    advancedRevenueError,
    advancedStaffError,
    advancedServiceError,
    staffTipsDiscountsError,
    toast,
  ]);

  const fetchInitialData = () => {
    // Fetch staff and service listings (not date-dependent)
    fetchStaffList();
    fetchServicesList();

    // Fetch date-dependent reports
    fetchReportsData();
  };

  const fetchReportsData = () => {
    // Format dates for API calls
    const dateFrom = format(fromDate, 'yyyy-MM-dd');
    // Add 1 day to make the end-date inclusive (prevents timezone truncation issues)
    const dateTo = format(addDays(toDate, 1), 'yyyy-MM-dd');

    // Define groupBy based on report type
    const groupBy = reportType === 'yearly' ? 'month' : reportType === 'monthly' ? 'week' : 'day';

    // Fetch all reports with the same date range
    fetchRevenueReport(dateFrom, dateTo, groupBy);
    fetchServicesReport(dateFrom, dateTo, 'revenue_desc');
    fetchStaffReport(dateFrom, dateTo, 'revenue_desc');
    fetchTipsDiscountsReport(dateFrom, dateTo, groupBy);
    fetchDayOfWeekReport(dateFrom, dateTo);
    fetchAdvancedRevenue(dateFrom, dateTo);
    fetchAdvancedStaff(dateFrom, dateTo);
  };

  // Handle date range changes
  const handleDateRangeChange = (preset: "today" | "yesterday" | "last7days" | "last30days" | "thisMonth" | "lastMonth" | "custom") => {
    setDateRange(preset);
    const today = new Date();

    switch (preset) {
      case 'today':
        setFromDate(today);
        setToDate(today);
        setTempFromDate(today);
        setTempToDate(today);
        break;
      case 'yesterday': {
        const yesterday = subDays(today, 1);
        setFromDate(yesterday);
        setToDate(yesterday);
        setTempFromDate(yesterday);
        setTempToDate(yesterday);
        break;
      }
      case 'last7days':
        setFromDate(subDays(today, 7));
        setToDate(today);
        setTempFromDate(subDays(today, 7));
        setTempToDate(today);
        break;
      case 'last30days':
        setFromDate(subDays(today, 30));
        setToDate(today);
        setTempFromDate(subDays(today, 30));
        setTempToDate(today);
        break;
      case 'thisMonth':
        setFromDate(new Date(today.getFullYear(), today.getMonth(), 1));
        setToDate(today);
        setTempFromDate(new Date(today.getFullYear(), today.getMonth(), 1));
        setTempToDate(today);
        break;
      case 'lastMonth':
        setFromDate(new Date(today.getFullYear(), today.getMonth() - 1, 1));
        setToDate(new Date(today.getFullYear(), today.getMonth(), 0));
        setTempFromDate(new Date(today.getFullYear(), today.getMonth() - 1, 1));
        setTempToDate(new Date(today.getFullYear(), today.getMonth(), 0));
        break;
    }

    // Close the popover for preset buttons
    if (preset !== 'custom') {
      setIsCalendarOpen(false);
    }
    // Refresh data will happen via the useEffect
  };

  // New function to apply date range from calendar
  const applyDateRange = () => {
    if (tempFromDate && tempToDate) {
      setFromDate(tempFromDate);
      setToDate(tempToDate);
      setDateRange('custom');
      setIsCalendarOpen(false);
    }
  };

  // Extract data from API responses
  const staffList = staffListData?.staff || [];
  const servicesList = servicesListData?.services || [];
  const revenueReportData = revenueData?.data || [];
  const servicesReportData = servicesData?.data || [];
  const staffReportData = staffData?.data || [];

  // Extract service categories from API data
  const serviceCategories = Array.from(
    new Set(servicesList.filter(service => service.category).map((service) => service.category)),
  );

  // Toggle selections
  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaff((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId],
    );
  };

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const toggleServiceCategory = (category: string) => {
    setSelectedServiceCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category],
    );
  };

  const togglePaymentMethod = (method: string) => {
    setPaymentFilter((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method],
    );
  };

  // Clear filters
  const clearFilters = () => {
    setDateRange("last7days");
    setFromDate(subDays(new Date(), 7));
    setToDate(new Date());
    setTempFromDate(subDays(new Date(), 7));
    setTempToDate(new Date());
    setSelectedStaff([]);
    setSelectedServices([]);
    setSelectedServiceCategories([]);
    setPaymentFilter(["cash", "card", "mobile"]);
    setCompareWith("none");
  };

  // Export handling
  const handleExport = (format: string) => {
    alert(`Exporting data as ${format}...`);
  };

  // Format date range for display
  const getDisplayDateRange = () => {
    if (dateRange !== 'custom') {
      return DATE_PRESETS.find(preset => preset.value === dateRange)?.label || '';
    }
    return `${format(fromDate, 'MMM dd, yyyy')} - ${format(toDate, 'MMM dd, yyyy')}`;
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (dateRange !== "last7days") count++;
    if (compareWith !== "none") count++;
    if (selectedStaff.length > 0) count++;
    if (selectedServices.length > 0) count++;
    if (selectedServiceCategories.length > 0) count++;
    if (paymentFilter.length !== 3) count++;
    return count;
  };

  // Payment method distribution data for pie chart
  const paymentMethodData = revenueData?.data?.paymentMethods
    ? revenueData.data.paymentMethods.map((method) => ({
      name: method.payment_method,
      value: parseFloat(String(method.amount)) || 0,
      percentage: parseFloat(String(method.amount)) > 0
        ? parseFloat(((parseFloat(String(method.amount)) / (revenueData.data.revenue?.reduce((sum, item) =>
          sum + (parseFloat(String(item.total)) || 0), 0) || 1)) * 100).toFixed(1))
        : 0,
      color:
        method.payment_method === "Cash"
          ? "#000000"
          : method.payment_method === "Card"
            ? "#666666"
            : "#999999",
    }))
    : [];

  // Service category distribution data - use API data instead of mock data
  const serviceCategoryData = serviceCategories.map((category) => {
    // Get all services in this category
    const servicesInCategory = servicesListData?.services?.filter(
      (service) => service.category === category
    ) || [];

    const serviceIds = servicesInCategory.map(service => service.id);

    // Find service performance records for these services
    const categoryPerformanceData = servicesData?.data?.filter(
      (service) => serviceIds.includes(service.service_id)
    ) || [];

    // Calculate total revenue for this category from actual service data
    const totalRevenue = categoryPerformanceData.reduce(
      (sum, service) => sum + (parseFloat(String(service.revenue)) || 0),
      0
    );

    return {
      name: category,
      value: totalRevenue,
      color:
        category === "haircut"
          ? "#000000"
          : category === "beard"
            ? "#333333"
            : "#666666",
    };
  });

  // Handle staff selection
  const handleStaffRowClick = (staffId: string) => {
    // Set the selected staff member
    setSelectedStaffMember(staffId);

    // Show dialog immediately with loading state
    setShowStaffDialog(true);

    // Format dates for API calls
    const dateFrom = format(fromDate, 'yyyy-MM-dd');
    const dateTo = format(addDays(toDate, 1), 'yyyy-MM-dd');

    // Find the staff in the existing data if possible
    if (advancedStaffData?.data) {
      const existingStaff = advancedStaffData.data.find(staff => staff.staff_id === staffId);
      if (existingStaff) {
        setSelectedStaffDetails(existingStaff);
        return;
      }
    }

    // Make a separate API call to get staff details without affecting the main list
    try {
      const fetchSelectedStaffDetails = async () => {
        const baseUrl = '/reports/advanced-staff';
        const params = new URLSearchParams({
          dateFrom,
          dateTo,
          staffId
        });

        const response = await fetch(`${baseUrl}?${params}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.length > 0) {
            setSelectedStaffDetails(data.data[0]);
          }
        }
      };

      fetchSelectedStaffDetails();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch staff details",
        variant: "destructive"
      });
    }

    // Fetch tips & discounts specific to this staff member
    fetchStaffTipsDiscounts(dateFrom, dateTo, 'day', staffId);
  };

  // Handle service selection
  const handleServiceRowClick = (serviceId: string) => {
    // Set the selected service
    setSelectedService(serviceId);

    // Show dialog immediately with loading state
    setShowServiceDialog(true);

    // Format dates for API calls
    const dateFrom = format(fromDate, 'yyyy-MM-dd');
    const dateTo = format(addDays(toDate, 1), 'yyyy-MM-dd');

    // Fetch the data - dialog will show loading state while this happens
    fetchAdvancedService(dateFrom, dateTo, serviceId)
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to fetch service details",
          variant: "destructive"
        });
      });
  };

  // Update the render section to use API data instead of mocks
  // Example for rendering revenue data
  const renderRevenueChart = () => {
    if (revenueLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    if (revenueError) return (
      <div className="text-center p-8 text-destructive">
        <p>Error loading revenue data. Please try again.</p>
      </div>
    );

    if (!revenueData || !revenueData.data || !revenueData.data.revenue || revenueData.data.revenue.length === 0) return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No revenue data available for the selected period.</p>
      </div>
    );

    // Format data for chart - transform to match ComparisonChart component's expected format
    const chartData = revenueData.data.revenue.map(item => ({
      date: item.date,
      current: parseFloat(item.total as string) || 0,
      previous: parseFloat(item.subtotal as string) || 0
    }));

    return (
      <div className="h-full">
        {chartData.length > 0 ? (
          <ComparisonChart
            data={chartData}
            title=""
            showLegend={true}
            currentLabel="Revenue"
            previousLabel="Cost"
            className="h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No revenue data available for the selected period
          </div>
        )}
      </div>
    );
  };

  // Example for rendering services data
  const renderServicesTable = () => {
    if (servicesLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    if (servicesError) return (
      <div className="text-center p-8 text-destructive">
        <p>Error loading services data. Please try again.</p>
      </div>
    );

    if (!servicesData || !servicesData.data || servicesData.data.length === 0) return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No services data available for the selected period.</p>
      </div>
    );

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead className="text-right">Bookings</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Tips</TableHead>
            <TableHead className="text-right">Discounts</TableHead>
            <TableHead className="text-right">Avg. Price</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {servicesData.data.map((service) => {
            // Ensure numbers are properly parsed
            const revenue = parseFloat(String(service.revenue)) || 0;
            const bookings = parseInt(String(service.bookings)) || 0;
            const tips = parseFloat(String(service.tips ?? 0)) || 0;
            const discounts = parseFloat(String(service.discounts ?? 0)) || 0;
            const avgPrice = bookings > 0 ? revenue / bookings : 0;

            return (
              <TableRow key={service.service_id} onClick={() => handleServiceRowClick(service.service_id)}>
                <TableCell>{service.service_name}</TableCell>
                <TableCell className="text-right">{bookings}</TableCell>
                <TableCell className="text-right">${revenue.toFixed(2)}</TableCell>
                <TableCell className="text-right">${tips.toFixed(2)}</TableCell>
                <TableCell className="text-right">${discounts.toFixed(2)}</TableCell>
                <TableCell className="text-right">${avgPrice.toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={(e) => {
                    e.stopPropagation();
                    handleServiceRowClick(service.service_id);
                  }}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  // Staff data table renderer - prioritizes advanced staff metrics for accurate commission display
  const renderStaffTable = () => {
    // If advanced data is available, use it as the primary data source
    if (advancedStaffData?.data?.length > 0) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead className="text-right">Appointments</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Tips</TableHead>
              <TableHead className="text-right">Discounts</TableHead>
              <TableHead className="text-right">Total payout</TableHead>
              <TableHead className="text-right">Service</TableHead>
              <TableHead className="text-right">Srv Comm.</TableHead>
              <TableHead className="text-right">Product</TableHead>
              <TableHead className="text-right">Prod Comm.</TableHead>
              <TableHead className="text-right">Total Comm.</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advancedStaffData.data.map((staff: any) => {
              const revenue = parseFloat(String(staff.revenue)) || 0;
              const tips = parseFloat(String(staff.tips ?? 0)) || 0;
              const discounts = parseFloat(String(staff.discounts ?? 0)) || 0;
              const commissionServices = parseFloat(String(staff.commissionFromServices ?? 0));
              const commissionProducts = parseFloat(String(staff.commissionFromProducts ?? 0));
              const commission = parseFloat(String(staff.commissionEarned)) || (commissionServices + commissionProducts);

              return (
                <TableRow key={staff.staff_id} onClick={() => handleStaffRowClick(staff.staff_id)}>
                  <TableCell>{staff.name}</TableCell>
                  <TableCell className="text-right">{staff.appointments}</TableCell>
                  <TableCell className="text-right">${revenue.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${tips.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${discounts.toFixed(2)}</TableCell>
                  <TableCell className="text-right"> - </TableCell>
                  <TableCell className="text-right"> - </TableCell>
                  <TableCell className="text-right">${commissionServices.toFixed(2)}</TableCell>
                  <TableCell className="text-right"> - </TableCell>
                  <TableCell className="text-right">${commissionProducts.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${commission.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={(e) => {
                      e.stopPropagation();
                      handleStaffRowClick(staff.staff_id);
                    }}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      );
    }

    // Fallback to basic staff data if advanced data isn't available
    if (staffLoading || advancedStaffLoading) {
      return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (staffError || advancedStaffError) {
      return (
        <div className="text-center p-8 text-destructive">
          <p>Error loading staff data. Please try again.</p>
        </div>
      );
    }

    if ((!staffData || !staffData.data || staffData.data.length === 0) &&
      (!advancedStaffData || !advancedStaffData.data || advancedStaffData.data.length === 0)) {
      return (
        <div className="text-center p-8 text-muted-foreground">
          <p>No staff performance data available for the selected period.</p>
        </div>
      );
    }

    // Use basic staff data as a fallback
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff Member</TableHead>
            <TableHead className="text-right">Appointments</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Tips</TableHead>
            <TableHead className="text-right">Discounts</TableHead>
            <TableHead className="text-right">Commission</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffData.data.map((staff) => {
            const revenue = parseFloat(String(staff.revenue)) || 0;
            const tips = parseFloat(String(staff.tips ?? 0)) || 0;
            const discounts = parseFloat(String(staff.discounts ?? 0)) || 0;
            // Use commission from standard metrics as fallback
            const commission = parseFloat(String(staff.commission)) || 0;
            const appointments = parseInt(String(staff.appointments)) || 0;

            return (
              <TableRow key={staff.staff_id} onClick={() => handleStaffRowClick(staff.staff_id)}>
                <TableCell>{staff.staff_name || staff.name}</TableCell>
                <TableCell className="text-right">{appointments}</TableCell>
                <TableCell className="text-right">${revenue.toFixed(2)}</TableCell>
                <TableCell className="text-right">${tips.toFixed(2)}</TableCell>
                <TableCell className="text-right">${discounts.toFixed(2)}</TableCell>
                <TableCell className="text-right">${commission.toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={(e) => {
                    e.stopPropagation();
                    handleStaffRowClick(staff.staff_id);
                  }}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  // Example for rendering tips/discounts data
  const renderTipsDiscountsChart = () => {
    if (tipsDiscountsLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    if (tipsDiscountsError) return (
      <div className="text-center p-8 text-destructive">
        <p>Error loading tips and discounts data. Please try again.</p>
      </div>
    );

    if (!tipsDiscountsData || !tipsDiscountsData.data) return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No tips and discounts data available for the selected period.</p>
      </div>
    );

    // Format data for chart to match ComparisonChart component's expected format
    const chartData = tipsDiscountsData.data.timeSeriesData.map(item => ({
      date: item.date,
      current: parseFloat(item.tips as string) || 0,
      previous: parseFloat(item.discounts as string) || 0
    }));

    return (
      <div className="h-full">
        {chartData.length > 0 ? (
          <ComparisonChart
            data={chartData}
            title=""
            showLegend={true}
            currentLabel="Tips"
            previousLabel="Discounts"
            className="h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No tips and discounts data available for the selected period
          </div>
        )}
      </div>
    );
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Reports"
          description="View business performance and analytics"
        />
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left',
                !fromDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDisplayDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="font-medium">Date Range</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCalendarOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-3 border-b">
              <div className="grid grid-cols-2 gap-2">
                {DATE_PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={dateRange === preset.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleDateRangeChange(preset.value as "today" | "yesterday" | "last7days" | "last30days" | "thisMonth" | "lastMonth" | "custom")}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <Calendar
              mode="range"
              selected={{
                from: tempFromDate,
                to: tempToDate,
              }}
              onSelect={(range) => {
                if (range?.from) {
                  setTempFromDate(range.from);
                }
                if (range?.to) {
                  setTempToDate(range.to);
                }
              }}
              initialFocus
            />
            <div className="p-3 border-t flex justify-end">
              <Button onClick={applyDateRange}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex-1 space-y-4 pt-6">

        <div className="space-y-4">
          <Tabs
            defaultValue="revenue"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid grid-cols-4 lg:w-[850px]">
              <TabsTrigger value="revenue">
                <DollarSign className="h-4 w-4 mr-2" />
                Revenue
              </TabsTrigger>
              <TabsTrigger value="services">
                <Scissors className="h-4 w-4 mr-2" />
                Services
              </TabsTrigger>
              <TabsTrigger value="staff">
                <Users className="h-4 w-4 mr-2" />
                Staff
              </TabsTrigger>
              <TabsTrigger value="tips-discounts">
                <Coins className="h-4 w-4 mr-2" />
                Tips Commission & Discounts
              </TabsTrigger>
            </TabsList>

            {/* Revenue Tab */}
            <TabsContent value="revenue" className="space-y-6">
              {/* Revenue Overview */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {advancedRevenueLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : advancedRevenueError ? (
                      <div className="text-sm text-destructive">Error loading data</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          ${advancedRevenueData?.data?.current?.monthly?.total?.toLocaleString() || '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {(advancedRevenueData?.data?.current?.monthly?.percentChange || 0) > 0 ? '+' : ''}
                          {advancedRevenueData?.data?.current?.monthly?.percentChange || 0}%
                          from last month
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Daily
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {advancedRevenueLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : advancedRevenueError ? (
                      <div className="text-sm text-destructive">Error loading data</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          ${advancedRevenueData?.data?.current?.daily?.average?.toLocaleString() || '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {(advancedRevenueData?.data?.current?.daily?.percentChange || 0) > 0 ? '+' : ''}
                          {advancedRevenueData?.data?.current?.daily?.percentChange || 0}%
                          from last week
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                



                {/* <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Monthly Projection
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {advancedRevenueLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : advancedRevenueError ? (
                    <div className="text-sm text-destructive">Error loading data</div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        ${advancedRevenueData?.data?.current?.monthly?.projection?.toLocaleString() || '0'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Based on current trends
                      </p>
                    </>
                  )}
                </CardContent>
              </Card> */}

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Revenue per Visit
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {advancedRevenueLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : advancedRevenueError ? (
                      <div className="text-sm text-destructive">Error loading data</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          ${advancedRevenueData?.data?.current?.revenuePerVisit?.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Average transaction value
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Tip
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {advancedRevenueLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : advancedRevenueError ? (
                      <div className="text-sm text-destructive">Error loading data</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          ${advancedRevenueData?.data?.current?.monthly?.totaltTip?.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Average transaction value
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Commission 
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {advancedRevenueLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : advancedRevenueError ? (
                      <div className="text-sm text-destructive">Error loading data</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          ${advancedRevenueData?.data?.current?.monthly?.totaltCommision?.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Average transaction value
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Service 
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {advancedRevenueLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : advancedRevenueError ? (
                      <div className="text-sm text-destructive">Error loading data</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          ${advancedRevenueData?.data?.current?.monthly?.totalServices?.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Average transaction value
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Product 
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {advancedRevenueLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : advancedRevenueError ? (
                      <div className="text-sm text-destructive">Error loading data</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          ${advancedRevenueData?.data?.current?.monthly?.totalProduct?.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Average transaction value
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

              </div>

              <Tabs defaultValue="trends" className="w-full mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="trends">Revenue Trends</TabsTrigger>
                  <TabsTrigger value="payment">Payment Methods</TabsTrigger>
                  <TabsTrigger value="services">Service Categories</TabsTrigger>
                </TabsList>

                <TabsContent value="trends" className="space-y-4 pt-4">
                  <Card className="overflow-visible">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Revenue Trends</CardTitle>
                          <CardDescription>
                            {getDisplayDateRange()}
                            {compareWith !== "none" &&
                              ` vs ${COMPARISON_OPTIONS.find((c) => c.value === compareWith)?.label}`}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="h-80 overflow-hidden p-4">
                      {renderRevenueChart()}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Revenue Breakdown</CardTitle>
                      <CardDescription>
                        Revenue distribution by day of week
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Day</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Transactions</TableHead>
                            <TableHead>Avg. Transaction</TableHead>
                            <TableHead>Change</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dayOfWeekLoading ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />
                                Loading data...
                              </TableCell>
                            </TableRow>
                          ) : dayOfWeekError ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-destructive py-4">
                                Error loading data. Please try again.
                              </TableCell>
                            </TableRow>
                          ) : !dayOfWeekData || !dayOfWeekData.data || dayOfWeekData.data.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                                No revenue data available for the selected period.
                              </TableCell>
                            </TableRow>
                          ) : (
                            dayOfWeekData.data.map((dayData) => {
                              const revenue = parseFloat(String(dayData.revenue)) || 0;
                              const transactions = parseInt(String(dayData.transactions)) || 0;
                              const avgTransaction = parseFloat(String(dayData.avg_transaction)) || 0;

                              return (
                                <TableRow key={dayData.day_of_week}>
                                  <TableCell className="font-medium">
                                    {dayData.day_name}
                                  </TableCell>
                                  <TableCell>${revenue.toLocaleString()}</TableCell>
                                  <TableCell>{transactions}</TableCell>
                                  <TableCell>
                                    ${avgTransaction.toFixed(2)}
                                  </TableCell>
                                  <TableCell>
                                    <span
                                      className={
                                        dayData.change_percentage > 0
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }
                                    >
                                      {dayData.change_percentage > 0 ? "+" : ""}
                                      {dayData.change_percentage}%
                                    </span>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payment" className="space-y-4 pt-4">
                  <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-1 overflow-visible">
                      <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>
                          Distribution of payment methods
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-0 pb-0">
                        <PieChartCard
                          data={paymentMethodData}
                          title=""
                          showLegend
                          showLabels={false}
                          innerRadius={60}
                          outerRadius={80}
                          className="border-none shadow-none"
                        />
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Payment Method Analytics</CardTitle>
                        <CardDescription>
                          Detailed payment method analysis
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Method</TableHead>
                              <TableHead>Revenue</TableHead>
                              <TableHead>Percentage</TableHead>
                              <TableHead>Change</TableHead>
                              <TableHead>Trend</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {revenueLoading ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">
                                  <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />
                                  Loading data...
                                </TableCell>
                              </TableRow>
                            ) : revenueError ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-destructive py-4">
                                  Error loading payment methods data. Please try again.
                                </TableCell>
                              </TableRow>
                            ) : !revenueData || !revenueData.data || !revenueData.data.paymentMethods || revenueData.data.paymentMethods.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                                  No payment methods data available for the selected period.
                                </TableCell>
                              </TableRow>
                            ) : (
                              revenueData.data.paymentMethods.map((method) => {
                                const amount = parseFloat(String(method.amount)) || 0;
                                const count = parseInt(String(method.count)) || 0;

                                // Calculate totalRevenue from the sum of all payment methods
                                const totalRevenue = revenueData.data.paymentMethods.reduce(
                                  (sum, method) => sum + (parseFloat(String(method.amount)) || 0),
                                  0
                                );

                                const percentage = totalRevenue ? ((amount / totalRevenue) * 100).toFixed(1) : "0";
                                // Assuming we don't have trend data from API, we can calculate based on count
                                const trend = count > 5 ? "up" : "down";
                                const changePercent = "10.5"; // Placeholder as API doesn't provide this

                                return (
                                  <TableRow key={method.payment_method}>
                                    <TableCell className="font-medium">
                                      {method.payment_method}
                                    </TableCell>
                                    <TableCell>
                                      ${amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell>{percentage}%</TableCell>
                                    <TableCell>
                                      <span
                                        className={
                                          trend === "up"
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }
                                      >
                                        {trend === "up" ? "+" : ""}
                                        {changePercent}%
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          trend === "up"
                                            ? "default"
                                            : "secondary"
                                        }
                                      >
                                        {trend === "up"
                                          ? "Increasing"
                                          : "Decreasing"}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="services" className="space-y-4 pt-4">
                  <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-1 overflow-visible">
                      <CardHeader>
                        <CardTitle>Service Categories</CardTitle>
                        <CardDescription>Revenue by category</CardDescription>
                      </CardHeader>
                      <CardContent className="px-0 pb-0">
                        <PieChartCard
                          data={serviceCategoryData}
                          title=""
                          showLegend
                          showLabels={false}
                          innerRadius={60}
                          outerRadius={80}
                          className="border-none shadow-none"
                        />
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Category Performance</CardTitle>
                        <CardDescription>
                          Revenue and performance by service category
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Category</TableHead>
                              <TableHead>Revenue</TableHead>
                              <TableHead>Services</TableHead>
                              <TableHead>Avg. Price</TableHead>
                              <TableHead>Growth</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {servicesLoading || servicesListLoading ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">
                                  <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />
                                  Loading data...
                                </TableCell>
                              </TableRow>
                            ) : servicesError || servicesListError ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-destructive py-4">
                                  Error loading category data. Please try again.
                                </TableCell>
                              </TableRow>
                            ) : !serviceCategories || serviceCategories.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                                  No service categories available.
                                </TableCell>
                              </TableRow>
                            ) : (
                              serviceCategories.map((category) => {
                                // Get all services in this category
                                const servicesInCategory = servicesListData?.services?.filter(
                                  (service) => service.category === category
                                ) || [];

                                const serviceIds = servicesInCategory.map(service => service.id);

                                // Find service performance records for these services
                                const categoryPerformanceData = servicesData?.data?.filter(
                                  (service) => serviceIds.includes(service.service_id)
                                ) || [];

                                // Calculate total revenue for this category from actual service data
                                const totalRevenue = categoryPerformanceData.reduce(
                                  (sum, service) => sum + (parseFloat(String(service.revenue)) || 0),
                                  0
                                );

                                const totalServices = servicesInCategory.length;
                                const avgPrice = totalServices > 0 ? totalRevenue / totalServices : 0;
                                const growth = 5; // Placeholder since API doesn't provide growth data

                                return (
                                  <TableRow key={category}>
                                    <TableCell className="font-medium capitalize">
                                      {category}
                                    </TableCell>
                                    <TableCell>
                                      ${totalRevenue.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                      {totalServices}
                                    </TableCell>
                                    <TableCell>${avgPrice.toFixed(2)}</TableCell>
                                    <TableCell>
                                      <span
                                        className={
                                          growth > 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }
                                      >
                                        {growth > 0 ? "+" : ""}
                                        {growth}%
                                      </span>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-6">
              {/* Service Metrics Overview */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Services
                    </CardTitle>
                    <Scissors className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{servicesListData?.services?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Available services
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Price
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      $
                      {servicesListData?.services && servicesListData.services.length > 0 ?
                        (servicesListData.services.reduce(
                          (sum, service) => sum + (parseFloat(String(service.price)) || 0),
                          0
                        ) / servicesListData.services.length).toFixed(2)
                        : "0.00"
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">Per service</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Most Popular
                    </CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {servicesData?.data && servicesData.data.length > 0
                        ? servicesData.data.sort((a, b) =>
                          (parseInt(String(b.bookings)) || 0) - (parseInt(String(a.bookings)) || 0)
                        )[0]?.service_name || "No data"
                        : "No data"
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {servicesData?.data && servicesData.data.length > 0
                        ? `${parseInt(String(servicesData.data[0].bookings)) || 0} bookings this period`
                        : "No bookings data"
                      }
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Categories
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {serviceCategories?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Service categories
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Service Performance Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Service Performance</CardTitle>
                      <CardDescription>
                        {getDisplayDateRange()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderServicesTable()}
                </CardContent>
              </Card>

              {/* Service Detail Dialog */}
              <Dialog
                open={showServiceDialog}
                onOpenChange={setShowServiceDialog}
              >
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Service Details</DialogTitle>
                    <DialogDescription>
                      Detailed service performance metrics
                    </DialogDescription>
                  </DialogHeader>
                  {advancedServiceLoading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading service details...</span>
                    </div>
                  ) : advancedServiceError ? (
                    <div className="text-center p-8 text-destructive">
                      <p>Error loading service details. Please try again.</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          const dateFrom = format(fromDate, 'yyyy-MM-dd');
                          const dateTo = format(addDays(toDate, 1), 'yyyy-MM-dd');
                          if (selectedService) {
                            fetchAdvancedService(dateFrom, dateTo, selectedService);
                          }
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : selectedService && advancedServiceData?.data ? (
                    <div className="mt-4 space-y-6">
                      {advancedServiceData.data
                        .filter((service, index) => {
                          const serviceInfo = servicesData?.data?.find(
                            (s) => s.service_id === selectedService,
                          );
                          // Only match one record, either by name or by index
                          if (serviceInfo && serviceInfo.service_name === service.name)
                            return true;
                          if (
                            !serviceInfo &&
                            selectedService === `service-${index}`
                          )
                            return true;
                          return false;
                        })
                        .slice(0, 1) // Ensure only one record is displayed
                        .map((service, index) => {
                          const serviceInfo: any = servicesData?.data?.find(
                            (s) => s.service_name === service.name,
                          );
                          return (
                            <div key={index} className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h2 className="text-xl font-bold">
                                    {service.name}
                                  </h2>
                                  <p className="text-muted-foreground">
                                    {serviceInfo?.category || service.category || "General"} • {service.duration || service.avgDuration || "N/A"} minutes
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    service.growthRate && parseFloat(service.growthRate) > 0
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {service.growthRate && parseFloat(service.growthRate) > 0 ? "+" : ""}
                                  {service.growthRate || "0"}% growth
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card className="overflow-hidden">
                                  <CardHeader className="p-3">
                                    <CardTitle className="text-sm">
                                      Bookings
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-3 pt-0">
                                    <p className="text-2xl font-bold">
                                      {service.bookings || 0}
                                    </p>
                                  </CardContent>
                                </Card>

                                <Card className="overflow-hidden">
                                  <CardHeader className="p-3">
                                    <CardTitle className="text-sm">
                                      Revenue
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-3 pt-0">
                                    <p className="text-2xl font-bold">
                                      ${(service.revenue || 0).toLocaleString()}
                                    </p>
                                  </CardContent>
                                </Card>

                                <Card className="overflow-hidden">
                                  <CardHeader className="p-3">
                                    <CardTitle className="text-sm">
                                      Growth Rate
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-3 pt-0">
                                    <p className="text-2xl font-bold">
                                      {service.growthRate || "0"}%
                                    </p>
                                  </CardContent>
                                </Card>

                                <Card className="overflow-hidden">
                                  <CardHeader className="p-3">
                                    <CardTitle className="text-sm">
                                      Average Revenue
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-3 pt-0">
                                    <p className="text-2xl font-bold">
                                      ${typeof service.averageRevenue === 'number' ? service.averageRevenue.toFixed(2) : '0.00'}
                                    </p>
                                  </CardContent>
                                </Card>
                              </div>

                              <Tabs defaultValue="metrics" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                  <TabsTrigger value="metrics">
                                    Performance Metrics
                                  </TabsTrigger>
                                  <TabsTrigger value="services">
                                    Top Services
                                  </TabsTrigger>
                                  <TabsTrigger value="tips">
                                    Tips
                                  </TabsTrigger>
                                  <TabsTrigger value="discounts">
                                    Discounts
                                  </TabsTrigger>
                                </TabsList>

                                <TabsContent
                                  value="metrics"
                                  className="space-y-4 pt-4"
                                >
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Metric</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Status</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell>
                                          Appointment Completion
                                        </TableCell>
                                        <TableCell>
                                          {service.appointmentCompletionRate ?? 'N/A'}%
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            variant={
                                              (service.appointmentCompletionRate ?? 0) > 90
                                                ? "default"
                                                : (service.appointmentCompletionRate ?? 0) > 75
                                                  ? "secondary"
                                                  : "outline"
                                            }
                                          >
                                            {(service.appointmentCompletionRate ?? 0) > 90
                                              ? "Excellent"
                                              : (service.appointmentCompletionRate ?? 0) > 75
                                                ? "Good"
                                                : "Needs Improvement"}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>
                                          Growth Rate
                                        </TableCell>
                                        <TableCell>
                                          {service.growthRate}%
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            variant={
                                              parseFloat(service.growthRate) > 10
                                                ? "default"
                                                : parseFloat(service.growthRate) > 0
                                                  ? "secondary"
                                                  : "outline"
                                            }
                                          >
                                            {parseFloat(service.growthRate) > 10
                                              ? "Strong Growth"
                                              : parseFloat(service.growthRate) > 0
                                                ? "Growing"
                                                : "Declining"}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>Utilization Rate</TableCell>
                                        <TableCell>
                                          {service.utilization ?? 'N/A'}%
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            variant={
                                              (service.utilization ?? 0) > 85
                                                ? "default"
                                                : (service.utilization ?? 0) > 70
                                                  ? "secondary"
                                                  : "outline"
                                            }
                                          >
                                            {(service.utilization ?? 0) > 85
                                              ? "High"
                                              : (service.utilization ?? 0) > 70
                                                ? "Good"
                                                : "Low"}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>
                                          Services Per Appointment
                                        </TableCell>
                                        <TableCell>
                                          {service.averageServiceTime ? service.averageServiceTime.toFixed(1) : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            variant={
                                              Number(
                                                service.averageServiceTime || 0
                                              ) > 1.5
                                                ? "default"
                                                : "secondary"
                                            }
                                          >
                                            {Number(
                                              service.averageServiceTime || 0
                                            ) > 1.5
                                              ? "High"
                                              : "Average"}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </TabsContent>

                                <TabsContent
                                  value="services"
                                  className="space-y-4 pt-4"
                                >
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Bookings</TableHead>
                                        <TableHead>Performance</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {service.topServices && Array.isArray(service.topServices) ?
                                        service.topServices.map((topService, idx) => (
                                          <TableRow key={idx}>
                                            <TableCell className="font-medium">
                                              {topService.name}
                                            </TableCell>
                                            <TableCell>{topService.count}</TableCell>
                                            <TableCell>
                                              <Badge variant="secondary">
                                                {idx === 0
                                                  ? "Most Popular"
                                                  : idx === 1
                                                    ? "Popular"
                                                    : "Regular"}
                                              </Badge>
                                            </TableCell>
                                          </TableRow>
                                        ))
                                        : (
                                          <TableRow>
                                            <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                              No detailed service data available
                                            </TableCell>
                                          </TableRow>
                                        )}
                                    </TableBody>
                                  </Table>
                                </TabsContent>

                                <TabsContent value="tips" className="space-y-4 pt-4">
                                  {staffTipsDiscountsLoading ? (
                                    <div className="flex justify-center p-8">
                                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                  ) : staffTipsDiscountsError ? (
                                    <div className="text-center p-8 text-destructive">
                                      <p>Error loading tips data. Please try again.</p>
                                    </div>
                                  ) : staffTipsDiscountsData?.data ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <Card>
                                        <CardHeader className="p-3">
                                          <CardTitle className="text-sm">Total Tips</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-3 pt-0">
                                          <p className="text-2xl font-bold">
                                            ${parseFloat(staffTipsDiscountsData.data.summary.totalTips as string || '0').toFixed(2)}
                                          </p>
                                        </CardContent>
                                      </Card>
                                      <Card>
                                        <CardHeader className="p-3">
                                          <CardTitle className="text-sm">Avg Tip %</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-3 pt-0">
                                          <p className="text-2xl font-bold">
                                            {parseFloat(staffTipsDiscountsData.data.summary.avgTipPercentage as string || '0').toFixed(2)}%
                                          </p>
                                        </CardContent>
                                      </Card>
                                      <Card>
                                        <CardHeader className="p-3">
                                          <CardTitle className="text-sm">Invoices w/ Tip</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-3 pt-0">
                                          <p className="text-2xl font-bold">
                                            {staffTipsDiscountsData.data.summary.invoicesWithTip}
                                          </p>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  ) : (
                                    <div className="text-center p-8 text-muted-foreground">
                                      No tips data available
                                    </div>
                                  )}
                                </TabsContent>

                                <TabsContent value="discounts" className="space-y-4 pt-4">
                                  {staffTipsDiscountsLoading ? (
                                    <div className="flex justify-center p-8">
                                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                  ) : staffTipsDiscountsError ? (
                                    <div className="text-center p-8 text-destructive">
                                      <p>Error loading discounts data. Please try again.</p>
                                    </div>
                                  ) : staffTipsDiscountsData?.data ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <Card>
                                        <CardHeader className="p-3">
                                          <CardTitle className="text-sm">Total Discounts</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-3 pt-0">
                                          <p className="text-2xl font-bold">
                                            ${parseFloat(staffTipsDiscountsData.data.summary.totalDiscounts as string || '0').toFixed(2)}
                                          </p>
                                        </CardContent>
                                      </Card>
                                      <Card>
                                        <CardHeader className="p-3">
                                          <CardTitle className="text-sm">Avg Discount %</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-3 pt-0">
                                          <p className="text-2xl font-bold">
                                            {parseFloat(staffTipsDiscountsData.data.summary.avgDiscountPercentage as string || '0').toFixed(2)}%
                                          </p>
                                        </CardContent>
                                      </Card>
                                      <Card>
                                        <CardHeader className="p-3">
                                          <CardTitle className="text-sm">Invoices w/ Discount</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-3 pt-0">
                                          <p className="text-2xl font-bold">
                                            {staffTipsDiscountsData.data.summary.invoicesWithDiscount}
                                          </p>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  ) : (
                                    <div className="text-center p-8 text-muted-foreground">
                                      No discount data available
                                    </div>
                                  )}
                                </TabsContent>
                              </Tabs>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      No detailed metrics available for this service
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Staff Tab */}
            <TabsContent value="staff" className="space-y-6">
              {/* Staff Overview Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Staff
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{staffData?.data.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Active staff members
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Commission
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      $
                      {advancedStaffData?.data && advancedStaffData.data.length > 0 ?
                        (advancedStaffData.data.reduce(
                          (sum, staff) => sum + (staff.commissionEarned || 0),
                          0
                        ) / (advancedStaffData.data.length || 1)).toFixed(2)
                        : '0.00'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per staff member
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Utilization Rate
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {advancedStaffData?.data && advancedStaffData.data.length > 0 ?
                        Math.round(
                          advancedStaffData.data.reduce(
                            (sum, staff) => sum + (staff.utilization || 0),
                            0
                          ) / advancedStaffData.data.length
                        )
                        : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average across all staff
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Rebook Rate
                    </CardTitle>
                    <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {advancedStaffData?.data && advancedStaffData.data.length > 0 ?
                        Math.round(
                          advancedStaffData.data.reduce(
                            (sum, staff) => sum + (staff.rebookRate || 0),
                            0
                          ) / advancedStaffData.data.length
                        )
                        : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Client retention average
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Staff Performance Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div>
                        <CardTitle>Staff Performance</CardTitle>
                        <CardDescription>{getDisplayDateRange()}</CardDescription>
                      </div>

                      {/* Push dropdown to the right */}
                      <div
                        ref={dropdownRef}
                        className="inline-block text-left ml-auto absolute right-16">
                        {/* Dropdown Button */}
                        <button
                          onClick={() => setIsOpen(!isOpen)}
                          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none"
                        >
                          Select Staff
                          <svg
                            className="ml-2 -mr-1 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isOpen && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                              {advancedStaffData?.data?.map((staff) => {
                                return <a
                                  href="#"
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {staff.name}
                                </a>
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </CardHeader>
                <CardContent>
                  {renderStaffTable()}
                </CardContent>
              </Card>

              {/* Staff Detail Dialog */}
              <Dialog
                open={showStaffDialog}
                onOpenChange={(open) => {
                  setShowStaffDialog(open);
                  if (!open) setSelectedStaffDetails(null);
                }}
              >
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Staff Performance Analysis</DialogTitle>
                    <DialogDescription>Detailed metrics for selected staff member</DialogDescription>
                  </DialogHeader>
                  {advancedStaffLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 space-y-2">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-muted-foreground">Loading staff performance details...</p>
                    </div>
                  ) : advancedStaffError ? (
                    <div className="text-center p-8 text-destructive">
                      <p>Error loading staff details. Please try again.</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          const dateFrom = format(fromDate, 'yyyy-MM-dd');
                          const dateTo = format(addDays(toDate, 1), 'yyyy-MM-dd');
                          if (selectedStaffMember) {
                            fetchAdvancedStaff(dateFrom, dateTo, selectedStaffMember);
                          }
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : (
                    advancedStaffData?.data && advancedStaffData.data.length > 0 ? (
                      <div className="space-y-4">
                        {advancedStaffData.data
                          .filter(staff => staff.staff_id === selectedStaffMember)
                          .map((staff) => {
                            return (
                              <div key={staff.staff_id} className="space-y-6">
                                <div className="flex items-center space-x-4">
                                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                    {staff.image ? (
                                      <img
                                        src={staff.image}
                                        alt={staff.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-xl font-semibold">
                                        {staff.name.charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <h2 className="text-xl font-bold">
                                      {staff.name}
                                    </h2>
                                    <div className="text-muted-foreground text-sm">
                                      {staff.position || "Staff Member"}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <Card className="overflow-hidden">
                                    <CardHeader className="p-3">
                                      <CardTitle className="text-sm">
                                        Appointments
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                      <p className="text-2xl font-bold">
                                        {staff.appointments}
                                      </p>
                                    </CardContent>
                                  </Card>

                                  <Card className="overflow-hidden">
                                    <CardHeader className="p-3">
                                      <CardTitle className="text-sm">
                                        Revenue
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                      <p className="text-2xl font-bold">
                                        ${staff.revenue.toLocaleString()}
                                      </p>
                                    </CardContent>
                                  </Card>

                                  <Card className="overflow-hidden">
                                    <CardHeader className="p-3">
                                      <CardTitle className="text-sm">
                                        Srv Comm.
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                      <p className="text-2xl font-bold">
                                        ${staff.commissionFromServices.toLocaleString()}
                                      </p>
                                    </CardContent>
                                  </Card>

                                  <Card className="overflow-hidden">
                                    <CardHeader className="p-3">
                                      <CardTitle className="text-sm">
                                        Prod Comm.
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                      <p className="text-2xl font-bold">
                                        ${staff.commissionFromProducts.toLocaleString()}
                                      </p>
                                    </CardContent>
                                  </Card>

                                  <Card className="overflow-hidden">
                                    <CardHeader className="p-3">
                                      <CardTitle className="text-sm">
                                        Total Comm.
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                      <p className="text-2xl font-bold">
                                        ${staff.commissionEarned.toLocaleString()}
                                      </p>
                                    </CardContent>
                                  </Card>
                                </div>

                                <Tabs defaultValue="metrics" className="w-full">
                                  <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="metrics">
                                      Performance Metrics
                                    </TabsTrigger>
                                    <TabsTrigger value="services">
                                      Top Services
                                    </TabsTrigger>
                                    <TabsTrigger value="tips">
                                      Tips
                                    </TabsTrigger>
                                    <TabsTrigger value="discounts">
                                      Discounts
                                    </TabsTrigger>
                                  </TabsList>

                                  <TabsContent
                                    value="metrics"
                                    className="space-y-4 pt-4"
                                  >
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Metric</TableHead>
                                          <TableHead>Value</TableHead>
                                          <TableHead>Status</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        <TableRow>
                                          <TableCell>
                                            Appointment Completion
                                          </TableCell>
                                          <TableCell>
                                            {staff.utilization}%
                                          </TableCell>
                                          <TableCell>
                                            <Badge
                                              variant={
                                                staff.utilization > 90
                                                  ? "default"
                                                  : staff.utilization > 75
                                                    ? "secondary"
                                                    : "outline"
                                              }
                                            >
                                              {staff.utilization > 90
                                                ? "Excellent"
                                                : staff.utilization > 75
                                                  ? "Good"
                                                  : "Needs Improvement"}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell>
                                            Rebook Rate
                                          </TableCell>
                                          <TableCell>
                                            {staff.rebookRate}%
                                          </TableCell>
                                          <TableCell>
                                            <Badge
                                              variant={
                                                staff.rebookRate > 70
                                                  ? "default"
                                                  : staff.rebookRate > 50
                                                    ? "secondary"
                                                    : "outline"
                                              }
                                            >
                                              {staff.rebookRate > 70
                                                ? "Excellent"
                                                : staff.rebookRate > 50
                                                  ? "Good"
                                                  : "Needs Improvement"}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell>Utilization Rate</TableCell>
                                          <TableCell>
                                            {staff.utilization}%
                                          </TableCell>
                                          <TableCell>
                                            <Badge
                                              variant={
                                                staff.utilization > 85
                                                  ? "default"
                                                  : staff.utilization > 70
                                                    ? "secondary"
                                                    : "outline"
                                              }
                                            >
                                              {staff.utilization > 85
                                                ? "High"
                                                : staff.utilization > 70
                                                  ? "Good"
                                                  : "Low"}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell>
                                            Services Per Appointment
                                          </TableCell>
                                          <TableCell>
                                            {staff.averageServiceTime.toFixed(1)}
                                          </TableCell>
                                          <TableCell>
                                            <Badge
                                              variant={
                                                Number(
                                                  staff.averageServiceTime,
                                                ) > 1.5
                                                  ? "default"
                                                  : "secondary"
                                              }
                                            >
                                              {Number(
                                                staff.averageServiceTime,
                                              ) > 1.5
                                                ? "High"
                                                : "Average"}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </TabsContent>

                                  <TabsContent
                                    value="services"
                                    className="space-y-4 pt-4"
                                  >
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Service</TableHead>
                                          <TableHead>Bookings</TableHead>
                                          <TableHead>Performance</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {staff.topServices && Array.isArray(staff.topServices) ?
                                          staff.topServices.map((topService: any, idx: any) => (
                                            <TableRow key={idx}>
                                              <TableCell className="font-medium">
                                                {topService.name}
                                              </TableCell>
                                              <TableCell>{topService.count}</TableCell>
                                              <TableCell>
                                                <Badge variant="secondary">
                                                  {idx === 0
                                                    ? "Most Popular"
                                                    : idx === 1
                                                      ? "Popular"
                                                      : "Regular"}
                                                </Badge>
                                              </TableCell>
                                            </TableRow>
                                          ))
                                          : (
                                            <TableRow>
                                              <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                                No detailed service data available
                                              </TableCell>
                                            </TableRow>
                                          )}
                                      </TableBody>
                                    </Table>
                                  </TabsContent>

                                  <TabsContent value="tips" className="space-y-4 pt-4">
                                    {staffTipsDiscountsLoading ? (
                                      <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                      </div>
                                    ) : staffTipsDiscountsError ? (
                                      <div className="text-center p-8 text-destructive">
                                        <p>Error loading tips data. Please try again.</p>
                                      </div>
                                    ) : staffTipsDiscountsData?.data ? (
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card>
                                          <CardHeader className="p-3">
                                            <CardTitle className="text-sm">Total Tips</CardTitle>
                                          </CardHeader>
                                          <CardContent className="p-3 pt-0">
                                            <p className="text-2xl font-bold">
                                              ${parseFloat(staffTipsDiscountsData.data.summary.totalTips as string || '0').toFixed(2)}
                                            </p>
                                          </CardContent>
                                        </Card>
                                        <Card>
                                          <CardHeader className="p-3">
                                            <CardTitle className="text-sm">Avg Tip %</CardTitle>
                                          </CardHeader>
                                          <CardContent className="p-3 pt-0">
                                            <p className="text-2xl font-bold">
                                              {parseFloat(staffTipsDiscountsData.data.summary.avgTipPercentage as string || '0').toFixed(2)}%
                                            </p>
                                          </CardContent>
                                        </Card>
                                        <Card>
                                          <CardHeader className="p-3">
                                            <CardTitle className="text-sm">Invoices w/ Tip</CardTitle>
                                          </CardHeader>
                                          <CardContent className="p-3 pt-0">
                                            <p className="text-2xl font-bold">
                                              {staffTipsDiscountsData.data.summary.invoicesWithTip}
                                            </p>
                                          </CardContent>
                                        </Card>
                                      </div>
                                    ) : (
                                      <div className="text-center p-8 text-muted-foreground">
                                        No tips data available
                                      </div>
                                    )}
                                  </TabsContent>

                                  <TabsContent value="discounts" className="space-y-4 pt-4">
                                    {staffTipsDiscountsLoading ? (
                                      <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                      </div>
                                    ) : staffTipsDiscountsError ? (
                                      <div className="text-center p-8 text-destructive">
                                        <p>Error loading discounts data. Please try again.</p>
                                      </div>
                                    ) : staffTipsDiscountsData?.data ? (
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card>
                                          <CardHeader className="p-3">
                                            <CardTitle className="text-sm">Total Discounts</CardTitle>
                                          </CardHeader>
                                          <CardContent className="p-3 pt-0">
                                            <p className="text-2xl font-bold">
                                              ${parseFloat(staffTipsDiscountsData.data.summary.totalDiscounts as string || '0').toFixed(2)}
                                            </p>
                                          </CardContent>
                                        </Card>
                                        <Card>
                                          <CardHeader className="p-3">
                                            <CardTitle className="text-sm">Avg Discount %</CardTitle>
                                          </CardHeader>
                                          <CardContent className="p-3 pt-0">
                                            <p className="text-2xl font-bold">
                                              {parseFloat(staffTipsDiscountsData.data.summary.avgDiscountPercentage as string || '0').toFixed(2)}%
                                            </p>
                                          </CardContent>
                                        </Card>
                                        <Card>
                                          <CardHeader className="p-3">
                                            <CardTitle className="text-sm">Invoices w/ Discount</CardTitle>
                                          </CardHeader>
                                          <CardContent className="p-3 pt-0">
                                            <p className="text-2xl font-bold">
                                              {staffTipsDiscountsData.data.summary.invoicesWithDiscount}
                                            </p>
                                          </CardContent>
                                        </Card>
                                      </div>
                                    ) : (
                                      <div className="text-center p-8 text-muted-foreground">
                                        No discount data available
                                      </div>
                                    )}
                                  </TabsContent>
                                </Tabs>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      selectedStaffDetails ? (
                        <div className="space-y-4">
                          <div key={selectedStaffDetails.staff_id} className="space-y-6">
                            <div className="flex items-center space-x-4">
                              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                {selectedStaffDetails.image ? (
                                  <img
                                    src={selectedStaffDetails.image}
                                    alt={selectedStaffDetails.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xl font-semibold">
                                    {selectedStaffDetails.name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div>
                                <h2 className="text-xl font-bold">
                                  {selectedStaffDetails.name}
                                </h2>
                                <div className="text-muted-foreground text-sm">
                                  {selectedStaffDetails.position || "Staff Member"}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">
                                    Appointments
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">
                                    {selectedStaffDetails.appointments}
                                  </p>
                                </CardContent>
                              </Card>

                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">
                                    Revenue
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">
                                    ${selectedStaffDetails.revenue.toLocaleString()}
                                  </p>
                                </CardContent>
                              </Card>

                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">
                                    Srv Comm.
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">
                                    ${selectedStaffDetails.commissionFromServices.toLocaleString()}
                                  </p>
                                </CardContent>
                              </Card>

                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">
                                    Prod Comm.
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">
                                    ${selectedStaffDetails.commissionFromProducts.toLocaleString()}
                                  </p>
                                </CardContent>
                              </Card>

                              <Card className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">
                                    Total Comm.
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <p className="text-2xl font-bold">
                                    ${selectedStaffDetails.commissionEarned.toLocaleString()}
                                  </p>
                                </CardContent>
                              </Card>
                            </div>

                            <Tabs defaultValue="metrics" className="w-full">
                              <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="metrics">
                                  Performance Metrics
                                </TabsTrigger>
                                <TabsTrigger value="services">
                                  Top Services
                                </TabsTrigger>
                                <TabsTrigger value="tips">
                                  Tips
                                </TabsTrigger>
                                <TabsTrigger value="discounts">
                                  Discounts
                                </TabsTrigger>
                              </TabsList>

                              <TabsContent
                                value="metrics"
                                className="space-y-4 pt-4"
                              >
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Metric</TableHead>
                                      <TableHead>Value</TableHead>
                                      <TableHead>Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell>
                                        Appointment Completion
                                      </TableCell>
                                      <TableCell>
                                        {selectedStaffDetails.utilization}%
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            selectedStaffDetails.utilization > 90
                                              ? "default"
                                              : selectedStaffDetails.utilization > 75
                                                ? "secondary"
                                                : "outline"
                                          }
                                        >
                                          {selectedStaffDetails.utilization > 90
                                            ? "Excellent"
                                            : selectedStaffDetails.utilization > 75
                                              ? "Good"
                                              : "Needs Improvement"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>
                                        Rebook Rate
                                      </TableCell>
                                      <TableCell>
                                        {selectedStaffDetails.rebookRate}%
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            selectedStaffDetails.rebookRate > 70
                                              ? "default"
                                              : selectedStaffDetails.rebookRate > 50
                                                ? "secondary"
                                                : "outline"
                                          }
                                        >
                                          {selectedStaffDetails.rebookRate > 70
                                            ? "Excellent"
                                            : selectedStaffDetails.rebookRate > 50
                                              ? "Good"
                                              : "Needs Improvement"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Utilization Rate</TableCell>
                                      <TableCell>
                                        {selectedStaffDetails.utilization}%
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            selectedStaffDetails.utilization > 85
                                              ? "default"
                                              : selectedStaffDetails.utilization > 70
                                                ? "secondary"
                                                : "outline"
                                          }
                                        >
                                          {selectedStaffDetails.utilization > 85
                                            ? "High"
                                            : selectedStaffDetails.utilization > 70
                                              ? "Good"
                                              : "Low"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>
                                        Services Per Appointment
                                      </TableCell>
                                      <TableCell>
                                        {selectedStaffDetails.averageServiceTime.toFixed(1)}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            Number(
                                              selectedStaffDetails.averageServiceTime,
                                            ) > 1.5
                                              ? "default"
                                              : "secondary"
                                          }
                                        >
                                          {Number(
                                            selectedStaffDetails.averageServiceTime,
                                          ) > 1.5
                                            ? "High"
                                            : "Average"}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TabsContent>

                              <TabsContent
                                value="services"
                                className="space-y-4 pt-4"
                              >
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Service</TableHead>
                                      <TableHead>Bookings</TableHead>
                                      <TableHead>Performance</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedStaffDetails.topServices && Array.isArray(selectedStaffDetails.topServices) ?
                                      selectedStaffDetails.topServices.map((topService: any, idx: any) => (
                                        <TableRow key={idx}>
                                          <TableCell className="font-medium">
                                            {topService.name}
                                          </TableCell>
                                          <TableCell>{topService.count}</TableCell>
                                          <TableCell>
                                            <Badge variant="secondary">
                                              {idx === 0
                                                ? "Most Popular"
                                                : idx === 1
                                                  ? "Popular"
                                                  : "Regular"}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      ))
                                      : (
                                        <TableRow>
                                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                            No detailed service data available
                                          </TableCell>
                                        </TableRow>
                                      )}
                                  </TableBody>
                                </Table>
                              </TabsContent>

                              <TabsContent value="tips" className="space-y-4 pt-4">
                                {staffTipsDiscountsLoading ? (
                                  <div className="flex justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                  </div>
                                ) : staffTipsDiscountsError ? (
                                  <div className="text-center p-8 text-destructive">
                                    <p>Error loading tips data. Please try again.</p>
                                  </div>
                                ) : staffTipsDiscountsData?.data ? (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                      <CardHeader className="p-3">
                                        <CardTitle className="text-sm">Total Tips</CardTitle>
                                      </CardHeader>
                                      <CardContent className="p-3 pt-0">
                                        <p className="text-2xl font-bold">
                                          ${parseFloat(staffTipsDiscountsData.data.summary.totalTips as string || '0').toFixed(2)}
                                        </p>
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardHeader className="p-3">
                                        <CardTitle className="text-sm">Avg Tip %</CardTitle>
                                      </CardHeader>
                                      <CardContent className="p-3 pt-0">
                                        <p className="text-2xl font-bold">
                                          {parseFloat(staffTipsDiscountsData.data.summary.avgTipPercentage as string || '0').toFixed(2)}%
                                        </p>
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardHeader className="p-3">
                                        <CardTitle className="text-sm">Invoices w/ Tip</CardTitle>
                                      </CardHeader>
                                      <CardContent className="p-3 pt-0">
                                        <p className="text-2xl font-bold">
                                          {staffTipsDiscountsData.data.summary.invoicesWithTip}
                                        </p>
                                      </CardContent>
                                    </Card>
                                  </div>
                                ) : (
                                  <div className="text-center p-8 text-muted-foreground">
                                    No tips data available
                                  </div>
                                )}
                              </TabsContent>

                              <TabsContent value="discounts" className="space-y-4 pt-4">
                                {staffTipsDiscountsLoading ? (
                                  <div className="flex justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                  </div>
                                ) : staffTipsDiscountsError ? (
                                  <div className="text-center p-8 text-destructive">
                                    <p>Error loading discounts data. Please try again.</p>
                                  </div>
                                ) : staffTipsDiscountsData?.data ? (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                      <CardHeader className="p-3">
                                        <CardTitle className="text-sm">Total Discounts</CardTitle>
                                      </CardHeader>
                                      <CardContent className="p-3 pt-0">
                                        <p className="text-2xl font-bold">
                                          ${parseFloat(staffTipsDiscountsData.data.summary.totalDiscounts as string || '0').toFixed(2)}
                                        </p>
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardHeader className="p-3">
                                        <CardTitle className="text-sm">Avg Discount %</CardTitle>
                                      </CardHeader>
                                      <CardContent className="p-3 pt-0">
                                        <p className="text-2xl font-bold">
                                          {parseFloat(staffTipsDiscountsData.data.summary.avgDiscountPercentage as string || '0').toFixed(2)}%
                                        </p>
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardHeader className="p-3">
                                        <CardTitle className="text-sm">Invoices w/ Discount</CardTitle>
                                      </CardHeader>
                                      <CardContent className="p-3 pt-0">
                                        <p className="text-2xl font-bold">
                                          {staffTipsDiscountsData.data.summary.invoicesWithDiscount}
                                        </p>
                                      </CardContent>
                                    </Card>
                                  </div>
                                ) : (
                                  <div className="text-center p-8 text-muted-foreground">
                                    No discount data available
                                  </div>
                                )}
                              </TabsContent>
                            </Tabs>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          No detailed metrics available for this staff member
                        </div>
                      )
                    )
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Tips & Discounts Tab */}
            <TabsContent value="tips-discounts" className="space-y-6">
              <Card className="col-span-4">
                <CardHeader className="pb-2">
                  <CardTitle>Tips & Discounts Analysis</CardTitle>
                  <CardDescription>
                    Comparison of tips and discounts over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {renderTipsDiscountsChart()}
                </CardContent>
              </Card>

              {tipsDiscountsData?.data?.summary && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        ${parseFloat(tipsDiscountsData.data.summary.totalTips as string || '0').toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {parseFloat(tipsDiscountsData.data.summary.avgTipPercentage as string || '0').toFixed(2)}% average tip rate
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        ${parseFloat(tipsDiscountsData.data.summary.totalDiscounts as string || '0').toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {parseFloat(tipsDiscountsData.data.summary.avgDiscountPercentage as string || '0').toFixed(2)}% average discount rate
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Invoices with Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {parseFloat(tipsDiscountsData.data.summary.invoicesWithTip as string || '0')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tipsDiscountsData.data.summary.totalInvoices ?
                          ((parseFloat(tipsDiscountsData.data.summary.invoicesWithTip as string) /
                            parseFloat(tipsDiscountsData.data.summary.totalInvoices as string)) * 100).toFixed(2) :
                          '0'}% of total invoices
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Invoices with Discounts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {parseFloat(tipsDiscountsData.data.summary.invoicesWithDiscount as string || '0')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tipsDiscountsData.data.summary.totalInvoices ?
                          ((parseFloat(tipsDiscountsData.data.summary.invoicesWithDiscount as string) /
                            parseFloat(tipsDiscountsData.data.summary.totalInvoices as string)) * 100).toFixed(2) :
                          '0'}% of total invoices
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
