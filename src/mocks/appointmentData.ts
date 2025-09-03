import { Appointment } from '@/types';
import { addDays, addMinutes, format, startOfDay, subDays } from 'date-fns';

// Helper function to generate appointments
const createAppointment = (
  id: string,
  customerId: string,
  customerName: string,
  customerPhone: string,
  staffId: string,
  staffName: string,
  dateOffset: number,
  time: string,
  services: { serviceId: string; serviceName: string; price: number; duration: number }[],
  status: Appointment['status'],
  notes?: string
): Appointment => {
  const date = format(addDays(startOfDay(new Date()), dateOffset), 'yyyy-MM-dd');
  const [hours, minutes] = time.split(':').map(Number);
  const startTime = new Date(date);
  startTime.setHours(hours, minutes);
  
  // Calculate end time based on service durations
  const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
  const endTime = addMinutes(startTime, totalDuration);
  
  // Calculate total amount
  const totalAmount = services.reduce((sum, service) => sum + service.price, 0);
  
  return {
    id,
    customerId,
    customerName,
    customerPhone,
    customerEmail: `${customerName.toLowerCase().replace(/\s/g, '.')}@example.com`,
    staffId,
    staffName,
    date,
    time: format(startTime, 'HH:mm'),
    endTime: format(endTime, 'HH:mm'),
    services,
    status,
    totalAmount,
    notes,
    createdAt: format(subDays(startTime, 7), "yyyy-MM-dd'T'HH:mm:ss"),
    updatedAt: format(subDays(startTime, 2), "yyyy-MM-dd'T'HH:mm:ss"),
  };
};

// Generate mock appointment data
export const appointmentData: Appointment[] = [
  // Today's appointments with overlaps
  createAppointment(
    'apt-1',
    'cust-1',
    'John Smith',
    '(555) 123-4567',
    'staff-1',
    'James Wilson',
    0,
    '09:30',
    [
      { serviceId: 'service-1', serviceName: 'Classic Haircut', price: 25, duration: 30 },
      { serviceId: 'service-2', serviceName: 'Beard Trim', price: 15, duration: 15 }
    ],
    'confirmed',
    'Regular customer, prefers scissors over clippers'
  ),
  // Same time as apt-1, different staff
  createAppointment(
    'apt-1a',
    'cust-20',
    'Alex Rodriguez',
    '(555) 777-8888',
    'staff-2',
    'Miguel Rodriguez',
    0,
    '09:30',
    [
      { serviceId: 'service-3', serviceName: 'Hot Towel Shave', price: 35, duration: 45 }
    ],
    'scheduled'
  ),
  // Same time as apt-1, yet another staff
  createAppointment(
    'apt-1b',
    'cust-21',
    'Kevin Hart',
    '(555) 888-9999',
    'staff-3',
    'Sarah Johnson',
    0,
    '09:30',
    [
      { serviceId: 'service-4', serviceName: 'Fade Haircut', price: 30, duration: 45 }
    ],
    'confirmed'
  ),
  createAppointment(
    'apt-2',
    'cust-2',
    'Michael Johnson',
    '(555) 234-5678',
    'staff-2',
    'Miguel Rodriguez',
    0,
    '10:00',
    [
      { serviceId: 'service-4', serviceName: 'Fade Haircut', price: 30, duration: 45 }
    ],
    'confirmed'
  ),
  // Overlapping at 10:00 with apt-2
  createAppointment(
    'apt-2a',
    'cust-22',
    'Chris Evans',
    '(555) 111-2222',
    'staff-4',
    'David Lee',
    0,
    '10:00',
    [
      { serviceId: 'service-1', serviceName: 'Classic Haircut', price: 25, duration: 30 }
    ],
    'scheduled'
  ),
  createAppointment(
    'apt-3',
    'cust-3',
    'Robert Davis',
    '(555) 345-6789',
    'staff-3',
    'Sarah Johnson',
    0,
    '11:15',
    [
      { serviceId: 'service-7', serviceName: 'Hair Coloring', price: 60, duration: 90 }
    ],
    'scheduled'
  ),
  // Multiple appointments at 13:00
  createAppointment(
    'apt-4',
    'cust-4',
    'William Brown',
    '(555) 456-7890',
    'staff-1',
    'James Wilson',
    0,
    '13:00',
    [
      { serviceId: 'service-1', serviceName: 'Classic Haircut', price: 25, duration: 30 }
    ],
    'completed'
  ),
  createAppointment(
    'apt-4a',
    'cust-23',
    'Tony Stark',
    '(555) 333-4444',
    'staff-2',
    'Miguel Rodriguez',
    0,
    '13:00',
    [
      { serviceId: 'service-5', serviceName: 'Hair & Beard Combo', price: 40, duration: 60 }
    ],
    'confirmed'
  ),
  createAppointment(
    'apt-4b',
    'cust-24',
    'Steve Rogers',
    '(555) 444-5555',
    'staff-3',
    'Sarah Johnson',
    0,
    '13:00',
    [
      { serviceId: 'service-2', serviceName: 'Beard Trim', price: 15, duration: 15 }
    ],
    'scheduled'
  ),
  createAppointment(
    'apt-4c',
    'cust-25',
    'Bruce Banner',
    '(555) 555-6666',
    'staff-4',
    'David Lee',
    0,
    '13:00',
    [
      { serviceId: 'service-6', serviceName: 'Kids Haircut', price: 20, duration: 30 }
    ],
    'confirmed'
  ),
  createAppointment(
    'apt-5',
    'cust-5',
    'James Miller',
    '(555) 567-8901',
    'staff-5',
    'Olivia Brown',
    0,
    '14:30',
    [
      { serviceId: 'service-8', serviceName: 'Deluxe Package', price: 75, duration: 120 }
    ],
    'scheduled',
    'First-time customer'
  ),
  
  // Tomorrow's appointments with overlaps
  createAppointment(
    'apt-6',
    'cust-6',
    'Richard Wilson',
    '(555) 678-9012',
    'staff-2',
    'Miguel Rodriguez',
    1,
    '09:00',
    [
      { serviceId: 'service-5', serviceName: 'Hair & Beard Combo', price: 40, duration: 60 }
    ],
    'scheduled'
  ),
  createAppointment(
    'apt-6a',
    'cust-26',
    'Thor Odinson',
    '(555) 666-7777',
    'staff-1',
    'James Wilson',
    1,
    '09:00',
    [
      { serviceId: 'service-2', serviceName: 'Beard Trim', price: 15, duration: 15 }
    ],
    'confirmed'
  ),
  createAppointment(
    'apt-7',
    'cust-7',
    'Thomas Moore',
    '(555) 789-0123',
    'staff-3',
    'Sarah Johnson',
    1,
    '10:30',
    [
      { serviceId: 'service-3', serviceName: 'Hot Towel Shave', price: 35, duration: 45 }
    ],
    'scheduled'
  ),
  // Same time slot with different staff
  createAppointment(
    'apt-7a',
    'cust-27',
    'Clint Barton',
    '(555) 777-9999',
    'staff-4',
    'David Lee',
    1,
    '10:30',
    [
      { serviceId: 'service-1', serviceName: 'Classic Haircut', price: 25, duration: 30 }
    ],
    'confirmed'
  ),
  
  // Day after tomorrow - multiple staff with appointments at the same time
  createAppointment(
    'apt-8',
    'cust-8',
    'Daniel Taylor',
    '(555) 890-1234',
    'staff-4',
    'David Lee',
    2,
    '11:00',
    [
      { serviceId: 'service-1', serviceName: 'Classic Haircut', price: 25, duration: 30 },
      { serviceId: 'service-2', serviceName: 'Beard Trim', price: 15, duration: 15 }
    ],
    'scheduled'
  ),
  createAppointment(
    'apt-8a',
    'cust-28',
    'Natasha Romanoff',
    '(555) 888-0000',
    'staff-1',
    'James Wilson',
    2,
    '11:00',
    [
      { serviceId: 'service-4', serviceName: 'Fade Haircut', price: 30, duration: 45 }
    ],
    'confirmed'
  ),
  createAppointment(
    'apt-8b',
    'cust-29',
    'Wanda Maximoff',
    '(555) 999-1111',
    'staff-2',
    'Miguel Rodriguez',
    2,
    '11:00',
    [
      { serviceId: 'service-6', serviceName: 'Kids Haircut', price: 20, duration: 30 }
    ],
    'scheduled'
  ),
  createAppointment(
    'apt-8c',
    'cust-30',
    'Scott Lang',
    '(555) 000-2222',
    'staff-3',
    'Sarah Johnson',
    2,
    '11:00',
    [
      { serviceId: 'service-3', serviceName: 'Hot Towel Shave', price: 35, duration: 45 }
    ],
    'scheduled'
  ),
  
  // Previous appointments (completed)
  createAppointment(
    'apt-9',
    'cust-9',
    'Christopher White',
    '(555) 901-2345',
    'staff-1',
    'James Wilson',
    -1,
    '14:00',
    [
      { serviceId: 'service-4', serviceName: 'Fade Haircut', price: 30, duration: 45 }
    ],
    'completed'
  ),
  createAppointment(
    'apt-10',
    'cust-10',
    'Matthew Harris',
    '(555) 012-3456',
    'staff-5',
    'Olivia Brown',
    -1,
    '16:30',
    [
      { serviceId: 'service-9', serviceName: 'Hair Treatment', price: 45, duration: 60 }
    ],
    'completed'
  ),
  createAppointment(
    'apt-11',
    'cust-1',
    'John Smith',
    '(555) 123-4567',
    'staff-2',
    'Miguel Rodriguez',
    -2,
    '10:00',
    [
      { serviceId: 'service-1', serviceName: 'Classic Haircut', price: 25, duration: 30 }
    ],
    'completed'
  ),
  createAppointment(
    'apt-12',
    'cust-11',
    'Andrew Clark',
    '(555) 123-7890',
    'staff-3',
    'Sarah Johnson',
    -2,
    '15:00',
    [
      { serviceId: 'service-8', serviceName: 'Deluxe Package', price: 75, duration: 120 }
    ],
    'no-show'
  ),
  createAppointment(
    'apt-13',
    'cust-12',
    'Ryan Phillips',
    '(555) 234-8901',
    'staff-4',
    'David Lee',
    -3,
    '13:30',
    [
      { serviceId: 'service-6', serviceName: 'Kids Haircut', price: 20, duration: 30 }
    ],
    'completed'
  ),
  createAppointment(
    'apt-14',
    'cust-13',
    'Joshua Campbell',
    '(555) 345-9012',
    'staff-1',
    'James Wilson',
    -3,
    '17:00',
    [
      { serviceId: 'service-5', serviceName: 'Hair & Beard Combo', price: 40, duration: 60 }
    ],
    'completed'
  ),
  createAppointment(
    'apt-15',
    'cust-14',
    'David Evans',
    '(555) 456-0123',
    'staff-5',
    'Olivia Brown',
    -4,
    '09:30',
    [
      { serviceId: 'service-4', serviceName: 'Fade Haircut', price: 30, duration: 45 }
    ],
    'completed'
  ),
  createAppointment(
    'apt-16',
    'cust-15',
    'Edward King',
    '(555) 567-1234',
    'staff-3',
    'Sarah Johnson',
    -4,
    '14:00',
    [
      { serviceId: 'service-1', serviceName: 'Classic Haircut', price: 25, duration: 30 },
      { serviceId: 'service-2', serviceName: 'Beard Trim', price: 15, duration: 15 }
    ],
    'cancelled'
  ),
  createAppointment(
    'apt-17',
    'cust-16',
    'George Wright',
    '(555) 678-2345',
    'staff-2',
    'Miguel Rodriguez',
    -5,
    '11:30',
    [
      { serviceId: 'service-3', serviceName: 'Hot Towel Shave', price: 35, duration: 45 }
    ],
    'completed'
  ),
  createAppointment(
    'apt-18',
    'cust-17',
    'Henry Lopez',
    '(555) 789-3456',
    'staff-4',
    'David Lee',
    -5,
    '16:00',
    [
      { serviceId: 'service-7', serviceName: 'Hair Coloring', price: 60, duration: 90 }
    ],
    'completed'
  ),
  createAppointment(
    'apt-19',
    'cust-18',
    'Isaac Allen',
    '(555) 890-4567',
    'staff-1',
    'James Wilson',
    -6,
    '10:30',
    [
      { serviceId: 'service-1', serviceName: 'Classic Haircut', price: 25, duration: 30 }
    ],
    'completed'
  ),
  createAppointment(
    'apt-20',
    'cust-19',
    'Jack Young',
    '(555) 901-5678',
    'staff-5',
    'Olivia Brown',
    -6,
    '13:00',
    [
      { serviceId: 'service-9', serviceName: 'Hair Treatment', price: 45, duration: 60 }
    ],
    'completed'
  ),
];