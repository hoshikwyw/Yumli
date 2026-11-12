import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { colors as lightColors, darkColors, type ColorScheme } from '../themes/color';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  isDark: boolean;
  /** Legacy hex palette for inline styles. New code should use the CSS tokens in index.css. */
  colors: ColorScheme;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = 'yumli_theme';
/** Browser toolbar colour per theme: matches the page background. */
const TOOLBAR_COLOR: Record<ThemeMode, string> = { light: '#FFF9F5', dark: '#1A1A2E' };

function readStoredTheme(): ThemeMode | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch { /* storage blocked */ }
  return null;
}

const systemTheme = (): ThemeMode =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Until the visitor picks a theme themselves, follow their device setting.
  const [mode, setMode] = useState<ThemeMode>(() => readStoredTheme() ?? systemTheme());
  const [chosen, setChosen] = useState(() => readStoredTheme() !== null);
  const isDark = mode === 'dark';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', TOOLBAR_COLOR[mode]);
  }, [mode]);

  useEffect(() => {
    if (chosen) return;
    const query = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!query) return;
    const follow = (e: MediaQueryListEvent) => setMode(e.matches ? 'dark' : 'light');
    query.addEventListener('change', follow);
    return () => query.removeEventListener('change', follow);
  }, [chosen]);

  const toggleMode = () => {
    const next: ThemeMode = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    setChosen(true);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch { /* storage blocked: the choice lasts for this visit only */ }
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, isDark, colors: isDark ? darkColors : lightColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
