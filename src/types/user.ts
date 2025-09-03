export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'staff' | 'billing';
  image?: string;
  created_at?: string;
  updated_at?: string;
  staff?: {
    id: string;
    user_id: string;
    position?: string;
    bio?: string;
    commission_percentage?: number;
    is_available?: boolean;
    created_at?: string;
    updated_at?: string;
  };
} 