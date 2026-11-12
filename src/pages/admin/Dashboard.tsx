import { useEffect, useState } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Badge, Button, Card, Chip, Container, Input, RecipeImage, Skeleton, StateMessage } from '../../components/common';
import * as recipeService from '../../services/recipeService';
import { coverImage } from '../../utils/recipe';
import { errorMessage } from '../../utils/errors';
import type { Recipe, Category } from '../../types';

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

// ── Recipes ──

interface RecipeListProps {
  recipes: Recipe[];
  deleting: string | null;
  onDelete: (recipe: Recipe) => void;
}

function RecipeList({ recipes, deleting, onDelete }: RecipeListProps) {
  if (recipes.length === 0) {
    return (
      <StateMessage
        title="No recipes yet"
        text="Add your first one and it will show up on the site straight away."
        action={<Button to="/admin/new" variant="primary">+ Add recipe</Button>}
      />
    );
  }

  return (
    <ul className="space-y-3">
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <Card variant="default" className="p-3 sm:p-4">
            {/* Phone: details on top, actions in a full-width row below. Wider: one line. */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-md">
                  <RecipeImage src={coverImage(recipe)} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-extrabold leading-snug text-ink line-clamp-2">{recipe.title}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                    {recipe.is_featured && <Badge variant="primary">Featured</Badge>}
                    <span>{recipe.category || 'No category'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 sm:shrink-0">
                <Button to={`/recipes/${recipe.id}`} variant="ghost" size="sm" className="flex-1 sm:flex-none">View</Button>
                <Button to={`/admin/edit/${recipe.id}`} variant="outline" size="sm" className="flex-1 sm:flex-none">Edit</Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={() => onDelete(recipe)}
                  disabled={deleting === recipe.id}
                  aria-label={`Delete ${recipe.title}`}
                >
                  {deleting === recipe.id ? 'Deleting…' : 'Delete'}
                </Button>
              </div>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}

// ── Categories ──

interface CategoryManagerProps {
  categories: Category[];
  recipes: Recipe[];
  onChanged: (categories: Category[]) => void;
  onError: (message: string) => void;
}

/** The server answers 409 "That name is already used" for a duplicate: say it in plainer words. */
const categoryError = (error: unknown) => {
  const message = errorMessage(error);
  return message.includes('already used') ? 'A category with that name already exists.' : message;
};

function CategoryManager({ categories, recipes, onChanged, onError }: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');
  const [busy, setBusy] = useState(false);

  const recipeCount = (name: string) => recipes.filter((r) => r.category === name).length;

  const refresh = async () => onChanged(await recipeService.getCategories());

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name || busy) return;
    setBusy(true);
    setAddError('');
    try {
      await recipeService.createCategory(name);
      setNewName('');
      await refresh();
    } catch (error) {
      setAddError(categoryError(error));
    }
    setBusy(false);
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditError('');
  };

  const handleRename = async (id: string) => {
    const name = editName.trim();
    if (!name || busy) return;
    setBusy(true);
    setEditError('');
    try {
      await recipeService.updateCategory(id, name);
      setEditingId(null);
      await refresh();
    } catch (error) {
      setEditError(categoryError(error));
    }
    setBusy(false);
  };

  const handleDelete = async (category: Category) => {
    const count = recipeCount(category.name);
    const question = count > 0
      ? `"${category.name}" has ${count} recipe(s). Deleting it leaves them without a category. Continue?`
      : `Delete category "${category.name}"?`;
    if (!confirm(question)) return;
    setBusy(true);
    onError('');
    try {
      await recipeService.deleteCategory(category.id);
      onChanged(categories.filter((c) => c.id !== category.id));
    } catch (error) {
      onError(`Could not delete "${category.name}": ${errorMessage(error)}`);
    }
    setBusy(false);
  };

  return (
    <div className="space-y-5">
      <Card variant="default" className="p-4 sm:p-6">
        <form
          onSubmit={(e) => { e.preventDefault(); void handleAdd(); }}
          className="flex flex-col sm:flex-row sm:items-start gap-3"
        >
          <div className="flex-1">
            <Input
              label="New category"
              placeholder="e.g. Drinks"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              error={addError}
            />
          </div>
          <Button variant="primary" type="submit" disabled={busy || !newName.trim()} className="sm:mt-[1.625rem]">
            Add category
          </Button>
        </form>
      </Card>

      {categories.length === 0 ? (
        <StateMessage emoji="🏷️" title="No categories yet" text="Add one above, then choose it when you write a recipe." />
      ) : (
        <ul className="space-y-3">
          {categories.map((category) => {
            const count = recipeCount(category.name);
            const isEditing = editingId === category.id;

            return (
              <li key={category.id}>
                <Card variant="default" className="p-3 sm:p-4">
                  {isEditing ? (
                    <form
                      onSubmit={(e) => { e.preventDefault(); void handleRename(category.id); }}
                      onKeyDown={(e) => { if (e.key === 'Escape') setEditingId(null); }}
                      className="flex flex-col sm:flex-row sm:items-start gap-3"
                    >
                      <div className="flex-1">
                        <Input
                          aria-label={`New name for ${category.name}`}
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          error={editError}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm" type="submit" disabled={busy || !editName.trim()} className="flex-1 sm:flex-none">
                          Save
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingId(null)} className="flex-1 sm:flex-none">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base sm:text-lg font-extrabold leading-snug text-ink break-words">{category.name}</h2>
                        <p className="text-sm text-ink-muted">{count} {count === 1 ? 'recipe' : 'recipes'}</p>
                      </div>
                      <div className="flex gap-2 sm:shrink-0">
                        <Button variant="outline" size="sm" onClick={() => startEdit(category)} className="flex-1 sm:flex-none">
                          Rename
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(category)}
                          disabled={busy}
                          aria-label={`Delete ${category.name}`}
                          className="flex-1 sm:flex-none"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
