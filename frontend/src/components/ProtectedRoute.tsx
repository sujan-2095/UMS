import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-8 bg-slate-900 border border-red-500/30 rounded-2xl text-center shadow-xl">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">403 Forbidden: Access Denied</h2>
        <p className="text-slate-400 text-sm mb-6">
          This area requires <span className="text-emerald-400 font-semibold">ADMIN</span> privileges. Your current role is restricted.
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return children;
};
