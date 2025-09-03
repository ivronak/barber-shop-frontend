import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { GalleryImage } from '@/api/services/galleryImageService';
import { validateImageFile } from '@/utils/fileValidators';
import { useToast } from '@/hooks/use-toast';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Image as ImageIcon } from 'lucide-react';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Invalid URL').min(1, 'URL is required'),
  is_active: z.boolean().optional().default(true),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  initialData?: GalleryImage | null;
  onSubmit: (data: FormValues) => void;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
}

export const GalleryImageDialog: React.FC<Props> = ({ open, initialData, onSubmit, onOpenChange, loading = false }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      url: initialData?.url || '',
      is_active: initialData?.is_active ?? true,
    },
  });

  const [imagePreview, setImagePreview] = React.useState<string | undefined>(initialData?.url);

  const { toast } = useToast();

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:max-w-[600px] rounded-lg p-4 sm:p-6 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Image' : 'Add New Image'}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Image title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center">
                        {imagePreview ? (
                          <div className="relative mb-2 w-full max-w-[220px]">
                            <AspectRatio ratio={1 / 1} className="bg-muted rounded-md overflow-hidden border">
                              <img
                                src={imagePreview}
                                alt="Preview"
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
                                field.onChange('');
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="w-full max-w-[220px]">
                            <label
                              htmlFor="gallery-image-upload"
                              className="flex flex-col items-center justify-center w-full h-[180px] border-2 border-dashed rounded-md cursor-pointer bg-muted/20 hover:bg-muted/30"
                            >
                              <div className="flex flex-col items-center justify-center p-4 text-center">
                                <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-semibold">Click to upload</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG or GIF</p>
                              </div>
                              <input
                                id="gallery-image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  const validation = validateImageFile(file);
                                  if (!validation.valid) {
                                    toast({ title: 'Invalid image', description: validation.message, variant: 'destructive' });
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
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Active</FormLabel>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4 pb-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 