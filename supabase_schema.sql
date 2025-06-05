-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR NOT NULL UNIQUE,
  msku VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  location VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inventory table (connects Products and Warehouses)
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products (id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses (id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, warehouse_id)
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR NOT NULL UNIQUE,
  customer_name VARCHAR,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'completed'
);

-- Sale_items table (connects Sales and Products)
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales (id) ON DELETE CASCADE,
  product_id UUID REFERENCES products (id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL
);

-- Returns table
CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales (id) ON DELETE CASCADE,
  return_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reason TEXT,
  status VARCHAR NOT NULL DEFAULT 'pending'
);

-- Return_items table (what items were returned)
CREATE TABLE IF NOT EXISTS return_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_id UUID REFERENCES returns (id) ON DELETE CASCADE,
  product_id UUID REFERENCES products (id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_msku ON products(msku);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_returns_sale ON returns(sale_id);

-- Create stored procedures for transactions
-- Create a sale with items in a single transaction
CREATE OR REPLACE FUNCTION create_sale_with_items(
  sale_data jsonb,
  sale_items jsonb
) RETURNS jsonb AS $$
DECLARE
  new_sale_id UUID;
  item jsonb;
  result jsonb;
BEGIN
  -- Insert the sale
  INSERT INTO sales (
    order_number, 
    customer_name, 
    sale_date, 
    total_amount, 
    status
  )
  VALUES (
    sale_data->>'order_number',
    sale_data->>'customer_name',
    COALESCE((sale_data->>'sale_date')::timestamp with time zone, now()),
    (sale_data->>'total_amount')::decimal,
    COALESCE(sale_data->>'status', 'completed')
  )
  RETURNING id INTO new_sale_id;
  
  -- Insert each sale item
  FOR item IN SELECT * FROM jsonb_array_elements(sale_items)
  LOOP
    INSERT INTO sale_items (
      sale_id,
      product_id,
      quantity,
      unit_price
    )
    VALUES (
      new_sale_id,
      item->>'product_id',
      (item->>'quantity')::integer,
      (item->>'unit_price')::decimal
    );
    
    -- Update inventory (decrease quantity)
    UPDATE inventory
    SET quantity = quantity - (item->>'quantity')::integer,
        last_updated = now()
    WHERE product_id = (item->>'product_id')::uuid;
  END LOOP;
  
  -- Return the created sale id
  result := jsonb_build_object('sale_id', new_sale_id);
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a return with items in a single transaction
CREATE OR REPLACE FUNCTION create_return_with_items(
  return_data jsonb,
  return_items jsonb
) RETURNS jsonb AS $$
DECLARE
  new_return_id UUID;
  item jsonb;
  result jsonb;
BEGIN
  -- Insert the return
  INSERT INTO returns (
    sale_id,
    return_date,
    reason,
    status
  )
  VALUES (
    return_data->>'sale_id',
    COALESCE((return_data->>'return_date')::timestamp with time zone, now()),
    return_data->>'reason',
    COALESCE(return_data->>'status', 'pending')
  )
  RETURNING id INTO new_return_id;
  
  -- Insert each return item
  FOR item IN SELECT * FROM jsonb_array_elements(return_items)
  LOOP
    INSERT INTO return_items (
      return_id,
      product_id,
      quantity
    )
    VALUES (
      new_return_id,
      item->>'product_id',
      (item->>'quantity')::integer
    );
    
    -- Update inventory (increase quantity for returns)
    UPDATE inventory
    SET quantity = quantity + (item->>'quantity')::integer,
        last_updated = now()
    WHERE product_id = (item->>'product_id')::uuid;
  END LOOP;
  
  -- Return the created return id
  result := jsonb_build_object('return_id', new_return_id);
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert a default warehouse if none exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM warehouses LIMIT 1) THEN
    INSERT INTO warehouses (name, location)
    VALUES ('Main Warehouse', 'Default Location');
  END IF;
END
$$;
