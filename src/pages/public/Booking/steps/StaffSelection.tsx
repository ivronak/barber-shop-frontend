import React,
{
  useState, useEffect, useRef
} from 'react';
import {
  motion
} from 'framer-motion';
import {
  staffData
} from '@/mocks';
import {
  Avatar, AvatarFallback, AvatarImage
} from '@/components/ui/avatar';
import {
  Button
} from '@/components/ui/button';
import {
  Badge
} from '@/components/ui/badge';
import {
  useBooking
} from '../BookingContext';
import {
  Loader2, Scissors, User
} from 'lucide-react';
import {
  Alert, AlertDescription
} from '@/components/ui/alert';
import {
  getBookingStaff, BookingStaff
} from '@/api/services/bookingService';

interface StaffSelectionProps {
  hideHeading?: boolean;
}

export const StaffSelection: React.FC<StaffSelectionProps> = ({ hideHeading = false
}) => {
  const {
    selectedStaffId,
    setSelectedStaffId,
    setSelectedStaffName,
    setSelectedStaffPosition,
    selectedServices,
    bookingFlow
  } = useBooking();
  const [staffList, setStaffList
  ] = useState<BookingStaff[]>([]);
  const [isLoading, setIsLoading
  ] = useState(false);
  const [error, setError
  ] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const fetchStaff = async () => {
      // Skip fetching if we've already fetched staff data and no service selection has changed
      if (hasFetchedRef.current && !(bookingFlow === 'service-first' && selectedServices.length > 0)) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // If we're in service-first flow and have selected services, pass all service IDs
        const serviceId = bookingFlow === 'service-first' && selectedServices.length > 0
          ? selectedServices.map(service => service.id)
          : undefined;

        const response = await getBookingStaff(serviceId);

        if (response.success) {
          console.log('Staff data:', response.staff);
          setStaffList(response.staff);
        } else {
          setError('Failed to load staff members');
          // Fallback to mock data
          setStaffList(staffData as unknown as BookingStaff[]);
        }
      } catch (err) {
        console.error('Error fetching staff:', err);
        setError('Failed to load staff members');
        // Fallback to mock data
        setStaffList(staffData as unknown as BookingStaff[]);
      } finally {
        setIsLoading(false);
        hasFetchedRef.current = true;
      }
    };

    fetchStaff();
  },
    [bookingFlow, selectedServices
    ]);

  // Filter staff by selected services if in service-first flow
  const availableStaff = bookingFlow === 'service-first' && selectedServices.length > 0
    ? staffList.filter(staff =>
      selectedServices.every(service =>
        staff.services.includes(service.id)
      )
    )
    : staffList;

  // Handle staff selection without memoization to prevent unnecessary re-renders
  const handleStaffSelect = (staff: BookingStaff) => {
    setSelectedStaffId(staff.id);
    setSelectedStaffName(staff.name);
    setSelectedStaffPosition(staff.position);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading staff members...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={
        {
          opacity: 0
        }
      }
      animate={
        {
          opacity: 1
        }
      }
      exit={
        {
          opacity: 0
        }
      }
      className="space-y-6"
    >
      {!hideHeading && (
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Choose Your Barber</h2>
          <p className="text-muted-foreground">
            Select a staff member for your appointment
          </p>
        </div>
      )
      }

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error
          }</AlertDescription>
        </Alert>
      )
      }

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {
          [
            {
              "id": "any_staff",
              "name": "Any staff",
              "position": null,
              "bio": "",
              "image": "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
              "services": []
            }, ...availableStaff
          ].map((staff) => {
            const isSelected = selectedStaffId === staff.id;
            return (
              <motion.div
                key={`staff-${staff.id
                  }`
                }
                whileHover={
                  {
                    scale: 1.02
                  }
                }
                whileTap={
                  {
                    scale: 0.98
                  }
                }
              >
                <Button
                  variant="ghost"
                  className={`group w-full h-auto p-3 sm:p-4 text-left flex items-center gap-3 sm:gap-4 rounded-xl border transition-all duration-200 ${isSelected
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg border-primary hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 hover:text-primary-foreground" : "bg-accent/10 border-accent/30 text-foreground shadow-sm hover:border-accent/50 hover:bg-accent/20 hover:shadow-md"
                    }`
                  }
                  onClick={(e) => {
                    e.preventDefault(); // Prevent default button behavior
                    e.stopPropagation(); // Stop event propagation
                    handleStaffSelect(staff);
                  }
                  }
                  type="button" // Explicitly set type to button
                >
                  <Avatar className={`h-14 w-14 sm:h-12 sm:w-12 shrink-0 ${isSelected ? "ring-2 ring-primary-foreground/30" : ""
                    }`
                  }>
                    <AvatarImage
                      src={
                        staff.image || (staff as unknown as {
                          user?: {
                            image?: string
                          }
                        }).user?.image ||
                        'https: //images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1080'
                      }
                      alt={staff.name
                      }
                    />
                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className={`font-medium truncate ${isSelected ? "text-primary-foreground" : ""
                        }`
                      }>
                        {staff.name
                        }
                      </span>
                      <Badge
                        variant="default"
                        className={`text-[
          10px
        ] px-2 py-0.5 shrink-0 border-0 ${isSelected
                            ? "bg-white/20 text-white group-hover:bg-white/20" : "bg-muted/40 text-foreground group-hover:bg-muted/50"
                          }`
                        }
                      >
                        Available
                      </Badge>
                    </div>
                    <span className={`text-xs truncate ${isSelected
                        ? "text-primary-foreground/90" : "text-muted-foreground"
                      }`
                    }>
                      {staff.position
                      }
                    </span>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <Badge
                        variant="default"
                        className={`text-xs py-0 h-5 px-1.5 flex items-center gap-1 border-0 ${isSelected
                            ? "bg-white/20 text-white group-hover:bg-white/20" : "bg-muted/40 text-foreground group-hover:bg-muted/50"
                          }`
                        }
                      >
                        <Scissors className="h-2.5 w-2.5" />
                        <span>{Array.isArray(staff.services) ? staff.services.length : 0
                        }</span>
                      </Badge>
                      {selectedServices.length > 0 && bookingFlow === 'service-first' && (
                        <Badge
                          variant="default"
                          className={`text-xs border-0 ${isSelected
                              ? "bg-white/20 text-white group-hover:bg-white/20" : "bg-muted/40 text-foreground group-hover:bg-muted/50"
                            }`
                          }
                        >
                          All selected services
                        </Badge>
                      )
                      }
                    </div>
                  </div>
                </Button>
              </motion.div>
            );
          })
        }
      </div>

      {availableStaff.length === 0 && !isLoading && (
        <div className="text-center py-8 border rounded-lg p-4">
          <p className="text-muted-foreground">
            No staff members available for the selected services.
            Please choose different services or try another time.
          </p>
        </div>
      )
      }
    </motion.div>
  );
};