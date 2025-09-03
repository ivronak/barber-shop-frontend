import { get, post, put, del } from '../apiClient';

// Type definitions
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  commission: number;
  imageUrl?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Response interfaces
export interface ProductListResponse {
  success: boolean;
  products: Product[];
  totalCount: number;
  pages: number;
}

export interface ProductResponse {
  success: boolean;
  product: Product;
  message?: string;
}

export interface DeleteProductResponse {
  success: boolean;
  message: string;
}

/**
 * Get all products with pagination, sorting and filtering
 */
export const getAllProducts = async (
  page = 1,
  limit = 10,
  sort = 'name_asc',
  category?: string,
  search?: string
): Promise<ProductListResponse> => {
  let url = `/products?page=${page}&limit=${limit}&sort=${sort}`;
  
  if (category) {
    url += `&category=${category}`;
  }
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  return get<ProductListResponse>(url);
};

/**
 * Get product by ID
 */
export const getProductById = async (id: string): Promise<ProductResponse> => {
  return get<ProductResponse>(`/products/${id}`);
};

/**
 * Create new product
 */
export const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<ProductResponse> => {
  return post<ProductResponse>('/products', productData);
};

/**
 * Update product
 */
export const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<ProductResponse> => {
  return put<ProductResponse>(`/products/${id}`, productData);
};

/**
 * Delete product
 */
export const deleteProduct = async (id: string): Promise<DeleteProductResponse> => {
  return del<DeleteProductResponse>(`/products/${id}`);
}; 