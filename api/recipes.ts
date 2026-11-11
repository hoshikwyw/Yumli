import { db, IMAGE_BUCKET, publicImagePrefix } from './_lib/db.js';
import { check, handle, HttpError, json, readJson, uuidParam } from './_lib/http.js';
import { requireAdmin } from './_lib/session.js';
import { recipeInput, searchText } from './_lib/validate.js';

/**
 * Recipes.
 *
 *   GET    /api/recipes                 all, newest first (public)
 *          /api/recipes?featured=1      featured only
 *          /api/recipes?category=Name   one category
 *          /api/recipes?q=text          search title + description
 *          /api/recipes?id=...          one recipe
 *   POST   /api/recipes                 create (admin)
 *   PUT    /api/recipes?id=...          update (admin)
 *   DELETE /api/recipes?id=...          delete, with its uploaded images (admin)
 */

export const GET = handle(async (request) => {
  const params = new URL(request.url).searchParams;
  const supabase = await db();

  if (params.has('id')) {
    const id = uuidParam(request);
    const recipe = check(await supabase.from('recipes_with_category').select('*').eq('id', id).maybeSingle());
    if (!recipe) throw new HttpError(404, 'Recipe not found');
    return json(recipe);
  }

  let query = supabase.from('recipes_with_category').select('*');
  if (params.get('featured') === '1') query = query.eq('is_featured', true);

  const category = params.get('category');
  if (category) query = query.eq('category', category);

  const q = searchText(params.get('q') ?? '');
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);

  return json(check(await query.order('created_at', { ascending: false })));
});

export const POST = handle(async (request) => {
  requireAdmin(request);
  const input = recipeInput(await readJson(request));
  const supabase = await db();
  const created = check(await supabase.from('recipes').insert(input).select('id').single());
  return json(created, 201);
});

export const PUT = handle(async (request) => {
  requireAdmin(request);
  const id = uuidParam(request);
  const input = recipeInput(await readJson(request));
  const supabase = await db();
  const updated = check(await supabase
    .from('recipes')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id'));
  if (!updated?.length) throw new HttpError(404, 'Recipe not found');
  return json({ ok: true });
});

export const DELETE = handle(async (request) => {
  requireAdmin(request);
  const id = uuidParam(request);
  const supabase = await db();

  const deleted = check(await supabase.from('recipes').delete().eq('id', id).select('images'));
  if (!deleted?.length) throw new HttpError(404, 'Recipe not found');

  // Its images would otherwise stay in the bucket forever. Only files in our
  // own bucket are removed; links to other sites are left alone.
  const prefix = publicImagePrefix();
  const paths = (deleted[0].images as string[] | null ?? [])
    .filter((url: string) => url.startsWith(prefix))
    .map((url: string) => url.slice(prefix.length));
  if (paths.length) {
    const { error } = await supabase.storage.from(IMAGE_BUCKET).remove(paths);
    if (error) console.error('Recipe deleted, but its images were not:', error.message);
  }

  return json({ ok: true });
});
