import React, { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  getDay, 
  getDaysInMonth, 
  isSameDay, 
  startOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CalendarDays, 
  LayoutGrid, 
  LayoutList
} from 'lucide-react';

import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types';
import { theme } from '@/theme/theme';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { AppointmentDetailsModalMobile } from '@/features/appointments/AppointmentDetailsModalMobile';

type CalendarView = 'month' | 'week' | 'day' | 'list';

interface MobileCalendarViewProps {
  appointments: Appointment[];
  onSelectDate?: (date: Date) => void;
  onViewAppointment?: (appointmentId: string) => void; // not used to avoid duplicate dialogs
  onAddAppointment?: (date: Date) => void;
}

/**
 * Mobile Calendar View Component
 * 
 * Note: We receive onViewAppointment from props but intentionally don't use it
 * to avoid showing duplicate modals (parent already shows appointment details).
 * Instead, we manage our own modal state internally.
 */
export const MobileCalendarView = ({
  appointments,
  onSelectDate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAddAppointment: _onAddAppointment,
}: MobileCalendarViewProps): JSX.Element => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('day');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [listRange, setListRange] = useState<DateRange>({ from: new Date(), to: new Date() });

  // Quick range presets for list view
  const applyQuickRange = (preset: 'today' | 'tomorrow' | 'next7' | 'next14' | 'thisWeek' | 'nextWeek') => {
    const today = startOfDay(new Date());
    let from = today;
    let to = today;
    switch (preset) {
      case 'tomorrow':
        from = addDays(today, 1);
        to = from;
        break;
      case 'next7':
        to = addDays(today, 6);
        break;
      case 'next14':
        to = addDays(today, 13);
        break;
      case 'thisWeek':
        from = startOfWeek(today);
        to = endOfWeek(today);
        break;
      case 'nextWeek': {
        const start = startOfWeek(addWeeks(today, 1));
        from = start;
        to = endOfWeek(start);
        break;
      }
    }
    setListRange({ from, to });
    setCurrentDate(from);
    setSelectedDate(from);
    onSelectDate?.(from);
  };

  const isPresetActive = (preset: 'today' | 'tomorrow' | 'next7' | 'next14' | 'thisWeek' | 'nextWeek') => {
    const today = startOfDay(new Date());
    const eq = (d1: Date, d2: Date) => format(d1, 'yyyy-MM-dd') === format(d2, 'yyyy-MM-dd');
    switch (preset) {
      case 'today':
        return eq(listRange.from ?? today, today) && eq(listRange.to ?? today, today);
      case 'tomorrow': {
        const t = addDays(today, 1);
        return eq(listRange.from ?? t, t) && eq(listRange.to ?? t, t);
      }
      case 'next7':
        return eq(listRange.from ?? today, today) && eq(listRange.to ?? today, addDays(today, 6));
      case 'next14':
        return eq(listRange.from ?? today, today) && eq(listRange.to ?? today, addDays(today, 13));
      case 'thisWeek':
        return eq(listRange.from ?? today, startOfWeek(today)) && eq(listRange.to ?? today, endOfWeek(today));
      case 'nextWeek': {
        const start = startOfWeek(addWeeks(today, 1));
        return eq(listRange.from ?? today, start) && eq(listRange.to ?? today, endOfWeek(start));
      }
    }
  };

  // Silence unused variable
  void _onAddAppointment;

  // Add CSS for custom scrollbar when component mounts
  useEffect(() => {
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 3px;
        height: 3px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #ccc;
      }
      
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #ddd transparent;
      }
    `;
    
    // Add it to the document
    document.head.appendChild(style);
    
    // Clean up
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const selectedAppointment = selectedAppointmentId 
    ? appointments.find(app => app.id === selectedAppointmentId) ?? null
    : null;

  // Function to handle opening the appointment details modal
  const handleViewAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowAppointmentDetails(true);
  };

  // Navigation functions
  const goToPrevious = () => {
    switch (view) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'list':
        setCurrentDate(subDays(currentDate, 1));
        break;
    }
  };

  const goToNext = () => {
    switch (view) {
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'list':
        setCurrentDate(addDays(currentDate, 1));
        break;
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    onSelectDate?.(today);
  };

  // Get title based on current view
  const getViewTitle = () => {
    let title = '';
    switch (view) {
      case 'month':
        title = format(currentDate, 'MMM yyyy');
        break;
      case 'week': {
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        title = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;
        break;
      }
      case 'day':
        title = format(currentDate, 'MMM d, yyyy');
        break;
      case 'list': {
        const listStart = listRange?.from ?? currentDate;
        const listEnd = listRange?.to ?? currentDate;
        title = `${format(listStart, 'MMM d')} - ${format(listEnd, 'MMM d')}`;
        break;
      }
    }
    return title;
  };

  // Appointment filtering helpers
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(
      (appointment) => appointment.date === dateStr
    );
  };

  // When a date cell is clicked in Month view
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
    setView('day');
    onSelectDate?.(date);
  };

  // Header with navigation and view controls - Mobile optimized with minimal layout
  const renderHeader = () => {
    return (
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold truncate max-w-[150px]">
            {getViewTitle()}
          </h2>
          
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" onClick={goToPrevious} className="h-7 w-7 rounded-full shadow-sm">
              <ChevronLeft className="h-3 w-3" />
            </Button>
            {view !== 'list' ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="px-2 py-0 h-7 text-xs">
                    {format(currentDate, 'dd MMM yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={currentDate}
                    onSelect={(date) => {
                      if (date) {
                        setCurrentDate(date);
                        setSelectedDate(date);
                        onSelectDate?.(date);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="px-2 py-0 h-7 text-xs">
                    {`${format(listRange.from ?? new Date(), 'dd MMM')} - ${format(listRange.to ?? new Date(), 'dd MMM')}`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto" align="start">
                  <div className="p-3 pb-2 border-b space-y-2 w-[220px]">
                    <h4 className="text-[10px] font-medium text-muted-foreground mb-1">Quick ranges</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { key: 'today', label: 'Today' },
                        { key: 'tomorrow', label: 'Tomorrow' },
                        { key: 'next7', label: 'Next 7 Days' },
                        { key: 'next14', label: 'Next 14 Days' },
                        { key: 'thisWeek', label: 'This Week' },
                        { key: 'nextWeek', label: 'Next Week' },
                      ] as const).map(({ key, label }) => (
                        <Button
                          key={key}
                          variant={isPresetActive(key) ? 'default' : 'ghost'}
                          size="sm"
                          className="text-[10px]"
                          onClick={() => applyQuickRange(key)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <CalendarComponent
                    mode="range"
                    selected={listRange}
                    onSelect={(range) => {
                      if (range?.from) {
                        setListRange(range as DateRange);
                        const newCurr = range.from;
                        setCurrentDate(newCurr);
                        setSelectedDate(newCurr);
                        onSelectDate?.(newCurr);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
            <Button variant="outline" size="icon" onClick={goToNext} className="h-7 w-7 rounded-full shadow-sm">
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Tabs 
            value={view} 
            onValueChange={(value) => setView(value as CalendarView)} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 shadow-sm h-12 rounded-md bg-muted/20">
              <TabsTrigger value="month" className="flex flex-col items-center justify-center gap-0.5 h-full text-[11px] hidden">
                <CalendarDays className="h-4 w-4" />
                <span>Month</span>
              </TabsTrigger>
              <TabsTrigger value="week" className="flex flex-col items-center justify-center gap-0.5 h-full text-[11px] hidden">
                <LayoutGrid className="h-4 w-4" />
                <span>Week</span>
              </TabsTrigger>
              <TabsTrigger value="day" className="flex flex-col items-center justify-center gap-0.5 h-full text-[11px]">
                <Clock className="h-4 w-4" />
                <span>Day</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex flex-col items-center justify-center gap-0.5 h-full text-[11px]">
                <LayoutList className="h-4 w-4" />
                <span>List</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    );
  };

  // Month View - Mobile optimized with minimal information
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const startDate = getDay(monthStart);
    const daysInMonth = getDaysInMonth(currentDate);
    
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    const renderDays = () => (
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {days.map((day, index) => (
          <div
            key={index}
            className="h-6 flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
    );

    const renderCells = () => {
      const rows = [];
      const cells = [];

      // Create blank cells for days before the first of the month
      for (let i = 0; i < startDate; i++) {
        cells.push(
          <div
            key={`empty-${i}`}
            className="border h-12 p-1 bg-background-alt rounded-md opacity-40 shadow-sm"
          />
        );
      }

      // Create cells for days in the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = format(date, 'yyyy-MM-dd');
        const isToday = isSameDay(date, new Date());
        const dayAppointments = getAppointmentsForDate(date);

        cells.push(
          <div
            key={dateStr}
            className={cn(
              "border h-12 p-1.5 relative transition-all duration-200 cursor-pointer",
              isToday && "bg-primary/5 border-primary",
              // Add rounded corners and additional styling
              "rounded-md shadow-sm"
            )}
            onClick={() => handleDateClick(date)}
          >
            <div className="flex justify-between items-center mb-1">
                <span
                  className={cn(
                  "text-xs font-medium h-5 w-5 flex items-center justify-center",
                  isToday && "rounded-full text-primary bg-primary/10 font-bold"
                  )}
                >
                {day}
                </span>
              {dayAppointments.length > 0 && (
                <span className="absolute top-0.5 right-0.5 text-[9px] font-medium text-muted-foreground">
                  {dayAppointments.length}
                </span>
              )}
            </div>
            
            {/* Show a small indicator if there are appointments */}
            {dayAppointments.length > 0 && (
              <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(dayAppointments.length, 3) }).map((_, i) => (
                    <div 
                      key={i} 
                      className="h-1.5 w-1.5 rounded-full bg-primary/50"
                    />
                  ))}
                </div>
                </div>
              )}
          </div>
        );

        // Start a new row after every 7 cells
        if ((startDate + day) % 7 === 0 || day === daysInMonth) {
          const row = [...cells];
          rows.push(
            <div className="grid grid-cols-7 gap-1.5 mb-1.5" key={`row-${day}`}>
              {row}
            </div>
          );
          cells.length = 0;
        }
      }

      return rows;
    };

    return (
      <div>
        {renderDays()}
        {renderCells()}
      </div>
    );
  };
  
  // Week View - Mobile optimized
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="space-y-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            
            return (
              <div 
                key={format(day, 'yyyy-MM-dd')} 
                className={cn(
                  "flex flex-col items-center justify-center py-1 rounded-md transition-all duration-200 cursor-pointer",
                  isToday && "bg-primary/10",
                  isSelected && "ring-1 ring-primary"
                )}
                onClick={() => {
                  setSelectedDate(day);
                  setCurrentDate(day);
                  onSelectDate?.(day);
                }}
              >
                <span className="text-xs text-muted-foreground">{format(day, 'EEE')}</span>
                <span className={cn(
                  "text-xs font-medium mt-1 h-5 w-5 flex items-center justify-center",
                  isToday && "rounded-full bg-primary/20 text-primary"
                )}>
                  {format(day, 'd')}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Appointments for selected date */}
        <div className="space-y-1 mt-2">
          <h3 className="text-sm font-medium px-1">
            {format(selectedDate, 'EEEE, MMMM d')}
          </h3>
          
          <div className="border rounded-lg overflow-hidden shadow-sm divide-y">
            {getAppointmentsForDate(selectedDate).length === 0 ? (
              <div className="py-4 text-center text-muted-foreground text-xs">
                No appointments for this day
              </div>
            ) : (
              getAppointmentsForDate(selectedDate).map((appointment) => (
                <div 
                  key={appointment.id}
                  className="p-2 hover:bg-muted/10 transition-colors active:bg-muted/20"
                  onClick={() => handleViewAppointment(appointment.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <div 
                          className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: getStatusColor(appointment.status) }}
                      />
                      <span className="text-xs font-medium">{appointment.time}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] h-4 px-1 py-0 rounded-full",
                        appointment.status === 'confirmed' && "bg-success/10 text-success border-success/30",
                        appointment.status === 'cancelled' && "bg-error/10 text-error border-error/30",
                        appointment.status === 'scheduled' && "bg-warning/10 text-warning border-warning/30"
                      )}
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="ml-3 mt-1">
                    <div className="text-xs font-medium">{appointment.customerName}</div>
                    <div className="text-[10px] text-muted-foreground truncate max-w-[90%]">
                      {appointment.services.map(s => s.serviceName).join(', ')}
                      </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // Day View - Mobile optimized with single day focus
  const renderDayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
    const dayAppointments = getAppointmentsForDate(currentDate);

    return (
      <div>
        <div className="text-center mb-3 bg-muted/10 py-2 rounded-lg shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">{format(currentDate, 'EEEE')}</div>
          <div className="text-base font-bold">{format(currentDate, 'MMMM d, yyyy')}</div>
        </div>
        
        <div className="border rounded-lg shadow-sm divide-y overflow-hidden">
          {hours.map((hour) => {
            const hourAppointments = dayAppointments.filter(appointment => {
              const appointmentHour = parseInt(appointment.time.split(':')[0], 10);
              return appointmentHour === hour;
            });
            
            return (
              <div key={hour} className="flex items-start">
                <div className="p-2 text-xs text-muted-foreground w-10 flex-shrink-0">
                  {hour}:00
          </div>
                <div className="flex-1 min-h-[50px] p-1 hover:bg-muted/5">
                  {hourAppointments.length === 0 ? (
                    <div className="h-full"></div>
        ) : (
                    <div className="space-y-1">
                      {hourAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                          className="p-1.5 rounded-md bg-primary/10 border border-primary/20 text-xs cursor-pointer hover:bg-primary/20 transition-colors active:bg-primary/30 shadow-sm w-full max-w-full"
                  onClick={() => handleViewAppointment(appointment.id)}
                >
                  <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getStatusColor(appointment.status) }}
                      />
                              <span className="font-medium">{appointment.time}</span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className="text-[9px] h-4 px-1 py-0 rounded-full"
                            >
                              {getTotalServiceDuration(appointment)} min
                            </Badge>
                          </div>
                          <div className="font-medium mt-1 truncate">
                            {appointment.customerName}
                          </div>
                          <div className="text-[10px] text-muted-foreground break-words whitespace-normal">
                            {getServiceNames(appointment)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
            </div>
            );
          })}
          </div>
      </div>
    );
  };

  // List View - Mobile optimized with simplified layout
  const renderListView = () => {
    // Get appointments for the next 14 days
    const getAppointmentsForPeriod = () => {
      const start = listRange?.from ?? currentDate;
      const end = listRange?.to ?? currentDate;
      const result = [] as { date: Date; appointments: Appointment[] }[];
      let day = startOfDay(start);
      const endDay = endOfDay(end);
      while (day <= endDay) {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayAppointments = appointments.filter(a => a.date === dateStr);
        if (dayAppointments.length > 0) {
          result.push({ date: day, appointments: dayAppointments });
        }
        day = addDays(day, 1);
      }
      return result;
    };

    const periodAppointments = getAppointmentsForPeriod();

    return (
      <div className="space-y-4 custom-scrollbar overflow-y-auto max-h-[70vh]">
        {periodAppointments.length === 0 ? (
          <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
            No appointments scheduled
          </div>
        ) : (
          periodAppointments.map(({ date, appointments }) => (
            <div key={format(date, 'yyyy-MM-dd')} className="border rounded-lg overflow-hidden shadow-sm">
              <div className={cn(
                "px-3 py-2 font-medium text-sm border-b",
                isSameDay(date, new Date()) && "bg-primary/10"
              )}>
                {format(date, 'EEE, MMM d')}
                <Badge variant="outline" className="ml-2 text-[10px] rounded-full">
                  {appointments.length}
                </Badge>
              </div>
              <div className="divide-y">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-2 hover:bg-muted/10 transition-colors active:bg-muted/20"
                    onClick={() => handleViewAppointment(appointment.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-xs">{appointment.time}</div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] h-4 px-1 py-0 rounded-full",
                          appointment.status === 'confirmed' && "bg-success/10 text-success border-success/30",
                          appointment.status === 'cancelled' && "bg-error/10 text-error border-error/30",
                          appointment.status === 'scheduled' && "bg-warning/10 text-warning border-warning/30"
                        )}
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div 
                        className="w-1.5 h-1.5 rounded-full" 
                          style={{ backgroundColor: getStatusColor(appointment.status) }}
                        />
                      <div className="text-xs">{appointment.customerName}</div>
                      </div>
                    <div className="text-[10px] text-muted-foreground ml-3 truncate">
                      {getServiceNames(appointment)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // Helper functions
  const getTotalServiceDuration = (appointment: Appointment) => {
    return appointment.services.reduce((total, service) => total + service.duration, 0);
  };

  const getServiceNames = (appointment: Appointment) => {
    return appointment.services.map(service => service.serviceName).join(', ');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return theme.colors.success;
      case 'scheduled':
        return theme.colors.warning;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <div className="p-3 bg-card rounded-lg shadow-sm border">
      {renderHeader()}
      <div className="mt-3">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
        {view === 'list' && renderListView()}
      </div>
      
      {/* Mobile appointment details modal */}
      {selectedAppointment && (
      <AppointmentDetailsModalMobile
        appointment={selectedAppointment}
        open={showAppointmentDetails}
        onOpenChange={setShowAppointmentDetails}
      />
      )}
    </div>
  );
}; 