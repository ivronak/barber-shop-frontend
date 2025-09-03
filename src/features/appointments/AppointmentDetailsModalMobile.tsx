import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, Scissors, MessageSquare, Phone } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Appointment } from '@/types';
import { cn } from '@/lib/utils';

interface AppointmentDetailsModalMobileProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AppointmentDetailsModalMobile: React.FC<AppointmentDetailsModalMobileProps> = ({
  appointment,
  open,
  onOpenChange,
}) => {
  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95%] sm:max-w-md p-0 h-[85vh] sm:h-[80vh] flex flex-col rounded-xl mx-auto">
        <DialogHeader className="px-5 py-4 border-b sticky top-0 z-10 bg-card rounded-xl">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold">
              Appointment Details
            </DialogTitle>
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-2.5 py-0.5 ml-2",
                appointment.status === 'confirmed' && "bg-success/10 text-success border-success/30",
                appointment.status === 'cancelled' && "bg-error/10 text-error border-error/30",
                appointment.status === 'scheduled' && "bg-warning/10 text-warning border-warning/30",
                appointment.status === 'completed' && "bg-success/10 text-success border-success/30",
                appointment.status === 'no-show' && "bg-error/10 text-error border-error/30"
              )}
            >
              {appointment.status}
            </Badge>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1">
          <div className="p-5 space-y-5">
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold">{appointment.customerName}</h3>
              <div className="text-sm text-muted-foreground flex items-center">
                <Phone className="h-3.5 w-3.5 mr-1.5" />
                {appointment.customerPhone}
              </div>
              {appointment.customerEmail && (
                <div className="text-sm text-muted-foreground flex items-center">
                  <span className="i-lucide-mail h-3.5 w-3.5 mr-1.5" />
                  {appointment.customerEmail}
                </div>
              )}
            </div>
            
            <Separator className="my-5" />
            
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4.5 w-4.5 text-muted-foreground" />
                <span className="font-medium text-sm">
                  {format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <Clock className="h-4.5 w-4.5 text-muted-foreground" />
                <span className="font-medium text-sm">
                  {appointment.time} - {appointment.endTime}
                </span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <User className="h-4.5 w-4.5 text-muted-foreground" />
                <span className="font-medium text-sm">{appointment.staffName}</span>
              </div>
            </div>
            
            <Separator className="my-5" />
            
            <div>
              <h4 className="font-medium text-sm mb-3 flex items-center">
                <Scissors className="h-4.5 w-4.5 text-muted-foreground mr-2.5" />
                Services
              </h4>
              <div className="space-y-3 pl-7">
                {appointment.services.map((service) => (
                  <div key={service.serviceId} className="flex justify-between text-sm">
                    <span>{service.serviceName}</span>
                    <span className="text-muted-foreground">${Number(service.price).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="flex justify-between text-sm font-medium pt-2 border-t mt-2">
                  <span>Total</span>
                  <span>${appointment.services.reduce((sum, svc) => sum + Number(svc.price), 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {appointment.notes && (
              <>
                <Separator className="my-5" />
                <div>
                  <h4 className="font-medium text-sm mb-3 flex items-center">
                    <MessageSquare className="h-4.5 w-4.5 text-muted-foreground mr-2.5" />
                    Notes
                  </h4>
                  <p className="text-sm text-muted-foreground pl-7">{appointment.notes}</p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="border-t p-4">
          <Button 
            variant="outline" 
            size="default" 
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 