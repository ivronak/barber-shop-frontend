import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useBooking } from '../BookingContext';
import { getCustomerByPhone } from '@/api/services/customerService';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const CustomerDetails: React.FC = () => {
  const { customerDetails, setCustomerDetails } = useBooking();
  const [isSearching, setIsSearching] = useState(false);
  const lastLookupRef = useRef<string>('');
  const [lookupStatus, setLookupStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Determine color class for lookup status message
  const statusColor = lookupStatus?.type === 'success'
    ? 'text-green-600'
    : lookupStatus?.type === 'error'
    ? 'text-destructive'
    : lookupStatus && lookupStatus.message.toLowerCase().includes('not found')
    ? 'text-destructive'
    : 'text-muted-foreground';

  // ------------------
  // Field validations
  // ------------------
  const phoneDigits = customerDetails.phone.replace(/\D/g, '');
  const phoneError = phoneDigits.length === 0
    ? 'Phone number is required.'
    : phoneDigits.length !== 10
    ? 'Phone number must be exactly 10 digits.'
    : '';

  const nameError = customerDetails.name.trim() === '' ? 'Full name is required.' : '';

  const emailTrimmed = customerDetails.email.trim();
  const emailError = emailTrimmed !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)
    ? 'Enter a valid email address.'
    : '';

  // Effect to watch phone input and lookup when 10 digits reached
  useEffect(() => {
    const digits = customerDetails.phone.replace(/\D/g, '');
    if (digits.length === 10 && digits !== lastLookupRef.current) {
      lastLookupRef.current = digits;
      (async () => {
        setIsSearching(true);
        setLookupStatus(null);
        try {
          const response = await getCustomerByPhone(digits);
          if (response.success && response.customer) {
            setCustomerDetails({
              name: response.customer.name || '',
              email: response.customer.email || '',
              phone: response.customer.phone,
              notes: response.customer.notes || ''
            });
            setLookupStatus({ type: 'success', message: 'Customer details auto-filled.' });
          } else {
            const apiMsg = (response as unknown as { message?: string }).message;
            setLookupStatus({ type: 'info', message: apiMsg || 'Customer not found. Please enter your details.' });
          }
        } catch (error: unknown) {
          // Attempt to extract message from API error response
          const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
          const apiErrorMsg = err?.response?.data?.message || err?.message;
          if (apiErrorMsg) {
            const isNotFound = apiErrorMsg.toLowerCase().includes('not found');
            setLookupStatus({ type: isNotFound ? 'info' : 'error', message: apiErrorMsg });
          } else if (err?.response?.status === 404) {
            setLookupStatus({ type: 'info', message: 'Customer not found. Please enter your details.' });
          } else {
            setLookupStatus({ type: 'error', message: 'Lookup failed, please try again.' });
          }
        } finally {
          setIsSearching(false);
        }
      })();
    }
  }, [customerDetails.phone, setCustomerDetails]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Your Details</h2>
        <p className="text-muted-foreground">
          Please provide your contact information
        </p>
      </div>

      <motion.div 
        className="space-y-4"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="initial"
        animate="animate"
      >
        <motion.div
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
        >
          <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
          <div className="relative">
            <Input
              id="phone"
              value={customerDetails.phone}
              maxLength={10}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                setCustomerDetails({ ...customerDetails, phone: digits });
              }}
              placeholder="Enter your phone number"
              required
            />
            {isSearching && (
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Enter your 10-digit phone number. We'll search our records and auto-fill your details if you've booked before.
          </p>
          {phoneError && (
            <p className="mt-1 text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {phoneError}
            </p>
          )}
          {lookupStatus && (
            <p className={`mt-1 flex items-center gap-1 text-xs ${statusColor}`}>
              {lookupStatus.type === 'success' && <CheckCircle2 className="h-3 w-3" />}
              {lookupStatus.type === 'error' && <AlertCircle className="h-3 w-3" />}
              {lookupStatus.message}
            </p>
          )}
        </motion.div>

        <motion.div
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
        >
          <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
          <Input
            id="name"
            value={customerDetails.name}
            onChange={(e) =>
              setCustomerDetails({ ...customerDetails, name: e.target.value })
            }
            placeholder="Enter your full name"
            required
          />
          {nameError && (
            <p className="mt-1 text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {nameError}
            </p>
          )}
        </motion.div>

        <motion.div
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
        >
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            value={customerDetails.email}
            onChange={(e) =>
              setCustomerDetails({ ...customerDetails, email: e.target.value })
            }
            placeholder="Enter your email address"
          />
          {emailError && (
            <p className="mt-1 text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {emailError}
            </p>
          )}
        </motion.div>

        <motion.div
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
        >
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Input
            id="notes"
            value={customerDetails.notes}
            onChange={(e) =>
              setCustomerDetails({ ...customerDetails, notes: e.target.value })
            }
            placeholder="Any special requests or notes"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};