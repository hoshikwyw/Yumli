import { handle, HttpError, json, readJson } from './_lib/http.js';
import { clearedCookie, credentialsMatch, isAdmin, sessionCookie } from './_lib/session.js';

/**
 * Admin login.
 *
 *   GET    /api/auth   { loggedIn }
 *   POST   /api/auth   { username, password } -> sets the session cookie
 *   DELETE /api/auth   logs out
 */

const FAILED_LOGIN_DELAY_MS = 800;

export const GET = handle(async (request) => json({ loggedIn: isAdmin(request) }));

export const POST = handle(async (request) => {
  const body = (await readJson(request)) as { username?: unknown; password?: unknown } | null;
  const username = typeof body?.username === 'string' ? body.username : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!credentialsMatch(username, password)) {
    // Slows down password guessing without any state to keep.
    await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
    throw new HttpError(401, 'Wrong credentials');
  }

  return json({ loggedIn: true }, 200, { 'Set-Cookie': sessionCookie() });
});

export const DELETE = handle(async () =>
  json({ loggedIn: false }, 200, { 'Set-Cookie': clearedCookie() }));
