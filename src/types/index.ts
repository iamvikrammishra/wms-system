// Type definitions for the Warehouse Management System

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  lastUpdated: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface InventoryMovement {
  date: string;
  inbound: number;
  outbound: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export interface SkuMapping {
  id: string;
  internalSku: string;
  externalSku: string;
  source: string;
  lastMapped: string;
}