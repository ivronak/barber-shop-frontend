import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Home,
  User,
  Clock,
  BarChart3,
  CalendarDays
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetClose } from '@/components/ui/sheet';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  isInSheet: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, href, isActive, isInSheet }) => {
  return (
    (isInSheet ? (
      <SheetClose asChild>
        <Link to={href}>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-2 h-10 rounded-md transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground font-semibold shadow hover:bg-primary hover:text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            {icon}
            <span>{label}</span>
          </Button>
        </Link>
      </SheetClose>
    ) : (
      <Link to={href}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-2 h-10 rounded-md transition-colors',
            isActive
              ? 'bg-primary text-primary-foreground font-semibold shadow hover:bg-primary hover:text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          )}
        >
          {icon}
          <span>{label}</span>
        </Button>
      </Link>
    ))
  );
};

interface StaffSidebarProps { isInSheet?: boolean }

export const StaffSidebar: React.FC<StaffSidebarProps> = ({ isInSheet = false }) => {
  const location = useLocation();
  const pathName = location.pathname;

  const sidebarItems = [
    {
      icon: <Home size={18} />,
      label: 'Dashboard',
      href: '/staff/dashboard',
    },
    {
      icon: <Calendar size={18} />,
      label: 'Appointments',
      href: '/staff/appointments',
    },
    {
      icon: <CalendarDays size={18} />,
      label: 'Calendar',
      href: '/staff/calendar',
    },
    {
      icon: <BarChart3 size={18} />,
      label: 'Reports',
      href: '/staff/reports',
    },
    {
      icon: <Clock size={18} />,
      label: 'Working Hours',
      href: '/staff/working-hours',
    },
    {
      icon: <User size={18} />,
      label: 'Profile',
      href: '/staff/profile',
    },
  ];

  return (
    <ScrollArea className="h-full">
      <div className={`${isInSheet ? 'pt-14' : 'py-4'} px-3 h-full flex flex-col relative`}>
        {isInSheet && (
          <div className="absolute left-4 top-4 text-lg font-semibold">Menu</div>
        )}
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={pathName === item.href}
              isInSheet={isInSheet}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};