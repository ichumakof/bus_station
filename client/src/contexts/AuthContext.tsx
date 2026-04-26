import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { apiClient, ApiError } from '../api/client';
import PageLoading from '../components/PageLoading';

export type Role = 'Customer' | 'Operator' | 'Admin';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

interface MeResponse {
  id: string;
  email: string;
  displayName: string;
  role: Role;
}

interface TokenResponse {
  accessToken: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  login(email: string, password: string): Promise<void>;
  register(displayName: string, email: string, password: string): Promise<void>;
  logout(): void;
  init(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setRole(null);
  };

  const init = async (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const me = await apiClient.get<MeResponse>('/api/auth/me');
      setUser({ id: me.id, email: me.email, displayName: me.displayName });
      setRole(me.role);
    } catch (error) {
      if (error instanceof ApiError || error instanceof TypeError) {
        logout();
      }
    }
  };

  useEffect(() => {
    init().finally(() => setIsInitialized(true));
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const { accessToken } = await apiClient.post<TokenResponse>('/api/auth/login', {
      email,
      password,
    });
    localStorage.setItem('token', accessToken);
    await init();
  };

  const register = async (
    displayName: string,
    email: string,
    password: string,
  ): Promise<void> => {
    const { accessToken } = await apiClient.post<TokenResponse>('/api/auth/register', {
      displayName,
      email,
      password,
    });
    localStorage.setItem('token', accessToken);
    await init();
  };

  if (!isInitialized) {
    return <PageLoading />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        init,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
