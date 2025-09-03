import React, { useState } from 'react';
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

type CalendarView = 'month' | 'week' | 'day' | 'list';

interface TabletCalendarViewProps {
  appointments: Appointment[];
  onSelectDate: (date: Date) => void;
  onViewAppointment: (appointmentId: string) => void;
  onAddAppointment?: (date: Date) => void;
}

export const TabletCalendarView = ({
  appointments,
  onSelectDate,
  onViewAppointment,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAddAppointment: _onAddAppointment,
}: TabletCalendarViewProps): JSX.Element => {
  // Silence unused variable warning
  void _onAddAppointment;

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('day');
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
    onSelectDate(from);
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

  // Navigation functions
  const goToPrevious = () => {
    let newDate: Date;
    switch (view) {
      case 'month':
        newDate = subMonths(currentDate, 1);
        break;
      case 'week':
        newDate = subWeeks(currentDate, 1);
        break;
      case 'day':
        newDate = subDays(currentDate, 1);
        break;
      case 'list':
        newDate = subDays(currentDate, 1);
        break;
      default:
        newDate = currentDate;
    }
    setCurrentDate(newDate);
    onSelectDate(newDate);
  };

  const goToNext = () => {
    let newDate: Date;
    switch (view) {
      case 'month':
        newDate = addMonths(currentDate, 1);
        break;
      case 'week':
        newDate = addWeeks(currentDate, 1);
        break;
      case 'day':
        newDate = addDays(currentDate, 1);
        break;
      case 'list':
        newDate = addDays(currentDate, 1);
        break;
      default:
        newDate = currentDate;
    }
    setCurrentDate(newDate);
    onSelectDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    onSelectDate(today);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
    onSelectDate(date);
    setView('day');
  };

  // Get title based on current view
  const getViewTitle = () => {
    let title = '';
    switch (view) {
      case 'month':
        title = format(currentDate, 'MMMM yyyy');
        break;
      case 'week': {
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        title = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
        break;
      }
      case 'day':
        title = format(currentDate, 'EEEE, MMM d');
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
  
  // Get appointments for a specific time in day/week view
  const getAppointmentsForTimeSlot = (date: Date, hour: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(appointment => {
      if (appointment.date !== dateStr) return false;
      
      const appointmentHour = parseInt(appointment.time.split(':')[0], 10);
      return appointmentHour === hour;
    });
  };

  // Header with navigation and view controls - Tablet optimized with compact layout
  const renderHeader = () => {
    return (
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold truncate max-w-[200px]">
            {getViewTitle()}
          </h2>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPrevious} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {view !== 'list' ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="px-2 py-1 h-8 text-xs">
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
                        onSelectDate(date);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="px-2 py-1 h-8 text-xs">
                    {`${format(listRange.from ?? new Date(), 'dd MMM')} - ${format(listRange.to ?? new Date(), 'dd MMM')}`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto" align="start">
                  <div className="p-3 pb-2 border-b space-y-2 w-[240px]">
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
                        onSelectDate(newCurr);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
            <Button variant="outline" size="icon" onClick={goToNext} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Tabs value={view} onValueChange={(value) => setView(value as CalendarView)} className="w-auto">
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="month" className="flex items-center gap-1 hidden">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Month</span>
              </TabsTrigger>
              <TabsTrigger value="week" className="flex items-center gap-1 hidden">
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Week</span>
              </TabsTrigger>
              <TabsTrigger value="day" className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Day</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-1">
                <LayoutList className="h-3.5 w-3.5" />
                <span>List</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    );
  };

  // Month View - Tablet optimized with medium-sized cells
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const startDate = getDay(monthStart);
    const daysInMonth = getDaysInMonth(currentDate);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const renderDays = () => (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
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
            className="border h-24 p-1.5 bg-background-alt rounded-md opacity-40"
          />
        );
      }

      // Fill in the days of the month
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        const dateAppointments = getAppointmentsForDate(date);
        const isToday = isSameDay(date, new Date());
        const isSelected = isSameDay(date, selectedDate);

        cells.push(
          <div
            key={i}
            className={cn(
              'border h-24 p-1.5 rounded-md transition-colors cursor-pointer hover:bg-background-alt relative overflow-hidden',
              isToday && 'border-primary',
              isSelected && 'bg-background-alt border-primary-light',
            )}
            onClick={() => handleDateClick(date)}
          >
            <div className="flex justify-between items-center mb-1">
              <span
                className={cn(
                  'text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center',
                  isToday && 'bg-primary text-white'
                )}
              >
                {i}
              </span>
              {dateAppointments.length > 0 && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                  {dateAppointments.length}
                </Badge>
              )}
            </div>
            
            <div className="h-[calc(100%-24px)] overflow-hidden">
              <div className="space-y-0.5">
                {dateAppointments.slice(0, 2).map((appointment) => (
                  <div
                    key={appointment.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewAppointment(appointment.id);
                    }}
                    className="text-[10px] p-0.5 rounded bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors truncate flex items-center gap-1"
                  >
                    <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: getStatusColor(appointment.status) }} />
                    <span className="truncate">{appointment.time} - {appointment.customerName}</span>
                  </div>
                ))}
                {dateAppointments.length > 2 && (
                  <div className="text-[10px] text-center text-muted-foreground">
                    +{dateAppointments.length - 2} more
                  </div>
                )}
              </div>
            </div>
          </div>
        );

        // Push the row once we've added 7 cells
        if ((i + startDate) % 7 === 0) {
          rows.push(
            <div key={`row-${i}`} className="grid grid-cols-7 gap-1 mb-1">
              {cells.splice(0, 7)}
            </div>
          );
        }
      }

      // Add any remaining cells
      if (cells.length > 0) {
        // Add empty cells to complete the row
        for (let i = cells.length; i < 7; i++) {
          cells.push(
            <div
              key={`empty-end-${i}`}
              className="border h-24 p-1.5 bg-background-alt rounded-md opacity-40"
            />
          );
        }

        rows.push(
          <div key="row-end" className="grid grid-cols-7 gap-1 mb-1">
            {cells}
          </div>
        );
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

  // Week View - Tablet optimized
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

    return (
      <div className="flex flex-col">
        {/* Day headers */}
        <div className="grid grid-cols-8 mb-2 border-b">
          <div className="h-14 flex items-end justify-center p-1 font-medium text-muted-foreground">
            <span className="text-[10px]">Hour</span>
          </div>
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div 
                key={format(day, 'yyyy-MM-dd')} 
                className={cn(
                  "h-14 flex flex-col items-center justify-center border-l p-1 cursor-pointer hover:bg-background-alt",
                  isToday && "bg-primary/5 border-primary"
                )}
                onClick={() => handleDateClick(day)}
              >
                <span className="text-xs font-medium">{format(day, 'EEE')}</span>
                <span className={cn("text-sm font-semibold mt-0.5", isToday && "text-primary")}>{format(day, 'd')}</span>
              </div>
            );
          })}
        </div>
        
        {/* Time slots */}
        <div className="grid grid-cols-8 gap-0">
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* Hour column */}
              <div className="p-1 border-r text-[10px] text-muted-foreground h-20 flex items-start justify-end">
                {hour}:00
              </div>
              
              {/* Day columns */}
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForTimeSlot(day, hour);
                return (
                  <div 
                    key={`${format(day, 'yyyy-MM-dd')}-${hour}`}
                    className="border-t border-l p-0.5 h-20 relative"
                  >
                    <div className="flex flex-col gap-0.5 h-full overflow-hidden">
                      {dayAppointments.length === 0 ? (
                        <div className="h-full w-full"></div>
                      ) : (
                        dayAppointments.slice(0, 2).map((appointment) => (
                          <div
                            key={appointment.id}
                            className="p-0.5 rounded bg-primary/10 border border-primary/20 
                                      text-[9px] cursor-pointer hover:bg-primary/20 transition-colors overflow-hidden"
                            onClick={() => onViewAppointment(appointment.id)}
                          >
                            <div className="flex items-center">
                              <div className="w-1.5 h-1.5 rounded-full mr-0.5 flex-shrink-0" style={{ backgroundColor: getStatusColor(appointment.status) }} />
                              <span className="font-medium truncate">{appointment.time}</span>
                            </div>
                            <div className="truncate">{appointment.customerName}</div>
                          </div>
                        ))
                      )}
                      {dayAppointments.length > 2 && (
                        <div className="text-[8px] text-center text-muted-foreground">
                          +{dayAppointments.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Day View - Tablet optimized
  const renderDayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
    const dayAppointments = getAppointmentsForDate(currentDate);

    return (
      <div className="flex flex-col">
        <div className="text-center mb-3">
          <div className="text-sm font-medium">{format(currentDate, 'EEEE')}</div>
          <div className="text-lg font-bold">{format(currentDate, 'MMMM d, yyyy')}</div>
        </div>
        
        <div className="grid grid-cols-12 gap-2">
          {/* Time slots */}
          <div className="col-span-1">
            {hours.map((hour) => (
              <div 
                key={hour} 
                className="h-20 flex items-start justify-end pr-1 text-xs text-muted-foreground"
              >
                {hour}:00
              </div>
            ))}
          </div>
          
          {/* Appointments */}
          <div className="col-span-11 border-l">
            {hours.map((hour) => {
              const hourAppointments = dayAppointments.filter(appointment => {
                const appointmentHour = parseInt(appointment.time.split(':')[0], 10);
                return appointmentHour === hour;
              });
              
              return (
                <div key={hour} className="h-20 border-t relative">
                  {hourAppointments.map((appointment, idx) => (
                    <div
                      key={appointment.id}
                      className="absolute inset-y-0 p-1.5 m-0.5 rounded bg-primary/10 border border-primary/20 
                               cursor-pointer hover:bg-primary/20 transition-colors overflow-hidden"
                      style={{
                        left: `${idx * 33}%`,
                        width: 'calc(33% - 4px)',
                        maxWidth: '240px'
                      }}
                      onClick={() => onViewAppointment(appointment.id)}
                    >
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getStatusColor(appointment.status) }} />
                        <span className="font-medium text-xs">{appointment.time}</span>
                      </div>
                      <div className="font-medium truncate text-xs">{appointment.customerName}</div>
                      <div className="text-[10px] truncate text-muted-foreground">{appointment.services.map(s => s.serviceName).join(', ')}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // List View - Tablet optimized
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
      <div className="space-y-3">
        {periodAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No appointments scheduled for this period
          </div>
        ) : (
          periodAppointments.map(({ date, appointments }) => (
            <div key={format(date, 'yyyy-MM-dd')} className="border rounded-md overflow-hidden">
              <div className={cn(
                "bg-muted/30 px-3 py-1.5 font-medium flex justify-between items-center border-b",
                isSameDay(date, new Date()) && "bg-primary/10"
              )}>
                <span className="text-sm">{format(date, 'EEEE, MMMM d')}</span>
                <Badge variant="outline" className="text-[10px] h-5">
                  {appointments.length} appt{appointments.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="divide-y">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-2.5 hover:bg-muted/10 cursor-pointer flex items-center gap-4"
                    onClick={() => onViewAppointment(appointment.id)}
                  >
                    <div className="flex-shrink-0 w-16">
                      <div className="text-sm font-semibold">{appointment.time}</div>
                      <div className="text-xs text-muted-foreground">
                        {appointment.services.reduce((total, svc) => total + svc.duration, 0)} min
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getStatusColor(appointment.status) }} />
                        <span className="font-medium text-xs">{appointment.customerName}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {appointment.services.map(s => s.serviceName).join(', ')}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 text-[10px]">
                      <Badge variant="outline" className={cn(
                        "text-[10px] py-0 h-5",
                        appointment.status === 'confirmed' && "bg-success/10 text-success border-success/30",
                        appointment.status === 'cancelled' && "bg-error/10 text-error border-error/30",
                        appointment.status === 'scheduled' && "bg-warning/10 text-warning border-warning/30"
                      )}>
                        {appointment.status}
                      </Badge>
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
    <div className="p-3 bg-card rounded-lg">
      {renderHeader()}
      <div className="mt-3">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
        {view === 'list' && renderListView()}
      </div>
    </div>
  );
}; 