import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import { User, ApiError } from '../types';
import {
  Users,
  UserPlus,
  Trash2,
  Shield,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Lock,
  Mail,
  Key,
} from 'lucide-react';

export const UsersList: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      const apiErr = err as ApiError;
      setErrorMessage(apiErr.message || 'Failed to fetch users from backend');
    } finally {
      setLoading(false);
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();

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

      setSuccessMessage(`User "${created.name}" created successfully in MySQL!`);
      setIsAddModalOpen(false);
      await fetchUsers();
      setTimeout(() => setSuccessMessage(null), 5000);
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
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      const apiErr = err as ApiError;
      setErrorMessage(apiErr.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Directory of registered users persisted in MySQL
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchUsers}
            id="refresh-users-btn"
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
            title="Refresh user list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Add User Button - Only for ADMIN (Section 19 & 20) */}
          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              id="add-user-btn"
              data-testid="add-user-button"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Feedback Banner for Standard USER */}
      {!isAdmin && (
        <div className="bg-slate-900/80 border border-blue-500/30 rounded-xl p-4 flex items-start space-x-3 text-sm text-slate-300">
          <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Viewing as USER role: </span>
            You have read-only access to view registered users. Administrative operations (Add User, Delete User) are hidden in UI and strictly rejected with <strong className="text-red-400">403 Forbidden</strong> on the backend.
          </div>
        </div>
      )}

      {/* Notifications */}
      {successMessage && (
        <div
          className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-sm flex items-center justify-between"
          id="success-banner"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div
          className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center justify-between"
          id="error-banner"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Users Table (Section 19) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="user-table" data-testid="user-table">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">Email</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Created Date</th>
                {isAdmin && <th className="py-3.5 px-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading users from database...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-slate-400">
                    No users found in database.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrentAdmin = Boolean(currentUser && currentUser.id === u.id);

                  return (
                    <tr
                      key={u.id}
                      id={`user-row-${u.id}`}
                      data-testid={`user-row-${u.id}`}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-6 font-mono text-xs text-slate-400">
                        #{u.id}
                      </td>
                      <td className="py-4 px-6 font-medium text-white flex items-center space-x-2">
                        <span>{u.name}</span>
                        {isCurrentAdmin && (
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-mono text-xs">
                        {u.email}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${
                            u.role === 'ADMIN'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                      </td>

                      {/* Actions: ADMIN ONLY (Section 19) */}
                      {isAdmin && (
                        <td className="py-4 px-6 text-right">
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center space-x-1 ${
                              isCurrentAdmin
                                ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                                : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 cursor-pointer'
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

      {/* Add User Modal (Section 20: Admin only) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Add New User</h3>
                  <p className="text-xs text-slate-400">Admin-only user creation</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                id="cancel-add-user-btn"
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="new-user-name">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="new-user-name"
                  data-testid="new-user-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Arun Kumar"
                  className={`w-full px-4 py-2.5 bg-slate-950/60 border ${
                    addFormErrors.name ? 'border-red-500' : 'border-slate-800'
                  } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500`}
                />
                {addFormErrors.name && (
                  <p className="text-xs text-red-400 mt-1">{addFormErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="new-user-email">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  id="new-user-email"
                  data-testid="new-user-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="arun@test.com"
                  className={`w-full px-4 py-2.5 bg-slate-950/60 border ${
                    addFormErrors.email ? 'border-red-500' : 'border-slate-800'
                  } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500`}
                />
                {addFormErrors.email && (
                  <p className="text-xs text-red-400 mt-1">{addFormErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="new-user-password">
                  Password <span className="text-red-400">*</span>
                </label>
                <input
                  id="new-user-password"
                  data-testid="new-user-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={`w-full px-4 py-2.5 bg-slate-950/60 border ${
                    addFormErrors.password ? 'border-red-500' : 'border-slate-800'
                  } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500`}
                />
                {addFormErrors.password && (
                  <p className="text-xs text-red-400 mt-1">{addFormErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="create-user-submit-btn"
                  data-testid="create-user-submit"
                  disabled={isAdding}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-2"
                >
                  {isAdding ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Create User</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal (Section 19: Confirmation before deletion) */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Confirm User Deletion</h3>

            <p className="text-sm text-slate-300">
              Are you sure you want to delete this user?
            </p>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-left text-xs font-mono">
              <div className="text-white font-bold">{userToDelete.name}</div>
              <div className="text-slate-400">{userToDelete.email}</div>
              <div className="text-slate-500">ID: #{userToDelete.id} • Role: {userToDelete.role}</div>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                id="cancel-delete-btn"
                data-testid="cancel-delete"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                id="confirm-delete-btn"
                data-testid="confirm-delete"
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center space-x-2"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
