import React from 'react';
import { formatTime } from '@/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  CheckCheck, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { updateAppointmentStatusDirect } from '@/api/services/appointmentService';

// Define a simplified appointment type that works with both the API and mock data
export interface SimpleAppointment {
  id: string;
  customerName: string;
  customerId: string;
  customerPhone: string;
  customerEmail?: string;
  staffId: string;
  staffName: string;
  date: string;
  time: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  services: Array<{ serviceId: string; serviceName: string; price: number; duration: number }>;
  totalAmount: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AppointmentListProps {
  appointments: SimpleAppointment[];
  title: string;
  className?: string;
  showActions?: boolean;
  onRefresh?: () => void;
  onReschedule?: (appointment: SimpleAppointment) => void;
  allowCompletion?: boolean;
  onCompleteAppointment?: (appointment: SimpleAppointment) => void;
  onStatusPatched?: (appointmentId: string, newStatus: SimpleAppointment['status']) => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  title,
  className,
  showActions = true,
  onRefresh,
  onReschedule,
  allowCompletion = true,
  onCompleteAppointment,
  onStatusPatched,
}) => {
  const { toast } = useToast();
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});
  const [localAppointments, setLocalAppointments] = React.useState<SimpleAppointment[]>(appointments);

  // Update local appointments when props change
  React.useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);

  // Status badge styles
  const getStatusStyle = (status: SimpleAppointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Quick actions handlers with API integration
  const handleStatusChange = async (appointmentId: string, newStatus: SimpleAppointment['status']) => {
    try {
      // Set loading state for this specific appointment
      setLoadingStates(prev => ({ ...prev, [appointmentId]: true }));
      
      // Make the API call first
      await updateAppointmentStatusDirect(appointmentId, newStatus);
      
      // Update local state only after API call succeeds
      const updatedAppointments = localAppointments.map(app => {
        if (app.id === appointmentId) {
          return { ...app, status: newStatus };
        }
        return app;
      });
      
      // Update local state
      setLocalAppointments(updatedAppointments);

      // Notify parent of successful patch if callback provided
      if (onStatusPatched) {
        onStatusPatched(appointmentId, newStatus);
      }
      
      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${newStatus}`
      });
      
      // SUCCESS: We already patched local state, so skip immediate refetch to avoid flicker
      // If the parent still needs fresh aggregated stats, it can choose to refetch separately.
      
    } catch (error) {
      console.error('Error updating appointment status:', error);
      
      toast({
        title: "Error",
        description: "An error occurred while updating the appointment status",
        variant: "destructive"
      });
      
      // Refresh the data if a callback is provided
      if (onRefresh) {
        onRefresh();
      }
    } finally {
      // Keep loading state for a moment to ensure UI consistency
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, [appointmentId]: false }));
      }, 500);
    }
  };

  const handleConfirm = (appointment: SimpleAppointment) => {
    handleStatusChange(appointment.id, 'confirmed');
  };

  const handleComplete = (appointment: SimpleAppointment) => {
    if (onCompleteAppointment) {
      onCompleteAppointment(appointment);
    } else {
      handleStatusChange(appointment.id, 'completed');
    }
  };

  const handleCancel = (appointment: SimpleAppointment) => {
    handleStatusChange(appointment.id, 'cancelled');
  };

  const handleNoShow = (appointment: SimpleAppointment) => {
    handleStatusChange(appointment.id, 'no-show');
  };

  const handleReschedule = (appointment: SimpleAppointment) => {
    if (onReschedule) {
      onReschedule(appointment);
    } else {
      toast({
        title: "Reschedule Initiated",
        description: `Please use the appointments page to reschedule for ${appointment.customerName}`
      });
    }
  };

  // Render action buttons based on appointment status
  const renderActions = (appointment: SimpleAppointment) => {
    if (!showActions) return null;
    
    const isLoading = loadingStates[appointment.id] || false;
    
    if (isLoading) {
      return (
        <div className="flex justify-center mt-2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      );
    }
    
    const buttons = [];
    
    // Determine if the appointment falls on a future date (ignore time-of-day)
    const todayDateObj = new Date();
    const todayStr = `${todayDateObj.getFullYear()}-${(todayDateObj.getMonth() + 1).toString().padStart(2, '0')}-${todayDateObj.getDate().toString().padStart(2, '0')}`;
    const appointmentDateStr = appointment.date.split('T')[0];
    const isFutureAppointment = appointmentDateStr > todayStr;
    
    // Confirm button for scheduled appointments (allowed even for future dates)
    if (appointment.status === 'scheduled') {
      buttons.push(
        <TooltipProvider key="confirm">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirm(appointment);
                }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Confirm</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Complete button should only be shown once the appointment date is today/past and completion is allowed
    if (allowCompletion && !isFutureAppointment && (appointment.status === 'scheduled' || appointment.status === 'confirmed')) {
      buttons.push(
        <TooltipProvider key="complete">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleComplete(appointment);
                }}
              >
                <CheckCheck className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Complete</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // No-show button only when completion allowed and date is today/past
    if (allowCompletion && !isFutureAppointment && (appointment.status === 'scheduled' || appointment.status === 'confirmed')) {
      buttons.push(
        <TooltipProvider key="no-show">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleNoShow(appointment);
                }}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>No Show</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Cancel button for appointments that aren't already cancelled or completed
    if (appointment.status !== 'cancelled' && appointment.status !== 'completed' && appointment.status !== 'no-show') {
      buttons.push(
        <TooltipProvider key="cancel">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel(appointment);
                }}
              >
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cancel</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Reschedule button for scheduled/confirmed appointments
    if (appointment.status === 'scheduled' || appointment.status === 'confirmed') {
      buttons.push(
        <TooltipProvider key="reschedule">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReschedule(appointment);
                }}
              >
                <Calendar className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reschedule</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return (
      <div className="flex space-x-1 mt-2">
        {buttons}
      </div>
    );
  };

  // Get service names from the services array
  const getServiceNames = (services: SimpleAppointment['services']) => {
    if (!services || services.length === 0) return 'No services';
    
    return services.map(service => service.serviceName).join(', ');
  };

  return (
    <Card className={cn("p-4", className)}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      {localAppointments.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          No appointments to display
        </div>
      ) : (
        <div className="space-y-4">
          {localAppointments.map((appointment) => (
            <div key={appointment.id} className="border rounded-md p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>
                      {appointment.customerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{appointment.customerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {getServiceNames(appointment.services)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn("text-xs px-2 py-1 rounded-full", getStatusStyle(appointment.status))}>
                    {appointment.status}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">With:</span> {appointment.staffName}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Time:</span> {formatTime(appointment.time)}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Date:</span> {appointment.date}
                </div>
                {renderActions(appointment)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};