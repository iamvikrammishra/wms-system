import { supabase, Product } from '../lib/supabase';

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*');
    
  if (error) throw error;
  return data || [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
  return data;
}

export async function getProductBySku(sku: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('sku', sku)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

export async function bulkImportProducts(products: Array<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product[]> {
  // First check existing SKUs to avoid duplication
  const skus = products.map(p => p.sku);
  const { data: existingProducts } = await supabase
    .from('products')
    .select('sku, id')
    .in('sku', skus);
  
  // Create a map of existing SKUs for quick lookup
  const existingSkuMap = new Map(existingProducts?.map(p => [p.sku, p.id]) || []);
  
  // Split products into those that need to be created vs updated
  const productsToCreate = products.filter(p => !existingSkuMap.has(p.sku));
  const productsToUpdate = products.filter(p => existingSkuMap.has(p.sku))
    .map(p => ({ id: existingSkuMap.get(p.sku)!, ...p }));
  
  // Perform bulk insert for new products
  const newProducts = productsToCreate.length > 0 
    ? await supabase.from('products').insert(productsToCreate).select() 
    : { data: [] };
  
  // Perform bulk update for existing products
  for (const product of productsToUpdate) {
    const id = product.id;
    delete product.id; // Remove id from the update object
    await supabase
      .from('products')
      .update({ ...product, updated_at: new Date().toISOString() })
      .eq('id', id);
  }
  
  // Get the updated products
  const { data: updatedProducts } = await supabase
    .from('products')
    .select('*')
    .in('id', productsToUpdate.map(p => p.id));
  
  // Combine new and updated products
  return [...(newProducts.data || []), ...(updatedProducts || [])];
}
