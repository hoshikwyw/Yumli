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

      {/* Closing note: a solid lavender banner, so it reads the same in light and dark mode */}
      <section className="bg-bg pixel-hearts py-10 sm:py-16">
        <Container size="md">
          <div className="relative overflow-hidden bg-secondary text-on-fill pixel-box px-5 py-10 sm:px-12 sm:py-12 text-center">
            {/* Stickers in the corners, where the text never reaches. Kept upright: pixel art turns ragged when rotated. */}
            <PixelArt name="star" className="absolute top-3 left-3 w-8 h-8 sm:top-5 sm:left-6 sm:w-12 sm:h-12" />
            <PixelArt name="egg" className="absolute top-3 right-3 w-8 h-8 sm:top-auto sm:bottom-5 sm:right-6 sm:w-16 sm:h-16" />
            <PixelArt name="cookie" className="hidden sm:block absolute top-6 right-8 w-8 h-8" />
            <PixelArt name="cake" className="hidden sm:block absolute bottom-6 left-8 w-12 h-12" />

            <div className="relative max-w-md mx-auto">
              <PixelArt name="heart" className="w-12 h-12 mx-auto animate-heartbeat" />
              <h2 className="text-heading mt-3">{t('common.unlockChef')}</h2>
              <p className="text-lead mt-2 opacity-90">{t('home.soloSubtitle')}</p>
              <Button to="/recipes" variant="primary" size="lg" className="mt-6 w-full sm:w-auto">
                {t('common.browseRecipes')}
                <ArrowRightIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
