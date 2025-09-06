import React, { useState, useEffect } from 'react';
import { DesktopCalendarView } from './DesktopCalendarView';
import { TabletCalendarView } from './TabletCalendarView';
import { MobileCalendarView } from './MobileCalendarView';
import { Appointment } from '@/types';

interface CalendarLayoutProps {
  appointments: Appointment[];
  onSelectDate: (date: Date) => void;
  onViewAppointment: (appointmentId: string) => void;
  onAddAppointment?: (date: Date) => void;
}

export const CalendarLayout: React.FC<CalendarLayoutProps> = ({
  appointments,
  onSelectDate,
  onViewAppointment,
  onAddAppointment,
}) => {
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  console.log("__formattedAppointments >> ",appointments)

  // Render appropriate view based on screen width
  // Mobile: < 640px
  // Tablet: 640px - 1023px
  // Desktop: >= 1024px
  const renderCalendarView = () => {
    if (windowWidth < 640) {
  console.log("__formattedAppointments >> 1")

      return (
        <MobileCalendarView
          appointments={appointments}
          onSelectDate={onSelectDate}
          onViewAppointment={onViewAppointment}
          onAddAppointment={onAddAppointment}
        />
      );
    } else if (windowWidth >= 640 && windowWidth < 1024) {
  console.log("__formattedAppointments >> 2")

      return (
        <TabletCalendarView
          appointments={appointments}
          onSelectDate={onSelectDate}
          onViewAppointment={onViewAppointment}
          onAddAppointment={onAddAppointment}
        />
      );
    } else {
  console.log("__formattedAppointments >> 3")

      return (
        <DesktopCalendarView
          appointments={appointments}
          onSelectDate={onSelectDate}
          onViewAppointment={onViewAppointment}
          onAddAppointment={onAddAppointment}
        />
      );
    }
  };

  return <>{renderCalendarView()}</>;
}; 