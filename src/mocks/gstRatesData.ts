import { GSTRate } from '@/types';

// Mock GST rates data
export const gstRatesData: GSTRate[] = [
  { 
    id: '1', 
    name: 'Standard GST (7.5%)', 
    components: [
      { id: 'comp-1', name: 'GST', rate: 7.5 }
    ],
    isActive: true,
    totalRate: 7.5
  },
  { 
    id: '2', 
    name: 'Reduced GST (5%)', 
    components: [
      { id: 'comp-2', name: 'GST', rate: 5 }
    ],
    isActive: false,
    totalRate: 5
  },
  { 
    id: '3', 
    name: 'Canada GST (5%)', 
    components: [
      { id: 'comp-3', name: 'GST', rate: 5 }
    ],
    isActive: false,
    totalRate: 5
  },
  { 
    id: '4', 
    name: 'Canada HST - Ontario (13%)', 
    components: [
      { id: 'comp-5', name: 'HST', rate: 13 }
    ],
    isActive: false,
    totalRate: 13
  },
  { 
    id: '5', 
    name: 'Canada HST - Nova Scotia (15%)', 
    components: [
      { id: 'comp-7', name: 'HST', rate: 15 }
    ],
    isActive: false,
    totalRate: 15
  }
]; 