import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ContactRequest } from '@/api/services/contactRequestService';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  data?: ContactRequest | null;
  onOpenChange: (open: boolean) => void;
}

export const ContactRequestDialog: React.FC<Props> = ({ open, data, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>Contact Request Details</DialogTitle>
          <DialogDescription>ID: {data?.id}</DialogDescription>
        </DialogHeader>

        {data ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{data.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium truncate">{data.email}</p>
              </div>
              {data.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{data.phone}</p>
                </div>
              )}
            </div>
            {data.subject && (
              <div>
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="font-medium break-words">{data.subject}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Message</p>
              <p className="whitespace-pre-wrap">{data.message}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{new Date(data.created_at).toLocaleString()}</p>
            </div>
            <div className="pt-2 flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}; 