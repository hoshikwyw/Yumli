import { randomUUID } from 'node:crypto';
import { db, IMAGE_BUCKET, publicImagePrefix } from './_lib/db.js';
import { handle, HttpError, json, param } from './_lib/http.js';
import { requireAdmin } from './_lib/session.js';

/**
 * Recipe images (admin only).
 *
 *   POST   /api/images            the image file as the raw body, with its
 *                                  Content-Type -> { url }
 *   DELETE /api/images?url=...    remove an image this bucket holds
 *
 * Uploads pass through here rather than going straight to Supabase, so the
 * browser never needs a Supabase key. Vercel caps a request body at 4.5 MB;
 * the form shrinks photos well below that before sending.
 */

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export const POST = handle(async (request) => {
  requireAdmin(request);

  const type = request.headers.get('content-type')?.split(';')[0].trim() ?? '';
  const ext = TYPES[type];
  if (!ext) throw new HttpError(415, 'Images must be JPEG, PNG, WebP or GIF');

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BYTES) throw new HttpError(413, 'Image is too large (max 4 MB)');

  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength) throw new HttpError(400, 'Empty file');
  if (bytes.byteLength > MAX_BYTES) throw new HttpError(413, 'Image is too large (max 4 MB)');

  const path = `uploads/${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const supabase = await db();
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, bytes, {
    contentType: type,
    cacheControl: '31536000', // names are unique, so a file never changes
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  return json({ url: `${publicImagePrefix()}${path}` }, 201);
});

export const DELETE = handle(async (request) => {
  requireAdmin(request);

  const url = param(request, 'url');
  const prefix = publicImagePrefix();
  if (!url.startsWith(`${prefix}uploads/`)) throw new HttpError(400, 'Not an image from this site');

  const path = url.slice(prefix.length);
  if (path.includes('..')) throw new HttpError(400, 'Not an image from this site');

  const supabase = await db();
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
  return json({ ok: true });
});
