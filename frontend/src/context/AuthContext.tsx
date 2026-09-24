import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../api/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ message: string; user: User }>;
  logout: () => void;
  setManualToken: (newToken: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Rehydrate auth state on mount
    const savedToken = localStorage.getItem('ums_token');
    const savedUser = localStorage.getItem('ums_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        setToken(savedToken);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse saved user credentials', e);
        localStorage.removeItem('ums_token');
        localStorage.removeItem('ums_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('ums_token', response.token);
    localStorage.setItem('ums_user', JSON.stringify(response.user));
  };

  const register = async (name: string, email: string, password: string) => {
    return await api.register(name, email, password);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ums_token');
    localStorage.removeItem('ums_user');
  };

  const setManualToken = (newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('ums_token', newToken);
    } else {
      localStorage.removeItem('ums_token');
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        register,
        logout,
        setManualToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
