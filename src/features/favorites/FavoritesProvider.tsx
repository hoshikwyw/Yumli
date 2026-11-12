import { useState, useEffect, type ReactNode } from 'react';
import { FavoritesContext } from './FavoritesContext';

const STORAGE_KEY = 'yumli_favorites';

function loadFavorites(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    // Trust nothing read back from storage: keep only a list of ids.
    return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch { /* storage blocked or full: favourites last for this visit only */ }
  }, [favorites]);

  const isFavorite = (id: string) => favorites.includes(id);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}
