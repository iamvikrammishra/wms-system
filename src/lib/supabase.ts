import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase credentials
// In production, these should be environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
