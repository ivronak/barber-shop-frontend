import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Calendar, CreditCard, Home, Scissors, Settings, Users, Clock, ListCheck as ListChecklist, Percent, Package, Star, CalendarX, UserCog, Image, Mail } from 'lucide-react';
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

interface SidebarProps { isInSheet?: boolean }

export const Sidebar: React.FC<SidebarProps> = ({ isInSheet = false }) => {
  const location = useLocation();
  const pathName = location.pathname;

  const sidebarItems = [
    {
      icon: <Home size={18} />,
      label: 'Dashboard',
      href: '/admin/dashboard',
    },
    {
      icon: <Calendar size={18} />,
      label: 'Appointments',
      href: '/admin/appointments',
    },
    {
      icon: <Calendar size={18} />,
      label: 'Calendar',
      href: '/admin/calendar',
    },
    {
      icon: <CalendarX size={18} />,
      label: 'Shop Closures',
      href: '/admin/shop-closures',
    },
    {
      icon: <Users size={18} />,
      label: 'Customers',
      href: '/admin/customers',
    },
    {
      icon: <Scissors size={18} />,
      label: 'Staff Management',
      href: '/admin/staff-management',
    },
    {
      icon: <Users size={18} />,
      label: 'Experts',
      href: '/admin/experts',
    },
    {
      icon: <ListChecklist size={18} />,
      label: 'Services',
      href: '/admin/services',
    },
    {
      icon: <ListChecklist size={18} />,
      label: 'Service Categories',
      href: '/admin/service-categories',
    },
    {
      icon: <Package size={18} />,
      label: 'Products',
      href: '/admin/products',
    },
    {
      icon: <CreditCard size={18} />,
      label: 'POS & Invoices',
      href: '/admin/pos',
    },
    {
      icon: <Clock size={18} />,
      label: 'Slots',
      href: '/admin/slots',
    },
    {
      icon: <BarChart3 size={18} />,
      label: 'Reports',
      href: '/admin/reports',
    },
    {
      icon: <Settings size={18} />,
      label: 'Settings',
      href: '/admin/settings',
    },
    {
      icon: <Percent size={18} />,
      label: 'GST Settings',
      href: '/admin/gst-settings',
    },
    {
      icon: <Star size={18} />,
      label: 'Reviews',
      href: '/admin/reviews',
    },
    {
      icon: <UserCog size={18} />,
      label: 'User Management',
      href: '/admin/users',
    },
    {
      icon: <Image size={18} />,
      label: 'Gallery',
      href: '/admin/gallery-images',
    },
    {
      icon: <Mail size={18} />,
      label: 'Contact Requests',
      href: '/admin/contact-requests',
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