import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Copy, Download, Printer, Loader2, Percent, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Invoice, InvoiceProduct, getInvoiceById } from '@/api/services/invoiceService';
import { useApi } from '@/hooks/useApi';
// Helper to expand line items based on quantity so UI can show "#1", "#2", ...
interface ExpandedLine<T extends { quantity?: number }> extends T { _index: number; }

const expandByQuantity = <T extends { quantity?: number }>(items: T[]): ExpandedLine<T>[] => {
  return items.flatMap((item) => {
    const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
    return Array.from({ length: qty }, (_, i) => ({ ...item, _index: i + 1 }));
  });
};
import { formatCurrency } from '@/utils';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSettings } from '@/hooks/useSettings';

// Cache for the company logo so we don’t re-encode it to base64 on every print
let cachedLogoDataUrl: string | null = null;

interface InvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceUpdated?: () => void;
}

// Utility to load an image (from public folder) and convert to data URL for jsPDF
const loadImageAsDataUrl = (url: string): Promise<string> => {
  // Return cached copy if we already converted once
  if (cachedLogoDataUrl) {
    return Promise.resolve(cachedLogoDataUrl);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available'));
      ctx.drawImage(img, 0, 0);
      cachedLogoDataUrl = canvas.toDataURL('image/png');
      resolve(cachedLogoDataUrl);
    };
    img.onerror = (err) => reject(err as unknown as Error);
    img.src = url;
  });
};

export const InvoiceDialog: React.FC<InvoiceDialogProps> = ({
  invoice,
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const { execute: fetchInvoice } = useApi(getInvoiceById);
  const { settings } = useSettings();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [fullInvoice, setFullInvoice] = useState<Invoice | null>(null);

  // Reference to the main invoice content for PDF/print capture
  const invoiceContentRef = useRef<HTMLDivElement>(null);

  // Load detailed invoice when dialog opens
  useEffect(() => {
    if (open && invoice) {
      fetchInvoice(invoice.id)
        .then((resp)=>{
          if(resp.success) setFullInvoice(resp.invoice);
        })
        .catch(()=>{/* ignore */});
    } else {
      setFullInvoice(null);
    }
  }, [open, invoice]);

  const inv = fullInvoice || invoice;
  if (!inv) return null;

  const getStatusBadge = (status: Invoice['status']) => {
    const base = 'rounded-full px-2 py-0.5 text-[11px] font-semibold border';
    switch (status) {
      case 'paid':
        return <span className={`${base} border-green-500 text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400`}>Paid</span>;
      case 'pending':
        return <span className={`${base} border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10 dark:text-yellow-400`}>Pending</span>;
      case 'cancelled':
        return <span className={`${base} border-red-500 text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400`}>Cancelled</span>;
      default:
        return null;
    }
  };

  // Safe numeric values
  const discountAmount = inv.discount_amount ?? 0;
  const tipAmount = inv.tip_amount ?? 0; // derived from service lines by backend

  const handleCopyInvoiceNumber = () => {
    navigator.clipboard.writeText(inv.id);
    toast({
      title: 'Copied to clipboard',
      description: `Invoice number ${inv.id} has been copied.`,
    });
  };

  // Helper to build PDF using jsPDF + autoTable
  const generatePdf = async (autoPrint = false) => {
    // Show loader state
    if (autoPrint) setIsPrinting(true); else setIsDownloading(true);

    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const businessName = settings?.name || 'Barber Shop';
      doc.setProperties({ title: `Invoice ${inv.id}`, author: businessName });
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 40;
      let y = 40;

      // Load and draw company logo then header texts
      try {
        const logoData = await loadImageAsDataUrl('/logo/logo-tran.png');
        doc.addImage(logoData, 'PNG', marginX, y, 60, 60);
      } catch {
        // logo failed to load – continue without interruption
      }

      // Company name next to logo
      doc.setFontSize(18);
      doc.setFont('helvetica','bold');
      doc.setTextColor('#111827');
      doc.text(businessName, marginX + 70, y + 25);

      // Invoice Details subtitle
      doc.setFontSize(12);
      doc.setFont('helvetica','normal');
      doc.text('Invoice Details', marginX + 70, y + 45);

      y += 70; // move below header block

      // Invoice number below header
      doc.setFontSize(10);
      doc.text(`Invoice #: ${inv.id}`, marginX, y);
      y += 15;

      // Gray separator line
      doc.setDrawColor(210);
      doc.setLineWidth(0.5);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 10;

      // Status display right side
      doc.setFontSize(12);
      doc.text(`Status: ${inv.status.toUpperCase()}`, pageWidth - marginX - 80, y - 15);
      
      y += 15;

      // Dates & Meta
      doc.text(`Date: ${format(new Date(inv.date), 'MMM d, yyyy')}`, marginX, y);
      if (inv.appointment_id) {
        doc.text(`Appointment: #${inv.appointment_id}`, marginX + 220, y);
      }
      y += 14;
      doc.text(`Payment: ${inv.payment_method}`, marginX, y);
      y += 15;

      // Separator
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 15;

      // Customer & Staff
      // Customer label only (staff details are per-item)
      doc.setFontSize(11);
      doc.text('Customer', marginX, y);
      y += 12;
      doc.setFontSize(10);
      doc.text(inv.customer_name, marginX, y);
      y += 10;

      doc.line(marginX, y, pageWidth - marginX, y);
      y += 15;

      // Services table (expanded)
      const services = expandByQuantity(inv.invoiceServices || inv.services || []).map((s)=>[
        `${s.service_name} #${s._index}${s.staff_name? ` - ${s.staff_name}`:''}`,
        formatCurrency(s.price)
      ]);
      if(services.length){
        autoTable(doc,{
          startY:y,
          head:[['Service','Amount']],
          body:services,
          styles:{ fontSize:10, cellPadding:3 },
          headStyles:{ fillColor:[0,0,0], textColor:[255,255,255] },
          theme:'grid',
          margin:{ left:40, right:40 },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Products table
      const products = expandByQuantity(inv.invoiceProducts || inv.products || []).map((p)=>[
        `${p.product_name} #${p._index}${p.staff_name? ` - ${p.staff_name}`:''}`,
        formatCurrency(p.price)
      ]);
      if(products.length){
        autoTable(doc,{
          startY:y,
          head:[['Product','Amount']],
          body:products,
          styles:{ fontSize:10, cellPadding:3 },
          headStyles:{ fillColor:[0,0,0], textColor:[255,255,255] },
          theme:'grid',
          margin:{ left:40, right:40 },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Totals
      doc.setFontSize(12);
      doc.text('Summary', 40, y+10);
      y += 20;
      doc.setFontSize(10);
      const totals = [
        ['Subtotal', formatCurrency(inv.subtotal)],
        ['Discount', formatCurrency(inv.discount_amount ?? 0)],
        ['Tax', formatCurrency(inv.tax_amount)],
        ['Tip', formatCurrency(inv.tip_amount ?? 0)],
        ['Total', formatCurrency(inv.total)]
      ];
      autoTable(doc,{
        startY:y,
        body:totals,
        theme:'plain',
        styles:{ fontSize:10, cellPadding:2 },
        columnStyles:{ 0:{cellWidth:100}, 1:{halign:'right'} },
        margin:{ left:40, right:40 },
      });

      // Notes
      if(inv.notes){
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 10;
        doc.text('Notes:', 40, y);
        y += 14;
        doc.text(doc.splitTextToSize(inv.notes, pageWidth-80), 40, y);
      }

      if(autoPrint){
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const iframe = document.createElement('iframe');
        iframe.style.position='fixed'; iframe.style.left='-9999px';
        iframe.src=url; document.body.appendChild(iframe);
        iframe.onload=()=>{
          iframe.contentWindow?.focus(); iframe.contentWindow?.print();
          setTimeout(()=>{ document.body.removeChild(iframe); URL.revokeObjectURL(url); },1000);
        };
      } else {
        doc.save(`invoice_${inv.id}.pdf`);
      }
    }catch(err){
      console.error('PDF error',err);
      toast({ title:'Error', description:'Failed to generate PDF', variant:'destructive' });
    }finally{
      setIsPrinting(false); setIsDownloading(false);
      if(!autoPrint){ toast({title:'Download started', description:'Your invoice PDF is downloading.'}); }
      else { toast({title:'Print dialog opened', description:'Generating printable view…'}); }
    }
  };

  const handlePrint = () => generatePdf(true);
  const handleDownload = () => generatePdf(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] flex flex-col w-[95vw] sm:w-auto sm:max-w-2xl sm:min-w-[500px] rounded-lg">
        <DialogHeader className="pb-2 flex justify-between items-start">
          <div className="flex items-center gap-2 mr-8">
            <DialogTitle className="flex items-center gap-2">Invoice Details</DialogTitle>
            {getStatusBadge(inv.status)}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div ref={invoiceContentRef} className="space-y-6">
            {/* Header Information */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Invoice Number:</span>
                <span className="font-medium">{inv.id}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopyInvoiceNumber}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Date: {format(new Date(inv.date), 'MMMM d, yyyy')}
              </div>
              {inv.appointment_id && (
                <div className="text-sm text-muted-foreground">
                  Appointment: #{inv.appointment_id}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Payment Method: {inv.payment_method.charAt(0).toUpperCase() + inv.payment_method.slice(1)}
              </div>
              {inv.created_at && (
                <div className="text-sm text-muted-foreground">
                  Created: {format(new Date(inv.created_at), 'MMMM d, yyyy, h:mm a')}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Customer</h4>
                <div className="text-sm">Name : {inv?.customer?.name}</div>
                <div className="text-sm">Email : {inv?.customer?.email}</div>
                <div className="text-sm">Phone : {inv?.customer?.phone}</div>

              </div>

              {/* (Removed single staff list – staff now shown against each item) */}
            </div>

            <Separator />

            {/* Services */}
            { (inv.invoiceServices || inv.services || []).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Services</h4>
              <div className="space-y-2">
                {expandByQuantity(inv.invoiceServices || inv.services || []).map((service, idx) => (
                  <div
                    key={`svc-${service.service_id}-${idx}`}
                    className="flex justify-between text-sm"
                  >
                    <div>
                      <span>{service.service_name} #{service._index}</span>
                      {service.staff_name && (
                        <span className="text-muted-foreground ml-1">- {service.staff_name}</span>
                      )}
                    </div>
                    <span>{formatCurrency(service.price)}</span>
                  </div>
                ))}
              </div>
            </div>) }

            {/* Products */}
            { (inv.invoiceProducts || inv.products || []).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Products</h4>
              <div className="space-y-2">
                {expandByQuantity(inv.invoiceProducts || inv.products || []).map((product: any, idx: number) => (
                  <div
                    key={`prd-${product.product_id}-${idx}`}
                    className="flex justify-between text-sm"
                  >
                    <div>
                      <span>{product.product_name} #{product._index}</span>
                      {product.staff_name && (
                        <span className="text-muted-foreground ml-1">- {product.staff_name}</span>
                      )}
                    </div>
                    <span>{formatCurrency(product.price)}</span>
                  </div>
                ))}
              </div>
            </div>) }

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(inv.subtotal)}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Percent className={`h-4 w-4 mr-1 ${discountAmount > 0 ? 'text-blue-600' : 'text-muted-foreground'}`} />
                  <span className={`text-sm ${discountAmount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                    Discount
                    {inv.discount_type === 'percentage' && inv.discount_value
                      ? ` (${inv.discount_value}%)`
                      : ''}
                  </span>
                </div>
                <span className={`text-sm ${discountAmount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                  {discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : formatCurrency(0)}
                </span>
              </div>

              {/* Display individual tax components if available */}
              {inv.tax_components && inv.tax_components.length > 0 ? (
                inv.tax_components.map((component, index) => (
                  <div key={index} className="flex justify-between text-sm text-muted-foreground">
                    <span>{component.name} ({component.rate}%)</span>
                    <span>{formatCurrency(component.amount)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax ({inv.tax}%)</span>
                  <span>{formatCurrency(inv.tax_amount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <DollarSign className={`h-4 w-4 mr-1 ${tipAmount > 0 ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <span className={`text-sm ${tipAmount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                    Tip
                  </span>
                </div>
                <span className={`text-sm ${tipAmount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                  {formatCurrency(tipAmount || 0)}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(inv.total)}</span>
              </div>
              
              {/* Percentage indicators for tip and discount */}
              {(tipAmount > 0 || discountAmount > 0) && (
                <div className="text-xs text-muted-foreground space-y-1 mt-1">
                  {discountAmount > 0 && inv.subtotal > 0 && (
                    <div className="flex justify-end">
                      Discount: {((discountAmount / inv.subtotal) * 100).toFixed(1)}% of subtotal
                    </div>
                  )}
                  {tipAmount > 0 && inv.total > 0 && (
                    <div className="flex justify-end">
                      Tip: {((tipAmount / inv.total) * 100).toFixed(1)}% of total
                    </div>
                  )}
                </div>
              )}
            </div>

            {inv.notes && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Notes: </span>
                {inv.notes}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t">
          <Button variant="outline" onClick={handlePrint} disabled={isPrinting}>
            {isPrinting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
            <Printer className="h-4 w-4 mr-2" />
            )}
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
            <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};