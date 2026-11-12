import { useEffect, useState, type ReactNode } from 'react';
import * as authService from '../services/authService';
import { AuthContext } from './AuthContext';

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
