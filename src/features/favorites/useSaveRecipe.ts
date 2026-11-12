import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { notify, UNDO_DURATION_MS } from '@/lib/notify';
import { useFavorites } from './FavoritesContext';

/**
 * Save or un-save a recipe and say so, with an Undo: a heart is easy to tap
 * by accident while scrolling. Use this for every heart button instead of
 * calling `toggleFavorite` directly.
 */
export function useSaveRecipe() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useTranslation();

  return useCallback(
    (recipe: { id: string; title: string }) => {
      const wasSaved = isFavorite(recipe.id);
      toggleFavorite(recipe.id);

      const show = wasSaved ? notify.info : notify.success;
      show(t(wasSaved ? 'toast.removed' : 'toast.saved'), {
        description: recipe.title,
        duration: UNDO_DURATION_MS,
        // Toggling again puts it back exactly as it was.
        action: { label: t('toast.undo'), onClick: () => toggleFavorite(recipe.id) },
      });
    },
    [isFavorite, toggleFavorite, t],
  );
}
