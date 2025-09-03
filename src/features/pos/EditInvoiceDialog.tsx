import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { StepWiseInvoiceForm, InvoiceFormData } from './StepWiseInvoiceForm';
import { Invoice, updateInvoice } from '@/api/services/invoiceService';
import { getAllStaff } from '@/api/services/staffService';
import { getAllServices } from '@/api/services/serviceService';
import { getAllProducts } from '@/api/services/productService';
import { getGSTRates } from '@/api/services/settingsService';
import { Loader2 } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { formatPhoneNumber } from '@/utils';

interface EditInvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceUpdated?: () => void;
}

// Helper to transform existing invoice data into InvoiceFormData structure expected by StepWiseInvoiceForm
const mapInvoiceToFormData = (inv: Invoice): Partial<InvoiceFormData> => {
  // Aggregate duplicate service/product lines (same service/product id) into a single entry
  // and expand per-unit staff assignments into the staffIds array so each unit can be mapped independently.

  const svcMap = new Map<string, { id: string; serviceId: string; quantity: number; staffIds: string[] }>();
  (inv.invoiceServices || inv.services || []).forEach((s) => {
    const qty = s.quantity || 1;
    const key = s.service_id;
    if (!svcMap.has(key)) {
      svcMap.set(key, { id: `svc-${key}`, serviceId: key, quantity: 0, staffIds: [] });
    }
    const entry = svcMap.get(key)!;
    for (let i = 0; i < qty; i += 1) {
      entry.staffIds.push(s.staff_id || '');
      entry.quantity += 1;
    }
  });
  const services = Array.from(svcMap.values());

  const prdMap = new Map<string, { id: string; productId: string; quantity: number; staffIds: string[] }>();
  (inv.invoiceProducts || inv.products || []).forEach((p) => {
    const qty = p.quantity || 1;
    const key = p.product_id;
    if (!prdMap.has(key)) {
      prdMap.set(key, { id: `prd-${key}`, productId: key, quantity: 0, staffIds: [] });
    }
    const entry = prdMap.get(key)!;
    for (let i = 0; i < qty; i += 1) {
      entry.staffIds.push(p.staff_id || '');
      entry.quantity += 1;
    }
  });
  const products = Array.from(prdMap.values());

  return {
    id: inv.id,
    customerPhone: '', // phone not returned in invoice list; leave blank
    customerName: inv.customer_name,
    staffId: inv.staff_id || '',
    discountType: inv.discount_type || 'none',
    discountValue: inv.discount_value || 0,
    tipAmount: inv.tip_amount || 0,
    paymentMethod: inv.payment_method,
    gstRates: inv.tax_components && inv.tax_components.length ? [inv.tax_components[0].name] : [],
    notes: inv.notes,
    services,
    products,
    isNewCustomer: false,
    isGuestUser: false,
  } as Partial<InvoiceFormData>;
};

export const EditInvoiceDialog: React.FC<EditInvoiceDialogProps> = ({
  invoice,
  open,
  onOpenChange,
  onInvoiceUpdated,
}) => {
  const { toast } = useToast();

  const { execute: execUpdate, loading: isSaving } = useApi(updateInvoice);

  // Fetch helpers
  const { execute: fetchStaff } = useApi(getAllStaff);
  const { execute: fetchServices } = useApi(getAllServices);
  const { execute: fetchProducts } = useApi(getAllProducts);
  const { data: gstRatesResponse, execute: fetchGSTRates } = useApi(getGSTRates);

  // Local state for dropdown data
  interface GSTRate {
    id: string;
    name: string;
    components: { id: string; name: string; rate: number }[];
    isActive: boolean;
    totalRate: number;
  }

  const [staffMembers, setStaffMembers] = useState<Array<{ id: string; name: string; position: string; image: string }>>([]);
  const [serviceItems, setServiceItems] = useState<Array<{ id: string; name: string; price: number; duration: number; category: string; description?: string }>>([]);
  const [productItems, setProductItems] = useState<Array<{ id: string; name: string; price: number; category: string; image?: string; description?: string }>>([]);
  const [gstRates, setGSTRates] = useState<GSTRate[]>([]);

  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingGSTRates, setIsLoadingGSTRates] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (staffMembers.length === 0 && !isLoadingStaff) {
      setIsLoadingStaff(true);
      fetchStaff(1, 100, 'name_asc', undefined, 'available')
        .then((resp) => {
          if (resp.success && resp.staff) {
            const formatted = resp.staff.map((m: any) => ({
              id: m.id,
              name: m.user?.name || 'Unknown',
              position: m.bio ? m.bio.split('.')[0] : 'Staff',
              image: m.image || m.user?.image || '',
            }));
            setStaffMembers(formatted);
          }
        })
        .finally(() => setIsLoadingStaff(false));
    }

    if (serviceItems.length === 0 && !isLoadingServices) {
      setIsLoadingServices(true);
      fetchServices(1, 100, 'name_asc')
        .then((resp) => {
          if (resp.success && resp.services) setServiceItems(resp.services);
        })
        .finally(() => setIsLoadingServices(false));
    }

    if (productItems.length === 0 && !isLoadingProducts) {
      setIsLoadingProducts(true);
      fetchProducts(1, 100, 'name_asc')
        .then((resp) => {
          if (resp.success && resp.products) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mapped = resp.products.map((p: any) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              category: p.category,
              description: p.description,
              image: p.image || '',
            }));
            setProductItems(mapped);
          }
        })
        .finally(() => setIsLoadingProducts(false));
    }

    if (!isLoadingGSTRates && gstRates.length === 0) {
      setIsLoadingGSTRates(true);
      fetchGSTRates()
        .then(() => { })
        .finally(() => setIsLoadingGSTRates(false));
    }
  }, [open]);

  // Update GST rate list when response arrives
  useEffect(() => {
    if (gstRatesResponse?.gstRates) {
      const mapped: GSTRate[] = gstRatesResponse.gstRates.map((r: any) => ({
        id: r.id || '',
        name: r.name,
        isActive: r.is_active,
        totalRate: r.total_rate || 0,
        components: r.components.map((c: any) => ({ id: c.id || '', name: c.name, rate: c.rate })),
      }));
      setGSTRates(mapped);
    }
  }, [gstRatesResponse]);

  if (!invoice) return null;

  const initialData = mapInvoiceToFormData(invoice);

  const handleSubmit = async (formData: InvoiceFormData) => {
    try {
      // Build invoiceServices and invoiceProducts arrays with staff_id mapping
      const sourceServices = invoice.invoiceServices || invoice.services || [];
      const sourceProducts = invoice.invoiceProducts || invoice.products || [];

      // Helper to get service / product meta data
      // 1. Try existing entries on the invoice (sourceServices/sourceProducts)
      // 2. Fallback to the full catalog fetched for the form (serviceItems/productItems)
      const getServiceDetails = (serviceId: string) =>
        sourceServices.find((s) => s.service_id === serviceId) ||
        serviceItems.find((s) => s.id === serviceId) || null;

      const getProductDetails = (productId: string) =>
        sourceProducts.find((p) => p.product_id === productId) ||
        productItems.find((p) => p.id === productId) || null;

      type Svc = {
        service_id: string;
        service_name: string;
        price: number;
        quantity: number;
        total: number;
        staff_id?: string | null;
        staff_name?: string | null;
      };

      type Prod = {
        product_id: string;
        product_name: string;
        price: number;
        quantity: number;
        total: number;
        staff_id?: string | null;
        staff_name?: string | null;
      };

      const staffNameById = new Map<string, string>();
      staffMembers.forEach((m) => staffNameById.set(m.id, m.name));

      const tempServices: Svc[] = [];
      (formData.services || []).forEach((svc) => {
        const det = getServiceDetails(svc.serviceId);
        const priceVal = det ? (det as any).price || 0 : 0;
        if (svc.quantity < 1) return;
        const ids = svc.staffIds && svc.staffIds.length ? svc.staffIds : Array(svc.quantity).fill('');
        ids.forEach((sid, idx) => {
          // Ensure we create exactly "quantity" number of entries
          if (idx >= svc.quantity) return;
          tempServices.push({
            service_id: svc.serviceId,
            service_name: (det as any)?.service_name || (det as any)?.name || 'Service',
            price: priceVal,
            quantity: 1,
            total: priceVal,
            staff_id: sid || null,
            staff_name: sid ? (staffNameById.get(sid) || null) : null,
          });
        });
      });

      const mergedServices: Svc[] = Object.values(
        tempServices.reduce((acc, cur) => {
          const key = `${cur.service_id}_${cur.staff_id || ''}`;
          const existing = acc[key];
          if (existing) {
            existing.quantity += 1;
            existing.total += cur.total;
          } else {
            acc[key] = { ...cur };
          }
          return acc;
        }, {} as Record<string, Svc>)
      );

      // Products
      const tempProducts: Prod[] = [];
      (formData.products || []).forEach((prd) => {
        const det = getProductDetails(prd.productId);
        const priceVal = det ? (det as any).price || 0 : 0;
        if (prd.quantity < 1) return;
        const ids = prd.staffIds && prd.staffIds.length ? prd.staffIds : Array(prd.quantity).fill('');
        ids.forEach((sid, idx) => {
          if (idx >= prd.quantity) return;
          tempProducts.push({
            product_id: prd.productId,
            product_name: (det as any)?.product_name || (det as any)?.name || 'Product',
            price: priceVal,
            quantity: 1,
            total: priceVal,
            staff_id: sid || null,
            staff_name: sid ? (staffNameById.get(sid) || null) : null,
          });
        });
      });

      const mergedProducts: Prod[] = Object.values(
        tempProducts.reduce((acc, cur) => {
          const key = `${cur.product_id}_${cur.staff_id || ''}`;
          const existing = acc[key];
          if (existing) {
            existing.quantity += 1;
            existing.total += cur.total;
          } else {
            acc[key] = { ...cur };
          }
          return acc;
        }, {} as Record<string, Prod>)
      );

      // Build payload to send to API
      const payload: Partial<Invoice> = {
        tip_amount: formData.tipAmount, // total tip; backend allocates equally among staff lines
        discount_type: formData.discountType !== 'none' ? (formData.discountType as 'percentage' | 'fixed') : undefined,
        discount_value: formData.discountValue,
        notes: formData.notes,
        payment_method: formData.paymentMethod,
        invoiceServices: mergedServices as unknown as any[],
        invoiceProducts: mergedProducts as unknown as any[],
      };

      const response = await execUpdate(invoice.id, payload);
      if (response.success) {
        toast({ title: 'Invoice updated', description: 'Invoice changes have been saved.' });
        onInvoiceUpdated?.();
        onOpenChange(false);
      } else {
        toast({ title: 'Update failed', description: 'Failed to update invoice.', variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Unable to update invoice.', variant: 'destructive' });
    }
  };
  

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <SheetHeader>
            <SheetTitle>Edit Invoice #{invoice.id}</SheetTitle>
            <SheetDescription>Modify invoice details and save changes.</SheetDescription>
          </SheetHeader>
        </div>

        

        {(isLoadingStaff || isLoadingServices || isLoadingGSTRates) ? (
          <div className="flex items-center justify-center h-[calc(100%-80px)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : staffMembers.length === 0 || serviceItems.length === 0 || gstRates.length === 0 ? (
          <div className="flex items-center justify-center h-[calc(100%-80px)] p-6 text-center">
            <p className="text-muted-foreground text-sm">
              {staffMembers.length === 0
                ? 'No staff members available. Please add staff members first.'
                : serviceItems.length === 0
                  ? 'No services available. Please add services first.'
                  : 'No GST rates configured. Please configure GST rates.'}
            </p>
          </div>
        ) : (
          <div className="relative h-[calc(100%-80px)]">
            <StepWiseInvoiceForm
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              isSubmitting={isSaving}
              staffData={staffMembers}
              isLoadingStaff={isLoadingStaff}
              serviceData={serviceItems}
              isLoadingServices={isLoadingServices}
              productData={productItems}
              isLoadingProducts={isLoadingProducts}
              gstRatesData={gstRates}
              invoice={invoice}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};