import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import GuardDashboard from './pages/GuardDashboard';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboard
    if (user.role === 'student') return <Navigate to="/student" replace />;
    if (user.role === 'guard') return <Navigate to="/guard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Default route redirect based on role */}
      <Route path="/" element={
        user ? (
          user.role === 'student' ? <Navigate to="/student" replace /> :
          user.role === 'guard' ? <Navigate to="/guard" replace /> :
          <Navigate to="/admin" replace />
        ) : <Navigate to="/login" replace />
      } />

      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />

      <Route path="/guard" element={
        <ProtectedRoute allowedRoles={['guard']}>
          <GuardDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
