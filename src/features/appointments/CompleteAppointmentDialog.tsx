import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import {
  Appointment,
  updateAppointment,
  getAppointmentById,
} from '@/api/services/appointmentService';
import { getAllServices } from '@/api/services/serviceService';
import { getAllProducts, Product } from '@/api/services/productService';
import { ServicePicker } from './ServicePicker';
import { formatCurrency } from '@/utils';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { DollarSign } from 'lucide-react';

// --- Inline simple ProductPicker -------------------------------------------
interface ProductPickerProps {
  selectedProducts: string[];
  onToggle: (id: string) => void;
  products: Product[];
}

const ProductPicker: React.FC<ProductPickerProps> = ({ selectedProducts, onToggle, products }) => {
  const categories = Array.from(new Set(products.map(p => p.category || 'Other'))).sort();
  return (
    <div className="space-y-4">
      {categories.map(cat => (
        <div key={cat} className="space-y-2">
          <h4 className="text-sm font-medium capitalize">{cat}</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.filter(p => (p.category || 'Other') === cat).map(p => {
              const selected = selectedProducts.includes(p.id);
              return (
                <Card
                  key={p.id}
                  onClick={() => onToggle(p.id)}
                  className={`cursor-pointer p-3 flex items-center gap-3 border-2 transition-colors ${selected ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'}`}
                >
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="h-12 w-12 object-cover rounded-md" />
                  ) : (
                    <div className="h-12 w-12 rounded-md bg-muted" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{cat}</p>
                  </div>
                  <p className={selected ? 'text-primary font-medium' : 'text-muted-foreground font-medium'}>
                    {formatCurrency(p.price)}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Dialog -----------------------------------------------------------------
interface CompleteAppointmentDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: (appt: Appointment) => void;
}

export const CompleteAppointmentDialog: React.FC<CompleteAppointmentDialogProps> = ({
  appointment,
  open,
  onOpenChange,
  onCompleted,
}) => {
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const { paymentMethods } = usePaymentMethods();
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [discountType, setDiscountType] = useState<'none'|'percentage'|'fixed'>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const totalSteps = 3;

  // Load lists
  const { data: svcResp, execute: fetchSvcs, loading: svcLoading } = useApi(getAllServices);
  const { data: prodResp, execute: fetchProds, loading: prodLoading } = useApi(getAllProducts);

  useEffect(() => {
    if (open) {
      fetchSvcs(1, 100, 'name_asc');
      fetchProds(1, 100, 'name_asc');

      if (appointment) {
        if (appointment.appointmentServices && appointment.appointmentServices.length > 0) {
          setSelectedServices(appointment.appointmentServices.map(s => s.service_id));
        } else {
          // fetch full details
          getAppointmentById(appointment.id).then(resp => {
            if (resp.success && resp.appointment.appointmentServices) {
              setSelectedServices(resp.appointment.appointmentServices.map(s => s.service_id));
            }
          });
        }
      }
    }
  }, [open, appointment, fetchSvcs, fetchProds]);

  // Auto-set when list ready
  useEffect(() => {
    if (paymentMethod === '' && paymentMethods.length > 0) {
      setPaymentMethod(paymentMethods[0]);
    }
  }, [paymentMethods, paymentMethod]);

  const services: any[] = svcResp?.services ?? [];
  const products: Product[] = prodResp?.products ?? [];

  const handleSvcToggle = (id: string) => {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };
  const handleProdToggle = (id: string) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const baseTotal = () => {
    const svcTotal = services
      .filter(s => selectedServices.includes(s.id))
      .reduce((t, s) => t + Number(s.price || 0), 0);
    const prodTotal = products
      .filter(p => selectedProducts.includes(p.id))
      .reduce((t, p) => t + Number(p.price || 0), 0);
    return svcTotal + prodTotal;
  };

  const discountAmount = () => {
    if (discountType==='percentage') return (baseTotal()*discountValue)/100;
    if (discountType==='fixed') return discountValue;
    return 0;
  };

  const totalWithTip = () => baseTotal() - discountAmount() + tipAmount;

  const finalize = async () => {
    if (!appointment) return;
    try {
      setIsSubmitting(true);
      const resp = await updateAppointment(appointment.id, {
        status: 'completed',
        services: selectedServices,
        products: selectedProducts,
        tipAmount,
        paymentMethod,
      } as unknown as Partial<Appointment>);
      toast({ title: 'Completed', description: 'Appointment completed & invoiced.' });
      if (onCompleted) onCompleted(resp.appointment);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to complete appointment', variant: 'destructive' });
    } finally { setIsSubmitting(false); }
  };

  const listLoading = svcLoading || prodLoading;

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] grid grid-rows-[auto,1fr,auto]">
        <DialogHeader>
          <DialogTitle>Finalize Appointment</DialogTitle>
        </DialogHeader>
        <ScrollArea className="min-h-0 pr-4 -mr-4 overflow-auto">
          {listLoading ? (
            <div className="h-full w-full flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Step content */}
              <div className="flex-1 overflow-y-auto">
                {step === 0 && (
                  <ServicePicker
                    selectedServices={selectedServices}
                    onServiceSelect={handleSvcToggle}
                    serviceList={services}
                  />
                )}
                {step === 1 && (
                  <ProductPicker
                    selectedProducts={selectedProducts}
                    onToggle={handleProdToggle}
                    products={products}
                  />
                )}
                {step === 2 && (
                  <div className="space-y-6 p-1">
                    {/* Tip first */}
                    <Card>
                      <div className="p-4 border-b flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <h4 className="font-medium">Tip</h4>
                      </div>
                      <div className="p-4 space-y-2">
                        <label className="text-sm font-medium">Tip Amount</label>
                        <Input type="number" min="0" step="0.01" value={tipAmount}
                          onChange={e=>setTipAmount(Number(e.target.value))} />
                      </div>
                    </Card>

                    {/* Payment & Discount grouped */}
                    <Card>
                      <div className="p-4 border-b flex items-center gap-2">
                        <h4 className="font-medium">Payment & Discount</h4>
                      </div>
                      <div className="p-4 grid sm:grid-cols-2 gap-4">
                        {/* Payment Method */}
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Payment Method</label>
                          <Select value={paymentMethod} onValueChange={(v: string)=>setPaymentMethod(v)} disabled={paymentMethods.length===0}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              {paymentMethods.map(m=> (
                                <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Discount */}
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Discount</label>
                          <Select value={discountType} onValueChange={(v: 'none'|'percentage'|'fixed')=>{setDiscountType(v); if(v==='none'){setDiscountValue(0);}}}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Discount</SelectItem>
                              <SelectItem value="percentage">Percentage (%)</SelectItem>
                              <SelectItem value="fixed">Fixed Amount</SelectItem>
                            </SelectContent>
                          </Select>
                          {discountType!=='none' && (
                            <Input type="number" min="0" step="0.01" value={discountValue}
                              onChange={e=>setDiscountValue(Number(e.target.value))} className="mt-2" />
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
              {/* spacer bottom padding */}
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="flex items-center justify-between gap-4 border-t pt-4 bg-background">
          <div className="flex-1 space-y-2">
            <Progress value={((step+1)/totalSteps)*100} />
            <div className="text-sm text-muted-foreground">Step {step+1} of {totalSteps}</div>
          </div>
          <div className="text-lg font-semibold whitespace-nowrap">{formatCurrency(totalWithTip())}</div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={step===0} onClick={() => setStep((step-1) as 0|1|2)}>
              <ArrowLeft className="h-4 w-4 mr-2"/> Back
            </Button>
            {step < 2 ? (
              <Button onClick={() => setStep((step+1) as 0|1|2)}>
                Next <ArrowRight className="h-4 w-4 ml-2"/>
              </Button>
            ) : (
              <Button onClick={finalize} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin"/>}
                Finalize
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 