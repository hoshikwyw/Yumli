import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecipeById, useRecipes } from '@/features/recipes/hooks/useRecipes';
import { useCategoryLabel } from '@/features/recipes/hooks/useCategoryLabel';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useFavorites } from '@/features/favorites/FavoritesContext';
import { BackLink, Badge, Button, Card, Container, Skeleton, StateMessage } from '@/components/ui';
import { HeartIcon, ShareIcon } from '@/components/ui/icons';
import LoadError from '@/features/recipes/components/LoadError';
import ImageGallery from '@/features/recipes/components/ImageGallery';
import { IngredientChecklist, StepList } from '@/features/recipes/components/Checklists';
import RecipeGrid from '@/features/recipes/components/RecipeGrid';
import { getYouTubeId, youTubeEmbedUrl } from '@/lib/youtube';
import type { Recipe } from '@/types';

const DIFFICULTY_BADGE = { Easy: 'accent', Medium: 'warm', Hard: 'primary' } as const;

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { recipe, loading, error, reload } = useRecipeById(id ?? '');
  const { t } = useTranslation();

  useDocumentTitle(recipe?.title);

  if (loading) return <DetailSkeleton />;

  if (error) {
    return (
      <Container>
        <LoadError onRetry={reload} />
      </Container>
    );
  }

  if (!recipe) {
    return (
      <Container>
        <StateMessage
          icon="search"
          title={t('recipeDetail.notFound')}
          text={t('recipeDetail.notFoundHint')}
          action={<Button to="/recipes" variant="primary">{t('recipeDetail.backToRecipes')}</Button>}
        />
      </Container>
    );
  }

  return <RecipeView recipe={recipe} />;
}

function RecipeView({ recipe }: { recipe: Recipe }) {
  const { recipes } = useRecipes();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useTranslation();
  const categoryLabel = useCategoryLabel();
  const [copied, setCopied] = useState(false);

  const fav = isFavorite(recipe.id);
  const images = recipe.images?.length ? recipe.images : recipe.image ? [recipe.image] : [];
  const videoId = recipe.youtube_link ? getYouTubeId(recipe.youtube_link) : null;
  const category = recipe.category ? categoryLabel(recipe.category_slug, recipe.category) : null;
  const related = recipes.filter((r) => r.category === recipe.category && r.id !== recipe.id).slice(0, 4);

  /** Phones open their own share sheet; elsewhere the link is copied. */
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: recipe.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      }
    } catch { /* the visitor closed the share sheet, or the browser refused: nothing to do */ }
  };

  const stats = [
    { label: t('recipeDetail.prep'), value: recipe.prep_time },
    { label: t('recipeDetail.cook'), value: recipe.cook_time },
    { label: t('recipeDetail.serves'), value: String(recipe.servings) },
  ].filter((stat) => stat.value);

  return (
    <div className="bg-bg">
      <Container className="py-4 sm:py-8">
        <BackLink to="/recipes">{t('recipeDetail.back')}</BackLink>

        <article className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Photos: stay in view on wide screens while the method scrolls */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ImageGallery images={images} title={recipe.title} />
          </div>

          <div className="min-w-0 space-y-6">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                {category && <Badge variant="outline">{category}</Badge>}
                <Badge variant={DIFFICULTY_BADGE[recipe.difficulty] ?? 'outline'}>
                  {t(`difficulty.${recipe.difficulty}`, { defaultValue: recipe.difficulty })}
                </Badge>
              </div>
              <h1 className="text-title text-ink mt-3 break-words">{recipe.title}</h1>
              {recipe.description && <p className="text-lead text-ink-soft mt-2">{recipe.description}</p>}

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  variant={fav ? 'primary' : 'outline'}
                  size="sm"
                  aria-pressed={fav}
                  onClick={() => toggleFavorite(recipe.id)}
                >
                  <HeartIcon className="w-5 h-5" fill={fav ? 'currentColor' : 'none'} />
                  {t(fav ? 'recipes.saved' : 'recipeDetail.save')}
                </Button>
                <Button variant="outline" size="sm" onClick={share}>
                  <ShareIcon className="w-5 h-5" />
                  <span aria-live="polite">{copied ? t('recipeDetail.linkCopied') : t('recipeDetail.share')}</span>
                </Button>
              </div>
            </header>

            {stats.length > 0 && (
              <dl className="grid grid-cols-3 gap-2 sm:gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-surface border-2 border-line-soft px-2 py-3 text-center">
                    <dt className="text-eyebrow text-ink-muted">{stat.label}</dt>
                    <dd className="mt-0.5 text-base sm:text-lg font-extrabold text-ink">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {recipe.ingredients?.length > 0 && (
              <Card variant="pastel-pink" className="p-4 sm:p-6">
                <h2 className="text-heading text-ink">{t('recipeDetail.ingredients')}</h2>
                <p className="text-sm text-ink-soft mt-0.5 mb-2">{t('recipeDetail.ingredientsHint')}</p>
                <IngredientChecklist items={recipe.ingredients} />
              </Card>
            )}

            {recipe.instructions?.length > 0 && (
              <Card variant="pastel-mint" className="p-4 sm:p-6">
                <h2 className="text-heading text-ink">{t('recipeDetail.instructions')}</h2>
                <p className="text-sm text-ink-soft mt-0.5 mb-2">{t('recipeDetail.stepsHint')}</p>
                <StepList steps={recipe.instructions} />
              </Card>
            )}

            {videoId && (
              <section>
                <h2 className="text-heading text-ink mb-3">{t('recipeDetail.video')}</h2>
                <Card variant="default">
                  <div className="relative aspect-video">
                    <iframe
                      src={youTubeEmbedUrl(videoId)}
                      title={`${t('recipeDetail.video')}: ${recipe.title}`}
                      loading="lazy"
                      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  </div>
                </Card>
              </section>
            )}
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-10 sm:mt-14">
            <div className="pixel-divider-primary mb-6 sm:mb-10" />
            <h2 className="text-heading text-ink mb-4 sm:mb-6">
              {t('recipeDetail.moreIn', { category: category ?? '' })}
            </h2>
            <RecipeGrid recipes={related} />
          </section>
        )}
      </Container>
    </div>
  );
}

/** Same shape as the loaded page, so nothing jumps when the recipe arrives. */
function DetailSkeleton() {
  return (
    <Container className="py-4 sm:py-8" >
      <div aria-busy="true" className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        <Skeleton height="auto" className="aspect-[4/3] !rounded-none" />
        <div className="space-y-4">
          <Skeleton height="26px" width="40%" />
          <Skeleton height="36px" width="80%" />
          <Skeleton height="56px" />
          <Skeleton height="72px" />
          <Skeleton height="220px" />
        </div>
      </div>
    </Container>
  );
}
