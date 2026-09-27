import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import { User, ApiError } from '../types';
import { Users, UserPlus, LogOut, ArrowRight, Shield, ShieldAlert, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(isAdmin);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      const loadDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await api.getUsers();
          setUsers(data);
        } catch (err: any) {
          const apiErr = err as ApiError;
          setError(apiErr.message || 'Failed to load user metrics');
        } finally {
          setLoading(false);
        }
      };

      loadDashboardData();
    }
  }, [isAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const standardUserCount = users.filter((u) => u.role === 'USER').length;
  // Recent users sorted by id descending
  const recentUsers = [...users].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#263247]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold text-[#F8FAFC] tracking-tight">
            Dashboard
          </h1>
          <div className="mt-1 flex items-center space-x-2 text-sm text-[#94A3B8]">
            <span>Signed in as</span>
            <span className="font-medium text-[#F8FAFC]" id="dashboard-username">
              {user?.name}
            </span>
            <span className="text-[#64748B]">•</span>
            <span
              id="dashboard-role-text"
              data-testid="user-role-badge"
              className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isAdmin
                  ? 'bg-[#172033] text-[#93C5FD] border-[#263247]'
                  : 'bg-[#172033] text-[#94A3B8] border-[#263247]'
              }`}
            >
              {user?.role}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            to="/users"
            id="dashboard-view-users-btn"
            data-testid="dashboard-view-users"
            className="px-3.5 py-2 bg-[#172033] hover:bg-[#1f2b44] text-[#F8FAFC] text-sm font-medium rounded-md border border-[#263247] transition-colors duration-150 inline-flex items-center space-x-2"
          >
            <Users className="w-4 h-4 text-[#94A3B8]" />
            <span>View Users</span>
          </Link>

          {isAdmin && (
            <Link
              to="/users?action=add"
              id="dashboard-add-user-btn"
              data-testid="dashboard-add-user"
              className="px-3.5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-[#F8FAFC] text-sm font-medium rounded-md transition-colors duration-150 inline-flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            id="dashboard-logout-btn"
            data-testid="logout-button"
            className="p-2 text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#172033] rounded-md border border-[#263247] transition-colors duration-150"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ADMIN VIEW */}
      {isAdmin ? (
        <div className="space-y-6">
          {error && (
            <div className="bg-[#172033] border border-[#DC2626]/40 text-[#DC2626] px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Real Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#111827] border border-[#263247] rounded-lg p-5">
              <div className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                Total Users
              </div>
              <div className="mt-2 text-3xl font-semibold text-[#F8FAFC]">
                {loading ? '—' : totalUsers}
              </div>
              <div className="mt-1 text-xs text-[#64748B]">
                Registered in MySQL database
              </div>
            </div>

            <div className="bg-[#111827] border border-[#263247] rounded-lg p-5">
              <div className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                Administrators
              </div>
              <div className="mt-2 text-3xl font-semibold text-[#F8FAFC]">
                {loading ? '—' : adminCount}
              </div>
              <div className="mt-1 text-xs text-[#64748B]">
                Accounts with write & delete access
              </div>
            </div>

            <div className="bg-[#111827] border border-[#263247] rounded-lg p-5">
              <div className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                Standard Users
              </div>
              <div className="mt-2 text-3xl font-semibold text-[#F8FAFC]">
                {loading ? '—' : standardUserCount}
              </div>
              <div className="mt-1 text-xs text-[#64748B]">
                Accounts with read-only access
              </div>
            </div>
          </div>

          {/* Recent Users Table */}
          <div className="bg-[#111827] border border-[#263247] rounded-lg overflow-hidden">
            <div className="p-4 sm:px-6 border-b border-[#263247] flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#F8FAFC]">Recent Users</h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Latest registered accounts in the system
                </p>
              </div>
              <Link
                to="/users"
                className="text-xs font-medium text-[#93C5FD] hover:text-[#BFDBFE] transition-colors inline-flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#172033] border-b border-[#263247] text-xs font-medium text-[#94A3B8]">
                    <th className="py-2.5 px-6">Name</th>
                    <th className="py-2.5 px-6">Email</th>
                    <th className="py-2.5 px-6">Role</th>
                    <th className="py-2.5 px-6 text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#263247]">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-[#94A3B8]">
                        Loading recent users...
                      </td>
                    </tr>
                  ) : recentUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-[#94A3B8]">
                        No users recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#172033]/50 transition-colors duration-150">
                        <td className="py-3 px-6 text-[#F8FAFC] font-medium">
                          {u.name}
                        </td>
                        <td className="py-3 px-6 text-[#94A3B8] font-mono text-xs">
                          {u.email}
                        </td>
                        <td className="py-3 px-6">
                          <span
                            className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              u.role === 'ADMIN'
                                ? 'bg-[#172033] text-[#93C5FD] border-[#263247]'
                                : 'bg-[#172033] text-[#94A3B8] border-[#263247]'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right text-xs text-[#64748B] font-mono">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* USER ROLE VIEW: Simple Account Summary */
        <div className="max-w-xl mx-auto space-y-4">
          <div className="bg-[#111827] border border-[#263247] rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#F8FAFC]">Account Summary</h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                Your authenticated profile and access tier
              </p>
            </div>

            <div className="divide-y divide-[#263247] text-sm">
              <div className="py-3 flex justify-between items-center">
                <span className="text-[#94A3B8]">Name</span>
                <span className="text-[#F8FAFC] font-medium">{user?.name}</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-[#94A3B8]">Email</span>
                <span className="text-[#F8FAFC] font-mono text-xs">{user?.email}</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-[#94A3B8]">Role</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#172033] text-[#94A3B8] border border-[#263247]">
                  {user?.role}
                </span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-[#94A3B8]">Access level</span>
                <span className="text-xs text-[#94A3B8]">Read-only Directory Access</span>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <Link
                to="/users"
                className="flex-1 py-2 px-3 text-center text-sm font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-[#F8FAFC] rounded-md transition-colors duration-150"
              >
                View Users
              </Link>
              <button
                onClick={handleLogout}
                className="py-2 px-4 text-sm font-medium bg-[#172033] hover:bg-[#1f2b44] text-[#94A3B8] hover:text-[#DC2626] border border-[#263247] rounded-md transition-colors duration-150"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
