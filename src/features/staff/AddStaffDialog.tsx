import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { validateImageFile } from '@/utils/fileValidators';
import { Staff } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Loader2, ChevronDown, ChevronRight, Trash, Image } from 'lucide-react';
import { Service } from '@/api/services/serviceService';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatCurrency } from '@/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(10, 'Phone number must be 10 digits')
    .max(10, 'Phone number must be 10 digits')
    .regex(/^\d{10}$/, 'Phone number must contain exactly 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  bio: z.string().optional(),
  services: z.array(z.string()).min(1, 'Select at least one service'),
  commissionPercentage: z.number().min(0).max(100),
  isActive: z.boolean(),
  image: z.string().optional(),
});

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (newStaff: Staff & { password: string }) => void;
  onAddStaff?: (newStaff: Staff & { password: string }) => void;
  services: Service[];
  isLoadingServices?: boolean;
}

export const AddStaffDialog: React.FC<AddStaffDialogProps> = ({
  open,
  onOpenChange,
  onAdd,
  onAddStaff,
  services,
  isLoadingServices = false,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  
  // Ensure every service has a valid category; fallback to "Uncategorized" if missing/empty.
  const normalizedServices = React.useMemo(() =>
    services.map((s) => ({
      ...s,
      // Prefer explicit category field; otherwise attempt nested serviceCategory.name; else fallback.
      category:
        (s.category && s.category.trim() !== '')
          ? s.category
          : ((s as unknown as { serviceCategory?: { name?: string } }).serviceCategory?.name || 'Uncategorized'),
    })),
    [services]
  );
  
  // Get unique categories from normalized services
  const categories = React.useMemo(
    () => Array.from(new Set(normalizedServices.map((s) => s.category)) ),
    [normalizedServices]
  );
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      bio: '',
      services: [],
      commissionPercentage: 40,
      isActive: true,
      image: '',
    },
  });

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleServiceSelection = (serviceId: string) => {
    const isSelected = selectedServices.includes(serviceId);
    
    let updatedServices: string[];
    if (isSelected) {
      // Remove service if already selected
      updatedServices = selectedServices.filter(id => id !== serviceId);
    } else {
      // Add new service
      updatedServices = [...selectedServices, serviceId];
    }
    
    setSelectedServices(updatedServices);
    form.setValue('services', updatedServices);
  };

  const getSelectedServicesCount = (category: string) => {
    return normalizedServices
      .filter((service) => service.category === category && selectedServices.includes(service.id))
      .length;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({ title: 'Invalid image', description: validation.message, variant: 'destructive' });
      e.currentTarget.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setImagePreview(url);
      form.setValue('image', url);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Create a new staff member object
      const newStaff: Staff & { password: string } = {
        ...values,
        id: `staff-${Date.now()}`, // Generate a unique ID (in a real app this would be from the backend)
        role: 'staff',
        image: values.image || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
        workingHours: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        },
        totalEarnings: 0,
        totalAppointments: 0,
        breaks: [],
        isAvailable: values.isActive, // Map isActive to isAvailable
        password: values.password, // Explicitly include password
      };

      if (onAddStaff) {
        await onAddStaff(newStaff);
      } else if (onAdd) {
        await onAdd(newStaff);
      } else {
        // If no handler provided, just log
        console.log(newStaff);
      }
      
      toast({
        title: 'Staff member added',
        description: 'New staff member has been added successfully.',
      });
      
      onOpenChange(false);
      form.reset();
      setSelectedServices([]);
      setImagePreview(undefined);
    } catch (error) {
      console.error('Error adding staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to add staff member. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isSubmitting) {
        onOpenChange(isOpen);
      }
    }}>
      <DialogContent className="max-w-[95%] w-full sm:max-w-[600px] h-[90vh] flex flex-col rounded-xl">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>
            Add a new staff member to your barber shop. Fill in all the required information.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="px-1 sm:px-3 pb-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Status: {field.value ? 'Active' : 'Inactive'}</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          {field.value 
                            ? 'Staff member is active and can be scheduled' 
                            : 'Staff member is inactive and cannot be scheduled'}
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter phone number"
                            {...field}
                            inputMode="numeric"
                            pattern="[0-9]{10}"
                            maxLength={10}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter password for staff account" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter staff member's bio"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="services"
                  render={() => (
                    <FormItem>
                      <FormLabel>Services Offered</FormLabel>
                      <div className="space-y-2">
                        {isLoadingServices ? (
                          <div className="flex justify-center p-6">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : normalizedServices.length === 0 ? (
                          <div className="text-center p-4 border rounded-lg bg-muted/30">
                            <p>No services found. Please add services first.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {categories.map((category) => {
                              const selectedCount = getSelectedServicesCount(category);
                              return (
                                <Collapsible
                                  key={category}
                                  open={openCategories[category]}
                                  onOpenChange={() => toggleCategory(category)}
                                  className="border rounded-lg"
                                >
                                  <CollapsibleTrigger className="flex w-full items-center justify-between p-3 hover:bg-muted/50">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                      </span>
                                      {selectedCount > 0 && (
                                        <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                          {selectedCount}
                                        </span>
                                      )}
                                    </div>
                                    {openCategories[category] ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="p-2">
                                    <div className="grid gap-2">
                                      {normalizedServices
                                        .filter((s) => s.category === category)
                                        .map((s) => {
                                          const isSelected = selectedServices.includes(s.id);
                                          return (
                                            <Button
                                              key={s.id}
                                              type="button"
                                              variant={isSelected ? "default" : "outline"}
                                              className="w-full grid grid-cols-[1fr_auto] items-center gap-2 whitespace-normal py-2 h-auto"
                                              onClick={() => handleServiceSelection(s.id)}
                                            >
                                              <span className="text-left break-words whitespace-normal pr-2 leading-snug py-0.5">
                                                {s.name}
                                              </span>
                                              <span className={`${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'} pl-2 justify-self-end`}>
                                                {formatCurrency(Number(s.price) || 0)}
                                              </span>
                                            </Button>
                                          );
                                        })}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              );
                            })}
                            
                            {selectedServices.length > 0 && (
                              <div className="mt-4 space-y-2">
                                <div className="text-sm font-medium">Selected Services</div>
                                {selectedServices.map((serviceId) => {
                                  const selectedService = normalizedServices.find((s) => s.id === serviceId);
                                  if (!selectedService) return null;
                                  
                                  return (
                                    <div key={serviceId} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <span>{selectedService.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {selectedService.category}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium">
                                          {formatCurrency(Number(selectedService.price) || 0)}
                                        </span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleServiceSelection(serviceId)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commissionPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Percentage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter commission percentage"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image upload */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center">
                          {imagePreview ? (
                            <div className="relative mb-2 w-full max-w-[220px]">
                              <AspectRatio ratio={1 / 1} className="bg-muted rounded-md overflow-hidden border">
                                <img
                                  src={imagePreview}
                                  alt="Profile preview"
                                  className="object-cover w-full h-full"
                                />
                              </AspectRatio>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="absolute bottom-2 right-2"
                                onClick={() => {
                                  setImagePreview(undefined);
                                  form.setValue('image', '');
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="w-full max-w-[220px]">
                              <label
                                htmlFor="staff-image-upload"
                                className="flex flex-col items-center justify-center w-full h-[180px] border-2 border-dashed rounded-md cursor-pointer bg-muted/20 hover:bg-muted/30"
                              >
                                <div className="flex flex-col items-center justify-center p-4 text-center">
                                  <Image className="w-8 h-8 mb-2 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold">Click to upload</span>
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG or GIF</p>
                                </div>
                                <input
                                  id="staff-image-upload"
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                />
                                <input type="hidden" {...field} />
                              </label>
                            </div>
                          )}
                          <p className="text-center text-xs mt-2">Recommended size: 300×300px</p>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </ScrollArea>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Staff'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};