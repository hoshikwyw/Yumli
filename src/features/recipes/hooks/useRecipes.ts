import { useCallback, useEffect, useState } from 'react';
import type { Recipe, Category } from '@/types';
import * as recipeService from '@/features/recipes/recipeService';

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

/**
 * Runs `load` when the component appears (and again whenever `load` changes),
 * and tracks loading and failure. `reload` lets a "Try again" button repeat it.
 * Pass a stable `load`: a module-level function or one wrapped in useCallback.
 */
function useAsync<T>(load: () => Promise<T>, initial: T) {
  const [state, setState] = useState<AsyncState<T>>({ data: initial, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Ignore the answer if the component has gone or a newer request has started.
    let stale = false;
    load()
      .then((data) => { if (!stale) setState({ data, loading: false, error: null }); })
      .catch((e: unknown) => {
        if (stale) return;
        const message = e instanceof Error ? e.message : 'Request failed';
        setState((prev) => ({ ...prev, loading: false, error: message }));
      });
    return () => { stale = true; };
  }, [load, attempt]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, reload };
}

const NO_RECIPES: Recipe[] = [];
const NO_CATEGORIES: Category[] = [];

export function useRecipes() {
  const { data, loading, error, reload } = useAsync(recipeService.getRecipes, NO_RECIPES);
  return { recipes: data, loading, error, reload };
}

/** The page showing a recipe remounts when the id changes, so each id starts in the loading state. */
export function useRecipeById(id: string) {
  const load = useCallback(
    () => (id ? recipeService.getRecipeById(id) : Promise.resolve(null)),
    [id],
  );
  const { data, loading, error, reload } = useAsync<Recipe | null>(load, null);
  return { recipe: data, loading, error, reload };
}

export function useCategories() {
  const { data, loading, error, reload } = useAsync(recipeService.getCategories, NO_CATEGORIES);
  return { categories: data, loading, error, reload };
}
