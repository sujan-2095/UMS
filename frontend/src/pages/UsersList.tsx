import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import { User, Role, ApiError } from '../types';
import {
  UserPlus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

export const UsersList: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [addFormErrors, setAddFormErrors] = useState<{ [key: string]: string }>({});
  const [isAdding, setIsAdding] = useState(false);

  // Delete User Confirmation Modal State
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      const apiErr = err as ApiError;
      setErrorMessage(apiErr.message || 'Failed to fetch users from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (isAdmin && searchParams.get('action') === 'add') {
      handleOpenAddModal();
      setSearchParams({});
    }
  }, [isAdmin, searchParams]);

  const handleOpenAddModal = () => {
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setAddFormErrors({});
    setErrorMessage(null);
    setIsAddModalOpen(true);
  };

  const validateAddForm = () => {
    const errors: { [key: string]: string } = {};
    if (!newName.trim()) {
      errors.name = 'Name is required';
    } else if (!/^[A-Za-z\s]{2,50}$/.test(newName.trim())) {
      errors.name = 'Letters and spaces only (2-50 chars)';
    }

    if (!newEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      errors.email = 'Valid email is required';
    }

    if (!newPassword || newPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setAddFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddForm()) return;

    setIsAdding(true);
    setErrorMessage(null);
    try {
      const created = await api.addUser({
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        password: newPassword,
      });

      setSuccessMessage(`User "${created.name}" created successfully.`);
      setIsAddModalOpen(false);
      await fetchUsers();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      const apiErr = err as ApiError;
      setErrorMessage(apiErr.message || 'Failed to create user');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    if (currentUser && user.id === currentUser.id) {
      setErrorMessage('You cannot delete your own logged-in administrator account');
      return;
    }
    setUserToDelete(user);
    setErrorMessage(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await api.deleteUser(userToDelete.id);
      setSuccessMessage(`User "${userToDelete.name}" deleted successfully.`);
      setUserToDelete(null);
      await fetchUsers();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      const apiErr = err as ApiError;
      setErrorMessage(apiErr.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold text-[#F8FAFC] tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">
            Manage registered users and access.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchUsers}
            id="refresh-users-btn"
            disabled={loading}
            className="p-2 bg-[#172033] hover:bg-[#1f2b44] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#263247] rounded-md transition-colors duration-150 disabled:opacity-50"
            title="Refresh user list"
            aria-label="Refresh user list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              id="add-user-btn"
              data-testid="add-user-button"
              className="px-3.5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-[#F8FAFC] text-sm font-medium rounded-md transition-colors duration-150 inline-flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add user</span>
            </button>
          )}
        </div>
      </div>

      {/* Simplified Read-Only Notice for Normal USER */}
      {!isAdmin && (
        <div className="bg-[#172033] border border-[#263247] rounded-md px-4 py-3 text-xs text-[#94A3B8] flex items-center justify-between">
          <div>
            <span className="font-medium text-[#F8FAFC]">Read-only access: </span>
            You are viewing the user directory. Administrative actions (adding or deleting accounts) are restricted to administrators.
          </div>
        </div>
      )}

      {/* Feedback Alerts */}
      {successMessage && (
        <div
          className="bg-[#172033] border border-[#16A34A]/40 text-[#16A34A] px-4 py-2.5 rounded-md text-sm flex items-center justify-between"
          id="success-banner"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-[#16A34A] hover:text-[#F8FAFC] p-0.5"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div
          className="bg-[#172033] border border-[#DC2626]/40 text-[#DC2626] px-4 py-2.5 rounded-md text-sm flex items-center justify-between"
          id="error-banner"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-[#DC2626] hover:text-[#F8FAFC] p-0.5"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] border border-[#263247] p-3 rounded-lg">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#0B1120] border border-[#263247] rounded-md text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors duration-150"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#64748B] hover:text-[#F8FAFC]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-[#94A3B8]">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Role:</span>
            <div className="inline-flex rounded-md border border-[#263247] p-0.5 bg-[#0B1120]">
              {(['ALL', 'ADMIN', 'USER'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors duration-150 ${
                    roleFilter === r
                      ? 'bg-[#172033] text-[#F8FAFC]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {r === 'ALL' ? 'All' : r}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs text-[#64748B] hidden sm:inline">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#111827] border border-[#263247] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm" id="user-table" data-testid="user-table">
            <thead>
              <tr className="bg-[#172033] border-b border-[#263247] text-xs font-medium text-[#94A3B8]">
                <th className="py-3 px-4 sm:px-6">Name</th>
                <th className="py-3 px-4 sm:px-6">Email</th>
                <th className="py-3 px-4 sm:px-6">Role</th>
                <th className="py-3 px-4 sm:px-6">Created Date</th>
                {isAdmin && <th className="py-3 px-4 sm:px-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263247]">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="py-12 text-center text-[#94A3B8]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="py-12 text-center text-xs text-[#94A3B8]">
                    {users.length === 0 ? 'No users registered yet.' : 'No users match the active search or filter.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrentAdmin = Boolean(currentUser && currentUser.id === u.id);

                  return (
                    <tr
                      key={u.id}
                      id={`user-row-${u.id}`}
                      data-testid={`user-row-${u.id}`}
                      className="hover:bg-[#172033]/50 transition-colors duration-150"
                    >
                      <td className="py-3 px-4 sm:px-6 font-medium text-[#F8FAFC]">
                        <div className="flex items-center space-x-2">
                          <span>{u.name}</span>
                          {isCurrentAdmin && (
                            <span className="text-[10px] font-medium bg-[#172033] text-[#94A3B8] px-1.5 py-0.5 rounded border border-[#263247]">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-[#94A3B8] font-mono text-xs">
                        {u.email}
                      </td>
                      <td className="py-3 px-4 sm:px-6">
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
                      <td className="py-3 px-4 sm:px-6 text-xs text-[#64748B] font-mono">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                      </td>

                      {/* Admin Actions */}
                      {isAdmin && (
                        <td className="py-3 px-4 sm:px-6 text-right">
                          <button
                            onClick={() => handleDeleteClick(u)}
                            id={`delete-user-${u.id}`}
                            data-testid={`delete-user-${u.id}`}
                            disabled={isCurrentAdmin}
                            title={
                              isCurrentAdmin
                                ? 'Cannot delete your own admin account'
                                : `Delete ${u.name}`
                            }
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-150 inline-flex items-center space-x-1.5 ${
                              isCurrentAdmin
                                ? 'opacity-30 cursor-not-allowed text-[#64748B]'
                                : 'text-[#DC2626] hover:bg-[#DC2626]/10 border border-transparent hover:border-[#DC2626]/30'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/80">
          <div className="bg-[#111827] border border-[#263247] rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#263247]">
              <div>
                <h3 className="text-base font-semibold text-[#F8FAFC]">Add user</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">Create a new user account.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                id="cancel-add-user-btn"
                className="p-1 rounded-md text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#172033] transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5" htmlFor="new-user-name">
                  Name <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  id="new-user-name"
                  data-testid="new-user-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Full name"
                  className={`w-full px-3 py-2 bg-[#0B1120] border ${
                    addFormErrors.name ? 'border-[#DC2626]' : 'border-[#263247]'
                  } rounded-md text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors duration-150`}
                />
                {addFormErrors.name && (
                  <p className="text-xs text-[#DC2626] mt-1">{addFormErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5" htmlFor="new-user-email">
                  Email <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  id="new-user-email"
                  data-testid="new-user-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Email address"
                  className={`w-full px-3 py-2 bg-[#0B1120] border ${
                    addFormErrors.email ? 'border-[#DC2626]' : 'border-[#263247]'
                  } rounded-md text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors duration-150`}
                />
                {addFormErrors.email && (
                  <p className="text-xs text-[#DC2626] mt-1">{addFormErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5" htmlFor="new-user-password">
                  Password <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  id="new-user-password"
                  data-testid="new-user-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password (minimum 8 characters)"
                  className={`w-full px-3 py-2 bg-[#0B1120] border ${
                    addFormErrors.password ? 'border-[#DC2626]' : 'border-[#263247]'
                  } rounded-md text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors duration-150`}
                />
                {addFormErrors.password && (
                  <p className="text-xs text-[#DC2626] mt-1">{addFormErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-[#263247]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#172033] rounded-md transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="create-user-submit-btn"
                  data-testid="create-user-submit"
                  disabled={isAdding}
                  className="px-3.5 py-2 text-sm font-medium bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 text-[#F8FAFC] rounded-md transition-colors duration-150 flex items-center space-x-1.5"
                >
                  {isAdding ? (
                    <div className="w-4 h-4 border-2 border-[#F8FAFC] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Create user</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/80">
          <div className="bg-[#111827] border border-[#263247] rounded-xl w-full max-w-sm p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-[#F8FAFC]">Delete user</h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
            </div>

            <div className="bg-[#0B1120] p-3 rounded-md border border-[#263247] text-xs font-mono space-y-1">
              <div className="text-[#F8FAFC] font-sans font-medium">{userToDelete.name}</div>
              <div className="text-[#94A3B8]">{userToDelete.email}</div>
              <div className="text-[#64748B]">Role: {userToDelete.role}</div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                id="cancel-delete-btn"
                data-testid="cancel-delete"
                className="px-3.5 py-2 bg-[#172033] hover:bg-[#1f2b44] text-[#94A3B8] hover:text-[#F8FAFC] text-sm font-medium rounded-md transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                id="confirm-delete-btn"
                data-testid="confirm-delete"
                disabled={isDeleting}
                className="px-3.5 py-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-[#F8FAFC] text-sm font-medium rounded-md transition-colors duration-150 flex items-center space-x-1.5"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-[#F8FAFC] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Delete user</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
