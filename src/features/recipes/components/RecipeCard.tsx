import { Link } from 'react-router-dom';
import { textLang } from '@/lib/lang';
import { useTranslation } from 'react-i18next';
import type { Recipe } from '@/types';
import { useFavorites } from '@/features/favorites/FavoritesContext';
import { useSaveRecipe } from '@/features/favorites/useSaveRecipe';
import { useCategoryLabel } from '@/features/recipes/hooks/useCategoryLabel';
import { coverImage } from '@/features/recipes/utils';
import { HeartIcon } from '@/components/ui/icons';
import RecipeImage from './RecipeImage';
import RecipeMeta from './RecipeMeta';

interface RecipeCardProps {
  recipe: Recipe;
}

/**
 * One recipe in a grid. The whole card is the link (its title link is
 * stretched over the card), and the heart sits above it as a separate button,
 * so there is no button nested inside a link.
 */
export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { isFavorite } = useFavorites();
  const saveRecipe = useSaveRecipe();
  const { t } = useTranslation();
  const categoryLabel = useCategoryLabel();
  const fav = isFavorite(recipe.id);

  return (
    <article className="group relative h-full flex flex-col bg-surface border-2 border-line-soft rounded-[14px] overflow-hidden transition-[box-shadow,translate,border-color] duration-200 hover:border-primary hover:shadow-lg hover:-translate-y-1 focus-within:border-primary">
      <div className="relative aspect-[4/3] overflow-hidden">
        <RecipeImage
          src={coverImage(recipe)}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {recipe.category && (
          <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-surface/95 px-2.5 py-0.5 text-[0.8125rem] font-bold text-ink">
            {categoryLabel(recipe.category_slug, recipe.category)}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-3 sm:p-4">
        <h3 lang={textLang(recipe.title)} className="text-base sm:text-lg font-extrabold leading-snug text-ink line-clamp-2">
          <Link
            to={`/recipes/${recipe.id}`}
            className="no-underline text-inherit outline-none after:absolute after:inset-0 after:rounded-[14px] focus-visible:after:outline-[3px] focus-visible:after:outline-focus focus-visible:after:-outline-offset-2"
          >
            {recipe.title}
          </Link>
        </h3>

        {/* Short teaser: only where the card is wide enough for it to read well */}
        <p lang={textLang(recipe.description)} className="hidden sm:block mt-1 text-sm leading-relaxed text-ink-muted line-clamp-2">
          {recipe.description}
        </p>

        <RecipeMeta recipe={recipe} className="mt-auto pt-2.5" />
      </div>

      <button
        type="button"
        onClick={() => saveRecipe(recipe)}
        aria-pressed={fav}
        aria-label={t(fav ? 'card.unsave' : 'card.save', { title: recipe.title })}
        className={`absolute top-2 right-2 z-10 flex items-center justify-center w-11 h-11 rounded-full border-2 heart-pop ${
          fav ? 'bg-primary-soft border-primary text-primary-ink' : 'bg-surface/95 border-transparent text-ink-soft'
        }`}
      >
        <HeartIcon className="w-5 h-5" fill={fav ? 'currentColor' : 'none'} />
      </button>
    </article>
  );
}
