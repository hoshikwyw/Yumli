import { useTranslation } from 'react-i18next';
import { ClockIcon, PeopleIcon } from '@/components/ui/icons';
import type { Recipe } from '@/types';

interface RecipeMetaProps {
  recipe: Recipe;
  /** `sm` inside recipe cards, `md` where the recipe has more room. */
  size?: 'sm' | 'md';
  className?: string;
}

const sizes = {
  sm: { row: 'gap-x-3 text-sm', item: 'gap-1', icon: 'w-4 h-4' },
  md: { row: 'gap-x-4 text-base', item: 'gap-1.5', icon: 'w-5 h-5' },
};

/** Prep time and servings in one line, each with an icon and a screen-reader label. */
export default function RecipeMeta({ recipe, size = 'sm', className = '' }: RecipeMetaProps) {
  const { t } = useTranslation();
  const s = sizes[size];

  return (
    <div className={`flex flex-wrap items-center gap-y-1 font-semibold text-ink-soft ${s.row} ${className}`}>
      {recipe.prep_time && (
        <span className={`inline-flex items-center ${s.item}`}>
          <ClockIcon className={s.icon} />
          <span className="sr-only">{t('card.prepTime')}:</span>
          {recipe.prep_time}
        </span>
      )}
      <span className={`inline-flex items-center ${s.item}`}>
        <PeopleIcon className={s.icon} />
        <span className="sr-only">{t('card.serves')}:</span>
        {recipe.servings}
      </span>
    </div>
  );
}
