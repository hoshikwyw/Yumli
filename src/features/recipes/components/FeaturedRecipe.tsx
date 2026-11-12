import { useTranslation } from 'react-i18next';
import { textLang } from '@/lib/lang';
import type { Recipe } from '@/types';
import { coverImage } from '@/features/recipes/utils';
import { Button, Card, Container, Skeleton } from '@/components/ui';
import RecipeImage from './RecipeImage';
import RecipeMeta from './RecipeMeta';

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
              <h2 lang={textLang(recipe.title)} className="text-heading text-ink mt-2">{recipe.title}</h2>
              <p lang={textLang(recipe.description)} className="text-lead text-ink-soft mt-3 line-clamp-4">{recipe.description}</p>
              <RecipeMeta recipe={recipe} size="md" className="mt-4" />
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
