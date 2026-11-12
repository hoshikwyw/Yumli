import type { Recipe } from '@/types';
import RecipeCard from './RecipeCard';
import { RecipeCardSkeleton } from '@/components/ui';

interface RecipeGridProps {
  recipes: Recipe[];
  /** Show placeholder cards instead of recipes. */
  loading?: boolean;
  /** How many placeholders to show while loading. */
  skeletonCount?: number;
}

/**
 * The one recipe grid used across the site: two columns on phones, three on
 * tablets and laptops, four on wide screens.
 */
export default function RecipeGrid({ recipes, loading = false, skeletonCount = 6 }: RecipeGridProps) {
  const grid = 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5';

  if (loading) {
    return (
      <div className={grid} aria-busy="true">
        {Array.from({ length: skeletonCount }, (_, i) => <RecipeCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <ul className={grid}>
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <RecipeCard recipe={recipe} />
        </li>
      ))}
    </ul>
  );
}
