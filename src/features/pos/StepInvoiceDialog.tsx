import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { StepWiseInvoiceForm, InvoiceFormData } from './StepWiseInvoiceForm';
import { useApi } from '@/hooks/useApi';
import { createInvoice as apiCreateInvoice } from '@/api/services/invoiceService';
import type { Invoice as ApiInvoice } from '@/api/services/invoiceService';
import { InvoiceService, InvoiceProduct } from '@/api/services/invoiceService';
import { getAllStaff } from '@/api/services/staffService';
import { getAllServices } from '@/api/services/serviceService';
import { getAllProducts } from '@/api/services/productService';
import { getGSTRates } from '@/api/services/settingsService';
import { Customer } from '@/api/services/customerService';
import { Loader2 } from 'lucide-react';

// Type for a GST rate
interface GSTRate {
  id: string;
  name: string;
  components: { id: string; name: string; rate: number }[];
  isActive: boolean;
  totalRate: number;
}

interface StepInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceCreated?: () => void;
}

export const StepInvoiceDialog: React.FC<StepInvoiceDialogProps> = ({
  open,
  onOpenChange,
  onInvoiceCreated,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [staffMembers, setStaffMembers] = useState<Array<{
    id: string;
    name: string;
    position: string;
    image: string;
  }>>([]);
  const [serviceItems, setServiceItems] = useState<Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
    category: string;
    description?: string;
  }>>([]);
  const [productItems, setProductItems] = useState<Array<{
    id: string;
    name: string;
    price: number;
    category: string;
    image?: string;
    description?: string;
  }>>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // Use the API hook for creating invoices and fetching data
  const {
    loading,
    execute: executeCreateInvoice
  } = useApi(apiCreateInvoice);
  
  const {
    execute: fetchStaff
  } = useApi(getAllStaff);
  
  const {
    execute: fetchServices
  } = useApi(getAllServices);

  const {
    execute: fetchProducts
  } = useApi(getAllProducts);

  // Add API hook for creating customers
  const {
    loading: isCreatingCustomer
  } = useApi(() => Promise.resolve({ success: true }));
  
  // Add API hook for fetching GST rates
  const {
    data: gstRatesResponse,
    loading: isLoadingGSTRates,
    error: gstRatesError,
    execute: fetchGSTRates
  } = useApi(getGSTRates);
  
  // State to hold the fetched GST rates
  const [gstRates, setGSTRates] = useState<GSTRate[]>([]);
  
  // Fetch staff members and services when dialog opens
  useEffect(() => {
    if (!open) return;

    // Fetch staff only if we don't already have data
    if (staffMembers.length === 0 && !isLoadingStaff) {
      setIsLoadingStaff(true);
      fetchStaff(1, 100, 'name_asc', undefined, 'available')
        .then(response => {
          if (response.success && response.staff) {
            const formattedStaff = response.staff.map(member => ({
              id: member.id,
              name: member.user?.name || 'Unknown',
              position: member.bio ? member.bio.split('.')[0] : 'Staff Member',
              image: member.image || member.user?.image || '',
            }));
            setStaffMembers(formattedStaff);
          } else {
            toast({
              title: 'Error',
              description: 'Failed to load staff members',
              variant: 'destructive',
            });
          }
        })
        .catch(error => {
          console.error('Error fetching staff:', error);
          toast({
            title: 'Error',
            description: 'Failed to load staff members',
            variant: 'destructive',
          });
        })
        .finally(() => setIsLoadingStaff(false));
    }

    // Fetch services only if not already cached
    if (serviceItems.length === 0 && !isLoadingServices) {
      setIsLoadingServices(true);
      fetchServices(1, 100, 'name_asc')
        .then(response => {
          if (response.success && response.services) {
            setServiceItems(response.services);
          } else {
            toast({
              title: 'Error',
              description: 'Failed to load services',
              variant: 'destructive',
            });
          }
        })
        .catch(error => {
          console.error('Error fetching services:', error);
          toast({
            title: 'Error',
            description: 'Failed to load services',
            variant: 'destructive',
          });
        })
        .finally(() => setIsLoadingServices(false));
    }

    // Fetch products only if not already cached
    if (productItems.length === 0 && !isLoadingProducts) {
      setIsLoadingProducts(true);
      fetchProducts(1, 100, 'name_asc')
        .then(response => {
          if (response.success && response.products) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mapped = response.products.map((p: any) => {
              let img = p.image || p.image_url || p.imageUrl || p.photo || '';
              if (img && !img.startsWith('http') && !img.startsWith('data:')) {
                img = `data:image/jpeg;base64,${img}`;
              }
              return {
                id: p.id,
                name: p.name,
                price: p.price,
                category: p.category,
                description: p.description,
                image: img,
              };
            });
            setProductItems(mapped);
          } else {
            toast({
              title: 'Error',
              description: 'Failed to load products',
              variant: 'destructive',
            });
          }
        })
        .catch(error => {
          console.error('Error fetching products:', error);
          toast({
            title: 'Error',
            description: 'Failed to load products',
            variant: 'destructive',
          });
        })
        .finally(() => setIsLoadingProducts(false));
    }
  }, [open, staffMembers.length, serviceItems.length, isLoadingStaff, isLoadingServices, fetchStaff, fetchServices, fetchProducts, toast]);

  // Add a useEffect to fetch GST rates on component mount
  useEffect(() => {
    fetchGSTRates();
  }, [fetchGSTRates]);
  
  // Update GST rates state when API data is loaded
  useEffect(() => {
    if (gstRatesResponse?.gstRates) {
      // Map API GST rates to the format our component expects
      const mappedRates: GSTRate[] = gstRatesResponse.gstRates.map(rate => ({
        id: rate.id || '',
        name: rate.name,
        isActive: rate.is_active,
        totalRate: rate.total_rate || 0,
        components: rate.components.map(comp => ({
          id: comp.id || '',
          name: comp.name,
          rate: comp.rate
        }))
      }));
      
      setGSTRates(mappedRates);
    }
  }, [gstRatesResponse]);
  
  // Handle GST rates error
  useEffect(() => {
    if (gstRatesError) {
      toast({
        title: 'Error loading GST rates',
        description: gstRatesError.message,
        variant: 'destructive',
      });
    }
  }, [gstRatesError, toast]);

  const handleSubmit = async (formData: InvoiceFormData) => {
    try {
      setIsSubmitting(true);
      const round2 = (n: number) => Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;
      
      // If we received a selected customer in the form data, update our state
      if (formData.selectedCustomer) {
        setSelectedCustomer(formData.selectedCustomer);
      }
      
      // Prepare services data
      console.log('Original services data from form:', JSON.stringify(formData.services, null, 2));
      
      if (!formData.services || formData.services.length === 0) {
        console.error('WARNING: No services received from form data!');
        toast({
          title: 'Error',
          description: 'No services selected. Please select at least one service.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      const servicesWithDetails: InvoiceService[] = [];
      (formData.services as any[]).forEach((service) => {
        const serviceDetails = serviceItems.find(s => s.id === (service as any).serviceId || (service as any).service_id);
        const ids: string[] = service.staffIds ?? (service.staffId ? [service.staffId] : []);
        if(ids.length===0){ ids.push(''); }
        ids.forEach((sid)=>{
          const detail = serviceDetails;
          const base = {
            service_id: detail?.id || (service as any).serviceId,
            service_name: detail?.name || 'Unknown Service',
            price: detail?.price || 0,
            quantity: 1,
            total: (detail?.price || 0),
            staff_id: sid,
            staff_name: staffMembers.find(s=>s.id===sid)?.name || 'Staff Member'
          };
          servicesWithDetails.push(base);
        });
      });

      // Merge duplicates (same service & staff) for API expectations
      const mergedServices: InvoiceService[] = Object.values(servicesWithDetails.reduce((acc: Record<string, InvoiceService>, svc: InvoiceService)=>{
        const key = `${svc.service_id}_${svc.staff_id}`;
        const existing = acc[key];
        if(existing){
          existing.quantity += 1;
          existing.total += svc.total;
        } else {
          acc[key] = { ...svc };
        }
        return acc;
      },{} as Record<string,InvoiceService>)) as InvoiceService[];
      
      // Prepare products data
      /*
       * Map products and their assigned staff just like services.
       * Each quantity of a product is stored as a separate record so that it can be
       * associated to a specific staff member. This makes it easy to merge duplicates
       * afterwards while maintaining a correct staff_id ➜ staff_name association.
       */
      const productsWithDetails: InvoiceProduct[] = [];

      (formData.products || []).forEach((product: any) => {
        const productDetails = productItems.find(p => p.id === product.productId || p.id === product.product_id);

        // Support both the new staffIds array and the legacy single staffId field
        const ids: string[] = product.staffIds ?? (product.staffId ? [product.staffId] : []);

        // Ensure at least one placeholder staff entry so that length === quantity
        if (ids.length === 0) ids.push('');

        ids.forEach((sid) => {
          const priceVal = productDetails?.price ?? 0;
          productsWithDetails.push({
            product_id: productDetails?.id || product.productId,
            product_name: productDetails?.name || 'Unknown Product',
            price: priceVal,
            quantity: 1,
            total: priceVal,
            staff_id: sid,
            staff_name: staffMembers.find(s => s.id === sid)?.name || 'Staff Member'
          });
        });
      });

      // Merge duplicates (same product & staff) for API expectations
      const mergedProducts: InvoiceProduct[] = Object.values(productsWithDetails.reduce((acc: Record<string, InvoiceProduct>, prod: InvoiceProduct) => {
        const key = `${prod.product_id}_${prod.staff_id}`;
        const existing = acc[key];
        if (existing) {
          existing.quantity += 1;
          existing.total += prod.total;
        } else {
          acc[key] = { ...prod };
        }
        return acc;
      }, {} as Record<string, InvoiceProduct>)) as InvoiceProduct[];
      
      // Calculate subtotal - ensure values are numbers
      const subtotalServices = mergedServices.reduce((sum: number, service: InvoiceService) => sum + (Number(service.total) || 0), 0);
      const subtotalProducts = mergedProducts.reduce((sum: number, product: InvoiceProduct) => sum + (Number(product.total) || 0), 0);
      const subtotal = round2(subtotalServices + subtotalProducts);
      
      // Get the GST rate data
      const gstRateData = gstRates.find(rate => rate.id === formData.gstRates[0]);
      const taxRate = Number(gstRateData?.totalRate) || 7.5;
      
      // Calculate discount amount
      let discountAmount = 0;
      const discountValue = Number(formData.discountValue) || 0;
      
      if (formData.discountType === 'percentage' && discountValue > 0) {
        discountAmount = round2((subtotal * discountValue) / 100);
      } else if (formData.discountType === 'fixed' && discountValue > 0) {
        discountAmount = round2(discountValue);
      }
      
      // Calculate tax amount
      const taxableAmount = Math.max(0, round2(subtotal - discountAmount));
      // If components exist, compute per-component rounded amounts and sum for total tax
      let taxAmount = 0;
      let taxComponentsForPayload: { name: string; rate: number; amount: number }[] | null = null;
      if (gstRateData && gstRateData.components && gstRateData.components.length > 0) {
        taxComponentsForPayload = gstRateData.components.map(comp => ({
          name: comp.name,
          rate: Number(comp.rate) || 0,
          amount: round2((taxableAmount * (Number(comp.rate) || 0)) / 100),
        }));
        taxAmount = round2(taxComponentsForPayload.reduce((s, c) => s + c.amount, 0));
      } else {
        taxAmount = round2((taxableAmount * taxRate) / 100);
      }
      
      // Calculate total
      const tipAmount = round2(Number(formData.tipAmount) || 0);
      const total = round2(taxableAmount + taxAmount + tipAmount);
      
      // Collect unique staff IDs from services and products mapping
      const staffIdsFromServices = mergedServices.map(s => s.staff_id).filter(Boolean);
      const staffIdsFromProducts = mergedProducts.map(p => p.staff_id).filter(Boolean);
      const uniqueStaffIds = Array.from(new Set([...staffIdsFromServices, ...staffIdsFromProducts]));

      const staffSummary = uniqueStaffIds.map(id => {
        const found = staffMembers.find(s => s.id === id);
        return {
          id,
          name: found?.name || 'Staff Member'
        };
      });
      
      // If no staff mapped (edge case), warn and assign 'unassigned'
      if (staffSummary.length === 0) {
        console.warn('No staff mapped to items. Proceeding with empty staff list.');
      }
      // (Optional) you can choose the first staff member for backward compatibility
      const primaryStaffId = staffSummary[0]?.id || '';
      const primaryStaffName = staffSummary[0]?.name || '';
      
      // Handle customer data based on form input
      let customerId;
      let customerName;
      let isNewCustomer = false;
      let customerDetails = null;

      console.log('Form data customer info:', {
        isNewCustomer: formData.isNewCustomer,
        isGuestUser: formData.isGuestUser,
        hasSelectedCustomer: !!formData.selectedCustomer,
        hasCustomerDetails: !!formData.customerDetails
      });

      // Check if this is a new customer that needs to be created
      if (formData.isNewCustomer && formData.customerDetails) {
        // Set flag for backend to create customer
        isNewCustomer = true;
        customerDetails = formData.customerDetails;
        
        // Use temporary ID and name for the request
        customerId = 'pending-creation';
        customerName = formData.customerDetails.name;
        
        console.log('New customer will be created on the server:', customerDetails);
      } else if (formData.isGuestUser) {
        // For guest user, use the guest-user ID
        customerId = 'guest-user'; // Guest customer ID that exists in the database
        customerName = 'Guest Customer';
      } else if (formData.selectedCustomer) {
        // Use the customer passed from the form
        customerId = formData.selectedCustomer.id;
        customerName = formData.selectedCustomer.name;
      } else if (selectedCustomer) {
        // Use our local state if available
        customerId = selectedCustomer.id;
        customerName = selectedCustomer.name;
      } else {
        // Fallback to guest if we somehow don't have customer information
        customerId = 'guest-user';
        customerName = 'Guest Customer';
        console.warn('No customer selected, using guest user as fallback');
      }
      
      // Transform form data to match API structure exactly as required
      const invoiceData = {
        customer_id: customerId,
        customer_name: customerName,
        staff_id: primaryStaffId,
        staff_name: primaryStaffName,
        staff: staffSummary, // array of involved staff
        date: new Date().toISOString().split('T')[0],
        services: mergedServices, // Keep for backward compatibility
        invoiceServices: mergedServices, // Use the correct property name to match backend alias
        products: mergedProducts,
        invoiceProducts: mergedProducts,
        subtotal: subtotal,
        tax: taxRate,
        tax_amount: taxAmount,
        total: total,
        payment_method: formData.paymentMethod,
        status: 'paid', // Invoice is created as paid
        notes: formData.notes || '',
        tip_amount: tipAmount || 0, // total tip; backend now allocates equally among staff lines
        // Add customer creation fields
        is_new_customer: isNewCustomer,
        customer_details: customerDetails
      } as const; // Use const assertion instead of individual property assertion
      
      // Always include discount fields even if no discount
      Object.assign(invoiceData, {
        discount_type: formData.discountType,
        discount_value: formData.discountValue || 0,
        discount_amount: discountAmount
      });
      
      // Tip amount is already included in the invoiceData object
      
      // Add tax components if we have GST rate details
      if (taxComponentsForPayload) {
        Object.assign(invoiceData, { tax_components: taxComponentsForPayload });
      } else {
        // Add default tax component if none exists
        Object.assign(invoiceData, {
          tax_components: [{
            name: 'Standard GST',
            rate: taxRate,
            amount: taxAmount
          }]
        });
      }
      
      console.log('Sending invoice data:', JSON.stringify(invoiceData, null, 2));
      console.log('Services being sent:', JSON.stringify(mergedServices, null, 2));
      console.log('Products being sent:', JSON.stringify(mergedProducts, null, 2));
      console.log('Services array length:', mergedServices.length);
      console.log('First service:', mergedServices[0] ? JSON.stringify(mergedServices[0], null, 2) : 'No services found');
      
      // Log any services that don't match our local cache
      const mismatchedServices = formData.services.filter(service => 
        !serviceItems.some(s => s.id === service.serviceId)
      );
      
      if (mismatchedServices.length > 0) {
        console.warn('Warning: Some services don\'t exist in local cache:', 
          mismatchedServices.map(s => s.serviceId).join(', ')
        );
      }
      
      // Send data to the API
      const response = await executeCreateInvoice(invoiceData as unknown as Partial<ApiInvoice>);
      
      if (response.success) {
        toast({
          title: 'Invoice created',
          description: 'New invoice has been created successfully.',
        });
        
        onOpenChange(false);
        
        // Call the onInvoiceCreated callback if provided
        if (onInvoiceCreated) {
          onInvoiceCreated();
        }
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Error creating invoice:', error);
      
      // Check if it's a foreign key constraint error
      if (error.message && error.message.includes('foreign key constraint fails')) {
        if (error.message.includes('customer_id')) {
          toast({
            title: 'Customer Error',
            description: 'Failed to create invoice: The customer ID does not exist in the database.',
            variant: 'destructive',
          });
        } else if (error.message.includes('staff_id')) {
          toast({
            title: 'Staff Error',
            description: 'Failed to create invoice: The staff ID does not exist in the database.',
            variant: 'destructive',
          });
        } else if (error.message.includes('service_id')) {
          // Handle service ID errors specifically
          let serviceId = '';
          try {
            // Try to extract the service ID from the error message
            const match = error.message.match(/parameters.*service-\d+/);
            if (match && match[0]) {
              serviceId = match[0].split(',').find(p => p.trim().includes('service-'))?.trim() || '';
            }
          } catch (e) {
            console.error('Failed to extract service ID from error:', e);
          }
          
          toast({
            title: 'Service Error',
            description: `Failed to create invoice: Service ID ${serviceId || ''} does not exist in the database. Please refresh the page to get the latest services.`,
            variant: 'destructive',
          });
          
          // Refresh the services list to get the latest data
          fetchServices(1, 100, 'name_asc')
            .then(response => {
              if (response.success && response.services) {
                setServiceItems(response.services);
              }
            })
            .catch(e => console.error('Error refreshing services:', e));
            
        } else {
          toast({
            title: 'Database Error',
            description: 'Failed to create invoice: A database constraint error occurred.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: `Failed to create invoice: ${error.message || 'Please try again.'}`,
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Global loading state while fetching initial data
  const isInitialLoading = isLoadingStaff || isLoadingServices || isLoadingGSTRates;
  const isInitialLoadingAll = isInitialLoading || isLoadingProducts;

  return (
    <Sheet open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <SheetHeader>
            <SheetTitle>Create New Invoice</SheetTitle>
            <SheetDescription>
              Create a new invoice by following these steps.
            </SheetDescription>
          </SheetHeader>
        </div>

        {isInitialLoadingAll ? (
          <div className="flex items-center justify-center h-[calc(100%-80px)]">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading data...</p>
            </div>
          </div>
        ) : staffMembers.length === 0 || serviceItems.length === 0 || gstRates.length === 0 ? (
          <div className="flex items-center justify-center h-[calc(100%-80px)]">
            <div className="text-center max-w-md p-6">
              <h3 className="text-lg font-medium mb-2">Cannot Create Invoice</h3>
              <p className="text-muted-foreground mb-4">
                {staffMembers.length === 0 
                  ? 'There are no staff members available. Please add staff members first.'
                  : serviceItems.length === 0
                  ? 'There are no services available. Please add services first.'
                  : 'There are no GST rates configured. Please configure GST rates first.'}
              </p>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        ) : (
        <div className="relative h-[calc(100%-80px)]">
          <StepWiseInvoiceForm 
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={loading || isSubmitting || isCreatingCustomer}
            staffData={staffMembers}
            isLoadingStaff={isLoadingStaff}
            serviceData={serviceItems}
            isLoadingServices={isLoadingServices}
            productData={productItems}
            isLoadingProducts={isLoadingProducts}
            gstRatesData={gstRates}
          />
        </div>
        )}
      </SheetContent>
    </Sheet>
  );
}; 