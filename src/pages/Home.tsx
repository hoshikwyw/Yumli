import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HeroSection from '../components/HeroSection';
import FeaturedRecipe from '../components/FeaturedRecipe';
import RecipeGrid from '../components/RecipeGrid';
import { ArrowRightIcon } from '../components/icons';
import { Button, Container, Skeleton, StateMessage } from '../components/common';
import { useRecipes } from '../hooks/useRecipes';
import { useCategoryLabel } from '../hooks/useCategoryLabel';
import { categoryEmoji, isQuick } from '../utils/recipe';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { Recipe } from '../types';

/** How many recipes the home page shows before sending people to the full list. */
const HOME_GRID_SIZE = 8;

/* Tile colours, used in rotation. */
const TILE_TONES = [
  'bg-secondary-soft pixel-box-secondary',
  'bg-accent-soft pixel-box-accent',
  'bg-primary-soft pixel-box-primary',
  'bg-warm-soft pixel-box-warm',
];

/* Two tiles per row on phones, fixed-width tiles centred in the row from tablet up. */
const TILE_SIZE = 'w-[calc(50%-0.375rem)] sm:w-48';

interface Pick {
  key: string;
  emoji: string;
  label: string;
  count: number;
  /** The recipe list, filtered to this pick. */
  to: string;
}

/** One tile per category that actually has recipes, biggest first. */
function categoryPicks(recipes: Recipe[], label: (slug: string | undefined, name: string) => string): Pick[] {
  const byName = new Map<string, Pick>();
  for (const recipe of recipes) {
    if (!recipe.category) continue;
    const pick = byName.get(recipe.category);
    if (pick) pick.count += 1;
    else {
      byName.set(recipe.category, {
        key: recipe.category,
        emoji: categoryEmoji(recipe.category_slug),
        label: label(recipe.category_slug, recipe.category),
        count: 1,
        to: `/recipes?category=${encodeURIComponent(recipe.category)}`,
      });
    }
  }
  return [...byName.values()].sort((a, b) => b.count - a.count);
}

export default function Home() {
  const { recipes, loading, error, reload } = useRecipes();
  const { t } = useTranslation();
  const categoryLabel = useCategoryLabel();
  useDocumentTitle();

  const featured = recipes.filter((r) => r.is_featured);
  const pool = featured.length > 0 ? featured : recipes;
  const mainRecipe = pool[0];
  // Avoid showing the featured recipe twice, unless it is the only one there is.
  const others = pool.filter((r) => r.id !== mainRecipe?.id);
  const gridRecipes = (others.length > 0 ? others : pool).slice(0, HOME_GRID_SIZE);

  const quickCount = recipes.filter(isQuick).length;
  const picks: Pick[] = [
    ...(quickCount > 0
      ? [{ key: 'quick', emoji: '⚡', label: t('home.pickQuick'), count: quickCount, to: '/recipes?quick=1' }]
      : []),
    ...categoryPicks(recipes, categoryLabel),
  ];

  const isEmpty = !loading && !error && recipes.length === 0;

  return (
    <div className="bg-bg">
      <HeroSection />

      {error ? (
        <Container>
          <StateMessage
            alert
            emoji="😕"
            title={t('common.loadError')}
            action={<Button variant="primary" onClick={reload}>{t('common.retry')}</Button>}
          />
        </Container>
      ) : isEmpty ? (
        <Container>
          <StateMessage title={t('home.emptyTitle')} text={t('home.emptyText')} />
        </Container>
      ) : (
        <>
          <FeaturedRecipe recipe={mainRecipe} />

          {/* Browse by category */}
          {(loading || picks.length > 0) && (
            <section className="bg-bg pixel-sparkles py-10 sm:py-14">
              <Container>
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-heading text-ink">{t('home.quickPicksTitle')}</h2>
                  <p className="text-lead text-ink-soft mt-1">{t('home.quickPicksSubtitle')}</p>
                </div>
                <ul className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
                  {loading
                    ? Array.from({ length: 4 }, (_, i) => (
                        <li key={i} className={TILE_SIZE}><Skeleton height="124px" className="!rounded-none" /></li>
                      ))
                    : picks.map((pick, i) => (
                        <li key={pick.key} className={TILE_SIZE}>
                          <Link
                            to={pick.to}
                            className={`flex flex-col items-center justify-center h-full min-h-[124px] p-3 text-center no-underline pixel-press ${TILE_TONES[i % TILE_TONES.length]}`}
                          >
                            <span className="text-3xl" aria-hidden="true">{pick.emoji}</span>
                            <span className="mt-1.5 text-base font-extrabold leading-snug text-ink">{pick.label}</span>
                            <span className="text-sm text-ink-soft">{t('home.recipeCount', { count: pick.count })}</span>
                          </Link>
                        </li>
                      ))}
                </ul>
              </Container>
            </section>
          )}

          <div className="pixel-divider-primary" />

          {/* Recipes to try */}
          <section className="bg-bg pixel-cross py-10 sm:py-14">
            <Container>
              <div className="flex items-end justify-between gap-4 mb-5 sm:mb-8">
                <h2 className="text-heading text-ink">{t('home.featuredRecipes')}</h2>
                <Link
                  to="/recipes"
                  className="shrink-0 inline-flex items-center gap-1 min-h-11 text-base font-extrabold text-primary-ink no-underline hover:underline underline-offset-4"
                >
                  {t('home.seeAll')}
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
              <RecipeGrid recipes={gridRecipes} loading={loading} skeletonCount={4} />
            </Container>
          </section>
        </>
      )}

      <div className="pixel-divider-primary" />

      {/* Closing note */}
      <section className="bg-bg pixel-hearts py-12 sm:py-16">
        <Container>
          <div className="text-center max-w-lg mx-auto">
            <div className="text-4xl animate-heartbeat inline-block" aria-hidden="true">💖</div>
            <h2 className="text-heading text-ink mt-3">{t('common.unlockChef')}</h2>
            <p className="text-lead text-ink-soft mt-2">{t('home.soloSubtitle')}</p>
            <Button to="/recipes" variant="primary" size="lg" className="mt-6 w-full sm:w-auto">
              {t('common.browseRecipes')}
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
