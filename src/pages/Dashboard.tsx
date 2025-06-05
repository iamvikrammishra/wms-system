// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Import services for Supabase integration
import { getInventory, InventoryWithDetails } from '../services/inventoryService';

// Color palette for charts
const CHART_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#84cc16", "#d946ef"
];

// Features for navigation cards
const features = [
  {
    id: 'sku-upload',
    title: 'Data Upload',
    description: 'Upload CSV files with inventory data',
    icon: (
      <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
      </svg>
    ),
    path: '/data-upload',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'sku-mapping',
    title: 'SKU Mapping',
    description: 'Map SKUs to MSKUs with editable mappings',
    icon: (
      <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
      </svg>
    ),
    path: '/sku-mapping',
    color: 'bg-purple-50 border-purple-200',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Visualize inventory with bar, pie, and line charts',
    icon: (
      <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>
    ),
    path: '/analytics',
    color: 'bg-green-50 border-green-200',
  },
  {
    id: 'ai-query',
    title: 'AI Insights',
    description: 'Query your data with natural language AI',
    icon: (
      <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
      </svg>
    ),
    path: '/ai-query',
    color: 'bg-amber-50 border-amber-200',
  },
];

// Previously used hardcoded metrics - now using dynamic metrics from actual data
// const metrics = [
//   {
//     title: 'Total Products',
//     value: '1,313',
//     change: '+12%',
//     trend: 'up',
//     description: 'From last month',
//     color: 'bg-blue-500',
//   },
//   {
//     title: 'Unique MSKUs',
//     value: '27',
//     change: '+3',
//     trend: 'up',
//     description: 'New mappings added',
//     color: 'bg-purple-500',
//   },
//   {
//     title: 'Total Inventory',
//     value: '29,842',
//     change: '-8%',
//     trend: 'down',
//     description: 'Units across all warehouses',
//     color: 'bg-emerald-500',
//   },
//   {
//     title: 'AI Queries',
//     value: '56',
//     change: '+24%',
//     trend: 'up',
//     description: 'Data insights generated',
//     color: 'bg-amber-500',
//   },
// ];

export default function Dashboard() {
  // Time state
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Data states
  const [inventoryData, setInventoryData] = useState<InventoryWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState<any[]>([]);
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  
  // Load data from Supabase
  useEffect(() => {
  async function loadData() {
    try {
      setLoading(true);
      
      // Fetch inventory data from Supabase
      const data = await getInventory();
      
      if (data && data.length > 0) {
        setInventoryData(data);
        
        // Load AI query history from localStorage
        const queryHistoryData = localStorage.getItem('aiQueryHistory');
        if (queryHistoryData) {
          setQueryHistory(JSON.parse(queryHistoryData));
        } else {
          // Initialize with empty array if no history exists
          setQueryHistory([]);
        }
      } else {
        setError('No inventory data available');
      }
    } catch (err) {
      console.error('Error loading inventory data:', err);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  }
  loadData();
}, []);

// Format date
const formattedDate = currentTime.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// Process inventory data to create chart data
function processChartData() {
  if (!inventoryData || inventoryData.length === 0) return [];
  
  // Group by MSKU and sum quantities
  const groupedData = inventoryData.reduce((acc: Record<string, number>, item) => {
    const msku = item.product?.msku || item.product?.sku || 'Unknown'; // Use MSKU if available, otherwise use SKU
    if (!acc[msku]) {
      acc[msku] = 0;
    }
    acc[msku] += item.quantity || 0;
    return acc;
  }, {});
  
  // Convert to array format for chart
  return Object.entries(groupedData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // Sort by quantity descending
}

// Function to generate inventory trend data
function generateTrendData() {
  // Only generate if we have data
  if (!inventoryData || inventoryData.length === 0) {
    return [];
  }
  
  // In a real app, we'd query historical data from Supabase
  // For the demo, we'll create some mock trend data
  const today = new Date();
  const trendData = [];
  
  // Get total quantity from current inventory data
  const totalQty = inventoryData.reduce(
    (sum: number, item) => sum + (item.quantity || 0), 0
  );
  
  // Create data for last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Format date as M/D
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    
    // Add some random variation with an upward trend
    // More recent days have higher values to simulate inventory growth
    const factor = 0.85 + (i * 0.025) + (Math.random() * 0.05);
    const adjustedQty = Math.round(totalQty * factor);
    
    trendData.push({
      date: dateStr,
      quantity: adjustedQty
    });
  }
  
  return trendData;
}

// Generate data for charts
const chartData = processChartData();
const trendData = generateTrendData();

// Calculate dashboard metrics
const dashboardMetrics = {
  totalProducts: inventoryData ? new Set(inventoryData.map(item => item.product?.sku)).size : 0,
  uniqueMSKUs: inventoryData ? new Set(inventoryData.map(item => item.product?.msku || 'Unknown')).size : 0,
  totalQuantity: inventoryData ? inventoryData.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0,
  topMSKU: chartData[0]?.name || "None",
  aiQueries: queryHistory.length
};
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Dashboard header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Warehouse Management System</h1>
          <p className="text-gray-600 mt-1">
            Dashboard overview for <span className="text-gray-800 font-medium">{formattedDate}</span>
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium">System Status: Operational</span>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <div className="h-1 bg-blue-500"></div>
          <div className="p-5">
            <h2 className="text-gray-500 text-sm font-medium mb-1">Total Products</h2>
            <div className="flex items-baseline">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                {dashboardMetrics.totalProducts.toLocaleString()}
              </span>
              <span className="ml-2 text-xs font-medium text-green-600 bg-green-50 rounded-full px-2 py-0.5">
                Products
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">All inventory items</p>
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <div className="h-1 bg-purple-500"></div>
          <div className="p-5">
            <h2 className="text-gray-500 text-sm font-medium mb-1">Unique MSKUs</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{dashboardMetrics.uniqueMSKUs.toLocaleString()}</span>
              <span className="text-xs font-medium text-gray-600">
                categories
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">From mapped SKUs</p>
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <div className="h-1 bg-emerald-500"></div>
          <div className="p-5">
            <h2 className="text-gray-500 text-sm font-medium mb-1">Total Inventory</h2>
            <div className="flex items-baseline">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                {dashboardMetrics.totalQuantity.toLocaleString()}
              </span>
              <span className="ml-2 text-xs font-medium text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">
                Units
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Total quantity across MSKUs</p>
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <div className="h-1 bg-amber-500"></div>
          <div className="p-5">
            <h2 className="text-gray-500 text-sm font-medium mb-1">AI Queries</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{dashboardMetrics.aiQueries.toLocaleString()}</span>
              <span className="text-xs font-medium text-gray-600">
                insights
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Data analysis queries</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-8 mb-8 text-center border border-gray-100 shadow-sm">
          <svg className="animate-spin w-16 h-16 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Loading inventory data...</h3>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl p-8 mb-8 text-center border border-red-100 shadow-sm">
          <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading Data</h3>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-4">
            <Link to="/data-upload" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              Go to Data Upload
            </Link>
          </div>
        </div>
      ) : inventoryData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Inventory Trend */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 lg:col-span-2">
            <div className="p-5 border-b">
              <h2 className="text-lg font-medium text-gray-900">Inventory Trend</h2>
              <p className="text-sm text-gray-500">Last 7 days inventory levels</p>
            </div>
            <div className="p-5 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="quantity" 
                    name="Total Inventory"
                    stroke={CHART_COLORS[0]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Distribution */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="p-5 border-b">
              <h2 className="text-lg font-medium text-gray-900">Product Distribution</h2>
              <p className="text-sm text-gray-500">By MSKU category</p>
            </div>
            <div className="p-5 h-[300px] flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.slice(0, 5)} // Only show top 5 MSKUs
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.slice(0, 5).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 mb-8 text-center border border-gray-100 shadow-sm">
          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No inventory data available</h3>
          <p className="mt-2 text-gray-600">
            Upload a CSV file in the Data Upload section to visualize your inventory data.
          </p>
          <div className="mt-4">
            <Link to="/data-upload" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              Go to Data Upload
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Feature navigation */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">WMS Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link 
              key={feature.id} 
              to={feature.path}
              className={`block p-6 rounded-xl border ${feature.color} hover:shadow-md transition-shadow duration-200`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Project information */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Project</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Project Overview</h3>
            <p className="text-gray-600 mb-4">
              This Warehouse Management System (WMS) provides comprehensive inventory management with dynamic SKU to MSKU mapping, 
              advanced analytics visualizations, and AI-powered data insights using natural language processing.  
            </p>
            <p className="text-gray-600">
              Upload your inventory data, map SKUs to meaningful names, analyze distribution patterns with multiple chart types, 
              and query your data using natural language.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Key Features</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>CSV data upload and processing</li>
              <li>Dynamic and persistent SKU to MSKU mapping</li>
              <li>Multiple visualization types (bar, line, pie charts and tables)</li>
              <li>Natural language AI querying with GPT-4o-mini</li>
              <li>Interactive dashboards with actionable insights</li>
              <li>Modern, responsive UI built with React and Tailwind CSS</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}