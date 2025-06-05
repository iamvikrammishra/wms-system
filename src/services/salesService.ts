import { supabase, Sale, SaleItem, Return, ReturnItem, Product } from '../lib/supabase';

// Extended types with additional details
export interface SaleWithItems extends Sale {
  items: (SaleItem & {
    product: Pick<Product, 'sku' | 'msku' | 'name'>;
  })[];
}

export interface ReturnWithItems extends Return {
  items: (ReturnItem & {
    product: Pick<Product, 'sku' | 'msku' | 'name'>;
  })[];
  sale: Pick<Sale, 'order_number'>;
}

export async function getAllSales(): Promise<Sale[]> {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('sale_date', { ascending: false });
    
  if (error) throw error;
  return data || [];
}

export async function getSaleById(id: string): Promise<SaleWithItems | null> {
  // Get sale data
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .select('*')
    .eq('id', id)
    .single();
    
  if (saleError && saleError.code !== 'PGRST116') throw saleError;
  if (!sale) return null;
  
  // Get sale items with product details
  const { data: items, error: itemsError } = await supabase
    .from('sale_items')
    .select(`
      *,
      product:products(id, sku, msku, name)
    `)
    .eq('sale_id', id);
    
  if (itemsError) throw itemsError;
  
  return {
    ...sale,
    items: items as unknown as SaleWithItems['items'] || []
  };
}

export async function createSale(
  sale: Omit<Sale, 'id'>,
  items: Array<Omit<SaleItem, 'id' | 'sale_id'>>
): Promise<SaleWithItems> {
  // Start a transaction
  const { error: txnError, data: { sale_id } } = await supabase.rpc('create_sale_with_items', {
    sale_data: sale,
    sale_items: items
  });
  
  if (txnError) throw txnError;
  
  // Get the created sale with items
  return await getSaleById(sale_id as string) as SaleWithItems;
}

export async function updateSaleStatus(id: string, status: string): Promise<Sale> {
  const { data, error } = await supabase
    .from('sales')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function createReturn(
  returnData: Omit<Return, 'id'>,
  items: Array<Omit<ReturnItem, 'id' | 'return_id'>>
): Promise<ReturnWithItems> {
  // Start transaction to create return and items
  const { error: txnError, data: { return_id } } = await supabase.rpc('create_return_with_items', {
    return_data: returnData,
    return_items: items
  });
  
  if (txnError) throw txnError;
  
  // Get the created return with items
  const { data, error } = await supabase
    .from('returns')
    .select(`
      *,
      items:return_items(
        *,
        product:products(id, sku, msku, name)
      ),
      sale:sales(order_number)
    `)
    .eq('id', return_id)
    .single();
  
  if (error) throw error;
  return data as unknown as ReturnWithItems;
}

// Get returns for a specific sale
export async function getReturnsBySaleId(saleId: string): Promise<ReturnWithItems[]> {
  const { data, error } = await supabase
    .from('returns')
    .select(`
      *,
      items:return_items(
        *,
        product:products(id, sku, msku, name)
      ),
      sale:sales(order_number)
    `)
    .eq('sale_id', saleId);
  
  if (error) throw error;
  return data as unknown as ReturnWithItems[] || [];
}

// Get all returns
export async function getAllReturns(): Promise<ReturnWithItems[]> {
  const { data, error } = await supabase
    .from('returns')
    .select(`
      *,
      items:return_items(
        *,
        product:products(id, sku, msku, name)
      ),
      sale:sales(order_number)
    `)
    .order('return_date', { ascending: false });
  
  if (error) throw error;
  return data as unknown as ReturnWithItems[] || [];
}
