import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase credentials
// In production, these should be environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create a mock client if credentials are not available
const createMockClient = () => {
  console.warn('Using mock Supabase client. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  return {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
    }),
    auth: {
      signIn: () => Promise.resolve({ user: null, session: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
  };
};

// Use real client if credentials are available, otherwise use mock
export const supabase = supabaseUrl && supabaseUrl !== 'https://your-supabase-project.supabase.co' 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient() as any;

// Types for database tables
export type Tables = {
  products: Product;
  warehouses: Warehouse;
  inventory: Inventory;
  sales: Sale;
  sale_items: SaleItem;
  returns: Return;
  return_items: ReturnItem;
}

export interface Product {
  id: string;
  sku: string;
  msku: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  created_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  last_updated: string;
}

export interface Sale {
  id: string;
  order_number: string;
  customer_name?: string;
  sale_date: string;
  total_amount: number;
  status: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface Return {
  id: string;
  sale_id: string;
  return_date: string;
  reason?: string;
  status: string;
}

export interface ReturnItem {
  id: string;
  return_id: string;
  product_id: string;
  quantity: number;
}
