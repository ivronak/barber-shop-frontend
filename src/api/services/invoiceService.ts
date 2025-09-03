import { get, post, put } from '../apiClient';

// Type definitions
export interface InvoiceService {
  service_id: string;
  service_name: string;
  price: number;
  quantity: number;
  total: number;
  staff_id?: string;
  staff_name?: string;
}

export interface InvoiceProduct {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  total: number;
  staff_id?: string;
  staff_name?: string;
}

export interface TaxComponent {
  name: string;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  appointment_id?: string;
  customer_id: string;
  staff_id?: string;
  date: string;
  customer_name: string;
  staff_name?: string;
  staff?: Array<{ id: string; name: string }>;
  subtotal: number;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  discount_amount?: number;
  tip_amount?: number; // total tip for the invoice; server allocates equally among staff lines
  tax: number;
  tax_amount: number;
  total: number;
  payment_method: string;
  status: 'paid' | 'pending' | 'cancelled';
  notes?: string;
  services?: InvoiceService[]; // For backward compatibility
  invoiceServices?: InvoiceService[]; // Correct alias from the backend
  products?: InvoiceProduct[]; // Backward compatibility
  invoiceProducts?: InvoiceProduct[]; // Preferred alias
  tax_components?: TaxComponent[];
  created_at?: string;
  updated_at?: string;
}

// Response interfaces
interface InvoiceListResponse {
  success: boolean;
  invoices: Invoice[];
  totalCount: number;
  pages: number;
}

interface InvoiceResponse {
  success: boolean;
  invoice: Invoice;
}

/**
 * Get all invoices
 */
export const getAllInvoices = async (
  page = 1,
  limit = 10,
  sort = 'date_desc',
  dateFrom?: string,
  dateTo?: string,
  staffId?: string,
  customerId?: string,
  status?: string,
  search?: string
): Promise<InvoiceListResponse> => {
  let url = `/invoices?page=${page}&limit=${limit}&sort=${sort}`;
  
  if (dateFrom) url += `&dateFrom=${dateFrom}`;
  if (dateTo) url += `&dateTo=${dateTo}`;
  if (staffId) url += `&staffId=${staffId}`;
  if (customerId) url += `&customerId=${customerId}`;
  if (status) url += `&status=${status}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  
  return get<InvoiceListResponse>(url);
};

/**
 * Get invoice by ID
 */
export const getInvoiceById = async (id: string): Promise<InvoiceResponse> => {
  return get<InvoiceResponse>(`/invoices/${id}`);
};

/**
 * Create new invoice
 */
export const createInvoice = async (invoiceData: Partial<Invoice>): Promise<InvoiceResponse> => {
  console.log('Creating invoice with data:', JSON.stringify(invoiceData));
  try {
    const response = await post<InvoiceResponse>('/invoices', invoiceData);
    return response;
  } catch (error) {
    console.error('API error creating invoice:', error);
    throw error;
  }
};

/**
 * Update invoice
 */
export const updateInvoice = async (
  id: string,
  invoiceData: Partial<Invoice>
): Promise<InvoiceResponse> => {
  return put<InvoiceResponse>(`/invoices/${id}`, invoiceData);
};

/**
 * Send invoice by email
 */
export const sendInvoice = async (id: string): Promise<{ success: boolean; message: string }> => {
  return post<{ success: boolean; message: string }>(`/invoices/${id}/send`, {});
}; 