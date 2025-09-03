import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Star } from 'lucide-react';
import { createPublicReview } from '@/api/services/reviewService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddReviewDialog: React.FC<AddReviewDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!customerName || !reviewText) {
      toast({ title: 'Please fill all fields' });
      return;
    }
    setLoading(true);
    try {
      await createPublicReview({ customerName, rating, reviewText });
      toast({ title: 'Thank you!', description: 'Your review has been submitted for approval.' });
      setCustomerName('');
      setReviewText('');
      setRating(5);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast({ title: 'Error', description: 'Could not submit review. Please try later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Input placeholder="Your Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <div className="flex items-center space-x-2">
            {[1,2,3,4,5].map((num)=>(
              <Star key={num} className={`h-5 w-5 cursor-pointer ${num<=rating?'fill-yellow-400 text-yellow-400':'text-muted-foreground'}`} onClick={()=>setRating(num)} />
            ))}
          </div>
          <Textarea placeholder="Your review" value={reviewText} onChange={(e)=>setReviewText(e.target.value)} rows={4} />
        </div>
        <DialogFooter>
          <Button onClick={()=>onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 