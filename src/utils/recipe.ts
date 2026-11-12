import type { Recipe } from '../types';

/** Recipes at or under this many minutes of prep count as "quick". */
export const QUICK_MINUTES = 10;

/** The value of `?category=` that means "quick recipes" instead of a real category. */
export const QUICK_FILTER = 'quick';

/** Prep time is free text ("10 min"); its leading number is the minutes. */
export const isQuick = (recipe: Recipe) => parseInt(recipe.prep_time, 10) <= QUICK_MINUTES;

/** The picture to show for a recipe in lists: the first gallery image, else the legacy single image. */
export const coverImage = (recipe: Recipe) => recipe.images?.[0] ?? recipe.image;

/** Emoji shown beside a category, by slug. Categories added later in the admin get the plate. */
const CATEGORY_EMOJI: Record<string, string> = {
  breakfast: '🍳',
  'main-course': '🍛',
  dessert: '🍰',
  salad: '🥗',
  soup: '🍲',
  snack: '🍿',
};

export const categoryEmoji = (slug: string) => CATEGORY_EMOJI[slug] ?? '🍽️';
