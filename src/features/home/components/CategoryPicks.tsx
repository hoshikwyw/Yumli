import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, PixelArt, Skeleton, type SpriteName } from '@/components/ui';
import { useCategoryLabel } from '@/features/recipes/hooks/useCategoryLabel';
import { categoryIcon, isQuick } from '@/features/recipes/utils';
import type { Recipe } from '@/types';

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
  icon: SpriteName;
  label: string;
  count: number;
  /** The recipe list, filtered to this pick. */
  to: string;
}

interface CategoryPicksProps {
  recipes: Recipe[];
  loading: boolean;
}

/**
 * "What sounds good?" tiles on the home page: a quick-recipes tile, then one
 * per category that actually has recipes (biggest first), each linking to the
 * recipe list with that filter applied.
 */
export default function CategoryPicks({ recipes, loading }: CategoryPicksProps) {
  const { t } = useTranslation();
  const categoryLabel = useCategoryLabel();

  const byCategory = new Map<string, Pick>();
  for (const recipe of recipes) {
    if (!recipe.category) continue;
    const pick = byCategory.get(recipe.category);
    if (pick) pick.count += 1;
    else {
      byCategory.set(recipe.category, {
        key: recipe.category,
        icon: categoryIcon(recipe.category_slug),
        label: categoryLabel(recipe.category_slug, recipe.category),
        count: 1,
        to: `/recipes?category=${encodeURIComponent(recipe.category)}`,
      });
    }
  }

  const quickCount = recipes.filter(isQuick).length;
  const picks: Pick[] = [
    ...(quickCount > 0
      ? [{ key: 'quick', icon: 'bolt' as const, label: t('home.pickQuick'), count: quickCount, to: '/recipes?quick=1' }]
      : []),
    ...[...byCategory.values()].sort((a, b) => b.count - a.count),
  ];

  if (!loading && picks.length === 0) return null;

  return (
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
                    className={`flex flex-col items-center justify-center h-full min-h-[136px] p-3 text-center no-underline pixel-press ${TILE_TONES[i % TILE_TONES.length]}`}
                  >
                    <PixelArt name={pick.icon} className="w-12 h-12" />
                    <span className="mt-1.5 text-base font-extrabold leading-snug text-ink">{pick.label}</span>
                    <span className="text-sm text-ink-soft">{t('home.recipeCount', { count: pick.count })}</span>
                  </Link>
                </li>
              ))}
        </ul>
      </Container>
    </section>
  );
}
