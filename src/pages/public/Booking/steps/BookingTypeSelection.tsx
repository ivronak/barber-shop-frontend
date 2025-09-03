import React from 'react';
import { motion } from 'framer-motion';
import { Scissors, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useBooking } from '../BookingContext';

interface BookingTypeSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export const BookingTypeSelection: React.FC<BookingTypeSelectionProps> = ({ onNext }) => {
  const { setBookingType } = useBooking();

  const handleSelection = (type: 'service' | 'staff') => {
    setBookingType(type);
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">How would you like to book?</h2>
        <p className="text-muted-foreground">
          Choose your preferred way to book an appointment
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelection('service')}
        >
          <Card className="p-6 cursor-pointer hover:border-primary/50 transition-colors h-full">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Scissors className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Book by Service</h3>
                <p className="text-muted-foreground">
                  Choose from our range of services first, then select your preferred barber
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelection('staff')}
        >
          <Card className="p-6 cursor-pointer hover:border-primary/50 transition-colors h-full">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Book by Staff</h3>
                <p className="text-muted-foreground">
                  Choose your preferred barber first, then select from their available services
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};