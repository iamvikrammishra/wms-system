import { supabase, Inventory, Product, Warehouse } from '../lib/supabase';

// Extend the Inventory type with product and warehouse details for display
export interface InventoryWithDetails extends Inventory {
  product: Pick<Product, 'sku' | 'msku' | 'name'>;
  warehouse: Pick<Warehouse, 'name'>;
}

export async function getInventory(): Promise<InventoryWithDetails[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      product:products(id, sku, msku, name),
      warehouse:warehouses(id, name)
    `);
    
  if (error) throw error;
  return (data || []) as unknown as InventoryWithDetails[];
}

export async function getInventoryByProductId(productId: string): Promise<InventoryWithDetails[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      product:products(id, sku, msku, name),
      warehouse:warehouses(id, name)
    `)
    .eq('product_id', productId);
    
  if (error) throw error;
  return (data || []) as unknown as InventoryWithDetails[];
}

export async function getInventoryByWarehouseId(warehouseId: string): Promise<InventoryWithDetails[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      product:products(id, sku, msku, name),
      warehouse:warehouses(id, name)
    `)
    .eq('warehouse_id', warehouseId);
    
  if (error) throw error;
  return (data || []) as unknown as InventoryWithDetails[];
}

export async function updateInventoryQuantity(
  productId: string, 
  warehouseId: string, 
  quantity: number
): Promise<Inventory> {
  // Check if inventory record exists
  const { data: existing } = await supabase
    .from('inventory')
    .select('*')
    .eq('product_id', productId)
    .eq('warehouse_id', warehouseId)
    .single();

  if (existing) {
    // Update existing record
    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity, last_updated: new Date().toISOString() })
      .eq('product_id', productId)
      .eq('warehouse_id', warehouseId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } else {
    // Create new record
    const { data, error } = await supabase
      .from('inventory')
      .insert([{ 
        product_id: productId, 
        warehouse_id: warehouseId, 
        quantity, 
        last_updated: new Date().toISOString() 
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
}

export async function bulkUpdateInventory(
  updates: Array<{ product_id: string; warehouse_id: string; quantity: number; }>
): Promise<void> {
  // Process in batches to avoid hitting API limits
  const batchSize = 50;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    
    // Process each item in the batch
    for (const item of batch) {
      await updateInventoryQuantity(
        item.product_id,
        item.warehouse_id,
        item.quantity
      );
    }
  }
}
