import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import { getCustomerByPhone, Customer } from '@/api/services/customerService';
import {
  createAppointment,
  getAvailableSlots,
  Staff,
  Service as ApiAppointmentService,
} from '@/api/services/appointmentService';
import { getAllServices, Service as ApiService } from '@/api/services/serviceService';
import { format, parse } from 'date-fns';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { createCustomer } from '@/api/services/customerService';
import { get } from '@/api/apiClient';
import { getBookingStaff } from '@/api/services/bookingService';

const anyStaff = {
  "id": "all",
  "name": "Any Staff",
  "email": "",
  "phone": "",
  "position": "",
  "avatar": null
}

// ---------------- Schema ----------------
const formSchema = z
  .object({
    phone: z.string().optional(),
    name: z.string().optional(),
    email: z
      .string()
      .optional()
      .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: 'Invalid email format',
      }),
    serviceIds: z.array(z.string()).min(1, 'Select at least one service'),
    staffId: z.string().min(1, 'Select staff'),
    slot: z.string().min(1, 'Select a time slot'),
    notes: z.string().optional(),
    isGuest: z.boolean().default(false),
  })
  // .refine((data) => data.isGuest || (!!data.phone && data.phone.length === 10), {
  //   message: 'Phone number must be 10 digits',
  //   path: ['phone'],
  // })
  .refine((data) => data.isGuest || (!!data.name && data.name.length >= 2), {
    message: 'Name must be at least 2 characters',
    path: ['name'],
  });

// const formSchema = z.object({
//   phone: z
//     .string().refine(({isGuest,phone}:any) => isGuest || (!!phone && phone.length === 10), {
//     message: 'Phone number must be 10 digits',
//     path: ['phone'],
//   }),
//   name: z.string().refine(({isGuest,name}:any) => isGuest || (!!name && name.length >= 2), {
//     message: 'Name must be at least 2 characters',
//     path: ['name'],
//   }),
//   email: z
//     .string()
//     .optional()
//     .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
//       message: 'Invalid email format',
//     }),
//   serviceIds: z.array(z.string()).min(1, 'Select at least one service'),
//   staffId: z.string().min(1, 'Select staff'),
//   slot: z.string().min(1, 'Select a time slot'),
//   notes: z.string().optional(),
//   isGuest: z.boolean().default(false),//

// });

// ---------------- Props ----------------
interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  staffList: Staff[];
  serviceList: ApiAppointmentService[];
  onAppointmentCreated?: () => void;
  disableStaffSelection?: boolean;
  lockedStaffId?: string;
}

// ---------------- Component ----------------
export const NewAppointmentDialog: React.FC<NewAppointmentDialogProps> = ({
  open,
  onOpenChange,
  selectedDate,
  staffList,
  serviceList,
  onAppointmentCreated,
  disableStaffSelection = false,
  lockedStaffId,
}) => {
  const { toast } = useToast();
  const [lookupStatus, setLookupStatus] = useState<
    | { type: 'success' | 'error' | 'info'; message: string }
    | null
  >(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const lastLookupRef = useRef<string>('');

  // Time slot state
  interface Slot {
    time: string;
    available: boolean;
    unavailableReason?: string;
  }
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  // Flag indicating that the requested preselected time is unavailable
  const [requestedTimeUnavailable, setRequestedTimeUnavailable] = useState(false);

  // Service categories expanded/collapsed state
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [isGuest, setIsGuest] = useState<boolean>(false);
  // Local service list (may be enriched via extra fetch to include categories)
  const [allServices, setAllServices] = useState<Array<ApiService | ApiAppointmentService>>(serviceList);

  const [filteredStaff, setFilteredStaff] = useState<Staff[]>(staffList);
  const { execute: fetchCustomer } = useApi(getCustomerByPhone);
  const { execute: fetchSlots } = useApi(getAvailableSlots);
  const { execute: fetchFullServices } = useApi(getAllServices);
  const {
    loading: isCreating,
    execute: saveAppointment,
  } = useApi(createAppointment);
  const { execute: createNewCustomer } = useApi(createCustomer);
  const { execute: fetchFilteredStaff } = useApi(getBookingStaff);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  // ---------------- React Hook Form ----------------
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: '',
      name: '',
      email: '',
      serviceIds: [],
      staffId: '',
      slot: '',
      notes: '',
      isGuest: false,
    },
  });

  // ---------------- Handlers ----------------
  const handleCustomerLookup = async (digitsOnly: string) => {
    try {
      setIsSearchingCustomer(true);
      setLookupStatus(null);
      const res = await fetchCustomer(digitsOnly);
      if (res.success && res.customer) {
        const c: Customer = res.customer;
        setCustomerId(c.id);
        form.setValue('name', c.name || '', { shouldValidate: true });
        form.setValue('email', c.email || '', { shouldValidate: true });
        setLookupStatus({ type: 'success', message: 'Customer details auto-filled.' });
      } else {
        setCustomerId(null);
        setLookupStatus({ type: 'info', message: 'Customer not found. Enter details below.' });
      }
    } catch {
      setLookupStatus({ type: 'error', message: 'Lookup failed. Try again.' });
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  // Auto-lookup when phone enters 10 digits
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'phone') {
        const digits = (value.phone || '').replace(/\D/g, '').slice(0, 10);
        if (digits.length === 10 && digits !== lastLookupRef.current) {
          lastLookupRef.current = digits;
          void handleCustomerLookup(digits);
        }
        if (digits.length < 10) {
          lastLookupRef.current = '';
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // declare preselected time
  const preselectedTimeStr = selectedDate ? format(selectedDate, 'HH:mm:ss') : undefined;

  const handleFetchSlots = async (staffId: string, serviceIdsParam: string) => {
    if (!selectedDate) return;
    if (!staffId || !serviceIdsParam) return;
    setIsFetchingSlots(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await fetchSlots(dateStr, staffId, serviceIdsParam);
      if (res.success) {
        setSlots(res.slots);
        // Only auto-select if a preselected time string was provided and is available
        let toSelect: string | undefined;
        let wasRequestedBlocked = false;
        if (preselectedTimeStr) {
          const match = res.slots.find((s) => s.time.startsWith(preselectedTimeStr.substring(0, 5)) && s.available);
          if (match) {
            toSelect = match.time;
          } else {
            wasRequestedBlocked = true;
          }
        }
        // Clear any previous selection if it's no longer available
        if (toSelect) {
          form.setValue('slot', toSelect, { shouldValidate: true });
        } else {
          form.setValue('slot', '', { shouldValidate: true });
        }

        setRequestedTimeUnavailable(wasRequestedBlocked);
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Could not fetch time slots',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingSlots(false);
    }
  };

  // Trigger slot fetch when staff/service selection changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      
      if (name === 'serviceIds') {
        const joinedServiceIds = value.serviceIds?.length ? value.serviceIds.join(',') : undefined;
        if (disableStaffSelection) {
          setFilteredStaff(staffList);
          if (lockedStaffId && joinedServiceIds) {
            console.log("handleFetchSlots >> 4")
            void handleFetchSlots(lockedStaffId, joinedServiceIds);
          }
        } else {
          // When services change, refetch staff list accordingly
          if (joinedServiceIds) {
            void (async () => {
              const res: any = await fetchFilteredStaff(joinedServiceIds);
              if (res.success) {
                setFilteredStaff(res.staff);
                // If currently selected staff cannot perform services, clear selection
                if (!res.staff.find((s: any) => s.id === form.getValues('staffId'))) {
                  form.setValue('staffId', '', { shouldValidate: true });
                  form.setValue('slot', '', { shouldValidate: true });
                  setSlots([]);
                }
              }
            })();
          } else {
            setFilteredStaff(staffList);
          }
        }
      }
      if (!disableStaffSelection && (name === 'staffId' || name === 'serviceIds')) {
        try {
          const staffId = value.staffId;
          const joinedServiceIds = value.staffId == "all" ? "all" : value.serviceIds?.length ? value.serviceIds.join(',') : undefined;
          if (staffId && joinedServiceIds) {
            console.log("handleFetchSlots >> 1")
            void handleFetchSlots(staffId, joinedServiceIds);
          }
        } catch (error) {
          console.log("handleFetchSlots >> error", error)
        }

      }
    });
    return () => subscription.unsubscribe();
  }, [form, selectedDate, disableStaffSelection, lockedStaffId, staffList, fetchFilteredStaff]);

  // When locked staff is provided, preselect it on open
  useEffect(() => {
    if (open && disableStaffSelection && lockedStaffId) {
      form.setValue('staffId', lockedStaffId, { shouldValidate: true });
    }
  }, [open, disableStaffSelection, lockedStaffId, form]);

  // On open, enrich services if categories missing
  useEffect(() => {
    if (!open) return;
    const hasValidCategory = serviceList.some((s) => (s as unknown as { category?: string }).category);
    if (!hasValidCategory) {
      void (async () => {
        const res = await fetchFullServices(1, 100, 'name_asc');
        if (res.success) {
          setAllServices(res.services);
        }
      })();
    } else {
      setAllServices(serviceList);
    }
  }, [open, serviceList, fetchFullServices]);

  // ---------------- Submit ----------------
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedDate) {
      toast({
        title: 'Date not selected',
        description: 'Please select a date from the calendar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Ensure we have a customer ID (existing or new)
      let finalCustomerId = customerId;
      if (!finalCustomerId) {
        try {
          const created = await createNewCustomer({
            name: values.name,
            email: values.email || undefined,
            phone: values.phone,
          });
          finalCustomerId = created.customer.id;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : '';
          if (message.includes('already exists')) {
            // Fetch the existing customer via secure lookup
            const lookupRes = await get<{ success: boolean; customer: Customer }>(`/customers/lookup/${values.phone}`);
            if (lookupRes.success && lookupRes.customer) {
              finalCustomerId = lookupRes.customer.id;
            } else {
              throw new Error('Customer exists but lookup failed');
            }
          } else {
            throw err;
          }
        }
      }

      // Re-validate selected slot availability to avoid race conditions
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const slotServiceParam = values.serviceIds.join(',');
      const slotCheck = await fetchSlots(dateStr, values.staffId, slotServiceParam);
      if (!slotCheck.success) {
        throw new Error('Failed to validate slot availability');
      }
      const stillAvailable = slotCheck.slots.find(s => s.time === values.slot && s.available);
      if (!stillAvailable) {
        toast({
          title: 'Time slot unavailable',
          description: 'The selected time is no longer available. Please choose another slot.',
          variant: 'destructive',
        });
        console.log("handleFetchSlots >> 2")
        await handleFetchSlots(values.staffId, slotServiceParam);
        return;
      }

      const payload = {
        customer_id: finalCustomerId,
        staff_id: values.staffId,
        date: dateStr,
        time: values.slot,
        services: values.serviceIds,
        service_ids: values.serviceIds,
        service_id: values.serviceIds.join(','),
        notes: values.notes,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await saveAppointment(payload as any);
      toast({ title: 'Appointment created' });
      form.reset();
      setSlots([]);
      onOpenChange(false);
      onAppointmentCreated?.();
      setLookupStatus(null);
      setCustomerId(null);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create appointment',
        variant: 'destructive',
      });
    }
  };

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setSlots([]);
      setLookupStatus(null);
    }
  }, [open, form]);

  // Helper for lookup status color
  const statusColor = lookupStatus?.type === 'success'
    ? 'text-green-600'
    : lookupStatus?.type === 'error'
      ? 'text-destructive'
      : 'text-muted-foreground';

  // Helper to safely get category from service (API may not include it in type)
  const getCategory = (svc: ApiService | ApiAppointmentService): string => {
    return (svc as unknown as { category?: string }).category || 'Uncategorized';
  };

  return (
    <Dialog open={open}
      // onOpenChange={onOpenChange}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);          // update state
        if (!isOpen) {
          setIsGuest(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-[800px] w-auto max-w-[95vw] max-h-[90vh] p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base font-semibold text-center">Add New Appointment</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-center mt-1">
            Fill in the details below to schedule an appointment.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-2">
          <Form {...form}>
            <form id="newAppointmentForm" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 px-2">
              {/* Scrollable content */}
              <div className="space-y-6">
                {/* Contact Details */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number <span>(Optional)</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter 10-digit phone number"
                              maxLength={10}
                              disabled={form.watch("isGuest")}
                              {...field}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                field.onChange(digits);
                              }}
                            />
                            {isSearchingCustomer && (
                              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              </span>
                            )}
                          </div>
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          We will auto-fill customer details if this number exists in records.
                        </p>
                        {lookupStatus && (
                          <p className={`mt-1 flex items-center gap-1 text-xs ${statusColor}`}>
                            {lookupStatus.type === 'success' && <CheckCircle2 className="h-3 w-3" />}\
                            {lookupStatus.type === 'error' && <AlertCircle className="h-3 w-3" />}\
                            {lookupStatus.message}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name{isGuest ? <span>(Optional)</span> : <span className="text-destructive"> *</span>}</FormLabel>
                        <FormControl>
                          <Input placeholder="Customer's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Guest Checkbox */}
                  {/* <FormField
                    control={form.control}
                    name="isGuest"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <div className="flex items-center gap-2 mt-1">
                          <FormControl>
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.checked)
                                setIsGuest((pre) => !pre);
                                if (e.target.checked && submitButtonRef.current) {
                                  submitButtonRef.current.click();
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer !mb-0 leading-none">
                            As Guest
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  /> */}


                  <FormField
                    control={form.control}
                    name="isGuest"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <div className="flex items-center gap-2 mt-1">
                          <FormControl>
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={field.value}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                field.onChange(checked);
                                setIsGuest(checked);

                                if (checked) {
                                  // Clear validation errors for phone and name
                                  form.clearErrors(['phone', 'name']);
                                }
                              }}
                            />

                          </FormControl>
                          <FormLabel className="cursor-pointer !mb-0 leading-none">
                            Continue as Guest
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />


                  {/* Email spans full width */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Customer email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Services (categorized) */}
                <FormField
                  control={form.control}
                  name="serviceIds"
                  render={({ field }) => {
                    const categories = Array.from(new Set(allServices.map((s) => getCategory(s))));

                    const toggleCategory = (cat: string) => {
                      setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
                    };

                    const getSelectedCount = (cat: string) =>
                      allServices.filter((s) => getCategory(s) === cat && field.value.includes(s.id)).length;

                    return (
                      <FormItem className="form-item-custom">
                        <FormLabel>Select Services<span className="text-destructive"> *</span></FormLabel>
                        <FormControl>
                          <ScrollArea className="max-h-100">
                            <div className="space-y-2">
                              {categories.map((cat) => {
                                const isOpen = openCategories[cat] ?? getSelectedCount(cat) > 0;
                                return (
                                  <div key={cat} className="border rounded-md">
                                    <button
                                      type="button"
                                      className="w-full px-2 py-3 flex items-center justify-between text-sm font-medium"
                                      onClick={() => toggleCategory(cat)}
                                    >
                                      <span>{cat}</span>
                                      <span className="flex items-center gap-1 text-muted-foreground">
                                        {getSelectedCount(cat) > 0 && (
                                          <span className="text-xs">{getSelectedCount(cat)}</span>
                                        )}
                                        {isOpen ? (
                                          <ChevronDown className="h-4 w-4" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4" />
                                        )}
                                      </span>
                                    </button>
                                    {isOpen && (
                                      <div className="px-3 py-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {allServices
                                          .filter((s) => getCategory(s) === cat)
                                          .map((svc) => {
                                            const isSelected = field.value.includes(svc.id);
                                            return (
                                              <div
                                                key={svc.id}
                                                className={`border rounded-lg p-3 text-sm cursor-pointer transition-all ${isSelected
                                                  ? 'border-primary bg-primary/5 shadow-sm'
                                                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
                                                  }`}
                                                onClick={() => {
                                                  if (isSelected) {
                                                    field.onChange(field.value.filter((id) => id !== svc.id));
                                                  } else {
                                                    field.onChange([...field.value, svc.id]);
                                                  }
                                                }}
                                              >
                                                <div className="flex justify-between items-center gap-2">
                                                  <span className="font-medium break-words flex-1">
                                                    {svc.name}
                                                  </span>
                                                  {isSelected && (
                                                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                                                  )}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                  {svc.duration} min
                                                </div>
                                              </div>
                                            );
                                          })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Booking Details */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Staff */}
                  <FormField
                    control={form.control}
                    name="staffId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {disableStaffSelection ? 'Staff' : 'Assign Staff'}
                          {!disableStaffSelection && <span className="text-destructive"> *</span>}
                        </FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(val) => {
                              field.onChange(val);
                            }}
                            // onValueChange={field.onChange} 
                            disabled={disableStaffSelection}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select staff" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem key={"_select_staff_id"} value={anyStaff?.id}>{anyStaff?.name}</SelectItem>
                              {filteredStaff.map((staff) => (
                                <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Time Slots */}
                  <FormField
                    control={form.control}
                    name="slot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Time Slot<span className="text-destructive"> *</span></FormLabel>
                        {isFetchingSlots ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /> Fetching available slots…
                          </div>
                        ) : slots.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Select staff and service to load slots.</p>
                        ) : (
                          <ScrollArea className="max-h-60 pr-1">
                            <div className="grid grid-cols-3 gap-2">
                              {slots.map((slot) => {
                                const display = format(parse(slot.time, 'HH:mm:ss', new Date()), 'h:mm a');
                                const isSelected = field.value === slot.time;
                                return (
                                  <TooltipProvider key={slot.time}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div>
                                          <Button
                                            type="button"
                                            variant={isSelected ? 'default' : 'outline'}
                                            size="sm"
                                            className={`w-full text-xs px-0.5 ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={() => slot.available && field.onChange(slot.time)}
                                            disabled={!slot.available}
                                          >
                                            <Clock className="h-3 w-3 mr-1" /> {display}
                                          </Button>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="text-xs">
                                        <span>{slot.available ? 'Available' : slot.unavailableReason || 'Not available'}</span>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        )}
                        {/* No available slots message */}
                        {slots.length > 0 && slots.every((s) => !s.available) && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> No available slots for the selected criteria.
                          </p>
                        )}
                        {requestedTimeUnavailable ? (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> The requested time is no longer available. Please choose another slot.
                          </p>
                        ) : (!field.value && slots.length > 0) ? (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Select an available time slot.
                          </p>
                        ) : null}
                        {slots.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">Times are displayed in local business timezone.</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Additional notes" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Sticky footer */}

            </form>
          </Form>
        </ScrollArea>
        <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button ref={submitButtonRef} form="newAppointmentForm" type="submit" disabled={isCreating}>
            {isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 