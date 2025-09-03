import React, { useState } from 'react';
import { 
  Edit, 
  Mail, 
  MoreHorizontal, 
  Phone, 
  Trash,
  Loader2
} from 'lucide-react';
import { Staff } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPhoneNumber } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditStaffDialog } from '@/features/admin/staff-management/components/EditStaffDialog';
import { useToast } from '@/hooks/use-toast';
import { Service } from '@/api/services/serviceService';

interface StaffListProps {
  staff: Staff[];
  onUpdateStaff?: (updatedStaff: Staff) => Promise<void>;
  onDeleteStaff?: (staffId: string) => void;
  deletingStaffId?: string | null;
  services: Service[];
  isLoadingServices?: boolean;
}

export const StaffList: React.FC<StaffListProps> = ({ 
  staff, 
  onUpdateStaff, 
  onDeleteStaff,
  deletingStaffId = null,
  services = [],
  isLoadingServices = false
}) => {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleEditStaff = (member: Staff) => {
    setSelectedStaff(member);
    setIsEditDialogOpen(true);
  };

  const handleUpdateStaff = (updatedStaff: Staff) => {
    if (onUpdateStaff) {
      // Just pass through to the parent component's handler
      return onUpdateStaff(updatedStaff);
    } else {
      // If no update handler is provided, just show a toast
      toast({
        title: "Update simulated",
        description: "In a real application, this would update the staff member in the database.",
      });
      return Promise.resolve();
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {staff.map((member) => (
          <Card key={member.id} className={`overflow-hidden relative ${deletingStaffId === member.id ? 'opacity-70' : ''}`}>
            {deletingStaffId === member.id && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-2 bg-background p-3 rounded-md shadow-md">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Deleting...</p>
                </div>
              </div>
            )}
            
            <div className="relative">
              <div className="h-20 sm:h-24 bg-gradient-to-r from-black to-primary"></div>
              <Avatar className="absolute bottom-0 left-4 transform translate-y-1/2 h-14 w-14 sm:h-16 sm:w-16 border-4 border-background">
                <AvatarImage src={member.image} alt={member.name || 'Staff'} />
                <AvatarFallback>
                  {member.name
                    ? member.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                    : 'ST'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20">
                      <MoreHorizontal className="h-5 w-5 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleEditStaff(member)}
                      disabled={deletingStaffId === member.id}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => onDeleteStaff && onDeleteStaff(member.id)}
                      disabled={deletingStaffId === member.id}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <CardContent className="pt-8 pb-5 px-4 sm:px-6">
              <div className="mb-4">
                <h3 className="font-semibold text-lg">{member.name || 'Unnamed Staff'}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={member.isAvailable ? "default" : "outline"}>
                    {member.isAvailable ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">{member.commissionPercentage}% Commission</Badge>
                </div>
              </div>
              
              <div className="space-y-1 text-sm mb-4">
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  {member.email || 'No email provided'}
                </p>
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  {member.phone ? formatPhoneNumber(member.phone) : 'No phone provided'}
                </p>
                {member.bio && (
                  <p className="text-muted-foreground mt-2">{member.bio}</p>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-4 py-4 border-t border-b mb-4 text-center">
                <MetricCell label="Appointments" value={member.totalAppointments.toString()} addRightBorder />
                <MetricCell label="Services" value={(member.services?.length || 0).toString()} addRightBorder />
                <MetricCell label="Earnings" value={formatCurrency(member.totalEarnings || 0)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedStaff && (
        <EditStaffDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          staff={selectedStaff}
          onUpdate={handleUpdateStaff}
          services={services}
          isLoadingServices={isLoadingServices}
        />
      )}
    </>
  );
};

// MetricCell - keeps design consistent and handles responsive font / borders
interface MetricCellProps {
  label: string;
  value: string;
  addRightBorder?: boolean;
}

const MetricCell: React.FC<MetricCellProps> = ({ label, value, addRightBorder = false }) => (
  <div className={`flex flex-col items-center justify-center ${addRightBorder ? 'sm:border-r sm:pr-4' : ''}`}>
    <p className="font-semibold text-xl sm:text-2xl leading-tight break-words max-w-[6rem] sm:max-w-none">
      {value}
    </p>
    <p className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">{label}</p>
  </div>
);