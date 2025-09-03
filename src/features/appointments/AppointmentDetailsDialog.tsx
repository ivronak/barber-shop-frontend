import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, Scissors, MessageSquare, Phone, CheckCircle, XCircle, AlertTriangle, CheckCheck, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Appointment } from '@/types';
import { updateAppointmentStatus } from '@/api/services/appointmentService';
import { toast } from '@/hooks/use-toast';

interface AppointmentDetailsDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isStaffView?: boolean;
  onStatusChange?: (appointmentId: string, status: Appointment['status']) => void;
  onAppointmentUpdated?: () => void;
}

export const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  appointment,
  open,
  onOpenChange,
  isStaffView = false,
  onStatusChange,
  onAppointmentUpdated,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // Status badge colors
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'secondary';
      case 'scheduled':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'no-show':
        return 'outline';
      default:
        return 'default';
    }
  };

  const handleUpdateStatus = async (newStatus: Appointment['status'], e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setIsUpdating(true);
    
    try {
      // Call the API to update the appointment status
      await updateAppointmentStatus(appointment.id, newStatus);
      
      // Show success toast
      toast({
        title: "Appointment updated",
        description: `Status changed to ${newStatus}`,
        variant: "default",
      });
      
      // Close the dialog for better UX
      onOpenChange(false);
      
      // Call the parent's onStatusChange if provided
      if (onStatusChange) {
        onStatusChange(appointment.id, newStatus);
      }
      
      // Trigger refetch of appointments if callback provided
      if (onAppointmentUpdated) {
        onAppointmentUpdated();
      }
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      toast({
        title: "Update failed",
        description: "Could not update the appointment status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const renderStatusActions = () => {
    if (isUpdating) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Updating...</span>
        </div>
      );
    }
    
    switch (appointment.status) {
      case 'scheduled':
        return (
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="default" 
              onClick={(e) => handleUpdateStatus('confirmed', e)}
              disabled={isUpdating}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm
            </Button>
            <Button 
              variant="outline" 
              onClick={(e) => handleUpdateStatus('completed', e)}
              disabled={isUpdating}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Complete
            </Button>
            <Button 
              variant="outline" 
              onClick={(e) => handleUpdateStatus('no-show', e)}
              disabled={isUpdating}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              No Show
            </Button>
            <Button 
              variant="destructive" 
              onClick={(e) => handleUpdateStatus('cancelled', e)}
              disabled={isUpdating}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        );
      
      case 'confirmed':
        return (
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="default" 
              onClick={(e) => handleUpdateStatus('completed', e)}
              disabled={isUpdating}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Complete
            </Button>
            <Button 
              variant="outline" 
              onClick={(e) => handleUpdateStatus('no-show', e)}
              disabled={isUpdating}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              No Show
            </Button>
            <Button 
              variant="destructive" 
              onClick={(e) => handleUpdateStatus('cancelled', e)}
              disabled={isUpdating}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        );
        
      case 'completed':
      case 'cancelled':
      case 'no-show':
        return null;
        
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{appointment.customerName}</h3>
            <Badge variant={getStatusBadgeVariant(appointment.status)} className="capitalize">
              {appointment.status}
            </Badge>
          </div>

          <div className="space-y-3">
            {isStaffView && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Contact</p>
                  <p className="text-sm text-muted-foreground">{appointment.customerPhone}</p>
                  <p className="text-sm text-muted-foreground">{appointment.customerEmail}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Time</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.time} - {appointment.endTime}
                </p>
              </div>
            </div>

            {!isStaffView && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Staff</p>
                  <p className="text-sm text-muted-foreground">{appointment.staffName}</p>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-start gap-3">
              <Scissors className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Services</p>
                <div className="space-y-1 mt-1">
                  {appointment.services.map((service) => (
                    <div key={service.serviceId} className="flex justify-between text-sm">
                      <span>{service.serviceName}</span>
                      <span className="text-muted-foreground">
                        ${Number(service.price).toFixed(2)} · {service.duration} min
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium mt-2">
                    <span>Total</span>
                    <span>${appointment.services.reduce((sum, svc) => sum + Number(svc.price), 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {appointment.notes && (
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0">
          {onStatusChange && (appointment.status === 'scheduled' || appointment.status === 'confirmed') ? (
            <>
              <div className="flex gap-2 flex-wrap">
                {renderStatusActions()}
              </div>
              <Button variant="ghost" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenChange(false);
              }}>
                Close
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenChange(false);
            }}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 