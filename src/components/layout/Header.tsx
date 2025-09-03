import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { StaffSidebar } from './StaffSidebar';
import { BillingSidebar } from './BillingSidebar';
import { useAuth } from '@/lib/auth';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { 
      state: { 
        logout: true 
      },
      replace: true
    });
  };

  return (
    <header className="bg-white border-b border-border h-16 flex items-center px-4 md:px-6 w-full z-10 sticky top-0">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              {user?.role === 'staff' ? (
                <StaffSidebar isInSheet />
              ) : user?.role === 'billing' ? (
                <BillingSidebar isInSheet />
              ) : (
                <Sidebar isInSheet />
              )}
            </SheetContent>
          </Sheet>

          <div className="flex items-center">
            <img src="/logo/logo-tran.png" alt="Barber Shop Logo" className="h-20 w-auto" />
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image} alt={user?.name ?? 'User'} />
                  <AvatarFallback>
                    {(user?.name ?? 'User')
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                {user?.name && (
                  <span className="hidden md:inline-block font-medium">
                    {user.name}
                  </span>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              {user?.role === 'admin' && (
                <DropdownMenuItem>Billing</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};