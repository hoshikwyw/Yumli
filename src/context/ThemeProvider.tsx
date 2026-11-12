import { useState, useEffect, type ReactNode } from 'react';
import { ThemeContext, type ThemeMode } from './ThemeContext';

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

/**
 * Owns the light/dark choice. It only sets `data-theme` on <html>; every
 * colour is a CSS token in index.css that changes value under that attribute.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Until the visitor picks a theme themselves, follow their device setting.
  const [mode, setMode] = useState<ThemeMode>(() => readStoredTheme() ?? systemTheme());
  const [chosen, setChosen] = useState(() => readStoredTheme() !== null);

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
    <ThemeContext.Provider value={{ mode, isDark: mode === 'dark', toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
