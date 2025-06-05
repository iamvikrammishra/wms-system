import { useState, useEffect } from "react";
import Papa from "papaparse";
import { bulkImportProducts } from "../services/productService";
import { bulkUpdateInventory } from "../services/inventoryService";
import { ensureDefaultWarehouse } from "../services/warehouseService";
import { Product } from "../lib/supabase";

export default function DataUpload() {
  const [rawCsvData, setRawCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [defaultWarehouseId, setDefaultWarehouseId] = useState<string>("");

  // Load previously saved data and get the default warehouse ID
  useEffect(() => {
    async function init() {
      // For backward compatibility, still check localStorage
      const savedData = localStorage.getItem("lastCSVData");
      if (savedData) {
        try {
          setRawCsvData(JSON.parse(savedData));
          setSaveMessage("Previously saved data loaded");
        } catch (error) {
          console.error("Error parsing saved data:", error);
        }
      }

      // Get default warehouse ID
      try {
        const warehouse = await ensureDefaultWarehouse();
        setDefaultWarehouseId(warehouse.id);
      } catch (error) {
        console.error("Error getting default warehouse:", error);
        setSaveMessage("Error connecting to database. Check your configuration.");
      }
    }
    
    init();
  }, []);

  // Handle file selection
  const handleFile = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setSaveMessage(""); // Clear any previous message
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // results.data is an array of row objects
        setRawCsvData(results.data as any[]);
      },
    });
  };

  // Save data to Supabase database
  const saveData = async () => {
    if (rawCsvData.length === 0) {
      setSaveMessage("No data to save");
      return;
    }

    if (!defaultWarehouseId) {
      setSaveMessage("Error: No default warehouse found. Check database connection.");
      return;
    }
    
    setLoading(true);
    setSaveMessage("Saving data to database...");
    
    try {
      // Format products for the database
      const productsToSave = rawCsvData.map(row => ({
        sku: row.SKU || row.sku || '',
        msku: row.MSKU || row.msku || 'UNMAPPED',
        name: row.ProductName || row.Name || row.SKU || row.sku || 'Unknown Product',
        description: row.Description || row.description || '',
      }));
      
      // Save products to database
      const savedProducts = await bulkImportProducts(productsToSave);
      
      // Prepare inventory updates
      const inventoryUpdates = savedProducts.map((product, index) => {
        // Try to find the quantity in the CSV data
        const quantity = parseInt(rawCsvData[index].Quantity || rawCsvData[index].quantity || '0', 10);
        
        return {
          product_id: product.id,
          warehouse_id: defaultWarehouseId,
          quantity
        };
      });
      
      // Update inventory quantities
      await bulkUpdateInventory(inventoryUpdates);
      
      // For backward compatibility, still save to localStorage
      localStorage.setItem("lastCSVData", JSON.stringify(rawCsvData));
      
      setSaveMessage(`Data saved successfully! ${rawCsvData.length} records imported to database.`);
    } catch (error) {
      console.error("Error saving data:", error);
      setSaveMessage(`Error saving data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Data Upload</h1>
      
      {/* File upload section */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-3">Upload CSV File</h2>
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="border p-2 rounded"
          />
          {fileName && <span className="text-sm text-gray-600">File: {fileName}</span>}
        </div>

        {/* Save button */}
        {rawCsvData.length > 0 && (
          <div className="mt-4">
            <button 
              onClick={saveData}
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Saving to Database...' : 'Save to Database'}
            </button>
          </div>
        )}

        {/* Feedback message */}
        {saveMessage && (
          <div className={`mt-3 p-2 rounded text-sm ${saveMessage.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {saveMessage}
          </div>
        )}
      </div>
      {rawCsvData.length > 0 && (
        <div className="mt-4 overflow-x-auto max-w-full">
          <table className="w-full table-auto border-collapse">
            <thead>
            <tr>
              {/* Dynamically generate headers */}
              {Object.keys(rawCsvData[0]).map((col) => (
                <th
                  key={col}
                  className="px-2 py-1 border bg-gray-100 text-left text-sm"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rawCsvData.slice(0, 5).map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((val, i) => (
                  <td key={i} className="px-2 py-1 border text-sm">
                    {val as string} 
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}