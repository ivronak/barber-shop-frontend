import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { validateImageFile } from '@/utils/fileValidators';
import { useToast } from '@/hooks/use-toast';
import { ServiceCategory } from '@/api/services/categoryService';
import { Image } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  is_active: z.boolean().default(true),
});

type CategoryFormValues = z.infer<typeof schema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  initialData?: Partial<ServiceCategory> | null;
  title?: string;
}

export const CategoryDialog: React.FC<CategoryDialogProps> = ({ open, onOpenChange, onSubmit, initialData = null, title = 'Add Category' }) => {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      imageUrl: initialData?.imageUrl || '',
      is_active: initialData?.is_active ?? true,
    },
  });

  // Reset form when initialData changes (for edit mode)
  React.useEffect(() => {
    form.reset({
      name: initialData?.name || '',
      description: initialData?.description || '',
      imageUrl: initialData?.imageUrl || '',
      is_active: initialData?.is_active ?? true,
    });
    setImagePreview(initialData?.imageUrl);
  }, [initialData, form]);

  const handleSubmit = async (values: CategoryFormValues) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const [imagePreview, setImagePreview] = useState<string | undefined>(initialData?.imageUrl);

  const { toast } = useToast();
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
      form.setValue('imageUrl', url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="w-[90%] sm:max-w-md rounded-lg p-4 sm:p-6 mx-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Manage service categories.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image upload */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Image</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center">
                      {imagePreview ? (
                        <div className="relative mb-2 w-full max-w-[220px]">
                          <img src={imagePreview} alt="Preview" className="object-cover w-full h-full border rounded" />
                          <Button type="button" variant="outline" size="sm" className="absolute bottom-2 right-2" onClick={() => { setImagePreview(undefined); form.setValue('imageUrl', ''); }}>
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="w-full max-w-[220px]">
                          <label htmlFor="category-image-upload" className="flex flex-col items-center justify-center w-full h-[180px] border-2 border-dashed rounded-md cursor-pointer bg-muted/20 hover:bg-muted/30">
                            <div className="flex flex-col items-center justify-center p-4 text-center">
                              <Image className="w-8 h-8 mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                              <p className="text-xs text-muted-foreground mt-1">PNG, JPG or GIF</p>
                            </div>
                            <input id="category-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            <input type="hidden" {...field} />
                          </label>
                        </div>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormLabel>Active</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={submitting} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog; 