import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  toggleMode: () => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

/** The current theme and a way to switch it. The colours themselves are CSS tokens in index.css. */
export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
