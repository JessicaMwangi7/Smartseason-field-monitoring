import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFields from './pages/admin/AdminFields';
import AdminAgents from './pages/admin/AdminAgents';
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentFields from './pages/agent/AgentFields';
import FieldDetail from './pages/FieldDetail';
import './styles/global.css';
import './styles/login.css';
import './styles/components.css';
import './styles/dashboard.css';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard'} replace />;
  }
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/fields" element={<ProtectedRoute role="admin"><AdminFields /></ProtectedRoute>} />
          <Route path="/admin/agents" element={<ProtectedRoute role="admin"><AdminAgents /></ProtectedRoute>} />

          {/* Agent routes */}
          <Route path="/agent/dashboard" element={<ProtectedRoute role="agent"><AgentDashboard /></ProtectedRoute>} />
          <Route path="/agent/fields" element={<ProtectedRoute role="agent"><AgentFields /></ProtectedRoute>} />

          {/* Shared field detail */}
          <Route path="/fields/:id" element={<ProtectedRoute><FieldDetail /></ProtectedRoute>} />

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
