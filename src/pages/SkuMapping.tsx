import { useState, useEffect } from "react";
import Papa from "papaparse";

// Initial example mapping
const defaultMapping: Record<string, string> = {
  "GLD": "Golden Apple",
  "Golden Apple": "Golden Apple",
  "GA123": "Golden Apple",
  "RDB": "Red Banana",
  "Red Banana": "Red Banana",
};

export default function SkuMapping() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [mappedData, setMappedData] = useState<any[]>([]);
  const [skuMap, setSkuMap] = useState<Record<string, string>>({});
  
  // For editing mapping entries
  const [newSku, setNewSku] = useState("");
  const [newMsku, setNewMsku] = useState("");
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState("");
  
  // Load mappings from localStorage on component mount
  useEffect(() => {
    const savedMappings = localStorage.getItem("skuMappings");
    if (savedMappings) {
      try {
        setSkuMap(JSON.parse(savedMappings));
      } catch (e) {
        console.error("Failed to parse saved mappings", e);
        setSkuMap(defaultMapping);
        localStorage.setItem("skuMappings", JSON.stringify(defaultMapping));
      }
    } else {
      // If no saved mappings, use default and save it
      setSkuMap(defaultMapping);
      localStorage.setItem("skuMappings", JSON.stringify(defaultMapping));
    }
  }, []);
  
  // Save mapping to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(skuMap).length > 0) {
      localStorage.setItem("skuMappings", JSON.stringify(skuMap));
    }
  }, [skuMap]);

  // Upload CSV file handling
  const handleFile = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data as any[]);
      },
    });
  };

  // Apply mapping to CSV data
  const applyMapping = () => {
    const result = csvData.map((row) => {
      // Assume CSV has a column "SKU"
      const rawSku = String(row.SKU || "").trim();
      const mapped = skuMap[rawSku] || "UNMAPPED";
      return { ...row, MSKU: mapped };
    });
    setMappedData(result);
  };
  
  // Add new SKU mapping
  const handleAddMapping = () => {
    if (!newSku.trim() || !newMsku.trim()) {
      setError("Both SKU and MSKU fields are required");
      return;
    }
    
    // Validate SKU format (optional)
    const skuPattern = /^[A-Za-z0-9\s-]{2,}$/;
    if (!skuPattern.test(newSku)) {
      setError("SKU must contain at least 2 alphanumeric characters");
      return;
    }
    
    setError("");
    setSkuMap(prev => ({
      ...prev,
      [newSku]: newMsku
    }));
    setNewSku("");
    setNewMsku("");
  };
  
  // Delete mapping by SKU
  const deleteMapping = (sku: string) => {
    const newMap = { ...skuMap };
    delete newMap[sku];
    setSkuMap(newMap);
  };
  
  // Start editing a mapping
  const startEdit = (sku: string) => {
    setEditMode(sku);
    setEditValue(skuMap[sku]);
  };
  
  // Save edited mapping
  const saveEdit = (sku: string) => {
    if (!editValue.trim()) {
      setError("MSKU cannot be empty");
      return;
    }
    setError("");
    setSkuMap(prev => ({
      ...prev,
      [sku]: editValue
    }));
    setEditMode(null);
  };
  
  // Reset to default mappings
  const resetToDefault = () => {
    if (window.confirm("Reset all mappings to default values?")) {
      setSkuMap(defaultMapping);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">SKU Mapping</h1>
      
      {/* Mapping management section */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Manage SKU Mappings</h2>
        
        {/* Add new mapping */}
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <input
              type="text"
              value={newSku}
              onChange={(e) => setNewSku(e.target.value)}
              className="border p-2 rounded w-40"
              placeholder="e.g., GLD123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MSKU (Master SKU)</label>
            <input
              type="text"
              value={newMsku}
              onChange={(e) => setNewMsku(e.target.value)}
              className="border p-2 rounded w-40"
              placeholder="e.g., Golden Apple"
            />
          </div>
          <button
            onClick={handleAddMapping}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Add Mapping
          </button>
          <button
            onClick={resetToDefault}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded ml-auto"
          >
            Reset to Default
          </button>
        </div>
        
        {/* Error message */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        {/* Mappings table */}
        <div className="max-h-60 overflow-y-auto overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 border text-left">SKU</th>
                <th className="px-4 py-2 border text-left">MSKU</th>
                <th className="px-4 py-2 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(skuMap).map(([sku, msku]) => (
                <tr key={sku}>
                  <td className="px-4 py-2 border">{sku}</td>
                  <td className="px-4 py-2 border">
                    {editMode === sku ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="border p-1 rounded w-full"
                        autoFocus
                      />
                    ) : (
                      msku
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editMode === sku ? (
                      <button
                        onClick={() => saveEdit(sku)}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs mr-2"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(sku)}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs mr-2"
                      >
                        Edit
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteMapping(sku)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* CSV Upload and Processing */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Process CSV with Mappings</h2>
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="border p-2 rounded"
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={applyMapping}
            disabled={csvData.length === 0}
          >
            Map SKUs in CSV
          </button>
        </div>

        {/* Statistics about mapping results */}
        {mappedData.length > 0 && (
          <div className="mt-4 mb-4">
            <div className="flex gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Total Rows</p>
                <p className="text-xl font-semibold">{mappedData.length}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Mapped SKUs</p>
                <p className="text-xl font-semibold">
                  {mappedData.filter(row => row.MSKU !== "UNMAPPED").length}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Unmapped SKUs</p>
                <p className="text-xl font-semibold">
                  {mappedData.filter(row => row.MSKU === "UNMAPPED").length}
                </p>
              </div>
            </div>
            
            <h3 className="font-medium mt-4 mb-2">Preview (First 5 Rows)</h3>
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr>
                  {Object.keys(mappedData[0]).map((col) => (
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
                {mappedData.slice(0, 5).map((row, idx) => (
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
    </div>
  );
}