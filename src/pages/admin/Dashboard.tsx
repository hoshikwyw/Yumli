import { useEffect, useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Button, Chip, Container, Skeleton, StateMessage } from '@/components/ui';
import RecipeList from '@/features/admin/components/RecipeList';
import CategoryManager from '@/features/admin/components/CategoryManager';
import * as recipeService from '@/features/recipes/recipeService';
import { errorMessage } from '@/lib/errors';
import type { Recipe, Category } from '@/types';

type Tab = 'recipes' | 'categories';

export default function Dashboard() {
  useDocumentTitle('Dashboard');

  const [tab, setTab] = useState<Tab>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  /** Id of the recipe or category being deleted right now. */
  const [deleting, setDeleting] = useState<string | null>(null);
  /** Problem with the last action (delete, add, rename), shown above the lists. */
  const [actionError, setActionError] = useState('');

  /** Bumped by "Try again" to run the load once more. */
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let stale = false;
    Promise.all([recipeService.getRecipes(), recipeService.getCategories()])
      .then(([r, c]) => {
        if (stale) return;
        setRecipes(r);
        setCategories(c);
        setLoadError('');
      })
      .catch((error: unknown) => {
        if (!stale) setLoadError(errorMessage(error, 'Could not load your recipes.'));
      })
      .finally(() => { if (!stale) setLoading(false); });
    return () => { stale = true; };
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setAttempt((n) => n + 1);
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    if (!confirm(`Delete "${recipe.title}"? This cannot be undone.`)) return;
    setDeleting(recipe.id);
    setActionError('');
    try {
      await recipeService.deleteRecipe(recipe.id);
      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
    } catch (error) {
      setActionError(`Could not delete "${recipe.title}": ${errorMessage(error)}`);
    }
    setDeleting(null);
  };

  const featuredCount = recipes.filter((r) => r.is_featured).length;

  return (
    <Container className="py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-title text-ink">Dashboard</h1>
          {!loading && !loadError && (
            <p className="text-base text-ink-soft">
              {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} · {featuredCount} featured ·{' '}
              {categories.length} {categories.length === 1 ? 'category' : 'categories'}
            </p>
          )}
        </div>
        <Button to="/admin/new" variant="primary" className="w-full sm:w-auto">+ New recipe</Button>
      </div>

      <div role="group" aria-label="Show" className="mt-6 flex gap-2">
        <Chip selected={tab === 'recipes'} onClick={() => setTab('recipes')}>Recipes</Chip>
        <Chip selected={tab === 'categories'} onClick={() => setTab('categories')}>Categories</Chip>
      </div>

      {actionError && (
        <div role="alert" className="mt-4 flex items-start justify-between gap-3 bg-primary-soft border-2 border-primary px-4 py-2 text-base font-semibold text-ink">
          <span className="py-1.5">{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError('')}
            className="shrink-0 min-h-11 px-2 font-extrabold underline underline-offset-4"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-5">
        {loadError ? (
          <StateMessage
            alert
            emoji="😕"
            title={loadError}
            action={<Button variant="primary" onClick={retry}>Try again</Button>}
          />
        ) : loading ? (
          <div aria-busy="true" className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} height="92px" className="!rounded-none" />)}
          </div>
        ) : tab === 'recipes' ? (
          <RecipeList recipes={recipes} deleting={deleting} onDelete={handleDeleteRecipe} />
        ) : (
          <CategoryManager
            categories={categories}
            recipes={recipes}
            onChanged={setCategories}
            onError={setActionError}
          />
        )}
      </div>
    </Container>
  );
}
