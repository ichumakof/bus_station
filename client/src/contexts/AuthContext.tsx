import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../api/client';
export type Role = 'Customer' | 'Operator' | 'Admin';
export interface AuthUser { id: string; email: string; displayName: string; }

interface AuthContextValue {
  user: AuthUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>; // Теперь возвращает Promise
  logout: () => void;
  register: (displayName: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  const init = async () => {
    try {
      const data = await apiClient.get<any>('/api/auth/me');

      setUser({ id: data.id, email: data.email, displayName: data.displayName });
      setRole(data.role as Role);
      setToken(localStorage.getItem('token'));
    }
    catch {
      logout();
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) init();
  }, []);

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    await init(); // Загружаем профиль сразу после логина
  };

  const register = async (displayName: string, email: string, password: string) => {
    
    const data = await apiClient.post<any>('/api/auth/register', { 
      displayName, 
      email, 
      password 
    });

    // Получаем токен из очищенных данных
    const newToken = data.accessToken || data.token;
    
    if (newToken) {
      await login(newToken);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRole(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated: !!token && !!role, login, logout, register}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};