import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X,
  Loader2,
  Clock,
  Scissors
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { AppointmentList } from '@/features/appointments/AppointmentList';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AppointmentDetailsDialog } from '@/features/appointments/AppointmentDetailsDialog';
import { AppointmentDetailsModalMobile } from '@/features/appointments/AppointmentDetailsModalMobile';
import { CompleteAppointmentDialog } from '@/features/appointments/CompleteAppointmentDialog';
import { useToast } from '@/hooks/use-toast';
import { getStaffAppointments, updateAppointmentStatus } from '@/api/services/appointmentService';
import { Appointment as ApiAppointment, Service } from '@/api/services/appointmentService';
import { Appointment as UIAppointment } from '@/types';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Date range options
type DateRangeType = 'today' | 'tomorrow' | 'thisWeek' | 'nextWeek' | 'custom';

const DATE_RANGE_OPTIONS: Record<DateRangeType, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  thisWeek: 'This Week',
  nextWeek: 'Next Week',
  custom: 'Custom Range'
};

export const StaffAppointments: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('today');
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: new Date(),
    end: new Date()
  });
  // Temporary date range for custom selection before applying
  const [tempDateRange, setTempDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: new Date(),
    to: new Date()
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeOfDayFilter, setTimeOfDayFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [appointmentToComplete, setAppointmentToComplete] = useState<ApiAppointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [staffData, setStaffData] = useState<{
    appointments: ApiAppointment[];
    services: Service[];
    totalCount: number;
  } | null>(null);
  const { toast } = useToast();

  // Detect mobile viewport
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Handle date range selection
  useEffect(() => {
    let start = new Date();
    let end = new Date();
    
    switch (dateRangeType) {
      case 'today':
        // Keep start and end as today
        break;
      case 'tomorrow':
        start = addDays(new Date(), 1);
        end = addDays(new Date(), 1);
        break;
      case 'thisWeek':
        start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start from Monday
        end = endOfWeek(new Date(), { weekStartsOn: 1 }); // End on Sunday
        break;
      case 'nextWeek':
        start = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7);
        end = addDays(endOfWeek(new Date(), { weekStartsOn: 1 }), 7);
        break;
      case 'custom':
        // Don't update dateRange for custom - it will be updated when Apply is clicked
        return;
      default:
        break;
    }
    
    // Update range for preset selections (custom handled separately)
    setDateRange({ start, end });
    setSelectedDate(start);

    // Also update tempDateRange to keep them in sync
    setTempDateRange({ from: start, to: end });
  }, [dateRangeType]);

  // Fetch appointments from API
  const fetchStaffData = async (
    page = 1,
    limit = 100,
    sort = 'time_asc',
    startDate?: string,
    endDate?: string,
    customerId?: string,
    status?: string,
    searchTerm?: string,
    timeOfDay?: string,
    services?: string[]
  ) => {
    try {
      setIsLoading(true);
      const response = await getStaffAppointments(
        page,
        limit,
        sort,
        startDate,
        endDate,
        customerId,
        status,
        searchTerm,
        timeOfDay,
        services
      );
      
      if (response.success) {
        setStaffData({
          appointments: response.appointments,
          services: response.services,
          totalCount: response.totalCount
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load appointments',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching staff appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointments. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts or when filters change
  useEffect(() => {
    const startDateString = format(dateRange.start, 'yyyy-MM-dd');
    const endDateString = format(dateRange.end, 'yyyy-MM-dd');
    
    fetchStaffData(
      1, 
      100, 
      'time_asc', 
      startDateString,
      endDateString,
      undefined, 
      statusFilter !== 'all' ? statusFilter : undefined,
      undefined,
      timeOfDayFilter !== 'all' ? timeOfDayFilter : undefined,
      serviceFilter.length > 0 ? serviceFilter : undefined
    );
  }, [dateRange, statusFilter, timeOfDayFilter, serviceFilter]);

  // Search is now performed via API instead of locally filtering
  const handleSearch = () => {
    const startDateString = format(dateRange.start, 'yyyy-MM-dd');
    const endDateString = format(dateRange.end, 'yyyy-MM-dd');
    
    fetchStaffData(
      1,
      100,
      'time_asc',
      startDateString,
      endDateString,
      undefined,
      statusFilter !== 'all' ? statusFilter : undefined,
      searchQuery.trim() !== '' ? searchQuery : undefined,
      timeOfDayFilter !== 'all' ? timeOfDayFilter : undefined,
      serviceFilter.length > 0 ? serviceFilter : undefined
    );
  };

  // Handle service filter toggle
  const toggleServiceFilter = (serviceId: string) => {
    setServiceFilter(current => 
      current.includes(serviceId) 
        ? current.filter(id => id !== serviceId) 
        : [...current, serviceId]
    );
  };

  const goToPreviousDay = () => {
    if (dateRangeType === ('custom' as DateRangeType)) {
      setDateRange(prev => ({
        start: addDays(prev.start, -1),
        end: addDays(prev.end, -1)
      }));
    } else {
      setSelectedDate(prev => {
        const newDate = addDays(prev, -1);
        setDateRange({
          start: newDate,
          end: newDate
        });
        return newDate;
      });
      setDateRangeType('custom');
    }
  };

  const goToNextDay = () => {
    if (dateRangeType === ('custom' as DateRangeType)) {
      setDateRange(prev => ({
        start: addDays(prev.start, 1),
        end: addDays(prev.end, 1)
      }));
    } else {
      setSelectedDate(prev => {
        const newDate = addDays(prev, 1);
        setDateRange({
          start: newDate,
          end: newDate
        });
        return newDate;
      });
      setDateRangeType('custom');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTimeOfDayFilter('all');
    setServiceFilter([]);
    setDateRangeType('today');
    const today = new Date();
    setDateRange({ start: today, end: today });
    setTempDateRange({ from: today, to: today });
    
    // Reset search after clearing filters
    fetchStaffData(1, 100, 'time_asc', format(today, 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd'));
  };

  const handleViewAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setIsDetailsOpen(true);
  };

  // Handle appointment status change
  const handleStatusChange = async (appointmentId: string, newStatus: UIAppointment['status']) => {
    try {
      // Optimistically update the UI first
      if (staffData) {
        const updatedAppointments = staffData.appointments.map(app => {
          if (app.id === appointmentId) {
            return { ...app, status: newStatus };
          }
          return app;
        });
        
        // Update the UI immediately
        setStaffData({
          ...staffData,
          appointments: updatedAppointments
        });
      }
      
      // Then make the API call
      await updateAppointmentStatus(appointmentId, newStatus);
      
      toast({
        title: 'Status Updated',
        description: `Appointment status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      
      // If there was an error, refresh the data to get back to a consistent state
      const startDateString = format(dateRange.start, 'yyyy-MM-dd');
      const endDateString = format(dateRange.end, 'yyyy-MM-dd');
      
      fetchStaffData(
        1, 
        100, 
        'time_asc', 
        startDateString,
        endDateString,
        undefined, 
        statusFilter !== 'all' ? statusFilter : undefined,
        searchQuery.trim() !== '' ? searchQuery : undefined,
        timeOfDayFilter !== 'all' ? timeOfDayFilter : undefined,
        serviceFilter.length > 0 ? serviceFilter : undefined
      );
      
      toast({
        title: 'Error',
        description: 'Failed to update appointment status. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Handle complete appointment via modal
  const handleCompleteAppointment = (appointment: UIAppointment) => {
    const apiAppt = staffData?.appointments.find(a => a.id === appointment.id);
    if (apiAppt) {
      setAppointmentToComplete(apiAppt);
    } else {
      // Fallback minimal object; dialog will refetch details
      setAppointmentToComplete({ id: appointment.id } as unknown as ApiAppointment);
    }
    setShowCompleteDialog(true);
  };

  const handleCompleteDone = (_updated: ApiAppointment) => {
    void _updated; // Mark as used to satisfy linter
    // Refresh data after completion
    const startDateString = format(dateRange.start, 'yyyy-MM-dd');
    const endDateString = format(dateRange.end, 'yyyy-MM-dd');
    fetchStaffData(
      1,
      100,
      'time_asc',
      startDateString,
      endDateString,
      undefined,
      statusFilter !== 'all' ? statusFilter : undefined,
      searchQuery.trim() !== '' ? searchQuery : undefined,
      timeOfDayFilter !== 'all' ? timeOfDayFilter : undefined,
      serviceFilter.length > 0 ? serviceFilter : undefined
    );
    setShowCompleteDialog(false);
  };

  // Convert API appointments to UI format for the appointment list
  const convertApiToUIAppointment = (apiAppointment: ApiAppointment): UIAppointment => {
    return {
      id: apiAppointment.id,
      customerId: apiAppointment.customer_id,
      customerName: apiAppointment.customer_name,
      customerPhone: apiAppointment.customer_phone,
      customerEmail: apiAppointment.customer_email || '',
      staffId: apiAppointment.staff_id,
      staffName: apiAppointment.staff_name,
      date: apiAppointment.date,
      time: apiAppointment.time,
      endTime: apiAppointment.end_time || calculateEndTime(apiAppointment),
      status: apiAppointment.status,
      services: apiAppointment.appointmentServices ? apiAppointment.appointmentServices.map(service => ({
        serviceId: service.service_id,
        serviceName: service.service_name,
        price: service.price,
        duration: service.duration
      })) : [],
      totalAmount: apiAppointment.total_amount,
      notes: apiAppointment.notes || '',
      createdAt: apiAppointment.created_at || new Date().toISOString(),
      updatedAt: apiAppointment.updated_at || new Date().toISOString()
    };
  };

  // Helper to calculate end time if not provided by API
  const calculateEndTime = (appointment: ApiAppointment): string => {
    const services = appointment.appointmentServices || appointment.services || [];
    const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
    const [hours, minutes] = appointment.time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + totalDuration;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  // Get UI appointments - No need to filter locally as API handles it
  const uiAppointments = staffData?.appointments.map(convertApiToUIAppointment) || [];

  const selectedAppointment = selectedAppointmentId 
    ? uiAppointments.find(app => app.id === selectedAppointmentId) 
    : null;

  // Format date range for display
  const formatDateRange = () => {
    if (dateRange.start.toDateString() === dateRange.end.toDateString()) {
      return format(dateRange.start, 'MMM d, yyyy');
    }
    return `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`;
  };

  // Check if there are any active filters
  const hasActiveFilters = searchQuery || 
    statusFilter !== 'all' || 
    timeOfDayFilter !== 'all' || 
    serviceFilter.length > 0 || 
    dateRangeType !== 'today';

  // Count active filters
  const activeFiltersCount = 
    (searchQuery ? 1 : 0) + 
    (statusFilter !== 'all' ? 1 : 0) + 
    (timeOfDayFilter !== 'all' ? 1 : 0) + 
    (serviceFilter.length > 0 ? 1 : 0) + 
    (dateRangeType !== 'today' ? 1 : 0);

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="My Appointments"
        description="View and manage your appointments"
      />
      
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousDay}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-[200px] sm:w-[240px] justify-center text-center font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateRange()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className={cn(
                    "w-auto p-0 min-w-[300px]",
                    isMobile ? "max-w-[95vw]" : ""
                  )}
                  align={isMobile ? "center" : "start"}
                >
                  <Tabs defaultValue="preset" className="w-full">
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="preset">Presets</TabsTrigger>
                      <TabsTrigger value="custom">Custom</TabsTrigger>
                    </TabsList>
                    <TabsContent value="preset" className="p-4 space-y-4">
                      <RadioGroup 
                        value={dateRangeType} 
                        onValueChange={(value: string) => {
                          setDateRangeType(value as DateRangeType);
                          // Close the popover after selecting a preset
                          const popoverTrigger = document.querySelector('[aria-expanded="true"]');
                          if (popoverTrigger instanceof HTMLElement) {
                            popoverTrigger.click();
                          }
                        }}
                      >
                        {Object.entries(DATE_RANGE_OPTIONS).map(([value, label]) => (
                          <div className="flex items-center space-x-2" key={value}>
                            <RadioGroupItem value={value} id={`date-range-${value}`} />
                            <Label htmlFor={`date-range-${value}`}>{label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </TabsContent>
                    <TabsContent value="custom" className="p-4 space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">Select a date range</p>
                      <Calendar
                        mode="range"
                        selected={{
                          from: tempDateRange.from,
                          to: tempDateRange.to
                        }}
                        onSelect={(range) => {
                          if (range?.from) {
                            setTempDateRange({
                              from: range.from,
                              to: range.to
                            });
                            setDateRangeType('custom');
                          }
                        }}
                        initialFocus
                        numberOfMonths={isMobile ? 1 : 2}
                      />
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => {
                          // Only update dateRange and make API call if we have a valid range
                          if (tempDateRange.from && tempDateRange.to) {
                            // Update the actual dateRange that triggers API calls
                            setDateRange({
                              start: tempDateRange.from,
                              end: tempDateRange.to || tempDateRange.from
                            });
                            
                            // Fetch appointments with the custom date range
                            const startDateString = format(tempDateRange.from, 'yyyy-MM-dd');
                            const endDateString = tempDateRange.to 
                              ? format(tempDateRange.to, 'yyyy-MM-dd')
                              : format(tempDateRange.from, 'yyyy-MM-dd');
                            
                            fetchStaffData(
                              1, 
                              100, 
                              'time_asc', 
                              startDateString,
                              endDateString,
                              undefined, 
                              statusFilter !== 'all' ? statusFilter : undefined,
                              searchQuery.trim() !== '' ? searchQuery : undefined,
                              timeOfDayFilter !== 'all' ? timeOfDayFilter : undefined,
                              serviceFilter.length > 0 ? serviceFilter : undefined
                            );
                          }
                        
                          // Close the popover
                          const popoverTrigger = document.querySelector('[aria-expanded="true"]');
                          if (popoverTrigger instanceof HTMLElement) {
                            popoverTrigger.click();
                          }
                        }}
                      >
                        Apply
                      </Button>
                    </TabsContent>
                  </Tabs>
                </PopoverContent>
              </Popover>
              
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextDay}
                className="h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="hidden sm:flex items-center gap-2 ml-auto">
              <Badge variant="secondary" className="h-9 px-4">
                {uiAppointments.length} appointment{uiAppointments.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col sm:flex-row items-stretch gap-3">
          {/* Search row */}
          <div className="flex w-full gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search appointments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              variant="secondary" 
              onClick={handleSearch}
              disabled={isLoading}
              className="shrink-0"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
          </div>

          <div className="hidden lg:flex items-center gap-3 lg:flex-nowrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeOfDayFilter} onValueChange={setTimeOfDayFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time of Day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Times</SelectItem>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9"
              >
                <X className="h-4 w-4 mr-2" />
                Clear filters
              </Button>
            )}
          </div>

          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="lg:hidden w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="lg:hidden mt-2"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <SheetContent side="right" className="w-full sm:max-w-[400px]">
              <SheetHeader className="mb-6">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time of Day</label>
                  <Select value={timeOfDayFilter} onValueChange={setTimeOfDayFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Times</SelectItem>
                      <SelectItem value="morning">Morning (6AM-12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12PM-5PM)</SelectItem>
                      <SelectItem value="evening">Evening (5PM-12AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Select value={dateRangeType} onValueChange={(value: string) => setDateRangeType(value as DateRangeType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DATE_RANGE_OPTIONS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {dateRangeType === ('custom' as DateRangeType) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom Date Range</label>
                    <Calendar
                      mode="range"
                      selected={{
                        from: tempDateRange.from,
                        to: tempDateRange.to
                      }}
                      onSelect={(range) => {
                        if (range?.from) {
                          setTempDateRange({
                            from: range.from,
                            to: range.to
                          });
                        }
                      }}
                      className="border rounded-md p-3"
                    />
                  </div>
                )}
                
                {staffData?.services && staffData.services.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Services</label>
                    <div className="flex flex-col space-y-2 p-2 border rounded-md">
                      {staffData.services.map(service => (
                        <div key={service.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`service-${service.id}`}
                            checked={serviceFilter.includes(service.id)}
                            onCheckedChange={() => toggleServiceFilter(service.id)}
                          />
                          <label
                            htmlFor={`service-${service.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex justify-between w-full"
                          >
                            <span>{service.name}</span>
                            <span className="text-muted-foreground">${service.price}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearFilters} className="flex-1">
                    Reset
                  </Button>
                  <SheetClose asChild>
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        // If using custom date range, update dateRange from tempDateRange
                        if ((dateRangeType as string) === 'custom' && tempDateRange.from) {
                          setDateRange({
                            start: tempDateRange.from,
                            end: tempDateRange.to || tempDateRange.from
                          });
                        }
                      }}
                    >
                      Apply Filters
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {hasActiveFilters && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {dateRangeType !== 'today' && (
              <Badge variant="outline" className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {(dateRangeType === ('custom' as DateRangeType)) 
                  ? `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d')}`
                  : DATE_RANGE_OPTIONS[dateRangeType]}
                <button className="ml-1" onClick={() => {
                  setDateRangeType('today');
                  const today = new Date();
                  setDateRange({ start: today, end: today });
                }}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Status: {statusFilter}
                <button className="ml-1" onClick={() => setStatusFilter('all')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {timeOfDayFilter !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeOfDayFilter}
                <button className="ml-1" onClick={() => setTimeOfDayFilter('all')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {serviceFilter.map(serviceId => {
              const service = staffData?.services.find(s => s.id === serviceId);
              return service ? (
                <Badge key={serviceId} variant="outline" className="flex items-center gap-1">
                  <Scissors className="h-3 w-3" />
                  {service.name}
                  <button className="ml-1" onClick={() => toggleServiceFilter(serviceId)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-10">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              Loading appointments...
            </p>
          </div>
        ) : uiAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground p-4">
            No appointments found for the selected criteria.
          </div>
        ) : (
          <AppointmentList 
            appointments={uiAppointments}
            isStaffView={true}
            showActions={true}
            onViewAppointment={handleViewAppointment}
            onStatusChange={handleStatusChange}
            onCompleteAppointment={handleCompleteAppointment}
          />
        )}
      </div>

      {selectedAppointment && (
        isMobile ? (
          <AppointmentDetailsModalMobile
            appointment={selectedAppointment}
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
          />
        ) : (
          <AppointmentDetailsDialog 
            appointment={selectedAppointment}
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            isStaffView={true}
            onStatusChange={handleStatusChange}
          />
        )
      )}

      {appointmentToComplete && (
        <CompleteAppointmentDialog
          appointment={appointmentToComplete}
          open={showCompleteDialog}
          onOpenChange={setShowCompleteDialog}
          onCompleted={handleCompleteDone}
        />
      )}
    </div>
  );
};

export default StaffAppointments;