import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateReviewRequest } from '@/api/services/reviewService';

// Schema for the review form
const reviewFormSchema = z.object({
  customer_name: z.string({
    required_error: 'Customer name is required',
  }),
  staff_name: z.string({
    required_error: 'Staff name is required',
  }),
  rating: z.coerce.number({
    required_error: 'Rating is required',
  }).min(1).max(5),
  text: z.string().optional(),
  date: z.date({
    required_error: 'Date is required',
  }),
  is_approved: z.boolean().optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface CreateReviewFormProps {
  onSubmit: (data: CreateReviewRequest) => Promise<boolean>;
  onCancel: () => void;
}

export const CreateReviewForm: React.FC<CreateReviewFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      customer_name: '',
      staff_name: '',
      rating: 5,
      text: '',
      date: new Date(),
      is_approved: false,
    },
  });

  const handleSubmit = async (values: ReviewFormValues) => {
    try {
      setIsLoading(true);
      // Format date to YYYY-MM-DD
      const formattedDate = format(values.date, 'yyyy-MM-dd');
      
      const reviewData: CreateReviewRequest = {
        ...values,
        date: formattedDate,
      };
      
      const success = await onSubmit(reviewData);
      if (success) {
        form.reset();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Customer name field */}
        <FormField
          control={form.control}
          name="customer_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter customer name" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Staff name field */}
        <FormField
          control={form.control}
          name="staff_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Staff Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter staff name" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Rating field */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <Select
                disabled={isLoading}
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rating" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 - Poor</SelectItem>
                  <SelectItem value="2">2 - Fair</SelectItem>
                  <SelectItem value="3">3 - Good</SelectItem>
                  <SelectItem value="4">4 - Very Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date field */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Text/comment field */}
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review Text</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter customer's review text (optional)"
                  className="resize-none"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Approve checkbox */}
        <FormField
          control={form.control}
          name="is_approved"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Approve for public display</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* Form actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Create Review'}
          </Button>
        </div>
      </form>
    </Form>
  );
}; 