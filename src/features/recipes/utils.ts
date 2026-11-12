import type { Recipe } from '@/types';

/** Recipes at or under this many minutes of prep count as "quick". */
export const QUICK_MINUTES = 10;

const BURMESE_DIGITS = '၀၁၂၃၄၅၆၇၈၉';

/**
 * Minutes in a free-text time such as "10 min", "1 hr 20 min", "1.5 hours" or
 * "၁၀ မိနစ်". A bare number is taken as minutes. Returns null when no time
 * can be read, so callers never mistake "a pinch of patience" for zero minutes.
 */
export function parseMinutes(text: string | null | undefined): number | null {
  if (!text) return null;
  const ascii = text.replace(/[၀-၉]/g, (digit) => String(BURMESE_DIGITS.indexOf(digit)));

  const hours = ascii.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h\b|နာရီ)/i);
  const minutes = ascii.match(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|m\b|မိနစ်)/i);
  if (hours || minutes) {
    return Math.round(Number(hours?.[1] ?? 0) * 60 + Number(minutes?.[1] ?? 0));
  }

  const bare = ascii.trim().match(/^(\d+(?:\.\d+)?)$/);
  return bare ? Math.round(Number(bare[1])) : null;
}

export const isQuick = (recipe: Recipe) => {
  const minutes = parseMinutes(recipe.prep_time);
  return minutes !== null && minutes <= QUICK_MINUTES;
};

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

export interface RecipeFilters {
  /** Free text, matched against title, description, category and ingredients. */
  query?: string;
  /** Category name; empty means every category. */
  category?: string | null;
  quickOnly?: boolean;
  /** When given, keep only recipes whose id is in this list (the visitor's saved recipes). */
  savedIds?: readonly string[] | null;
}

/** Everything a visitor might type to find a recipe, in one lowercase string. */
const searchText = (recipe: Recipe) =>
  [recipe.title, recipe.description, recipe.category, ...(recipe.ingredients ?? [])].join(' ').toLowerCase();

/** The recipes that pass every filter that is switched on. */
export function filterRecipes(recipes: Recipe[], { query = '', category, quickOnly = false, savedIds }: RecipeFilters) {
  // Every word must appear somewhere, in any order: "egg fried" finds "Fried egg rice".
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const saved = savedIds ? new Set(savedIds) : null;

  return recipes.filter((recipe) => {
    if (category && recipe.category !== category) return false;
    if (quickOnly && !isQuick(recipe)) return false;
    if (saved && !saved.has(recipe.id)) return false;
    if (words.length === 0) return true;
    const haystack = searchText(recipe);
    return words.every((word) => haystack.includes(word));
  });
}
