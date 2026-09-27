import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Shield, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-[#111827] border-b border-[#263247] sticky top-0 z-40 text-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand and Primary Nav */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#172033] border border-[#263247] flex items-center justify-center text-[#4F46E5]">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-semibold text-base tracking-tight text-[#F8FAFC]">
              UMS
            </span>
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-[#263247]">
              <Link
                to="/dashboard"
                id="nav-dashboard"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 flex items-center space-x-2 ${
                  isActive('/dashboard')
                    ? 'bg-[#172033] text-[#F8FAFC]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#172033]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/users"
                id="nav-users"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 flex items-center space-x-2 ${
                  isActive('/users')
                    ? 'bg-[#172033] text-[#F8FAFC]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#172033]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Users</span>
              </Link>
            </nav>
          )}
        </div>

        {/* Right Section: User Info / Logout / Auth links */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && user ? (
            <>
              <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-[#263247]">
                <div className="text-right">
                  <div className="text-sm font-medium text-[#F8FAFC] leading-none" id="user-display-name">
                    {user.name}
                  </div>
                  <div className="text-xs text-[#94A3B8] mt-0.5">{user.email}</div>
                </div>

                <span
                  id="user-role-badge"
                  data-testid="user-role-badge"
                  className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isAdmin
                      ? 'bg-[#172033] text-[#93C5FD] border-[#263247]'
                      : 'bg-[#172033] text-[#94A3B8] border-[#263247]'
                  }`}
                >
                  {user.role}
                </span>

                <button
                  onClick={handleLogout}
                  id="logout-btn"
                  data-testid="logout-button"
                  className="p-1.5 rounded-md text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#172033] transition-colors duration-150"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile menu trigger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-md text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#172033] transition-colors duration-150"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                id="nav-login"
                className="px-3 py-1.5 rounded-md text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#172033] transition-colors duration-150"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="nav-register"
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-[#F8FAFC] transition-colors duration-150"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-t border-[#263247] bg-[#111827] px-4 py-3 space-y-2">
          <div className="pb-2 border-b border-[#263247] flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[#F8FAFC]">{user?.name}</div>
              <div className="text-xs text-[#94A3B8]">{user?.email}</div>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#172033] text-[#94A3B8] border border-[#263247]">
              {user?.role}
            </span>
          </div>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/dashboard')
                ? 'bg-[#172033] text-[#F8FAFC]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#172033]'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/users"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/users')
                ? 'bg-[#172033] text-[#F8FAFC]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#172033]'
            }`}
          >
            Users
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-[#DC2626] hover:bg-[#172033] transition-colors duration-150 flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </header>
  );
};
