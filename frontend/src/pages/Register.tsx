import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#111827] border border-[#263247] rounded-xl p-6 sm:p-7 space-y-5">
        {/* Brand Header */}
        <div>
          <div className="flex items-center space-x-2 text-[#4F46E5] mb-3">
            <Shield className="w-5 h-5" />
            <span className="font-semibold text-sm tracking-wide text-[#F8FAFC]">UMS</span>
          </div>
          <h1 className="text-xl font-semibold text-[#F8FAFC] tracking-tight">
            Create an account
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Enter your details to create a new user account.
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-[#172033] border border-[#263247] rounded-lg p-5 text-center space-y-4">
            <div className="w-10 h-10 bg-[#16A34A]/10 text-[#16A34A] rounded-full flex items-center justify-center mx-auto border border-[#16A34A]/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F8FAFC]">Account Created</h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Your account <span className="font-medium text-[#F8FAFC]">{email}</span> is registered with standard access.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              id="goto-login-btn"
              className="w-full py-2 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-[#F8FAFC] font-medium text-sm rounded-md transition-colors duration-150 flex items-center justify-center space-x-2"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {serverError && (
              <div
                className="bg-[#172033] border border-[#DC2626]/40 text-[#DC2626] px-3.5 py-2.5 rounded-md text-xs flex items-start space-x-2"
                role="alert"
                id="register-error-banner"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <div>
              <label htmlFor="name-input" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Full Name <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="name-input"
                data-testid="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className={`w-full px-3 py-2 bg-[#0B1120] border ${
                  formErrors.name ? 'border-[#DC2626]' : 'border-[#263247]'
                } rounded-md text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors duration-150`}
              />
              {formErrors.name && (
                <p className="text-xs text-[#DC2626] mt-1" id="name-error">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email-input" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Email Address <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="email-input"
                data-testid="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full px-3 py-2 bg-[#0B1120] border ${
                  formErrors.email ? 'border-[#DC2626]' : 'border-[#263247]'
                } rounded-md text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors duration-150`}
              />
              {formErrors.email && (
                <p className="text-xs text-[#DC2626] mt-1" id="email-error">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password-input" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Password <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="password-input"
                data-testid="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className={`w-full px-3 py-2 bg-[#0B1120] border ${
                  formErrors.password ? 'border-[#DC2626]' : 'border-[#263247]'
                } rounded-md text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors duration-150`}
              />
              {formErrors.password && (
                <p className="text-xs text-[#DC2626] mt-1" id="password-error">{formErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password-input" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Confirm Password <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="confirm-password-input"
                data-testid="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={`w-full px-3 py-2 bg-[#0B1120] border ${
                  formErrors.confirmPassword ? 'border-[#DC2626]' : 'border-[#263247]'
                } rounded-md text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors duration-150`}
              />
              {formErrors.confirmPassword && (
                <p className="text-xs text-[#DC2626] mt-1" id="confirm-password-error">{formErrors.confirmPassword}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="register-submit-btn"
                data-testid="register-submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 text-[#F8FAFC] font-medium text-sm rounded-md transition-colors duration-150 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-[#F8FAFC] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Create account</span>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-[#94A3B8] pt-1">
              Already have an account?{' '}
              <Link to="/login" className="text-[#93C5FD] hover:text-[#BFDBFE] font-medium">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
