import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, LogOut } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome, <span className="text-indigo-400" id="dashboard-username">{user?.name}</span>
          </h1>
          <div className="mt-3 flex items-center space-x-2 text-sm text-slate-300">
            <span>Role:</span>
            <span
              id="dashboard-role-text"
              data-testid="user-role-badge"
              className={`font-bold px-2.5 py-0.5 rounded text-xs uppercase tracking-wider border ${
                isAdmin
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              }`}
            >
              {user?.role}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
          <Link
            to="/users"
            id="dashboard-view-users-btn"
            data-testid="dashboard-view-users"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>View Users</span>
          </Link>

          {isAdmin && (
            <Link
              to="/users?action=add"
              id="dashboard-add-user-btn"
              data-testid="dashboard-add-user"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-all flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            id="dashboard-logout-btn"
            data-testid="logout-button"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm rounded-xl transition-all flex items-center space-x-2 border border-slate-700 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
