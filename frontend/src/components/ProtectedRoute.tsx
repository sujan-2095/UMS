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
        <div className="w-6 h-6 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-[#111827] border border-[#263247] rounded-xl text-center space-y-3">
        <div className="w-10 h-10 mx-auto bg-[#172033] text-[#DC2626] border border-[#263247] rounded-full flex items-center justify-center">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <h2 className="text-base font-semibold text-[#F8FAFC]">403 Forbidden: Access Denied</h2>
        <p className="text-[#94A3B8] text-xs">
          This section requires administrator privileges. Your current role is restricted.
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return children;
};
