import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HeroSection from '@/features/home/components/HeroSection';
import CategoryPicks from '@/features/home/components/CategoryPicks';
import FeaturedRecipe from '@/features/recipes/components/FeaturedRecipe';
import RecipeGrid from '@/features/recipes/components/RecipeGrid';
import LoadError from '@/features/recipes/components/LoadError';
import { useRecipes } from '@/features/recipes/hooks/useRecipes';
import { Button, Container, PixelArt, StateMessage } from '@/components/ui';
import { ArrowRightIcon } from '@/components/ui/icons';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** How many recipes the home page shows before sending people to the full list. */
const HOME_GRID_SIZE = 8;

export default function Home() {
  const { recipes, loading, error, reload } = useRecipes();
  const { t } = useTranslation();
  useDocumentTitle();

  const featured = recipes.filter((r) => r.is_featured);
  const pool = featured.length > 0 ? featured : recipes;
  const mainRecipe = pool[0];
  // Avoid showing the featured recipe twice, unless it is the only one there is.
  const others = pool.filter((r) => r.id !== mainRecipe?.id);
  const gridRecipes = (others.length > 0 ? others : pool).slice(0, HOME_GRID_SIZE);

  const isEmpty = !loading && !error && recipes.length === 0;

  return (
    <div className="bg-bg">
      <HeroSection />

      {error ? (
        <Container>
          <LoadError onRetry={reload} />
        </Container>
      ) : isEmpty ? (
        <Container>
          <StateMessage title={t('home.emptyTitle')} text={t('home.emptyText')} />
        </Container>
      ) : (
        <>
          <FeaturedRecipe recipe={mainRecipe} />

          <CategoryPicks recipes={recipes} loading={loading} />

          <div className="pixel-divider-primary" />

          {/* Recipes to try */}
          <section className="bg-bg pixel-cross py-10 sm:py-14">
            <Container>
              <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 mb-5 sm:mb-8">
                <h2 className="text-heading text-ink">{t('home.featuredRecipes')}</h2>
                <Link
                  to="/recipes"
                  className="inline-flex items-center gap-1 min-h-11 text-base font-extrabold text-primary-ink no-underline hover:underline underline-offset-4"
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
            <PixelArt name="heart" className="w-12 h-12 mx-auto animate-heartbeat" />
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
