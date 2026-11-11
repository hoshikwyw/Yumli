import { db } from './_lib/db.js';
import { check, handle, json, readJson, uuidParam } from './_lib/http.js';
import { requireAdmin } from './_lib/session.js';
import { categoryName } from './_lib/validate.js';

/**
 * Categories.
 *
 *   GET    /api/categories           all, by name (public)
 *   POST   /api/categories           { name }   (admin)
 *   PUT    /api/categories?id=...    { name }   (admin)
 *   DELETE /api/categories?id=...               (admin; its recipes keep no category)
 */

export const GET = handle(async () => {
  const supabase = await db();
  return json(check(await supabase.from('categories').select('id, name, slug, icon').order('name')));
});

export const POST = handle(async (request) => {
  requireAdmin(request);
  const input = categoryName(await readJson(request));
  const supabase = await db();
  return json(check(await supabase.from('categories').insert(input).select().single()), 201);
});

export const PUT = handle(async (request) => {
  requireAdmin(request);
  const id = uuidParam(request);
  const input = categoryName(await readJson(request));
  const supabase = await db();
  check(await supabase.from('categories').update(input).eq('id', id));
  return json({ ok: true });
});

export const DELETE = handle(async (request) => {
  requireAdmin(request);
  const id = uuidParam(request);
  const supabase = await db();
  check(await supabase.from('categories').delete().eq('id', id));
  return json({ ok: true });
});
