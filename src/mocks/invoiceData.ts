import { Invoice } from '@/types';
import { addDays, format, subDays } from 'date-fns';
import { gstRatesData } from './gstRatesData';

// Get the standard GST rate and components
const standardGstRate = gstRatesData.find(rate => rate.isActive);
const standardRate = standardGstRate?.totalRate || 7.5;

// Create tax components for invoices
const createTaxComponents = (subtotal: number, gstRateId: string) => {
  const rate = gstRatesData.find(r => r.id === gstRateId) || standardGstRate;
  if (!rate) return undefined;
  
  return rate.components.map(comp => ({
    name: comp.name,
    rate: comp.rate,
    amount: parseFloat(((subtotal * comp.rate) / 100).toFixed(2))
  }));
};

// Create invoice data matching some of the appointments
export const invoiceData: Invoice[] = [
  {
    id: 'inv-1',
    appointmentId: 'apt-4',
    customerId: 'cust-4',
    customerName: 'William Brown',
    staffId: 'staff-1',
    staffName: 'James Wilson',
    date: format(new Date(), 'yyyy-MM-dd'),
    services: [
      {
        serviceId: 'service-1',
        serviceName: 'Classic Haircut',
        price: 25,
        quantity: 1,
        total: 25
      }
    ],
    subtotal: 25,
    discountType: undefined,
    discountValue: undefined,
    discountAmount: 0,
    tipAmount: 5,
    tax: standardRate,
    taxAmount: 1.88,
    taxComponents: createTaxComponents(25, '1'),
    total: 31.88,
    paymentMethod: 'card',
    status: 'paid',
    createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'inv-2',
    appointmentId: 'apt-9',
    customerId: 'cust-9',
    customerName: 'Christopher White',
    staffId: 'staff-1',
    staffName: 'James Wilson',
    date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    services: [
      {
        serviceId: 'service-4',
        serviceName: 'Fade Haircut',
        price: 30,
        quantity: 1,
        total: 30
      }
    ],
    subtotal: 30,
    discountType: undefined,
    discountValue: undefined,
    discountAmount: 0,
    tipAmount: 6,
    tax: standardRate,
    taxAmount: 2.25,
    taxComponents: createTaxComponents(30, '1'),
    total: 38.25,
    paymentMethod: 'cash',
    status: 'paid',
    createdAt: format(subDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'inv-3',
    appointmentId: 'apt-10',
    customerId: 'cust-10',
    customerName: 'Matthew Harris',
    staffId: 'staff-5',
    staffName: 'Olivia Brown',
    date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    services: [
      {
        serviceId: 'service-9',
        serviceName: 'Hair Treatment',
        price: 45,
        quantity: 1,
        total: 45
      }
    ],
    subtotal: 45,
    discountType: 'percentage',
    discountValue: 10,
    discountAmount: 4.5,
    tipAmount: 8,
    tax: 18, // Using India GST (18%)
    taxAmount: 7.29,
    taxComponents: [
      { name: 'CGST', rate: 9, amount: 3.645 },
      { name: 'SGST', rate: 9, amount: 3.645 }
    ],
    total: 55.79,
    paymentMethod: 'card',
    status: 'paid',
    createdAt: format(subDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'inv-4',
    appointmentId: 'apt-11',
    customerId: 'cust-1',
    customerName: 'John Smith',
    staffId: 'staff-2',
    staffName: 'Miguel Rodriguez',
    date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    services: [
      {
        serviceId: 'service-1',
        serviceName: 'Classic Haircut',
        price: 25,
        quantity: 1,
        total: 25
      }
    ],
    subtotal: 25,
    discountType: undefined,
    discountValue: undefined,
    discountAmount: 0,
    tipAmount: 5,
    tax: standardRate,
    taxAmount: 1.88,
    taxComponents: createTaxComponents(25, '1'),
    total: 31.88,
    paymentMethod: 'mobile',
    status: 'paid',
    createdAt: format(subDays(new Date(), 2), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'inv-5',
    appointmentId: 'apt-13',
    customerId: 'cust-12',
    customerName: 'Ryan Phillips',
    staffId: 'staff-4',
    staffName: 'David Lee',
    date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    services: [
      {
        serviceId: 'service-6',
        serviceName: 'Kids Haircut',
        price: 20,
        quantity: 1,
        total: 20
      }
    ],
    subtotal: 20,
    discountType: undefined,
    discountValue: undefined,
    discountAmount: 0,
    tipAmount: 3,
    tax: standardRate,
    taxAmount: 1.50,
    taxComponents: createTaxComponents(20, '1'),
    total: 24.50,
    paymentMethod: 'cash',
    status: 'paid',
    createdAt: format(subDays(new Date(), 3), "yyyy-MM-dd'T'HH:mm:ss")
  },
  // Walk-in example (no appointment)
  {
    id: 'inv-6',
    customerId: 'cust-14',
    customerName: 'Kevin Walker',
    staffId: 'staff-3',
    staffName: 'Sarah Johnson',
    date: format(new Date(), 'yyyy-MM-dd'),
    services: [
      {
        serviceId: 'service-2',
        serviceName: 'Beard Trim',
        price: 15,
        quantity: 1,
        total: 15
      },
      {
        serviceId: 'service-3',
        serviceName: 'Hot Towel Shave',
        price: 35,
        quantity: 1,
        total: 35
      }
    ],
    subtotal: 50,
    discountType: 'fixed',
    discountValue: 5,
    discountAmount: 5,
    tipAmount: 10,
    tax: standardRate,
    taxAmount: 3.38,
    taxComponents: createTaxComponents(50, '1'),
    total: 58.38,
    paymentMethod: 'card',
    status: 'paid',
    notes: 'Walk-in customer',
    createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
  },
  // Future invoice (for upcoming scheduled appointment)
  {
    id: 'inv-7',
    appointmentId: 'apt-6',
    customerId: 'cust-6',
    customerName: 'Richard Wilson',
    staffId: 'staff-2',
    staffName: 'Miguel Rodriguez',
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    services: [
      {
        serviceId: 'service-5',
        serviceName: 'Hair & Beard Combo',
        price: 40,
        quantity: 1,
        total: 40
      }
    ],
    subtotal: 40,
    discountType: undefined,
    discountValue: undefined,
    discountAmount: 0,
    tax: standardRate,
    taxAmount: 3.00,
    taxComponents: createTaxComponents(40, '1'),
    total: 43.00,
    paymentMethod: 'pending',
    status: 'pending',
    createdAt: format(subDays(new Date(), 2), "yyyy-MM-dd'T'HH:mm:ss")
  }
];