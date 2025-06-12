import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';  
import App from './App.jsx'
import Dashboard from './admin/dashboard.jsx'
import Assessment from './admin/assessment.jsx';
import Overview from './admin/overview.jsx';
import Evaluate from './user/evaluate.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/assessment" element={<Assessment />} />
        <Route path="/admin/overview" element={<Overview />} />
        <Route path="/user/evaluate" element={<Evaluate />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
