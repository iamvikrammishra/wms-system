import { Product, InventoryStats, InventoryMovement, CategoryDistribution, SkuMapping } from '../types';

// Helper function to generate random dates within the past month
const getRandomDate = () => {
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

// Mock Products Data
export const mockProducts: Product[] = [
  {
    id: 'p001',
    sku: 'SKU-001-ABC',
    name: 'Wireless Headphones',
    category: 'Electronics',
    quantity: 237,
    location: 'Rack A-12',
    lastUpdated: '2023-10-15',
    status: 'In Stock',
  },
  {
    id: 'p002',
    sku: 'SKU-002-DEF',
    name: 'Desktop Monitor 24"',
    category: 'Electronics',
    quantity: 52,
    location: 'Rack B-3',
    lastUpdated: '2023-10-14',
    status: 'In Stock',
  },
  {
    id: 'p003',
    sku: 'SKU-003-GHI',
    name: 'Leather Jacket',
    category: 'Apparel',
    quantity: 15,
    location: 'Section C-5',
    lastUpdated: '2023-10-10',
    status: 'Low Stock',
  },
  {
    id: 'p004',
    sku: 'SKU-004-JKL',
    name: 'Ceramic Coffee Mug',
    category: 'Home Goods',
    quantity: 423,
    location: 'Rack D-8',
    lastUpdated: '2023-10-16',
    status: 'In Stock',
  },
  {
    id: 'p005',
    sku: 'SKU-005-MNO',
    name: 'Running Shoes',
    category: 'Footwear',
    quantity: 0,
    location: 'Section E-2',
    lastUpdated: '2023-10-13',
    status: 'Out of Stock',
  },
  {
    id: 'p006',
    sku: 'SKU-006-PQR',
    name: 'Smartphone Case',
    category: 'Accessories',
    quantity: 189,
    location: 'Bin F-7',
    lastUpdated: '2023-10-12',
    status: 'In Stock',
  },
  {
    id: 'p007',
    sku: 'SKU-007-STU',
    name: 'Yoga Mat',
    category: 'Fitness',
    quantity: 5,
    location: 'Section G-4',
    lastUpdated: '2023-10-11',
    status: 'Low Stock',
  },
  {
    id: 'p008',
    sku: 'SKU-008-VWX',
    name: 'Stainless Steel Water Bottle',
    category: 'Home Goods',
    quantity: 108,
    location: 'Rack H-6',
    lastUpdated: '2023-10-09',
    status: 'In Stock',
  }
];

// Mock Inventory Stats
export const inventoryStats: InventoryStats = {
  totalProducts: 1029,
  totalValue: 1243750,
  lowStockItems: 48,
  outOfStockItems: 23,
};

// Mock Inventory Movements Data
export const inventoryMovements: InventoryMovement[] = [
  { date: '2023-10-10', inbound: 124, outbound: 80 },
  { date: '2023-10-11', inbound: 85, outbound: 97 },
  { date: '2023-10-12', inbound: 112, outbound: 68 },
  { date: '2023-10-13', inbound: 75, outbound: 110 },
  { date: '2023-10-14', inbound: 60, outbound: 45 },
  { date: '2023-10-15', inbound: 98, outbound: 72 },
  { date: '2023-10-16', inbound: 135, outbound: 89 },
];

// Mock Category Distribution
export const categoryDistribution: CategoryDistribution[] = [
  { name: 'Electronics', value: 358, color: '#3B82F6' },
  { name: 'Apparel', value: 245, color: '#10B981' },
  { name: 'Home Goods', value: 186, color: '#F59E0B' },
  { name: 'Footwear', value: 97, color: '#8B5CF6' },
  { name: 'Accessories', value: 143, color: '#EC4899' },
];

// Mock SKU Mappings
export const skuMappings: SkuMapping[] = [
  {
    id: 'm001',
    internalSku: 'SKU-001-ABC',
    externalSku: 'WH-001',
    source: 'Amazon',
    lastMapped: '2023-10-01',
  },
  {
    id: 'm002',
    internalSku: 'SKU-002-DEF',
    externalSku: 'MON-24-BLK',
    source: 'Shopify',
    lastMapped: '2023-10-03',
  },
  {
    id: 'm003',
    internalSku: 'SKU-003-GHI',
    externalSku: 'LJ-M-BRN',
    source: 'eBay',
    lastMapped: '2023-10-05',
  },
  {
    id: 'm004',
    internalSku: 'SKU-004-JKL',
    externalSku: 'CM-BLU-12OZ',
    source: 'Walmart',
    lastMapped: '2023-10-02',
  },
  {
    id: 'm005',
    internalSku: 'SKU-005-MNO',
    externalSku: 'RUN-10-BLK',
    source: 'Shopify',
    lastMapped: '2023-10-07',
  },
  {
    id: 'm006',
    internalSku: 'SKU-006-PQR',
    externalSku: 'CASE-IP13-CLR',
    source: 'Amazon',
    lastMapped: '2023-09-28',
  },
];