import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { useState } from "react";
import Papa from "papaparse";

// Chart type options
type ChartType = "bar" | "line" | "pie" | "table";

// Color palette for charts
const CHART_COLORS = [
  "#2563eb", "#db2777", "#16a34a", "#ea580c", 
  "#8b5cf6", "#0891b2", "#65a30d", "#9f1239",
  "#7e22ce", "#0369a1", "#15803d", "#b91c1c",
  "#4f46e5", "#0e7490", "#4d7c0f", "#be123c"
];

export default function Analytics() {
  const [mappedData, setMappedData] = useState<any[]>([]);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [fileName, setFileName] = useState<string>("");

  const handleFile = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // results.data contains MSKU column now
        setMappedData(results.data as any[]);
      },
    });
  };

  // Aggregate total quantity by MSKU (assuming "Quantity" column exists)
  const aggregated = () => {
    const sums: Record<string, number> = {};
    mappedData.forEach((row) => {
      const msku = row.MSKU || "UNMAPPED";
      const qty = Number(row.Quantity || 0);
      sums[msku] = (sums[msku] || 0) + qty;
    });
    // Convert to array of objects for recharts
    return Object.entries(sums)
      .map(([msku, total]) => ({
        MSKU: msku,
        TotalQuantity: total,
      }))
      .sort((a, b) => b.TotalQuantity - a.TotalQuantity); // Sort by quantity descending
  };

  const chartData = aggregated();

  // Function to render the selected chart type
  const renderChart = () => {
    if (chartData.length === 0) return null;
    
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="MSKU" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="TotalQuantity" fill="#2563eb" name="Total Quantity" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="MSKU" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="TotalQuantity" 
                stroke="#2563eb" 
                activeDot={{ r: 8 }} 
                name="Total Quantity"
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="TotalQuantity"
                nameKey="MSKU"
                label={({ MSKU, percent }) => `${MSKU}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} units`, 'Quantity']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case "table":
        return (
          <div className="overflow-x-auto max-w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MSKU</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chartData.map((item, idx) => {
                  const totalSum = chartData.reduce((sum, item) => sum + item.TotalQuantity, 0);
                  const percentage = (item.TotalQuantity / totalSum * 100).toFixed(1);
                  
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.MSKU}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.TotalQuantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Calculate total quantity
  const totalQuantity = chartData.reduce((sum, item) => sum + item.TotalQuantity, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Analytics Dashboard</h1>
      
      {/* File upload section */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-3">Upload Mapped CSV</h2>
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="border p-2 rounded"
          />
          <p className="text-sm text-gray-600">
            {fileName ? `File: ${fileName}` : "Upload a CSV with MSKU and Quantity columns"}
          </p>
        </div>
      </div>
      
      {/* Analytics content */}
      {chartData.length > 0 ? (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          {/* Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-blue-50">
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-semibold">{mappedData.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50">
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-2xl font-semibold">{totalQuantity.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50">
              <p className="text-sm text-gray-600">Unique MSKUs</p>
              <p className="text-2xl font-semibold">{chartData.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50">
              <p className="text-sm text-gray-600">Top MSKU</p>
              <p className="text-2xl font-semibold">
                {chartData.length > 0 ? chartData[0].MSKU : "--"}
              </p>
            </div>
          </div>
          
          {/* Chart type selector */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button 
              className={`px-4 py-2 rounded ${chartType === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => setChartType("bar")}
            >
              Bar Chart
            </button>
            <button 
              className={`px-4 py-2 rounded ${chartType === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => setChartType("line")}
            >
              Line Chart
            </button>
            <button 
              className={`px-4 py-2 rounded ${chartType === 'pie' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => setChartType("pie")}
            >
              Pie Chart
            </button>
            <button 
              className={`px-4 py-2 rounded ${chartType === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => setChartType("table")}
            >
              Data Table
            </button>
          </div>
          
          {/* Render selected chart */}
          {renderChart()}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No data to analyze</h3>
          <p className="mt-2 text-gray-600">
            Upload a CSV file with MSKU and Quantity columns to visualize your inventory data.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Make sure your CSV has been processed through SKU Mapping first to ensure proper MSKU values.
          </p>
        </div>
      )}
    </div>
  );
}