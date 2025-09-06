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
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import { motion } from 'framer-motion';
import { Loader2, Scissors, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { DollarSign } from 'lucide-react';
import { getAllStaff } from '@/api/services/bookingService';
import { Skeleton } from "@/components/ui/skeleton"; // shadcn skeleton

export function StaffSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="w-full h-auto p-3 sm:p-4 flex items-center gap-3 sm:gap-4 rounded-xl border bg-accent/10 border-accent/30 shadow-sm"
        >
          {/* Avatar Skeleton */}
          <Skeleton className="h-14 w-14 sm:h-12 sm:w-12 rounded-full" />

          <div className="flex flex-col min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2 w-full">
              {/* Name */}
              <Skeleton className="h-4 w-24 rounded" />
              {/* Badge */}
              <Skeleton className="h-4 w-12 rounded" />
            </div>

            {/* Position */}
            <Skeleton className="h-3 w-16 rounded" />

            {/* Services badge */}
            <div className="flex gap-1 mt-1">
              <Skeleton className="h-5 w-10 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


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
  const [IsstaffDetails, IsSetstaffDetails] = useState<any>({});
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const { paymentMethods } = usePaymentMethods();
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [discountType, setDiscountType] = useState<'none' | 'percentage' | 'fixed'>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [selectedStaffId, handleStaffSelect] = useState<any>("any_staff");
  const totalSteps = 4;
  const {
    data: staffListData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    loading: _staffListLoading,
    error: staffListError,
    execute: fetchStaffList,
  } = useApi(getAllStaff);

  useEffect(() => {
    fetchStaffList()
  }, [])

  console.log("__staffListData ", staffListData)

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
  }, []);

  // Auto-set when list ready
  useEffect(() => {
    if (paymentMethod === '' && paymentMethods.length > 0) {
      setPaymentMethod(paymentMethods[0]);
    }
  }, []);

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
    if (discountType === 'percentage') return (baseTotal() * discountValue) / 100;
    if (discountType === 'fixed') return discountValue;
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
        staffDetails: IsstaffDetails
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
          {listLoading && !_staffListLoading ? (
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
                  <>
                  {_staffListLoading && <StaffSkeletonGrid />}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden">
                    {
                      [
                        {
                          "id": "any_staff",
                          "name": "Any staff",
                          "position": null,
                          "bio": "",
                          "image": "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
                          "services": []
                        }, ...(staffListData?.staff || [])].map((staff) => {
                          if(!staff?.is_available) return null
                          const isSelected = selectedStaffId === staff.user_id;
                          console.log("____staff >> ",staff)
                          return (
                            <motion.div key={`staff-${staff.user_id}`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                variant="ghost"
                                className={`group w-full h-auto p-3 sm:p-4 text-left flex items-center gap-3 sm:gap-4 rounded-xl border transition-all duration-200 ${isSelected
                                  ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg border-primary hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 hover:text-primary-foreground" : "bg-accent/10 border-accent/30 text-foreground shadow-sm hover:border-accent/50 hover:bg-accent/20 hover:shadow-md"
                                  }`
                                }
                                onClick={(e) => {
                                  e.preventDefault(); // Prevent default button behavior
                                  e.stopPropagation(); // Stop event propagation
                                  handleStaffSelect(staff.user_id);
                                  IsSetstaffDetails(staff?.user)
                                }
                                }
                                type="button" // Explicitly set type to button
                              >
                                <Avatar className={`h-14 w-14 sm:h-12 sm:w-12 shrink-0 ${isSelected ? "ring-2 ring-primary-foreground/30" : ""
                                  }`
                                }>
                                  <AvatarImage
                                    src={
                                      staff.image || (staff as unknown as {
                                        user?: {
                                          image?: string
                                        }
                                      }).user?.image ||
                                      'https: //images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1080'
                                    }
                                    alt={staff.name}
                                  />
                                  <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2 w-full">
                                    <span className={`font-medium truncate ${isSelected ? "text-primary-foreground" : ""
                                      }`
                                    }>
                                      {staff?.user.name}
                                    </span>
                                    <Badge
                                      variant="default"
                                      className={`text-[
          10px
        ] px-2 py-0.5 shrink-0 border-0 ${isSelected
                                          ? "bg-white/20 text-white group-hover:bg-white/20" : "bg-muted/40 text-foreground group-hover:bg-muted/50"
                                        }`
                                      }
                                    >
                                      Available
                                    </Badge>
                                  </div>
                                  <span className={`text-xs truncate ${isSelected
                                    ? "text-primary-foreground/90" : "text-muted-foreground"
                                    }`
                                  }>
                                    {staff.position
                                    }
                                  </span>
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    <Badge
                                      variant="default"
                                      className={`text-xs py-0 h-5 px-1.5 flex items-center gap-1 border-0 ${isSelected
                                        ? "bg-white/20 text-white group-hover:bg-white/20" : "bg-muted/40 text-foreground group-hover:bg-muted/50"
                                        }`
                                      }
                                    >
                                      <Scissors className="h-2.5 w-2.5" />
                                      <span>{Array.isArray(staff.services) ? staff.services.length : 0
                                      }</span>
                                    </Badge>
                                  </div>
                                </div>
                              </Button>
                            </motion.div>
                          );
                        })
                    }
                  </div>
                 </>
                )}

                {step === 3 && (
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
                          onChange={e => setTipAmount(Number(e.target.value))} />
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
                          <Select value={paymentMethod} onValueChange={(v: string) => setPaymentMethod(v)} disabled={paymentMethods.length === 0}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              {paymentMethods.map(m => (
                                <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Discount */}
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Discount</label>
                          <Select value={discountType} onValueChange={(v: 'none' | 'percentage' | 'fixed') => { setDiscountType(v); if (v === 'none') { setDiscountValue(0); } }}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Discount</SelectItem>
                              <SelectItem value="percentage">Percentage (%)</SelectItem>
                              <SelectItem value="fixed">Fixed Amount</SelectItem>
                            </SelectContent>
                          </Select>
                          {discountType !== 'none' && (
                            <Input type="number" min="0" step="0.01" value={discountValue}
                              onChange={e => setDiscountValue(Number(e.target.value))} className="mt-2" />
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
            <Progress value={((step + 1) / totalSteps) * 100} />
            <div className="text-sm text-muted-foreground">Step {step + 1} of {totalSteps}</div>
          </div>
          <div className="text-lg font-semibold whitespace-nowrap">{formatCurrency(totalWithTip())}</div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((step - 1) as 0 | 1 | 2)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep((step + 1) as 0 | 1 | 2 | 3)}>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={finalize} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Finalize
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 