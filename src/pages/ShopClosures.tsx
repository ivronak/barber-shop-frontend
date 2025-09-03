import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Trash, Plus, Loader2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { getGeneric as get, postGeneric as post, delGeneric as del, putGeneric } from '@/api/apiClient';
import { PageHeader } from '@/components/layout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

interface ShopClosure {
  id?: string;
  date: string;
  reason: string;
  is_full_day: boolean;
  start_time?: string;
  end_time?: string;
  created_at?: string;
  updated_at?: string;
}

const ShopClosures: React.FC = () => {
  const { toast } = useToast();
  const [closures, setClosures] = useState<ShopClosure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingClosure, setEditingClosure] = useState<ShopClosure | null>(null);
  const [showForm, setShowForm] = useState(false);
  const tomorrowDefault = addDays(new Date(), 1);

  const [formData, setFormData] = useState<ShopClosure>({
    date: format(tomorrowDefault, 'yyyy-MM-dd'),
    reason: '',
    is_full_day: true,
    start_time: '09:00',
    end_time: '17:00',
  });
  
  // Date state for the Calendar component
  const [selectedDate, setSelectedDate] = useState<Date>(tomorrowDefault);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ShopClosure | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Derived validation state for partial day closure times
  const isTimeRangeValid = React.useMemo(() => {
    if (formData.is_full_day) return true;
    if (!formData.start_time || !formData.end_time) return false;
    return formData.start_time < formData.end_time;
  }, [formData.is_full_day, formData.start_time, formData.end_time]);

  // Fetch shop closures
  const fetchClosures = async () => {
    setIsLoading(true);
    try {
      const response = await get<{ success: boolean; closures: ShopClosure[] }>('/shop-closures');
      if (response.success) {
        setClosures(response.closures);
      }
    } catch (error) {
      console.error('Error fetching shop closures:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shop closures',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new shop closure
  const addClosure = async () => {
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      if (formData.is_full_day) {
        // If it's a full day closure, remove time fields
        delete payload.start_time;
        delete payload.end_time;
      }

      const response = await post<{ success: boolean; closure: ShopClosure }>('/shop-closures', payload);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Shop closure added successfully',
        });
        setClosures([...closures, response.closure]);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding shop closure:', error);
      toast({
        title: 'Error',
        description: 'Failed to add shop closure',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing shop closure
  const updateClosure = async () => {
    if (!editingClosure) return;
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      if (formData.is_full_day) {
        delete payload.start_time;
        delete payload.end_time;
      }

      const response = await putGeneric<{ success: boolean; closure: ShopClosure }>(`/shop-closures/${editingClosure.id}`, payload);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Shop closure updated successfully',
        });
        setClosures(closures.map(c => (c.id === editingClosure.id ? response.closure : c)));
        resetForm();
      }
    } catch (error) {
      console.error('Error updating shop closure:', error);
      toast({
        title: 'Error',
        description: 'Failed to update shop closure',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsEditMode(false);
      setEditingClosure(null);
    }
  };

  // Delete shop closure
  const deleteClosure = async (id: string) => {
    try {
      const response = await del<{ success: boolean }>(`/shop-closures/${id}`);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Shop closure deleted successfully',
        });
        setClosures(closures.filter(closure => closure.id !== id));
      }
    } catch (error) {
      console.error('Error deleting shop closure:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete shop closure',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteClosure(deleteTarget.id as string);
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  // Ensure time range stays valid while editing the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => {
      const updated: ShopClosure = {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      } as ShopClosure;

      // Real-time guard against reversed time selection
      if (!updated.is_full_day && updated.start_time && updated.end_time) {
        // If start_time becomes later than end_time, align the other field automatically
        if (updated.start_time > updated.end_time) {
          if (name === 'start_time') {
            updated.end_time = updated.start_time;
          } else if (name === 'end_time') {
            updated.start_time = updated.end_time;
          }
        }
      }

      return updated;
    });
  };

  // Handle date change from Calendar
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({
        ...prev,
        date: format(date, 'yyyy-MM-dd')
      }));
      // Close the popover after selecting a date
      setIsDatePickerOpen(false);
    }
  };

  // Handle switch change
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_full_day: checked
    }));
  };

  // Reset form
  const resetForm = () => {
    const tomorrow = addDays(new Date(), 1);
    setSelectedDate(tomorrow);
    setFormData({
      date: format(tomorrow, 'yyyy-MM-dd'),
      reason: '',
      is_full_day: true,
      start_time: '09:00',
      end_time: '17:00',
    });
    setShowForm(false);
    setIsEditMode(false);
    setEditingClosure(null);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Front-end validations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(formData.date);
    if (selected <= today) {
      toast({
        title: 'Invalid date',
        description: 'Please choose a future date for the shop closure.',
        variant: 'destructive',
      });
      return;
    }

    // Duplicate check (only when adding or changing date)
    const duplicate = closures.find(c => c.date === formData.date && (!isEditMode || c.id !== editingClosure?.id));
    if (duplicate) {
      toast({
        title: 'Duplicate date',
        description: 'A closure already exists for this date.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.is_full_day) {
      if (!formData.start_time || !formData.end_time) {
        toast({
          title: 'Invalid time',
          description: 'Start and end times are required for a partial day closure.',
          variant: 'destructive',
        });
        return;
      }
      if (formData.start_time >= formData.end_time) {
        toast({
          title: 'Invalid time range',
          description: 'Start time must be earlier than end time.',
          variant: 'destructive',
        });
        return;
      }
    }

    if (isEditMode) {
      updateClosure();
    } else {
      addClosure();
    }
  };

  // Open edit dialog with existing data
  const handleEditClick = (closure: ShopClosure) => {
    setIsEditMode(true);
    setEditingClosure(closure);
    setShowForm(true);
    setSelectedDate(new Date(closure.date));
    setFormData({
      date: closure.date,
      reason: closure.reason,
      is_full_day: closure.is_full_day,
      start_time: closure.start_time || '09:00',
      end_time: closure.end_time || '17:00',
    });
  };

  // Load shop closures on component mount
  useEffect(() => {
    fetchClosures();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shop Closures"
        description="Manage days when your shop will be closed"
        action={{
          label: "Add Closure",
          onClick: () => {
            const tomorrow = addDays(new Date(), 1);
            setIsEditMode(false);
            setEditingClosure(null);
            setSelectedDate(tomorrow);
            setFormData({
              date: format(tomorrow, 'yyyy-MM-dd'),
              reason: '',
              is_full_day: true,
              start_time: '09:00',
              end_time: '17:00',
            });
            setShowForm(true);
          },
          icon: <Plus className="mr-2 h-4 w-4" />,
        }}
      />

      {/* Modal Dialog for Adding Shop Closure */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[95%] w-full sm:max-w-[500px] p-0 max-h-[90vh] overflow-y-auto rounded-xl mx-auto [&>button]:hidden">
          <DialogHeader className="px-5 py-4 border-b sticky top-0 z-10 bg-card rounded-t-xl flex justify-center">
            <DialogTitle className="text-base font-semibold text-center">{isEditMode ? 'Edit Shop Closure' : 'Add New Shop Closure'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-5 p-5">
            {/* Date Field with Shadcn Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, 'MMMM d, yyyy')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    initialFocus
                    disabled={(date: Date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date <= today; // disable past and today
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Full Day Switch */}
            <div className="flex items-center justify-between border rounded-md p-3">
              <Label htmlFor="is_full_day" className="font-medium">Full Day Closure</Label>
              <Switch
                id="is_full_day"
                checked={formData.is_full_day}
                onCheckedChange={handleSwitchChange}
              />
            </div>

            {/* Time Fields - Only shown when not full day */}
            {!formData.is_full_day && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="start_time"
                      name="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={handleInputChange}
                      className="pl-10"
                      required={!formData.is_full_day}
                      max={formData.end_time}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <div className="relative">
                    <Clock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="end_time"
                      name="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={handleInputChange}
                      className="pl-10"
                      required={!formData.is_full_day}
                      min={formData.start_time}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Reason Field */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter reason for closure"
                required
              />
            </div>

            {!isTimeRangeValid && (
              <p className="text-xs text-destructive -mt-2">Start time must be earlier than end time.</p>
            )}

            <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || !isTimeRangeValid} className="flex items-center gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Closure' : 'Save Closure')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : closures.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No shop closures found</p>
            <p className="text-sm text-muted-foreground">Add a closure to get started</p>
            <Button onClick={() => {
              const tomorrow = addDays(new Date(), 1);
              setIsEditMode(false);
              setEditingClosure(null);
              setSelectedDate(tomorrow);
              setFormData({
                date: format(tomorrow, 'yyyy-MM-dd'),
                reason: '',
                is_full_day: true,
                start_time: '09:00',
                end_time: '17:00',
              });
              setShowForm(true);
            }} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Add Closure
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {closures.map((closure) => (
            <Card key={closure.id} className="overflow-hidden">
              <div className="bg-primary text-primary-foreground p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    <span className="font-medium text-sm sm:text-base">{format(new Date(closure.date), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(closure)}
                      className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(closure)}
                      className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="mb-2">
                  <span className="font-semibold">Type:</span>{' '}
                  {closure.is_full_day ? 'Full Day' : 'Partial Day'}
                </div>
                {!closure.is_full_day && (
                  <div className="mb-2">
                    <span className="font-semibold">Time:</span>{' '}
                    {closure.start_time} - {closure.end_time}
                  </div>
                )}
                <div>
                  <span className="font-semibold">Reason:</span>
                  <p className="mt-1 text-muted-foreground">{closure.reason}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[95%] sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Closure</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shop closure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="flex items-center gap-2">
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShopClosures; 