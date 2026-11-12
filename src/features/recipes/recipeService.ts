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

export const getRecipes = () => api<Recipe[]>('recipes');

export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    return await api<Recipe>(`recipes?id=${encodeURIComponent(id)}`);
  } catch (error) {
    // An unknown or malformed id is "not found", not a failure.
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export const getCategories = () => api<Category[]>('categories');

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
};

export const updateRecipe = async (id: string, input: RecipeInput): Promise<void> => {
  await send(`recipes?id=${encodeURIComponent(id)}`, 'PUT', input);
};

export const deleteRecipe = async (id: string): Promise<void> => {
  await send(`recipes?id=${encodeURIComponent(id)}`, 'DELETE');
};

export const createCategory = async (name: string): Promise<void> => {
  await send('categories', 'POST', { name });
};

export const updateCategory = async (id: string, name: string): Promise<void> => {
  await send(`categories?id=${encodeURIComponent(id)}`, 'PUT', { name });
};

export const deleteCategory = async (id: string): Promise<void> => {
  await send(`categories?id=${encodeURIComponent(id)}`, 'DELETE');
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
