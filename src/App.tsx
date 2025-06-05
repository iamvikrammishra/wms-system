import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import DataUpload from './pages/DataUpload';
import SkuMapping from './pages/SkuMapping';
import Analytics from './pages/Analytics';
import AIQuery from './pages/AIQuery';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="data-upload" element={<DataUpload />} />
          <Route path="sku-mapping" element={<SkuMapping />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ai-query" element={<AIQuery />} />
          <Route path="*" element={<Navigate to="/\" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;