import { get, post, put, del } from '../apiClient';
import { Appointment } from './appointmentService';
import { Invoice } from './invoiceService';

// Type definitions
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  visit_count?: number;
  total_spent?: number;
  last_visit?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Response interfaces
export interface CustomerListResponse {
  success: boolean;
  customers: Customer[];
  totalCount: number;
  pages: number;
}

export interface CustomerResponse {
  success: boolean;
  customer: Customer;
}

export interface CustomerStatsResponse {
  success: boolean;
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeCustomers: number;
  inactiveCustomers: number;
}

interface AppointmentListResponse {
  success: boolean;
  appointments: Appointment[];
}

interface InvoiceListResponse {
  success: boolean;
  invoices: Invoice[];
}

/**
 * Get all customers
 */
export const getAllCustomers = async (
  page = 1,
  limit = 10,
  sort = 'name_asc',
  search?: string,
  dateRange?: { from: string; to: string },
  spendingRange?: { min: number; max: number },
  customerSince?: string,
  minVisits?: number
): Promise<CustomerListResponse> => {
  console.log('getAllCustomers called with sort:', sort);
  
  let url = `/customers?page=${page}&limit=${limit}&sort=${sort}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  if (dateRange?.from && dateRange?.to) {
    url += `&visitFrom=${dateRange.from}&visitTo=${dateRange.to}`;
  }
  
  if (spendingRange?.min !== undefined && spendingRange?.max !== undefined) {
    url += `&minSpent=${spendingRange.min}&maxSpent=${spendingRange.max}`;
  }
  
  if (customerSince) {
    url += `&customerSince=${customerSince}`;
  }
  
  if (minVisits !== undefined && minVisits > 0) {
    url += `&minVisits=${minVisits}`;
  }
  
  console.log('Requesting URL:', url);
  return get<CustomerListResponse>(url);
};

/**
 * Get customer by ID
 */
export const getCustomerById = async (id: string): Promise<CustomerResponse> => {
  return get<CustomerResponse>(`/customers/${id}`);
};

/**
 * Get customer by phone number
 */
export const getCustomerByPhone = async (phone: string): Promise<CustomerResponse> => {
  return get<CustomerResponse>(`/public/customer/lookup/${phone}`);
};

/**
 * Create new customer
 */
export const createCustomer = async (customerData: Partial<Customer>): Promise<CustomerResponse> => {
  return post<CustomerResponse>('/customers', customerData);
};

/**
 * Update customer
 */
export const updateCustomer = async (
  id: string,
  customerData: Partial<Customer>
): Promise<CustomerResponse> => {
  return put<CustomerResponse>(`/customers/${id}`, customerData);
};

/**
 * Delete customer
 */
export const deleteCustomer = async (id: string): Promise<{ success: boolean; message: string }> => {
  return del<{ success: boolean; message: string }>(`/customers/${id}`);
};

/**
 * Get customer appointments
 */
export const getCustomerAppointments = async (id: string): Promise<AppointmentListResponse> => {
  return get<AppointmentListResponse>(`/customers/${id}/appointments`);
};

/**
 * Get customer invoices
 */
export const getCustomerInvoices = async (id: string): Promise<InvoiceListResponse> => {
  return get<InvoiceListResponse>(`/customers/${id}/invoices`);
};

/**
 * Get customer statistics
 */
export const getCustomerStats = async (): Promise<CustomerStatsResponse> => {
  return get<CustomerStatsResponse>('/customers/stats');
}; 