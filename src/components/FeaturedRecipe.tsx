import { useTranslation } from 'react-i18next';
import type { Recipe } from '../types';
import { coverImage } from '../utils/recipe';
import { Button, Card, Container, RecipeImage, Skeleton } from './common';
import { ClockIcon, PeopleIcon } from './icons';

interface FeaturedRecipeProps {
  /** Leave out while the recipes are still loading: a placeholder of the same size is shown. */
  recipe?: Recipe;
}

/** The one recipe the home page puts forward, with a button straight to it. */
export default function FeaturedRecipe({ recipe }: FeaturedRecipeProps) {
  const { t } = useTranslation();

  return (
    <section className="bg-surface py-10 sm:py-14" aria-busy={recipe ? undefined : true}>
      <Container>
        <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
          <Card variant="default">
            <div className="relative aspect-[4/3]">
              {recipe ? <RecipeImage src={coverImage(recipe)} eager /> : <Skeleton height="100%" className="!rounded-none" />}
            </div>
          </Card>

          {recipe ? (
            <div>
              <p className="text-eyebrow text-primary-ink">{t('home.featuredLabel')}</p>
              <h2 className="text-heading text-ink mt-2">{recipe.title}</h2>
              <p className="text-lead text-ink-soft mt-3 line-clamp-4">{recipe.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-base font-semibold text-ink-soft">
                {recipe.prep_time && (
                  <span className="inline-flex items-center gap-1.5">
                    <ClockIcon className="w-5 h-5" />
                    <span className="sr-only">{t('card.prepTime')}:</span>
                    {recipe.prep_time}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <PeopleIcon className="w-5 h-5" />
                  <span className="sr-only">{t('card.serves')}:</span>
                  {recipe.servings}
                </span>
              </div>
              <Button to={`/recipes/${recipe.id}`} variant="primary" className="mt-6 w-full sm:w-auto">
                {t('recipes.letsCook')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Skeleton height="16px" width="30%" />
              <Skeleton height="30px" width="80%" />
              <Skeleton height="72px" />
              <Skeleton height="48px" width="160px" />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
