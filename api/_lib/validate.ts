import { randomUUID } from 'node:crypto';
import { HttpError, isUuid } from './http.js';

/**
 * Check what the admin form sends before it reaches the database.
 * The browser's checks are a convenience; these are the ones that count.
 */

export const MAX_IMAGES = 3;
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

export interface RecipeInput {
  title: string;
  description: string;
  image: string;
  images: string[];
  prep_time: string;
  cook_time: string;
  servings: number;
  difficulty: (typeof DIFFICULTIES)[number];
  ingredients: string[];
  instructions: string[];
  category_id: string;
  is_featured: boolean;
  youtube_link: string | null;
}

const fail = (message: string): never => { throw new HttpError(400, message); };

const text = (value: unknown, field: string, max: number): string => {
  if (typeof value !== 'string' || !value.trim()) return fail(`${field} is required`);
  if (value.length > max) return fail(`${field} is too long (max ${max} characters)`);
  return value.trim();
};

const lines = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value)) return fail(`${field} must be a list`);
  const items = value.map((item) => (typeof item === 'string' ? item.trim() : fail(`${field} must be text`))).filter(Boolean);
  if (!items.length) return fail(`Add at least one ${field.replace(/s$/, '')}`);
  if (items.length > 100) return fail(`Too many ${field}`);
  for (const item of items) if (item.length > 1000) fail(`One of the ${field} is too long`);
  return items;
};

const httpsUrl = (value: unknown, field: string): string => {
  if (typeof value !== 'string') return fail(`${field} must be a link`);
  try {
    if (new URL(value).protocol === 'https:') return value;
  } catch { /* falls through */ }
  return fail(`${field} must be an https:// link`);
};

const youtube = (value: unknown): string | null => {
  if (value == null || (typeof value === 'string' && !value.trim())) return null;
  const url = httpsUrl(typeof value === 'string' ? value.trim() : value, 'YouTube link');
  const host = new URL(url).hostname.replace(/^(www\.|m\.)/, '');
  return host === 'youtube.com' || host === 'youtu.be' ? url : fail('YouTube link must be a youtube.com or youtu.be link');
};

export const recipeInput = (body: unknown): RecipeInput => {
  if (!body || typeof body !== 'object') return fail('Expected a recipe');
  const b = body as Record<string, unknown>;

  if (!Array.isArray(b.images) || !b.images.length) fail('Upload at least one image');
  const images = (b.images as unknown[]).map((url) => httpsUrl(url, 'Image'));
  if (images.length > MAX_IMAGES) fail(`At most ${MAX_IMAGES} images`);

  const servings = Number(b.servings);
  if (!Number.isInteger(servings) || servings < 1 || servings > 100) fail('Servings must be a whole number from 1 to 100');

  if (!DIFFICULTIES.includes(b.difficulty as RecipeInput['difficulty'])) fail('Difficulty must be Easy, Medium or Hard');
  if (!isUuid(b.category_id)) fail('Pick a category');

  return {
    title: text(b.title, 'Title', 120),
    description: text(b.description, 'Description', 2000),
    image: images[0],
    images,
    prep_time: text(b.prep_time, 'Prep time', 40),
    cook_time: text(b.cook_time, 'Cook time', 40),
    servings,
    difficulty: b.difficulty as RecipeInput['difficulty'],
    ingredients: lines(b.ingredients, 'ingredients'),
    instructions: lines(b.instructions, 'instructions'),
    category_id: b.category_id as string,
    is_featured: b.is_featured === true,
    youtube_link: youtube(b.youtube_link),
  };
};

export const categoryName = (body: unknown): { name: string; slug: string } => {
  const name = text((body as Record<string, unknown> | null)?.name, 'Category name', 60);
  // A name in Burmese has no a–z characters left after this, so it gets a
  // generated slug rather than an empty one (slugs must be unique).
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '')
    || `category-${randomUUID().slice(0, 8)}`;
  return { name, slug };
};

/**
 * Search text, made safe for a PostgREST `or=(...)` filter: commas, brackets
 * and wildcards would otherwise change the filter itself.
 */
export const searchText = (value: string): string =>
  value.replace(/[,()*%\\:"]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
