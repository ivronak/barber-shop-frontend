import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing method name; undefined means adding a new one */
  initialValue?: string;
  /** Called with the validated value when user confirms */
  onSubmit: (value: string) => void;
}

export const PaymentMethodDialog: React.FC<PaymentMethodDialogProps> = ({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
}) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setValue(initialValue ?? '');
    setError('');
  }, [open, initialValue]);

  const handleConfirm = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Name is required');
      return;
    }
    onSubmit(trimmed.toLowerCase());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{initialValue ? 'Edit' : 'Add'} Payment Method</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Input
            placeholder="e.g. paypal"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError('');
            }}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>{initialValue ? 'Save' : 'Add'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 