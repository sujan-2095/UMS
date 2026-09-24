import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { ApiError } from '../types';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const errors: { [key: string]: string } = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    } else if (!/^[A-Za-z\s]{2,50}$/.test(name.trim())) {
      errors.name = 'Name must contain only alphabetic characters and spaces (2-50 chars)';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'A valid email format is required (e.g. sujan@example.com)';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      setIsSuccess(true);
    } catch (err: any) {
      const apiErr = err as ApiError;
      setServerError(apiErr.message || 'Registration failed. Please check inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-sm text-slate-400 mt-1">
            Register to join the User Management System
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Registration Successful!</h3>
              <p className="text-sm text-slate-300 mt-1">
                Your account <span className="font-semibold text-emerald-400">{email}</span> has been saved in MySQL with role <span className="font-bold text-blue-400">USER</span>.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              id="goto-login-btn"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>Proceed to Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {serverError && (
              <div
                className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start space-x-2"
                role="alert"
                id="register-error-banner"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <div>
              <label htmlFor="name-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name-input"
                  data-testid="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sujan Palanisamy"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border ${
                    formErrors.name ? 'border-red-500 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500'
                  } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors`}
                />
              </div>
              {formErrors.name && (
                <p className="text-xs text-red-400 mt-1" id="name-error">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  data-testid="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sujan@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border ${
                    formErrors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500'
                  } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors`}
                />
              </div>
              {formErrors.email && (
                <p className="text-xs text-red-400 mt-1" id="email-error">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  data-testid="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border ${
                    formErrors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500'
                  } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors`}
                />
              </div>
              {formErrors.password && (
                <p className="text-xs text-red-400 mt-1" id="password-error">{formErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirm-password-input"
                  data-testid="register-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border ${
                    formErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500'
                  } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors`}
                />
              </div>
              {formErrors.confirmPassword && (
                <p className="text-xs text-red-400 mt-1" id="confirm-password-error">{formErrors.confirmPassword}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="register-submit-btn"
                data-testid="register-submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Register</span>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 pt-3">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                Sign in here
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
