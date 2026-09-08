import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getAuthToken } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check initial token
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);

    // Listen to unauthorized errors
    const handleAuthError = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('gym_auth_token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('gym_auth_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
