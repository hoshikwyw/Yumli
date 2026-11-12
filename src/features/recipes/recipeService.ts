import type { Recipe, Category } from '@/types';

/**
 * All data goes through Yumli's own API (`/api/*`, see the `api/` folder).
 * The browser holds no Supabase key: the database is private, and only the
 * server can reach it. Admin requests carry the login cookie automatically.
 */

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/${path}`, { credentials: 'same-origin', ...init });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body?.error ?? `Request failed (${res.status})`);
  return body as T;
}

const send = <T>(path: string, method: string, data?: unknown) =>
  api<T>(path, {
    method,
    headers: data === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data),
  });

// ── Reads (public) ──

/**
 * The server never lets the recipe and category lists be cached, so without
 * this every page would download them again. They are remembered here for a
 * short while: moving Home -> Recipes -> a recipe costs one request, not three.
 * Any admin write forgets them, and the admin screens always ask for fresh data.
 */
const LIST_TTL_MS = 60_000;

interface ReadOptions {
  /** Skip the short-lived memory and ask the server: for admin screens, which must show the truth. */
  fresh?: boolean;
}

function remembered<T>(load: () => Promise<T>) {
  let entry: { at: number; promise: Promise<T> } | null = null;

  const get = ({ fresh = false }: ReadOptions = {}): Promise<T> => {
    if (!fresh && entry && Date.now() - entry.at < LIST_TTL_MS) return entry.promise;
    const mine = { at: Date.now(), promise: load() };
    entry = mine;
    // A failed request must not be remembered, or "Try again" would replay the failure.
    mine.promise.catch(() => { if (entry === mine) entry = null; });
    return mine.promise;
  };

  return {
    get,
    /** The remembered value if there is a current one, without asking the server. */
    peek: () => (entry && Date.now() - entry.at < LIST_TTL_MS ? entry.promise.catch(() => null) : Promise.resolve(null)),
    forget: () => { entry = null; },
  };
}

const recipeList = remembered(() => api<Recipe[]>('recipes'));
const categoryList = remembered(() => api<Category[]>('categories'));

/** Called after every admin write: recipes carry their category's name, so either kind of change affects both lists. */
const forgetLists = () => {
  recipeList.forget();
  categoryList.forget();
};

export const getRecipes = (options?: ReadOptions) => recipeList.get(options);

export async function getRecipeById(id: string, { fresh = false }: ReadOptions = {}): Promise<Recipe | null> {
  if (!fresh) {
    // Coming from a list, the recipe is already here: show it without waiting.
    const known = (await recipeList.peek())?.find((recipe) => recipe.id === id);
    if (known) return known;
  }
  try {
    return await api<Recipe>(`recipes?id=${encodeURIComponent(id)}`);
  } catch (error) {
    // An unknown or malformed id is "not found", not a failure.
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export const getCategories = (options?: ReadOptions) => categoryList.get(options);

// ── Writes (admin) ──

export interface RecipeInput {
  title: string;
  description: string;
  image: string;
  images: string[];
  prep_time: string;
  cook_time: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  instructions: string[];
  category_id: string;
  is_featured: boolean;
  youtube_link: string | null;
}

export const createRecipe = async (input: RecipeInput): Promise<void> => {
  await send('recipes', 'POST', input);
  forgetLists();
};

export const updateRecipe = async (id: string, input: RecipeInput): Promise<void> => {
  await send(`recipes?id=${encodeURIComponent(id)}`, 'PUT', input);
  forgetLists();
};

export const deleteRecipe = async (id: string): Promise<void> => {
  await send(`recipes?id=${encodeURIComponent(id)}`, 'DELETE');
  forgetLists();
};

export const createCategory = async (name: string): Promise<void> => {
  await send('categories', 'POST', { name });
  forgetLists();
};

export const updateCategory = async (id: string, name: string): Promise<void> => {
  await send(`categories?id=${encodeURIComponent(id)}`, 'PUT', { name });
  forgetLists();
};

export const deleteCategory = async (id: string): Promise<void> => {
  await send(`categories?id=${encodeURIComponent(id)}`, 'DELETE');
  forgetLists();
};

// ── Images (admin) ──

const MAX_EDGE = 1600;
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const UPLOADABLE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Shrink a photo before upload: at most 1600px on its longest side, saved as
 * WebP. A phone photo drops from several MB to a few hundred KB, which keeps
 * it under the server's 4 MB limit and makes recipe pages load faster.
 * GIFs are sent as they are, since redrawing one would stop its animation.
 */
async function shrinkImage(file: File): Promise<Blob> {
  if (file.type === 'image/gif') return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`${file.name} is not an image this browser can read. Use JPEG, PNG or WebP.`);
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const webp = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
  // Keep the original if re-encoding did not help (a small, already-compressed file).
  if (!webp || (UPLOADABLE.includes(file.type) && file.size <= webp.size)) return file;
  return webp;
}

export async function uploadImage(file: File): Promise<string> {
  const image = await shrinkImage(file);
  if (image.size > MAX_UPLOAD_BYTES) throw new Error(`${file.name} is still over 4 MB after shrinking`);

  const { url } = await api<{ url: string }>('images', {
    method: 'POST',
    headers: { 'Content-Type': image.type },
    body: image,
  });
  return url;
}

export const deleteImage = async (url: string): Promise<void> => {
  await send(`images?url=${encodeURIComponent(url)}`, 'DELETE');
};
