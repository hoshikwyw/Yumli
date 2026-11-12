import { createContext, useContext } from 'react';

export interface AuthContextType {
  isLoggedIn: boolean;
  /** True until the server has said whether the session cookie is valid. */
  checking: boolean;
  /** Resolves to an error message, or null when the login worked. */
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
