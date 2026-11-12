import { Badge, Button, Card, StateMessage } from '@/components/ui';
import { textLang } from '@/lib/lang';
import RecipeImage from '@/features/recipes/components/RecipeImage';
import { coverImage } from '@/features/recipes/utils';
import type { Recipe } from '@/types';

interface RecipeListProps {
  recipes: Recipe[];
  deleting: string | null;
  onDelete: (recipe: Recipe) => void;
}

/** Every recipe as a row with View, Edit and Delete. */
export default function RecipeList({ recipes, deleting, onDelete }: RecipeListProps) {
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
                  <h2 lang={textLang(recipe.title)} className="text-base sm:text-lg font-extrabold leading-snug text-ink line-clamp-2">{recipe.title}</h2>
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

