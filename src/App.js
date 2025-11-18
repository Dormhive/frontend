// frontend/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

import Welcome from './pages/Welcome/Welcome';
import Signup from './pages/Signup/Signup';
import Login from './pages/Login/Login';
import OwnerDashboard from './pages/Dashboard/OwnerDashboard';
import TenantDashboard from './pages/Dashboard/TenantDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/owner" element={<OwnerDashboard />} />
      <Route path="/tenant" element={<TenantDashboard />} />
    </Routes>
  );
}

export default App;