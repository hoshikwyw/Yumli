import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecipes } from '../hooks/useRecipes';
import { useCategoryLabel } from '../hooks/useCategoryLabel';
import { useFavorites } from '../context/FavoritesContext';
import { PageHeader, Container, Button, Chip, StateMessage } from '../components/common';
import { CloseIcon, HeartIcon, SearchIcon } from '../components/icons';
import RecipeGrid from '../components/RecipeGrid';
import { fieldClasses } from '../components/common/Input';
import { categoryEmoji, isQuick } from '../utils/recipe';
import type { Recipe } from '../types';

/** Everything a visitor might type to find a recipe, in one lowercase string. */
const searchText = (recipe: Recipe) =>
  [recipe.title, recipe.description, recipe.category, ...(recipe.ingredients ?? [])].join(' ').toLowerCase();

/**
 * The recipe list. Search and filters live in the URL
 * (`?q=egg&category=Breakfast&quick=1&saved=1`), so a filtered list can be
 * shared, bookmarked, and survives the back button.
 */
export default function Recipes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { recipes, loading, error, reload } = useRecipes();
  const { favorites, isFavorite } = useFavorites();
  const { t } = useTranslation();
  const categoryLabel = useCategoryLabel();

  const query = searchParams.get('q') ?? '';
  const category = searchParams.get('category');
  const quickOnly = searchParams.get('quick') === '1';
  const savedOnly = searchParams.get('saved') === '1';
  const hasFilters = Boolean(query || category || quickOnly || savedOnly);

  /** Change some filters and keep the rest. A null value removes that filter. */
  const setFilters = (changes: Record<string, string | null>) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      },
      // Filtering is not a new page: Back should leave the list, not undo one keystroke.
      { replace: true },
    );
  };

  const clearFilters = () => setSearchParams({}, { replace: true });

  // Offer only categories that have recipes, so no chip leads to an empty list.
  const categories = [...new Map(recipes.filter((r) => r.category).map((r) => [r.category, r.category_slug])).entries()]
    .sort(([a], [b]) => a.localeCompare(b));

  const needle = query.trim().toLowerCase();
  const filtered = recipes.filter(
    (recipe) =>
      (!needle || searchText(recipe).includes(needle)) &&
      (!category || recipe.category === category) &&
      (!quickOnly || isQuick(recipe)) &&
      (!savedOnly || isFavorite(recipe.id)),
  );

  // "Saved" with no other filter and nothing saved needs its own explanation.
  const nothingSaved = savedOnly && favorites.length === 0;

  return (
    <div className="bg-bg">
      <PageHeader title={t('recipes.title')} subtitle={t('recipes.subtitle')} />

      {/* Search & filters */}
      <section className="bg-surface border-b-[3px] border-line py-4 sm:py-5">
        <Container>
          <div role="search" className="relative sm:max-w-md">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
            <input
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              aria-label={t('recipes.searchLabel')}
              placeholder={t('recipes.search')}
              value={query}
              onChange={(e) => setFilters({ q: e.target.value || null })}
              className={`${fieldClasses} pl-11 pr-12 [&::-webkit-search-cancel-button]:hidden`}
            />
            {query && (
              <button
                type="button"
                onClick={() => setFilters({ q: null })}
                aria-label={t('recipes.clearSearch')}
                className="absolute right-0.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 text-ink-soft hover:text-ink"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* One row that scrolls sideways on phones; wraps when there is room */}
          <div
            role="group"
            aria-label={t('recipes.filters')}
            className="mt-3 -mx-4 px-4 pt-1 pb-2 flex gap-2 overflow-x-auto scrollbar-none sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible"
          >
            <Chip selected={!category} onClick={() => setFilters({ category: null })}>
              {t('recipes.all')}
            </Chip>
            {categories.map(([name, slug]) => (
              <Chip key={name} selected={category === name} onClick={() => setFilters({ category: name })}>
                <span aria-hidden="true">{categoryEmoji(slug)}</span>
                {categoryLabel(slug, name)}
              </Chip>
            ))}
            <span aria-hidden="true" className="shrink-0 w-px my-1.5 bg-line-soft" />
            <Chip selected={quickOnly} onClick={() => setFilters({ quick: quickOnly ? null : '1' })}>
              <span aria-hidden="true">⚡</span>
              {t('home.pickQuick')}
            </Chip>
            <Chip selected={savedOnly} onClick={() => setFilters({ saved: savedOnly ? null : '1' })}>
              <HeartIcon className="w-4 h-4" fill={savedOnly ? 'currentColor' : 'none'} />
              {t('recipes.saved')}
              {favorites.length > 0 && <span className="font-bold">({favorites.length})</span>}
            </Chip>
          </div>
        </Container>
      </section>

      {/* Results */}
      <section className="py-6 sm:py-10">
        <Container>
          {error ? (
            <StateMessage
              alert
              emoji="😕"
              title={t('common.loadError')}
              action={<Button variant="primary" onClick={reload}>{t('common.retry')}</Button>}
            />
          ) : loading ? (
            <RecipeGrid recipes={[]} loading />
          ) : nothingSaved ? (
            <StateMessage
              emoji="💗"
              title={t('recipes.savedEmptyTitle')}
              text={t('recipes.savedEmptyText')}
              action={<Button variant="primary" onClick={clearFilters}>{t('common.browseRecipes')}</Button>}
            />
          ) : filtered.length === 0 ? (
            recipes.length === 0 ? (
              <StateMessage title={t('home.emptyTitle')} text={t('home.emptyText')} />
            ) : (
              <StateMessage
                emoji="🔍"
                title={t('recipes.noResults')}
                text={t('recipes.noResultsHint')}
                action={<Button variant="primary" onClick={clearFilters}>{t('recipes.clearFilters')}</Button>}
              />
            )
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 mb-4 min-h-11">
                {/* Read out when the filters change, so screen-reader users hear the new count */}
                <p aria-live="polite" className="text-base font-bold text-ink-soft">
                  {t('home.recipeCount', { count: filtered.length })}
                </p>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    {t('recipes.clearFilters')}
                  </Button>
                )}
              </div>
              <RecipeGrid recipes={filtered} />
            </>
          )}
        </Container>
      </section>
    </div>
  );
}
