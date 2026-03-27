import { createContext, useContext, useState, ReactNode } from 'react';

export type Role = 'Customer' | 'Operator' | 'Admin';

export interface AuthUser {
  id: string;
  displayName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser, role: Role) => void;
  logout: () => void;
  init: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  const login = (token: string, user: AuthUser, role: Role) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    setRole(role);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const init = () => {
    // stub: will read token from localStorage and restore session in Lab 3
  };

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated: Boolean(token), login, logout, init }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
