// src/pages/AiQuery.tsx
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// AI query templates to help users get started
const QUERY_TEMPLATES = [
  "What is the total quantity of each MSKU?",
  "Which MSKU has the highest quantity?",
  "Show the average quantity per MSKU",
  "Calculate the percentage distribution of MSKUs",
  "Identify any MSKUs with fewer than 10 items",
  "Compare quantities between Golden Apple and Red Banana",
  "Summarize the inventory distribution"
];

type AnalysisResult = {
  type: 'text' | 'chart' | 'table';
  content: string;
  chartData?: any[];
  tableHeaders?: string[];
  tableRows?: any[][];
};

export default function AiQuery() {
  const [question, setQuestion] = useState("");
  const [csvText, setCsvText] = useState("");       // raw CSV as string
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'standard' | 'advanced'>('standard');
  const [historyVisible, setHistoryVisible] = useState(false);
  
  // Store query history in localStorage
  const [queryHistory, setQueryHistory] = useState<{question: string; timestamp: number}[]>([]);
  
  // Load query history from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('aiQueryHistory');
      if (savedHistory) {
        setQueryHistory(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error("Failed to load query history", err);
    }
  }, []);
  
  // Save query history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('aiQueryHistory', JSON.stringify(queryHistory));
    } catch (err) {
      console.error("Failed to save query history", err);
    }
  }, [queryHistory]);

  // Helper function to try parsing AI response as JSON for visualization
  const tryParseResult = (text: string): AnalysisResult => {
    // Default to text display
    const result: AnalysisResult = {
      type: 'text',
      content: text
    };

    try {
      // Check if the response contains embedded JSON for chart or table
      if (text.includes('```json') && text.includes('```')) {
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          const parsedData = JSON.parse(jsonMatch[1]);
          
          // Handle chart data
          if (parsedData.type === 'chart' && Array.isArray(parsedData.data)) {
            result.type = 'chart';
            result.chartData = parsedData.data;
            // Extract the text content outside of the JSON block
            result.content = text.replace(/```json[\s\S]*?```/, '').trim();
            return result;
          }
          
          // Handle table data
          if (parsedData.type === 'table' && 
              Array.isArray(parsedData.headers) && 
              Array.isArray(parsedData.rows)) {
            result.type = 'table';
            result.tableHeaders = parsedData.headers;
            result.tableRows = parsedData.rows;
            result.content = text.replace(/```json[\s\S]*?```/, '').trim();
            return result;
          }
        }
      }
    } catch (err) {
      console.log("Failed to parse visualization data", err);
      // Fallback to plain text
    }
    
    return result;
  };

  // 1) Read the CSV file as raw text when user uploads
  const handleCsvUpload = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (!file) return;
    
    // Store the file name for display
    setCsvFileName(file.name);
    
    const reader = new FileReader();

    reader.onload = () => {
      // reader.result is a string containing the entire CSV text
      setCsvText(reader.result as string);
      // Reset previous query results when new file is loaded
      setAnswer(null);
      setAnalysisResult(null);
      setErrorMsg(null);
    };
    
    reader.onerror = () => {
      console.error("Error reading CSV file");
      setErrorMsg("Failed to read CSV file. Please try again.");
    };

    reader.readAsText(file);
  };

  // Apply a query template
  const applyTemplate = (template: string) => {
    setQuestion(template);
  };
  
  // Add to query history
  const addToHistory = (q: string) => {
    // Add to beginning of array, limit to last 10 queries
    const updatedHistory = [
      { question: q, timestamp: Date.now() },
      ...queryHistory
    ].slice(0, 10);
    
    setQueryHistory(updatedHistory);
  };

  // Clear query history
  const clearHistory = () => {
    setQueryHistory([]);
    setHistoryVisible(false);
  };

  // 2) Send question + csvText to backend
  const handleAsk = async () => {
    if (!question.trim() || !csvText) {
      setErrorMsg("Please upload a CSV file and type your question.");
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    setAnswer(null);
    setAnalysisResult(null);
    
    // Save to history
    addToHistory(question);

    try {
      // Use prompt enhancement for advanced mode
      let enhancedQuestion = question;
      if (displayMode === 'advanced') {
        enhancedQuestion = `${question} If possible, provide your answer with visualization data in JSON format. For charts, use format: {"type":"chart","data":[{key:value}]}. For tables, use format: {"type":"table","headers":[...],"rows":[[...]]}`;
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const resp = await fetch(`${apiUrl}/api/ai-query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: enhancedQuestion, 
          csvText 
        }),
      });

      if (!resp.ok) {
        const body = await resp.json();
        throw new Error(body.error || "Unknown error from server");
      }

      const data = await resp.json();
      setAnswer(data.answer);
      
      // Try to parse the result for visualization
      if (displayMode === 'advanced') {
        const parsedResult = tryParseResult(data.answer);
        setAnalysisResult(parsedResult);
      }
    } catch (err: any) {
      console.error("Error calling /api/ai-query:", err);
      setErrorMsg(err.message || "Failed to get a response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-2">AI Data Insight</h1>
      
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setDisplayMode(displayMode === 'standard' ? 'advanced' : 'standard')}
          className="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 flex items-center gap-1"
        >
          {displayMode === 'standard' ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Advanced Mode
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Standard Mode
            </>
          )}
        </button>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* 1: Upload CSV */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-3">Upload CSV Data</h2>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="border p-2 rounded w-full"
            />
            {csvText && (
              <div className="mt-2 text-sm">
                <span className="font-medium text-green-600">✓ CSV loaded:</span>
                <span className="ml-1 text-gray-600">
                  {csvFileName || "data.csv"} ({csvText.length.toLocaleString()} bytes)
                </span>
              </div>
            )}
          </div>

          {/* 2: Question Input */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-3">Ask about your data</h2>
            <textarea
              placeholder="e.g. What were total quantities for Golden Apple?"
              className="w-full border p-3 rounded min-h-[80px]"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            
            {/* Template suggestions */}
            <div className="mt-3">
              <p className="text-sm text-gray-500 mb-2">Try one of these questions:</p>
              <div className="flex flex-wrap gap-2">
                {QUERY_TEMPLATES.slice(0, 4).map((template, i) => (
                  <button
                    key={i}
                    onClick={() => applyTemplate(template)}
                    className="text-xs py-1 px-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Ask Button */}
            <div className="mt-4 flex">
              <button
                onClick={handleAsk}
                disabled={loading}
                className={`px-5 py-2 rounded text-white font-medium ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : "Analyze Data"}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
              <h3 className="font-medium">Error</h3>
              <p className="text-sm mt-1">{errorMsg}</p>
            </div>
          )}
          
          {/* Display Answer */}
          {answer && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-3">Analysis Results</h2>
              
              {/* Display different result formats based on type */}
              {analysisResult?.type === 'chart' && analysisResult.chartData && (
                <div className="mb-5">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Visualization</h3>
                  <div className="border rounded p-2 bg-gray-50">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analysisResult.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={Object.keys(analysisResult.chartData[0])[0]} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey={Object.keys(analysisResult.chartData[0])[1]} 
                          fill="#2563eb" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              
              {analysisResult?.type === 'table' && analysisResult.tableHeaders && analysisResult.tableRows && (
                <div className="mb-5 overflow-x-auto max-w-full">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Table Results</h3>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {analysisResult.tableHeaders.map((header, i) => (
                          <th 
                            key={i}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analysisResult.tableRows.map((row, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">AI Response</h3>
                <div className="bg-gray-50 p-4 rounded border text-gray-800 whitespace-pre-wrap">
                  {analysisResult ? analysisResult.content : answer}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* History Panel */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div 
              className="flex justify-between items-center cursor-pointer" 
              onClick={() => setHistoryVisible(!historyVisible)}
            >
              <h2 className="text-lg font-medium">Query History</h2>
              <svg 
                className={`w-5 h-5 transform transition-transform ${historyVisible ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            
            {historyVisible && (
              <div className="mt-3">
                {queryHistory.length > 0 ? (
                  <>
                    <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                      {queryHistory.map((item, i) => (
                        <li key={i} className="text-sm">
                          <button 
                            onClick={() => setQuestion(item.question)}
                            className="text-left w-full p-2 rounded hover:bg-gray-100 truncate overflow-hidden"
                          >
                            {item.question}
                            <span className="block text-xs text-gray-500">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={clearHistory}
                      className="mt-3 text-xs text-red-600 hover:text-red-800"
                    >
                      Clear History
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 py-2">No history yet</p>
                )}
              </div>
            )}
          </div>
          
          {/* Tips and Help */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-2">Tips</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex gap-2">
                <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Use the SKU Mapping page first to map your SKUs to MSKUs
              </li>
              <li className="flex gap-2">
                <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Ask specific questions about your data (quantities, trends, etc.)
              </li>
              <li className="flex gap-2">
                <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Advanced mode provides visualizations when possible
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}