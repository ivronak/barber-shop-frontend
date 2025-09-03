import { Customer } from '@/types';
import { format, subDays, subMonths } from 'date-fns';

// Generate mock customer data
export const customerData: Customer[] = [
  {
    id: 'cust-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    visitCount: 12,
    totalSpent: 435.50,
    lastVisit: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    notes: 'Prefers classic cuts, always asks for James',
    createdAt: format(subMonths(new Date(), 8), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'cust-2',
    name: 'Michael Johnson',
    email: 'michael.j@example.com',
    phone: '(555) 234-5678',
    visitCount: 8,
    totalSpent: 320.75,
    lastVisit: format(subDays(new Date(), 14), 'yyyy-MM-dd'),
    notes: 'Likes fade haircuts with sharp lines',
    createdAt: format(subMonths(new Date(), 6), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'cust-3',
    name: 'Robert Davis',
    email: 'robert.d@example.com',
    phone: '(555) 345-6789',
    visitCount: 5,
    totalSpent: 185.00,
    lastVisit: format(subDays(new Date(), 21), 'yyyy-MM-dd'),
    notes: 'Recently started coloring his hair',
    createdAt: format(subMonths(new Date(), 5), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'cust-4',
    name: 'William Brown',
    email: 'will.brown@example.com',
    phone: '(555) 456-7890',
    visitCount: 15,
    totalSpent: 512.25,
    lastVisit: format(new Date(), 'yyyy-MM-dd'),
    notes: 'VIP customer, very particular about his cut',
    createdAt: format(subMonths(new Date(), 10), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'cust-5',
    name: 'James Miller',
    email: 'james.m@example.com',
    phone: '(555) 567-8901',
    visitCount: 1,
    totalSpent: 75.00,
    lastVisit: null,
    notes: 'First-time customer',
    createdAt: format(subDays(new Date(), 2), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'cust-6',
    name: 'Richard Wilson',
    email: 'rich.wilson@example.com',
    phone: '(555) 678-9012',
    visitCount: 6,
    totalSpent: 230.50,
    lastVisit: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    notes: 'Always books hair & beard combo',
    createdAt: format(subMonths(new Date(), 5), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'cust-7',
    name: 'Thomas Moore',
    email: 'thomas.m@example.com',
    phone: '(555) 789-0123',
    visitCount: 4,
    totalSpent: 165.25,
    lastVisit: format(subDays(new Date(), 45), 'yyyy-MM-dd'),
    createdAt: format(subMonths(new Date(), 4), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'cust-8',
    name: 'Daniel Taylor',
    email: 'dan.taylor@example.com',
    phone: '(555) 890-1234',
    visitCount: 2,
    totalSpent: 80.00,
    lastVisit: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
    notes: 'Recently moved to the area',
    createdAt: format(subMonths(new Date(), 3), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'cust-9',
    name: 'Christopher White',
    email: 'chris.white@example.com',
    phone: '(555) 901-2345',
    visitCount: 9,
    totalSpent: 345.75,
    lastVisit: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    createdAt: format(subMonths(new Date(), 7), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'cust-10',
    name: 'Matthew Harris',
    email: 'matt.h@example.com',
    phone: '(555) 012-3456',
    visitCount: 7,
    totalSpent: 280.50,
    lastVisit: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    notes: 'Has sensitive scalp, use gentle products',
    createdAt: format(subMonths(new Date(), 6), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'cust-11',
    name: 'Andrew Clark',
    email: 'andrew.c@example.com',
    phone: '(555) 123-7890',
    visitCount: 3,
    totalSpent: 150.00,
    lastVisit: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    createdAt: format(subMonths(new Date(), 3), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'cust-12',
    name: 'Ryan Phillips',
    email: 'ryan.p@example.com',
    phone: '(555) 234-8901',
    visitCount: 5,
    totalSpent: 145.50,
    lastVisit: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    notes: 'Father of two kids who also get their haircuts here',
    createdAt: format(subMonths(new Date(), 5), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'cust-13',
    name: 'Joshua Campbell',
    email: 'josh.c@example.com',
    phone: '(555) 345-9012',
    visitCount: 11,
    totalSpent: 385.25,
    lastVisit: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    createdAt: format(subMonths(new Date(), 9), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'cust-14',
    name: 'Kevin Walker',
    email: 'kevin.w@example.com',
    phone: '(555) 456-0123',
    visitCount: 14,
    totalSpent: 495.00,
    lastVisit: format(new Date(), 'yyyy-MM-dd'),
    notes: 'Walks in regularly without appointment',
    createdAt: format(subMonths(new Date(), 11), "yyyy-MM-dd'T'HH:mm:ss")
  }
];