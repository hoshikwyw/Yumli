import { useState } from 'react';
import { Button, Card, Input, StateMessage } from '@/components/ui';
import * as recipeService from '@/features/recipes/recipeService';
import { errorMessage } from '@/lib/errors';
import type { Category, Recipe } from '@/types';

interface CategoryManagerProps {
  categories: Category[];
  recipes: Recipe[];
  /** Called after a category was added, renamed or deleted, so the lists can be reloaded. */
  onChanged: () => void;
  onError: (message: string) => void;
}

/** The server answers 409 "That name is already used" for a duplicate: say it in plainer words. */
const categoryError = (error: unknown) => {
  const message = errorMessage(error);
  return message.includes('already used') ? 'A category with that name already exists.' : message;
};

/** Add, rename and delete categories. */
export default function CategoryManager({ categories, recipes, onChanged, onError }: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');
  const [busy, setBusy] = useState(false);

  const recipeCount = (categoryId: string) => recipes.filter((r) => r.category_id === categoryId).length;

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name || busy) return;
    setBusy(true);
    setAddError('');
    try {
      await recipeService.createCategory(name);
      setNewName('');
      onChanged();
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
      onChanged();
    } catch (error) {
      setEditError(categoryError(error));
    }
    setBusy(false);
  };

  const handleDelete = async (category: Category) => {
    const count = recipeCount(category.id);
    const question = count > 0
      ? `"${category.name}" has ${count} recipe(s). Deleting it leaves them without a category. Continue?`
      : `Delete category "${category.name}"?`;
    if (!confirm(question)) return;
    setBusy(true);
    onError('');
    try {
      await recipeService.deleteCategory(category.id);
      onChanged();
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
        <StateMessage icon="plate" title="No categories yet" text="Add one above, then choose it when you write a recipe." />
      ) : (
        <ul className="space-y-3">
          {categories.map((category) => {
            const count = recipeCount(category.id);
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
