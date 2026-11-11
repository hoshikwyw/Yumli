import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as authService from '../services/authService';

interface AuthContextType {
  isLoggedIn: boolean;
  /** True until the server has said whether the session cookie is valid. */
  checking: boolean;
  /** Resolves to an error message, or null when the login worked. */
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    authService.checkSession()
      .then(setIsLoggedIn)
      .catch(() => setIsLoggedIn(false))
      .finally(() => setChecking(false));
  }, []);

  const login = async (username: string, password: string) => {
    const error = await authService.login(username, password);
    setIsLoggedIn(!error);
    return error;
  };

  const logout = async () => {
    await authService.logout().catch(() => {});
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, checking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
