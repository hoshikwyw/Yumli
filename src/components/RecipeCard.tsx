import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Recipe } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { useCategoryLabel } from '../hooks/useCategoryLabel';
import { coverImage } from '../utils/recipe';
import { RecipeImage } from './common';
import { ClockIcon, HeartIcon, PeopleIcon } from './icons';

interface RecipeCardProps {
  recipe: Recipe;
}

/**
 * One recipe in a grid. The whole card is the link (its title link is
 * stretched over the card), and the heart sits above it as a separate button,
 * so there is no button nested inside a link.
 */
export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
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
        <h3 className="text-base sm:text-lg font-extrabold leading-snug text-ink line-clamp-2">
          <Link
            to={`/recipes/${recipe.id}`}
            className="no-underline text-inherit outline-none after:absolute after:inset-0 after:rounded-[14px] focus-visible:after:outline-[3px] focus-visible:after:outline-focus focus-visible:after:-outline-offset-2"
          >
            {recipe.title}
          </Link>
        </h3>

        {/* Short teaser: only where the card is wide enough for it to read well */}
        <p className="hidden sm:block mt-1 text-sm text-ink-muted line-clamp-2">{recipe.description}</p>

        <div className="mt-auto pt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-ink-soft">
          {recipe.prep_time && (
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              <span className="sr-only">{t('card.prepTime')}:</span>
              {recipe.prep_time}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <PeopleIcon className="w-4 h-4" />
            <span className="sr-only">{t('card.serves')}:</span>
            {recipe.servings}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => toggleFavorite(recipe.id)}
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
