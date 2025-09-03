import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { StepWiseInvoiceForm } from './StepWiseInvoiceForm';

interface NewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewInvoiceDialog: React.FC<NewInvoiceDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();

  const handleSubmit = (invoiceData: any) => {
    console.log('Submitting invoice:', invoiceData);
    
    toast({
      title: 'Invoice created',
      description: 'New invoice has been created successfully.',
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Create New Invoice</SheetTitle>
          <SheetDescription>
            Create a new invoice by following these steps.
          </SheetDescription>
        </SheetHeader>

        <StepWiseInvoiceForm 
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
};