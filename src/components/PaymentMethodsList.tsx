import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { PaymentMethodDialog } from './PaymentMethodDialog';
import { Loader2 } from 'lucide-react';

interface Props {
  methods: string[];
  onSave: (methods: string[]) => Promise<void>;
  isSaving?: boolean;
}

export const PaymentMethodsList: React.FC<Props> = ({ methods, onSave, isSaving }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddClick = () => {
    setEditingIndex(null);
    setDialogOpen(true);
  };

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setDialogOpen(true);
  };

  const handleDelete = async (idx: number) => {
    const next = methods.filter((_, i) => i !== idx);
    await onSave(next);
  };

  const handleSubmit = async (value: string) => {
    if (editingIndex === null) {
      // Adding new
      if (!methods.includes(value)) await onSave([...methods, value]);
    } else {
      const next = methods.map((m, i) => (i === editingIndex ? value : m));
      await onSave(next);
    }
  };

  return (
    <div className="space-y-4 relative">
      {isSaving && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-md z-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      {methods.length === 0 && (
        <p className="text-sm text-muted-foreground">No payment methods added.</p>
      )}
      {methods.map((method, idx) => (
        <div
          key={method + idx}
          className="flex items-center justify-between p-2 border rounded-md"
        >
          <span className="capitalize">{method}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(idx)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(idx)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={handleAddClick} disabled={isSaving}>
        <Plus className="h-4 w-4 mr-2" /> Add Payment Method
      </Button>

      <PaymentMethodDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialValue={editingIndex !== null ? methods[editingIndex] : undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
}; 