import { Staff, User } from '@/types';

export const staffData: Staff[] = [
  {
    id: 'staff-1',
    name: 'James Wilson',
    email: 'james@barbershop.com',
    phone: '(555) 123-4567',
    role: 'staff',
    image: 'https://images.pexels.com/photos/1722198/pexels-photo-1722198.jpeg',
    position: 'Senior Barber',
    bio: 'James has over 10 years of experience specializing in modern and classic cuts.',
    services: [
      'service-1', // Classic Haircut
      'service-4', // Fade Haircut
      'service-5', // Hair & Beard Combo
      'service-10', // Buzz Cut
      'service-15', // Senior Haircut
      'service-21', // Designer Fade
      'service-6', // Kids Haircut
      'service-2', // Beard Trim
      'service-11', // Beard Styling
      'service-22', // Beard Wash & Treatment
    ],
    workingHours: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [{ start: '10:00', end: '16:00' }],
      sunday: [],
    },
    commissionPercentage: 50,
    totalEarnings: 32580,
    totalAppointments: 342,
    isAvailable: true,
  },
  {
    id: 'staff-2',
    name: 'Miguel Rodriguez',
    email: 'miguel@barbershop.com',
    phone: '(555) 234-5678',
    role: 'staff',
    image: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg',
    position: 'Master Barber',
    bio: 'Miguel is known for his precision fades and beard styling techniques.',
    services: [
      'service-2', // Beard Trim
      'service-3', // Hot Towel Shave
      'service-11', // Beard Styling
      'service-12', // Straight Razor Shave
      'service-16', // Beard Coloring
      'service-17', // Head Shave
      'service-22', // Beard Wash & Treatment
      'service-23', // Traditional Shave
      'service-5', // Hair & Beard Combo
      'service-1', // Classic Haircut
      'service-4', // Fade Haircut
      'service-10', // Buzz Cut
    ],
    workingHours: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '12:00', end: '20:00' }],
      thursday: [{ start: '12:00', end: '20:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [{ start: '10:00', end: '16:00' }],
      sunday: [],
    },
    commissionPercentage: 45,
    totalEarnings: 28950,
    totalAppointments: 305,
    isAvailable: true,
  },
  {
    id: 'staff-3',
    name: 'Sarah Johnson',
    email: 'sarah@barbershop.com',
    phone: '(555) 345-6789',
    role: 'staff',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    position: 'Style Specialist',
    bio: 'Sarah specializes in trending styles and transformative hair coloring.',
    services: [
      'service-7', // Hair Coloring
      'service-13', // Highlights
      'service-18', // Balayage
      'service-24', // Root Touch-Up
      'service-8', // Deluxe Package
      'service-20', // Premium Combo
      'service-9', // Hair Treatment
      'service-14', // Keratin Treatment
      'service-19', // Scalp Treatment
      'service-1', // Classic Haircut
      'service-4', // Fade Haircut
    ],
    workingHours: {
      monday: [{ start: '10:00', end: '18:00' }],
      tuesday: [{ start: '10:00', end: '18:00' }],
      wednesday: [{ start: '10:00', end: '18:00' }],
      thursday: [{ start: '10:00', end: '18:00' }],
      friday: [{ start: '12:00', end: '20:00' }],
      saturday: [{ start: '10:00', end: '16:00' }],
      sunday: [],
    },
    commissionPercentage: 40,
    totalEarnings: 22450,
    totalAppointments: 276,
    isAvailable: true,
  },
  {
    id: 'staff-4',
    name: 'David Lee',
    email: 'david@barbershop.com',
    phone: '(555) 456-7890',
    role: 'staff',
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
    position: 'Junior Barber',
    bio: 'David brings fresh perspective with expertise in contemporary styling.',
    services: [
      'service-1', // Classic Haircut
      'service-6', // Kids Haircut
      'service-10', // Buzz Cut
      'service-15', // Senior Haircut
      'service-4', // Fade Haircut
      'service-21', // Designer Fade
      'service-2', // Beard Trim
      'service-11', // Beard Styling
      'service-22', // Beard Wash & Treatment
    ],
    workingHours: {
      monday: [],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [{ start: '10:00', end: '18:00' }],
      sunday: [{ start: '10:00', end: '16:00' }],
    },
    commissionPercentage: 35,
    totalEarnings: 18720,
    totalAppointments: 215,
    isAvailable: true,
  },
  {
    id: 'staff-5',
    name: 'Olivia Brown',
    email: 'olivia@barbershop.com',
    phone: '(555) 567-8901',
    role: 'staff',
    image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    position: 'Senior Stylist',
    bio: 'Olivia excels in creative cuts and styling for all hair textures.',
    services: [
      'service-8', // Deluxe Package
      'service-9', // Hair Treatment
      'service-14', // Keratin Treatment
      'service-19', // Scalp Treatment
      'service-20', // Premium Combo
      'service-7', // Hair Coloring
      'service-13', // Highlights
      'service-18', // Balayage
      'service-1', // Classic Haircut
      'service-4', // Fade Haircut
      'service-2', // Beard Trim
      'service-11', // Beard Styling
    ],
    workingHours: {
      monday: [{ start: '12:00', end: '20:00' }],
      tuesday: [{ start: '12:00', end: '20:00' }],
      wednesday: [{ start: '12:00', end: '20:00' }],
      thursday: [],
      friday: [{ start: '12:00', end: '20:00' }],
      saturday: [{ start: '10:00', end: '18:00' }],
      sunday: [{ start: '10:00', end: '16:00' }],
    },
    commissionPercentage: 45,
    totalEarnings: 26340,
    totalAppointments: 289,
    isAvailable: true,
  },
];

export const adminUser: User = {
  id: 'admin-1',
  name: 'Alex Morgan',
  email: 'admin@barbershop.com',
  phone: '(555) 789-0123',
  role: 'admin',
  image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
};