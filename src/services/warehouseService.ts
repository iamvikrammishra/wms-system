import { supabase, Warehouse } from '../lib/supabase';

export async function getAllWarehouses(): Promise<Warehouse[]> {
  const { data, error } = await supabase
    .from('warehouses')
    .select('*');
    
  if (error) throw error;
  return data || [];
}

export async function getWarehouseById(id: string): Promise<Warehouse | null> {
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createWarehouse(warehouse: Omit<Warehouse, 'id' | 'created_at'>): Promise<Warehouse> {
  const { data, error } = await supabase
    .from('warehouses')
    .insert([warehouse])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateWarehouse(id: string, updates: Partial<Omit<Warehouse, 'id' | 'created_at'>>): Promise<Warehouse> {
  const { data, error } = await supabase
    .from('warehouses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteWarehouse(id: string): Promise<void> {
  const { error } = await supabase
    .from('warehouses')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

// Create a default warehouse if none exists
export async function ensureDefaultWarehouse(): Promise<Warehouse> {
  // Check if we have any warehouses
  const { data: warehouses } = await supabase
    .from('warehouses')
    .select('*')
    .limit(1);
  
  // If no warehouses, create a default one
  if (!warehouses || warehouses.length === 0) {
    const defaultWarehouse = {
      name: 'Main Warehouse',
      location: 'Default Location',
    };
    
    const { data, error } = await supabase
      .from('warehouses')
      .insert([defaultWarehouse])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  return warehouses[0];
}
