import React from 'react';
import { motion } from 'framer-motion';
import { useBooking } from '../BookingContext';
import { ServiceSelection } from './ServiceSelection';
import { StaffSelection } from './StaffSelection';

export const SecondSelectionStep: React.FC = () => {
  const { bookingFlow } = useBooking();

  const renderServiceFirstFlow = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Choose Your Barber</h2>
          <p className="text-muted-foreground">
            Select a staff member who can perform your chosen services
          </p>
        </div>
        <StaffSelection hideHeading={true} />
      </div>
    );
  };

  const renderStaffFirstFlow = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Choose Services</h2>
          <p className="text-muted-foreground">
            Select services you'd like to book with your chosen staff member
          </p>
        </div>
        <ServiceSelection hideHeading={true} />
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {bookingFlow === 'service-first' ? renderServiceFirstFlow() : renderStaffFirstFlow()}
    </motion.div>
  );
}; 