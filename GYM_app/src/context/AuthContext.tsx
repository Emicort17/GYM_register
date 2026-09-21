import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getAuthToken } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  isAdmin: boolean;
  userEmail: string;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Lee el correo y el rol del payload del JWT (solo para decidir qué mostrar en pantalla;
// la autorización real la valida siempre el backend).
function readSession(token: string | null): { isAdmin: boolean; userEmail: string } {
  if (!token) return { isAdmin: false, userEmail: '' };
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(decodeURIComponent(escape(atob(payload))));
    const roles: Array<{ authority?: string }> = Array.isArray(decoded.roles) ? decoded.roles : [];
    return {
      isAdmin: roles.some((r) => r.authority === 'ADMIN_ROLE'),
      userEmail: decoded.sub || '',
    };
  } catch {
    return { isAdmin: false, userEmail: '' };
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<{ isAdmin: boolean; userEmail: string }>({ isAdmin: false, userEmail: '' });

  useEffect(() => {
    // Check initial token
    const token = getAuthToken();
    if (token) {
      setSession(readSession(token));
      setIsAuthenticated(true);
    }
    setLoading(false);

    // Listen to unauthorized errors
    const handleAuthError = () => {
      setIsAuthenticated(false);
      setSession({ isAdmin: false, userEmail: '' });
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('gym_auth_token', token);
    setSession(readSession(token));
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('gym_auth_token');
    setSession({ isAdmin: false, userEmail: '' });
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, isAdmin: session.isAdmin, userEmail: session.userEmail, login, logout }}>
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
