import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CreditCard, Home, Calendar } from 'lucide-react';
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
  const content = (
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
  );

  return isInSheet ? <SheetClose asChild>{content}</SheetClose> : content;
};

interface BillingSidebarProps { isInSheet?: boolean }

export const BillingSidebar: React.FC<BillingSidebarProps> = ({ isInSheet = false }) => {
  const location = useLocation();
  const pathName = location.pathname;

  const sidebarItems = [
    {
      icon: <Home size={18} />,
      label: 'Dashboard',
      href: '/billing/dashboard',
    },
    {
      icon: <Calendar size={18} />,
      label: 'Calendar',
      href: '/billing/calendar',
    },
    {
      icon: <CreditCard size={18} />,
      label: 'POS & Invoices',
      href: '/billing/pos',
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

        <div className="mt-auto pt-4 px-3">
          <div className="bg-background border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">Billing Portal</p>
            <p className="text-sm font-medium">v1.0</p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}; 