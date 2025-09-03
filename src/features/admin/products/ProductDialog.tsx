import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductForm } from './ProductForm';
import { Product } from '@/api/services/productService';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Product;
  onSubmit: (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  isSubmitting?: boolean;
}

export function ProductDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting = false,
}: ProductDialogProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:max-w-[600px] rounded-lg p-4 sm:p-6 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update the product details below.'
              : 'Fill in the details to add a new product.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-1">
        <ProductForm 
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
        </div>
      </DialogContent>
    </Dialog>
  );
} 