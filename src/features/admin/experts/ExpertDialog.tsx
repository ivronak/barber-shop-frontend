import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Expert } from '@/api/services/expertService';
import { validateImageFile } from '@/utils/fileValidators';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  position: z.string().optional(),
  bio: z.string().optional(),
  image: z.string().optional(),
  is_active: z.boolean().optional().default(true),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  initialData?: Expert | null;
  loading?: boolean;
  onSubmit: (values: FormValues) => void;
  onOpenChange: (open: boolean) => void;
}

export const ExpertDialog: React.FC<Props> = ({ open, initialData, loading = false, onSubmit, onOpenChange }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      position: initialData?.position || '',
      bio: initialData?.bio || '',
      image: initialData?.image || '',
      is_active: initialData?.is_active ?? true,
    },
  });

  // local preview state
  const [imagePreview, setImagePreview] = useState<string | undefined>(initialData?.image);

  // Toast for error feedback
  const { toast } = useToast();

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  useEffect(() => {
    form.reset({
      name: initialData?.name || '',
      position: initialData?.position || '',
      bio: initialData?.bio || '',
      image: initialData?.image || '',
      is_active: initialData?.is_active ?? true,
    });
    setImagePreview(initialData?.image);
  }, [initialData, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:max-w-[600px] rounded-lg p-4 sm:p-6 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Expert' : 'Add New Expert'}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Expert name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder="Senior Barber" {...field} />
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
                      <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Short biography" {...field} />
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
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center">
                        {imagePreview ? (
                          <div className="relative mb-2 w-full max-w-[220px]">
                            <AspectRatio ratio={1 / 1} className="bg-muted rounded-md overflow-hidden border">
                              <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                            </AspectRatio>
                            <Button type="button" variant="outline" size="sm" className="absolute bottom-2 right-2" onClick={() => { setImagePreview(undefined); field.onChange(''); }}>
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="w-full max-w-[220px]">
                            <label htmlFor="expert-image-upload" className="flex flex-col items-center justify-center w-full h-[180px] border-2 border-dashed rounded-md cursor-pointer bg-muted/20 hover:bg-muted/30">
                              <div className="flex flex-col items-center justify-center p-4 text-center">
                                <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG or GIF</p>
                              </div>
                              <input
                                id="expert-image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  const validation = validateImageFile(file);
                                  if (!validation.valid) {
                                    toast({
                                      title: 'Invalid image',
                                      description: validation.message,
                                      variant: 'destructive',
                                    });
                                    e.currentTarget.value = '';
                                    return;
                                  }

                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    const base64 = ev.target?.result as string;
                                    setImagePreview(base64);
                                    field.onChange(base64);
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="!mt-0">Active</FormLabel>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4 pb-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 