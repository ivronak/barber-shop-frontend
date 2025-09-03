import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { Copy, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatPhoneNumber } from '@/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useApi } from '@/hooks/useApi';
import { Customer } from '@/api/services/customerService';
import { getCustomerInvoices } from '@/api/services/customerService';

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (id: string, customerData: Partial<Customer>) => void;
}

export const CustomerDetailsDialog: React.FC<CustomerDetailsDialogProps> = ({
  customer,
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();

  // API Hook for customer invoices
  const {
    data: invoicesData,
    loading: isLoading,
    error: invoicesError,
    execute: fetchInvoices
  } = useApi(getCustomerInvoices);


  useEffect(() => {
    if (customer && open) {
      fetchInvoices(customer.id);
    }
  }, [customer, open, fetchInvoices]);

  // Error handling for invoices
  useEffect(() => {
    if (invoicesError) {
      toast({
        title: "Error loading invoices",
        description: invoicesError.message,
        variant: "destructive"
      });
    }
  }, [invoicesError, toast]);

  if (!customer) return null;

  // Get customer's invoice history
  const customerInvoices = invoicesData?.invoices || [];
  // console.log(customerInvoices,"customer_name")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const getPaymentMethodBadge = (method: string) => (
    <Badge variant="outline">{method.charAt(0).toUpperCase() + method.slice(1)}</Badge>
  );

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(customer.phone);
    toast({
      title: 'Copied to clipboard',
      description: `Phone number has been copied.`,
    });
  };

  // Removed export/download functionality as per requirements
  console.log(customerInvoices, "customerInvoices")
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl p-0 max-h-[90vh] overflow-y-auto rounded-xl mx-auto flex flex-col">
        {/* Sticky header */}
        <DialogHeader className="px-5 py-4 border-b sticky top-0 z-10 bg-card rounded-t-xl text-center">
          <DialogTitle className="text-base font-semibold">Customer Details</DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 px-5 py-4 overflow-y-auto thin-scrollbar">
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-black font-bold">Name: <span className="font-normal">{customer?.name || "Not provided"}</span></span>
                <span className="text-black font-bold">Email: <span className="font-normal">{customer?.email || "Not provided"}</span></span>
                <div className="flex items-center gap-2">
                  <span className="text-black font-bold">Phone:</span>
                  {customer?.phone?<>
                  <span className="font-normal">{formatPhoneNumber(customer?.phone)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCopyPhone}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  </>
                  :<span className="text-muted-foreground">{"Not provided"}</span>
                  }
                </div>
                <div className="text-sm">
                  <span className="text-black font-bold">Member since:</span>
                  <span className='font-normal'> {customer.created_at ? format(new Date(customer.created_at), 'MMMM d, yyyy') : 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium mb-1">Total Visits</div>
                  <div className="text-2xl font-bold">{customer.visit_count || 0}</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium mb-1">Total Spent</div>
                  <div className="text-2xl font-bold">{formatCurrency(customer.total_spent || 0)}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Invoice History */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Invoice History</h4>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Staff Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Loading invoices...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : customerInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                          No invoices found for this customer
                        </TableCell>
                      </TableRow>
                    ) : (
                      customerInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>{format(new Date(invoice.date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="max-w-[200px] truncate cursor-help">
                                    {invoice.services?.map(s => s.service_name).join(', ')}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="start" className="max-w-[300px]">
                                  <div className="space-y-1 text-sm">
                                    {invoice.services?.map((service, idx) => (
                                      <div key={idx} className="flex justify-between gap-4">
                                        <span>
                                          {service.service_name}
                                          {service.quantity > 1 && <span className="text-muted-foreground"> × {service.quantity}</span>}
                                        </span>
                                        <span className="font-medium">{formatCurrency(service.total)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>{invoice?.staff_name || " - "}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell className="w-32 line-clamp-2">{invoice?.notes || " - "}</TableCell>
                          <TableCell>{getPaymentMethodBadge(invoice.payment_method)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(invoice.total)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Notes Section */}
            {customer.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Notes</h4>
                  <div className="rounded-lg border p-4 text-sm">
                    {customer.notes}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end pt-4 mt-4 border-t px-5 pb-5">
          <Button variant="default" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 