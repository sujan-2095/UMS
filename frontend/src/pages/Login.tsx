import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertCircle } from 'lucide-react';
import { ApiError } from '../types';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      const apiErr = err as ApiError;
      setErrorMessage(apiErr.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#111827] border border-[#263247] rounded-xl p-6 sm:p-7 space-y-5">
        {/* Brand Header */}
        <div>
          <div className="flex items-center space-x-2 text-[#4F46E5] mb-3">
            <Shield className="w-5 h-5" />
            <span className="font-semibold text-sm tracking-wide text-[#F8FAFC]">UMS</span>
          </div>
          <h1 className="text-xl font-semibold text-[#F8FAFC] tracking-tight">
            Sign in to UMS
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Enter your credentials to continue.
          </p>
        </div>

        {errorMessage && (
          <div
            className="bg-[#172033] border border-[#DC2626]/40 text-[#DC2626] px-3.5 py-2.5 rounded-md text-xs flex items-start space-x-2"
            role="alert"
            id="login-error-banner"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="login-email-input" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Email address
            </label>
            <input
              id="login-email-input"
              data-testid="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-3 py-2 bg-[#0B1120] border border-[#263247] rounded-md text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors duration-150"
            />
          </div>

          <div>
            <label htmlFor="login-password-input" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
              Password
            </label>
            <input
              id="login-password-input"
              data-testid="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 bg-[#0B1120] border border-[#263247] rounded-md text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors duration-150"
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              id="login-submit-btn"
              data-testid="login-submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 text-[#F8FAFC] font-medium text-sm rounded-md transition-colors duration-150 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-[#F8FAFC] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-[#94A3B8] pt-1">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#93C5FD] hover:text-[#BFDBFE] font-medium">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
